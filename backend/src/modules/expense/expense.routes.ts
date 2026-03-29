import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { createExpenseHandler, deleteExpenseHandler, getExpensesHandler } from './expense.controller.js';
import { createExpenseSchema } from './expense.validation.js';

const router = Router();

router.get('/', auth('admin'), getExpensesHandler);
router.post('/', auth('admin'), validateRequest(createExpenseSchema), createExpenseHandler);
router.delete('/:id', auth('admin'), deleteExpenseHandler);

export const expenseRoutes = router;
