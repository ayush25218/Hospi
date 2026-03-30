import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const payrollSchema = new Schema(
  {
    payrollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    staffMember: {
      type: Schema.Types.ObjectId,
      ref: 'StaffMember',
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending',
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

export type Payroll = InferSchemaType<typeof payrollSchema>;

export const PayrollModel =
  (mongoose.models.Payroll as mongoose.Model<Payroll> | undefined) ??
  mongoose.model<Payroll>('Payroll', payrollSchema);
