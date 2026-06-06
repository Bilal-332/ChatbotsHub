import { User, IUser, hashPassword } from './user.model';
import { Organization } from '@modules/organizations/organization.model';
import { generateTokenPair, verifyRefreshToken, TokenPair } from './token.service';
import { ConflictError, UnauthorizedError, NotFoundError } from '@shared/errors';
import { OAuth2Client } from 'google-auth-library';
import { config } from '@shared/config';
import type { UserRole } from '@shared/types';
import { sendPasswordResetOtp } from '@shared/mailer';
import { createHash, randomInt } from 'crypto';
import { checkAndApplyPlanExpiry, type PlanExpiryWarning } from '@modules/plans/plan.service';
import { logger } from '@shared/logger';

export interface RegisterDto {
  email: string;
  password: string;
  organizationName: string;
  organizationSlug: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface GoogleRegisterDto {
  idToken: string;
  organizationName: string;
  organizationSlug: string;
}

export interface AuthResult {
  tokens: TokenPair;
  user: {
    id: string;
    email: string;
    role: UserRole;
    organizationId: string;
  };
  planExpiryWarning?: PlanExpiryWarning | null;
}

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

export class AuthService {
  private googleClient = new OAuth2Client();

  private getGoogleAudiences(): string[] {
    return config.google.audiences;
  }

  private async verifyGoogleToken(idToken: string): Promise<{ email: string; googleId: string }> {
    const audiences = this.getGoogleAudiences();

    if (audiences.length === 0) {
      throw new UnauthorizedError('Google authentication is not configured');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: audiences.length === 1 ? audiences[0] : audiences,
      });

      const payload = ticket.getPayload();
      if (!payload?.email || !payload.email_verified || !payload.sub) {
        throw new UnauthorizedError('Google account could not be verified');
      }

      // aud/azp must match one of our configured web client IDs
      const tokenClientId = payload.azp ?? payload.aud;
      if (typeof tokenClientId === 'string' && !audiences.includes(tokenClientId)) {
        logger.error(
          `Google token client mismatch. Token aud/azp: ${tokenClientId}. ` +
            `Configured audiences: ${audiences.join(', ')}. ` +
            'Ensure backend GOOGLE_CLIENT_ID matches frontend NEXT_PUBLIC_GOOGLE_CLIENT_ID.',
        );
        throw new UnauthorizedError('Google authentication failed');
      }

      return {
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;

      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        `Google ID token verification failed: ${message}. ` +
          `Configured audiences: ${audiences.join(', ')}`,
      );

      if (/recipient|audience|aud/i.test(message)) {
        throw new UnauthorizedError(
          'Google sign-in configuration mismatch. Contact support if this persists.',
        );
      }

