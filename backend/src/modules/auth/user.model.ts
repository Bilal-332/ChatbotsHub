import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@shared/types';

const BCRYPT_ROUNDS = 12;

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  authProvider: 'password' | 'google';
  googleId?: string;
  role: UserRole;
  organizationId: Types.ObjectId;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: function (this: IUser) {
        return this.authProvider === 'password';
      },
      select: false, // Never returned in queries by default
    },
    authProvider: {
      type: String,
      enum: ['password', 'google'],
      default: 'password',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'super_admin'],
      default: 'admin',
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash as string);
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export const User = model<IUser>('User', userSchema);
