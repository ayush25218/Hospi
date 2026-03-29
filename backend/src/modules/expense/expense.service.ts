import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { ExpenseModel } from './expense.model.js';
import type { createExpenseSchema } from './expense.validation.js';

type CreateExpensePayload = z.infer<typeof createExpenseSchema>['body'];

export async function createExpense(payload: CreateExpensePayload, createdBy: string) {
  return ExpenseModel.create({
    category: payload.category,
    amount: payload.amount,
    description: payload.description,
    expenseDate: new Date(payload.expenseDate),
    status: payload.status ?? 'pending',
    createdBy,
  });
}

export async function getExpenses() {
  return ExpenseModel.find().populate('createdBy', '-password').sort({ expenseDate: -1, createdAt: -1 });
}

export async function deleteExpense(expenseId: string) {
  const deletedExpense = await ExpenseModel.findByIdAndDelete(expenseId);

  if (!deletedExpense) {
    throw new AppError('Expense not found', 404);
  }
}
