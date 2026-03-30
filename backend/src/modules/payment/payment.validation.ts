import { z } from 'zod';

const basePaymentSchema = z.object({
  payerName: z.string().trim().min(2),
  payerEmail: z.string().trim().email().optional(),
  patientId: z.string().trim().optional(),
  invoiceId: z.string().trim().optional(),
  amount: z.number().min(0),
  paymentDate: z.string().datetime(),
  method: z.enum(['cash', 'upi', 'credit-card', 'debit-card', 'net-banking']),
  status: z.enum(['success', 'pending', 'failed', 'refunded']).optional(),
  notes: z.string().trim().optional(),
});

export const createPaymentSchema = z.object({
  body: basePaymentSchema,
});

export const updatePaymentSchema = z.object({
  body: basePaymentSchema.partial(),
});
