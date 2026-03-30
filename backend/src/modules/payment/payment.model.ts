import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const paymentSchema = new Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    payerName: {
      type: String,
      required: true,
      trim: true,
    },
    payerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    method: {
      type: String,
      enum: ['cash', 'upi', 'credit-card', 'debit-card', 'net-banking'],
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'pending', 'failed', 'refunded'],
      default: 'success',
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

export type Payment = InferSchemaType<typeof paymentSchema>;

export const PaymentModel =
  (mongoose.models.Payment as mongoose.Model<Payment> | undefined) ??
  mongoose.model<Payment>('Payment', paymentSchema);
