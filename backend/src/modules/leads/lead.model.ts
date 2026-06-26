import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface ILead extends MongooseDocument {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  conversationId?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  sourceBot: string;
  intent?: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    sourceBot: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    intent: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'closed'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

leadSchema.index({ organizationId: 1, createdAt: -1 });
leadSchema.index({ organizationId: 1, status: 1 });

export const Lead = model<ILead>('Lead', leadSchema);