      throw new UnauthorizedError('Google authentication failed');
    }
  }

  private generateOtp(): string {
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH - 1;
    return String(randomInt(min, max + 1));
  }

  private hashOtp(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    // Check for existing email
    const existingUser = await User.findOne({ email: dto.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Check for existing slug
    const existingOrg = await Organization.findOne({ slug: dto.organizationSlug });
    if (existingOrg) {
      throw new ConflictError(`Organization slug "${dto.organizationSlug}" is taken`);
    }

    // Create organization first
    const organization = await Organization.create({
      name: dto.organizationName,
      slug: dto.organizationSlug,
    });

    // Create admin user
    const passwordHash = await hashPassword(dto.password);
    const user = await User.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      authProvider: 'password',
      role: 'admin',
      organizationId: organization._id,
    });

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      organizationId: organization._id.toString(),
      role: user.role,
    });

    return {
      tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        organizationId: organization._id.toString(),
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    // Explicitly select passwordHash (excluded by default)
    const user = await User.findOne({
      email: dto.email.toLowerCase(),
      isActive: true,
    }).select('+passwordHash');

    if (!user) {
      // Use constant-time generic error to prevent email enumeration
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.authProvider !== 'password') {
      throw new UnauthorizedError('Please sign in with Google');
    }

    const isValid = await user.comparePassword(dto.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const planExpiryWarning = await checkAndApplyPlanExpiry(user.organizationId.toString());

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      role: user.role,
    });

    return {
      tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        organizationId: user.organizationId.toString(),
      },
      planExpiryWarning,
    };
  }

  async googleRegister(dto: GoogleRegisterDto): Promise<AuthResult> {
    const { email, googleId } = await this.verifyGoogleToken(dto.idToken);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const existingOrg = await Organization.findOne({ slug: dto.organizationSlug });
    if (existingOrg) {
      throw new ConflictError(`Organization slug "${dto.organizationSlug}" is taken`);
    }

    const organization = await Organization.create({
      name: dto.organizationName,
      slug: dto.organizationSlug,
    });

    const user = await User.create({
      email,
      googleId,
      authProvider: 'google',
      role: 'admin',
      organizationId: organization._id,
    });

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      organizationId: organization._id.toString(),
      role: user.role,
    });

    return {
      tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        organizationId: organization._id.toString(),
      },
    };
  }

  async googleLogin(dto: GoogleLoginDto): Promise<AuthResult> {
    const { email, googleId } = await this.verifyGoogleToken(dto.idToken);

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new UnauthorizedError('No account found. Please sign up');
    }

    if (user.authProvider !== 'google') {
      throw new UnauthorizedError('Please sign in with email and password');
    }

    if (user.googleId && user.googleId !== googleId) {
      throw new UnauthorizedError('Google account mismatch');
    }

    if (!user.googleId) {
      await User.findByIdAndUpdate(user._id, { googleId });
    }

    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const planExpiryWarning = await checkAndApplyPlanExpiry(user.organizationId.toString());

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      role: user.role,
    });

    return {
      tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        organizationId: user.organizationId.toString(),
      },
      planExpiryWarning,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    let payload: { userId: string; organizationId: string };

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findOne({ _id: payload.userId, isActive: true }).lean();
    if (!user) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    return generateTokenPair({
      userId: user._id.toString(),
      organizationId: payload.organizationId,
      role: user.role,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user || user.authProvider !== 'password') return;

    const otp = this.generateOtp();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      {
        resetOtpHash: this.hashOtp(otp),
        resetOtpExpiresAt: expiresAt,
        resetOtpAttempts: 0,
        resetOtpRequestedAt: now,
      },
    );

    await sendPasswordResetOtp(user.email, otp);
  }

  async resetPassword(email: string, code: string, password: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true })
      .select('+passwordHash +resetOtpHash +resetOtpExpiresAt +resetOtpAttempts');

    if (!user || user.authProvider !== 'password') {
      throw new UnauthorizedError('Invalid or expired reset code');
    }

    const { resetOtpHash, resetOtpExpiresAt, resetOtpAttempts = 0 } = user;
    if (!resetOtpHash || !resetOtpExpiresAt) {
      throw new UnauthorizedError('Invalid or expired reset code');
    }

    if (resetOtpAttempts >= OTP_MAX_ATTEMPTS) {
      throw new UnauthorizedError('Invalid or expired reset code');
    }

    if (resetOtpExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('Invalid or expired reset code');
    }

    if (this.hashOtp(code) !== resetOtpHash) {
      await User.updateOne(
        { _id: user._id },
        { resetOtpAttempts: resetOtpAttempts + 1 },
      );
      throw new UnauthorizedError('Invalid or expired reset code');
    }

    const passwordHash = await hashPassword(password);
    await User.updateOne(
      { _id: user._id },
      {
        passwordHash,
        resetOtpHash: undefined,
        resetOtpExpiresAt: undefined,
        resetOtpAttempts: 0,
        resetOtpRequestedAt: undefined,
      },
    );
  }

  async getMe(
    userId: string,
    organizationId?: string,
    role?: UserRole,
  ): Promise<Omit<IUser, 'passwordHash'>> {
    const user = await User.findOne({ _id: userId, isActive: true })
      .populate('organizationId', 'name slug plan settings')
      .lean();

    if (!user) throw new NotFoundError('User');

    if (role === 'super_admin' && organizationId) {
      const org = await Organization.findById(organizationId)
        .select('name slug plan settings')
        .lean();

      if (!org) throw new NotFoundError('Organization');

      return {
        ...(user as unknown as Omit<IUser, 'passwordHash'>),
        organizationId: org as any,
      };
    }

    return user as unknown as Omit<IUser, 'passwordHash'>;
  }
}

export const authService = new AuthService();
