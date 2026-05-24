import { User, IUser, hashPassword } from './user.model';
import { Organization } from '@modules/organizations/organization.model';
import { generateTokenPair, verifyRefreshToken, TokenPair } from './token.service';
import { ConflictError, UnauthorizedError, NotFoundError } from '@shared/errors';
import { OAuth2Client } from 'google-auth-library';
import { config } from '@shared/config';
import type { UserRole } from '@shared/types';

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
}

export class AuthService {
  private googleClient = new OAuth2Client(config.google.clientId);

  private async verifyGoogleToken(idToken: string): Promise<{ email: string; googleId: string }> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified || !payload.sub) {
      throw new UnauthorizedError('Google account could not be verified');
    }

    return {
      email: payload.email.toLowerCase(),
      googleId: payload.sub,
    };
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
