import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const noticeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['urgent', 'hr', 'clinical', 'events', 'general'],
      default: 'general',
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    audience: {
      type: String,
      enum: ['all-staff', 'doctors-only', 'nurses-only', 'admin'],
      default: 'all-staff',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type Notice = InferSchemaType<typeof noticeSchema>;

export const NoticeModel =
  (mongoose.models.Notice as mongoose.Model<Notice> | undefined) ??
  mongoose.model<Notice>('Notice', noticeSchema);
