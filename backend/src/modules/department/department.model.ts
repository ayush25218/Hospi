import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    headDoctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    staffCount: {
      type: Number,
      min: 0,
      default: 0,
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

export type Department = InferSchemaType<typeof departmentSchema>;

export const DepartmentModel =
  (mongoose.models.Department as mongoose.Model<Department> | undefined) ??
  mongoose.model<Department>('Department', departmentSchema);
