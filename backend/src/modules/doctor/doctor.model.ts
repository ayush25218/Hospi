import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const doctorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    bio: {
      type: String,
      trim: true,
    },
    availability: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type Doctor = InferSchemaType<typeof doctorSchema>;

export const DoctorModel =
  (mongoose.models.Doctor as mongoose.Model<Doctor> | undefined) ??
  mongoose.model<Doctor>('Doctor', doctorSchema);
