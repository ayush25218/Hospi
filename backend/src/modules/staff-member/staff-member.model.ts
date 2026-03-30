import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const staffMemberSchema = new Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'on-leave', 'inactive'],
      default: 'active',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
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

export type StaffMember = InferSchemaType<typeof staffMemberSchema>;

export const StaffMemberModel =
  (mongoose.models.StaffMember as mongoose.Model<StaffMember> | undefined) ??
  mongoose.model<StaffMember>('StaffMember', staffMemberSchema);
