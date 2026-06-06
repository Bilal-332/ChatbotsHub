import { Schema, model, Document, Types } from 'mongoose';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationState {
  currentDay?: string;
  lastDoctorName?: string;
  lastPatientName?: string;
  lastTopic?: string;
  preferredLanguage?: string;
}

export interface IConversationSession extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  conversationId: string;
  history: ConversationMessage[];
  state: ConversationState;
  updatedAt: Date;
  expiresAt: Date;
}

const conversationSessionSchema = new Schema<IConversationSession>(
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
      maxlength: 64,
    },
    history: {
      type: [
        {
          role: { type: String, enum: ['user', 'assistant'], required: true },
          content: { type: String, required: true, maxlength: 2000 },
        },
      ],
      default: [],
    },
    state: {
      type: Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false,
  },
);

conversationSessionSchema.index({ organizationId: 1, conversationId: 1 }, { unique: true });
conversationSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ConversationSession = model<IConversationSession>(
  'ConversationSession',
  conversationSessionSchema,
);
