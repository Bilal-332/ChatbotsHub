import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';
import type { DocumentSourceType, DocumentStatus } from '@shared/types';

export interface IDocument extends MongooseDocument {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  title: string;
  fileUrl: string;
  sourceType: DocumentSourceType;
  status: DocumentStatus;
  chunkCount: number;
  processingError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    sourceType: {
      type: String,
      enum: ['pdf', 'docx', 'txt'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending',
    },
    chunkCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    processingError: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

documentSchema.index({ organizationId: 1, status: 1 });
documentSchema.index({ organizationId: 1, createdAt: -1 });

export const Document = model<IDocument>('Document', documentSchema);
