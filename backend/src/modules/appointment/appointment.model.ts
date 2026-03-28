import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
      default: 'scheduled',
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

export type Appointment = InferSchemaType<typeof appointmentSchema>;

export const AppointmentModel =
  (mongoose.models.Appointment as mongoose.Model<Appointment> | undefined) ??
  mongoose.model<Appointment>('Appointment', appointmentSchema);
