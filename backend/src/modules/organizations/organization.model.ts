import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import type { PlanName } from '@shared/types';

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  apiKey: string;
  plan: PlanName;
  isActive: boolean;
  monthlyQueryCount: number;
  queryResetAt: Date;
  settings: {
    chatbotName: string;
    welcomeMessage: string;
    primaryColor: string;
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
      primaryColor: { type: String, default: '#6366f1', match: /^#[0-9A-Fa-f]{6}$/ },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Organization = model<IOrganization>('Organization', organizationSchema);
