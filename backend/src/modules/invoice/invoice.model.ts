import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const invoiceLineItemSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    recipientType: {
      type: String,
      enum: ['patient', 'doctor', 'staff'],
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    paystubType: {
      type: String,
      enum: ['patient-bill', 'salary', 'expense', 'bonus'],
      default: 'patient-bill',
    },
    issueDate: {
      type: Date,
      required: true,
    },
    periodStart: {
      type: Date,
    },
    periodEnd: {
      type: Date,
    },
    lineItems: {
      type: [invoiceLineItemSchema],
      default: [],
    },
    taxRate: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    subtotal: {
      type: Number,
      min: 0,
      required: true,
    },
    taxAmount: {
      type: Number,
      min: 0,
      required: true,
    },
    totalAmount: {
      type: Number,
      min: 0,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'cancelled'],
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

export type Invoice = InferSchemaType<typeof invoiceSchema>;

export const InvoiceModel =
  (mongoose.models.Invoice as mongoose.Model<Invoice> | undefined) ??
  mongoose.model<Invoice>('Invoice', invoiceSchema);
