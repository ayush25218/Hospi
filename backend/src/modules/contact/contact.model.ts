import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactType: {
      type: String,
      enum: ['doctor', 'staff', 'vendor', 'support'],
      default: 'staff',
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
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

export type Contact = InferSchemaType<typeof contactSchema>;

export const ContactModel =
  (mongoose.models.Contact as mongoose.Model<Contact> | undefined) ??
  mongoose.model<Contact>('Contact', contactSchema);
