import { z } from 'zod';

const basePayrollSchema = z.object({
  staffMemberId: z.string().trim().optional(),
  employeeName: z.string().trim().min(2),
  employeeId: z.string().trim().min(2),
  department: z.string().trim().min(2),
  designation: z.string().trim().min(2),
  salary: z.number().min(0),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  paymentDate: z.string().datetime(),
  status: z.enum(['paid', 'pending']).optional(),
  notes: z.string().trim().optional(),
});

export const createPayrollSchema = z.object({
  body: basePayrollSchema,
});

export const updatePayrollSchema = z.object({
  body: basePayrollSchema.partial(),
});
