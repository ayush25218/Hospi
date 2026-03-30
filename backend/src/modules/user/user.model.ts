import bcrypt from 'bcryptjs';
import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';
import { env } from '../../config/env.js';

export const userRoles = ['admin', 'doctor', 'patient'] as const;
export type UserRole = (typeof userRoles)[number];

type UserMethods = {
  comparePassword(candidatePassword: string): Promise<boolean>;
};

type UserModel = Model<User, object, UserMethods>;

const userSchema = new Schema(
  {
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
    role: {
      type: String,
      enum: userRoles,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        const {
          password: _password,
          passwordResetTokenHash: _passwordResetTokenHash,
          passwordResetExpiresAt: _passwordResetExpiresAt,
          ...serialized
        } = ret as typeof ret & {
          password?: string;
          passwordResetTokenHash?: string;
          passwordResetExpiresAt?: string;
        };
        return serialized;
      },
    },
  },
);

userSchema.pre('save', async function savePassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = mongoose.HydratedDocument<User, UserMethods>;

export const UserModel =
  (mongoose.models.User as UserModel | undefined) ??
  mongoose.model<User, UserModel>('User', userSchema);
