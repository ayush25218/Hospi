import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type Organization = InferSchemaType<typeof organizationSchema>;

export const OrganizationModel =
  (mongoose.models.Organization as mongoose.Model<Organization> | undefined) ??
  mongoose.model<Organization>('Organization', organizationSchema);
