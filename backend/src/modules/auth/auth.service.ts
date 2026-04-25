import { User, IUser, hashPassword } from './user.model';
import { Organization } from '@modules/organizations/organization.model';
import { generateTokenPair, verifyRefreshToken, TokenPair } from './token.service';
import { ConflictError, UnauthorizedError, NotFoundError } from '@shared/errors';
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
      organizationId: user.organizationId.toString(),
      role: user.role,
    });
  }

  async getMe(userId: string): Promise<Omit<IUser, 'passwordHash'>> {
    const user = await User.findOne({ _id: userId, isActive: true })
      .populate('organizationId', 'name slug plan settings')
      .lean();

    if (!user) throw new NotFoundError('User');
    return user as unknown as Omit<IUser, 'passwordHash'>;
  }
}

export const authService = new AuthService();
