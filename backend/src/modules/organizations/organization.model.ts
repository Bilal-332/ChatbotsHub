import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import type { PlanName } from '@shared/types';

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  apiKey: string;
  plan: PlanName;
  planExpiresAt?: Date | null;
  planExpiredAt?: Date | null;
  expiredPlan?: 'starter' | 'pro' | null;
  isActive: boolean;
  monthlyQueryCount: number;
  queryResetAt: Date;
  settings: {
    chatbotName: string;
    welcomeMessage: string;
    noAnswerMessage: string;
    primaryColor: string;
    avatarUrl?: string;
    language: 'auto' | 'en' | 'ar' | 'ur';
  };
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
      minlength: 2,
      maxlength: 60,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      default: () => `chk_${uuidv4().replace(/-/g, '')}`,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro'],
      default: 'free',
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    planExpiredAt: {
      type: Date,
      default: null,
    },
    expiredPlan: {
      type: String,
      enum: ['starter', 'pro'],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    monthlyQueryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    queryResetAt: {
      type: Date,
      default: Date.now,
    },
    settings: {
      chatbotName: { type: String, default: 'AI Assistant', maxlength: 50 },
      welcomeMessage: {
        type: String,
        default: 'Hello! How can I help you today?',
        maxlength: 200,
      },
      noAnswerMessage: {
        type: String,
        default:
          'That\'s a great question. I don\'t know the answer yet, but if you tell me more, I\'ll do my best to help.',
        maxlength: 300,
      },
      primaryColor: { type: String, default: '#6366f1', match: /^#[0-9A-Fa-f]{6}$/ },
      avatarUrl: { type: String, default: '', maxlength: 500 },
      language: {
        type: String,
        enum: ['auto', 'en', 'ar', 'ur'],
        default: 'auto',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Organization = model<IOrganization>('Organization', organizationSchema);
