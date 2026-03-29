import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { createExpense, deleteExpense, getExpenses } from './expense.service.js';

export const createExpenseHandler = asyncHandler(async (req: Request, res: Response) => {
  const expense = await createExpense(req.body, req.user!.id);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Expense created successfully',
    data: expense,
  });
});

export const getExpensesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const expenses = await getExpenses();

  sendResponse({
    res,
    message: 'Expenses fetched successfully',
    data: expenses,
  });
});

export const deleteExpenseHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteExpense(req.params.id);

  sendResponse({
    res,
    message: 'Expense deleted successfully',
  });
});
