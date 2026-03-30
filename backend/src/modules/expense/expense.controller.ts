import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { createExpense, deleteExpense, getExpenses } from './expense.service.js';

export const createExpenseHandler = asyncHandler(async (req: Request, res: Response) => {
  const expense = await createExpense(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'expense.created',
    entityType: 'expense',
    entityId: expense.id,
    summary: `Created expense ${expense.category}`,
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Expense created successfully',
    data: expense,
  });
});

export const getExpensesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const expenses = await getExpenses(_req.user!);

  sendResponse({
    res,
    message: 'Expenses fetched successfully',
    data: expenses,
  });
});

export const deleteExpenseHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteExpense(req.params.id, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'expense.deleted',
    entityType: 'expense',
    entityId: req.params.id,
    summary: 'Deleted expense entry',
  });

  sendResponse({
    res,
    message: 'Expense deleted successfully',
  });
});
