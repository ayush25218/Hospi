import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { getOrganizationUserIds } from '../../utils/organization-scope.js';
import { ExpenseModel } from './expense.model.js';
import type { createExpenseSchema } from './expense.validation.js';

type CreateExpensePayload = z.infer<typeof createExpenseSchema>['body'];

export async function createExpense(payload: CreateExpensePayload, actor: AuthenticatedUser) {
  return ExpenseModel.create({
    category: payload.category,
    amount: payload.amount,
    description: payload.description,
    expenseDate: new Date(payload.expenseDate),
    status: payload.status ?? 'pending',
    createdBy: actor.id,
  });
}

export async function getExpenses(actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  return ExpenseModel.find({ createdBy: { $in: organizationUserIds } })
    .populate('createdBy', '-password')
    .sort({ expenseDate: -1, createdAt: -1 });
}

export async function deleteExpense(expenseId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const deletedExpense = await ExpenseModel.findOneAndDelete({
    _id: expenseId,
    createdBy: { $in: organizationUserIds },
  });

  if (!deletedExpense) {
    throw new AppError('Expense not found', 404);
  }
}
