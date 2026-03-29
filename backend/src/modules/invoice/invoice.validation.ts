import { z } from 'zod';

const lineItemSchema = z.object({
  description: z.string().trim().min(2),
  quantity: z.number().positive(),
  price: z.number().min(0),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    recipientType: z.enum(['patient', 'doctor', 'staff']),
    recipientName: z.string().trim().min(2),
    recipientEmail: z.email().optional(),
    patientId: z.string().trim().optional(),
    doctorId: z.string().trim().optional(),
    paystubType: z.enum(['patient-bill', 'salary', 'expense', 'bonus']).optional(),
    issueDate: z.string().datetime(),
    periodStart: z.string().datetime().optional(),
    periodEnd: z.string().datetime().optional(),
    lineItems: z.array(lineItemSchema).min(1),
    taxRate: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    status: z.enum(['draft', 'pending', 'paid', 'cancelled']).optional(),
    notes: z.string().trim().optional(),
  }),
});
