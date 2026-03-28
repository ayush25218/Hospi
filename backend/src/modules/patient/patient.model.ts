import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const patientSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type Patient = InferSchemaType<typeof patientSchema>;

export const PatientModel =
  (mongoose.models.Patient as mongoose.Model<Patient> | undefined) ??
  mongoose.model<Patient>('Patient', patientSchema);
