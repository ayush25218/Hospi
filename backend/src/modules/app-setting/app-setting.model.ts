import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const appSettingSchema = new Schema(
  {
    singletonKey: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    appTitle: {
      type: String,
      trim: true,
      default: 'Hospi Command Center',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    footerText: {
      type: String,
      trim: true,
      default: 'Care coordination for every team.',
    },
    themeColor: {
      type: String,
      trim: true,
      default: '#0f766e',
    },
    sidebarColor: {
      type: String,
      trim: true,
      default: '#0f172a',
    },
    pageBgColor: {
      type: String,
      trim: true,
      default: '#f8fafc',
    },
    language: {
      type: String,
      trim: true,
      default: 'en',
    },
    timeZone: {
      type: String,
      trim: true,
      default: 'Asia/Calcutta',
    },
    currency: {
      type: String,
      trim: true,
      default: 'INR',
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    faviconUrl: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type AppSetting = InferSchemaType<typeof appSettingSchema>;

export const AppSettingModel =
  (mongoose.models.AppSetting as mongoose.Model<AppSetting> | undefined) ??
  mongoose.model<AppSetting>('AppSetting', appSettingSchema);
