import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    category: z.string().trim().min(2),
    amount: z.number().min(0),
    description: z.string().trim().min(3),
    expenseDate: z.string().datetime(),
    status: z.enum(['approved', 'pending']).optional(),
  }),
});
