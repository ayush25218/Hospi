import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const expenseSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    expenseDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['approved', 'pending'],
      default: 'pending',
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

export type Expense = InferSchemaType<typeof expenseSchema>;

export const ExpenseModel =
  (mongoose.models.Expense as mongoose.Model<Expense> | undefined) ??
  mongoose.model<Expense>('Expense', expenseSchema);
