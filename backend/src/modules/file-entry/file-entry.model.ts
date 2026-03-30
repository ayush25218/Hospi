import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const fileEntrySchema = new Schema(
  {
    kind: {
      type: String,
      enum: ['folder', 'file'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'doc', 'other'],
      default: 'other',
    },
    sizeBytes: {
      type: Number,
      min: 0,
      default: 0,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    extension: {
      type: String,
      trim: true,
    },
    storagePath: {
      type: String,
      trim: true,
    },
    publicUrl: {
      type: String,
      trim: true,
    },
    parentFolder: {
      type: Schema.Types.ObjectId,
      ref: 'FileEntry',
    },
    visibility: {
      type: String,
      enum: ['admin', 'doctor', 'patient', 'clinical', 'authenticated'],
      default: 'admin',
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

export type FileEntry = InferSchemaType<typeof fileEntrySchema>;

export const FileEntryModel =
  (mongoose.models.FileEntry as mongoose.Model<FileEntry> | undefined) ??
  mongoose.model<FileEntry>('FileEntry', fileEntrySchema);
