import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const roomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    floor: {
      type: String,
      required: true,
      trim: true,
    },
    roomType: {
      type: String,
      required: true,
      trim: true,
    },
    bedLabel: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'cleaning', 'maintenance'],
      default: 'available',
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    admittedAt: {
      type: Date,
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

export type Room = InferSchemaType<typeof roomSchema>;

export const RoomModel =
  (mongoose.models.Room as mongoose.Model<Room> | undefined) ??
  mongoose.model<Room>('Room', roomSchema);
