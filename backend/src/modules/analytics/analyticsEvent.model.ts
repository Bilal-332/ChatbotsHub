import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export type AnalyticsEventType = 'message';

export interface IAnalyticsEvent extends MongooseDocument {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  conversationId: string;
  visitorId?: string;
  type: AnalyticsEventType;
  question?: string;
  questionNormalized?: string;
  answered: boolean;
  confidence?: number;
  sourceChunks: number;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    visitorId: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ['message'],
      default: 'message',
    },
    question: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    questionNormalized: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    answered: {
      type: Boolean,
      default: false,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    sourceChunks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound indexes that back the analytics aggregation pipelines.
analyticsEventSchema.index({ organizationId: 1, createdAt: -1 });
analyticsEventSchema.index({ organizationId: 1, answered: 1, createdAt: -1 });
analyticsEventSchema.index({ organizationId: 1, conversationId: 1, createdAt: 1 });

export const AnalyticsEvent = model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
