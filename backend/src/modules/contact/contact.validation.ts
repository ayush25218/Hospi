import { z } from 'zod';

export const createContactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    contactType: z.enum(['doctor', 'staff', 'vendor', 'support']).optional(),
    role: z.string().trim().min(2),
    department: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.email().optional(),
    address: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  }),
});

export const updateContactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    contactType: z.enum(['doctor', 'staff', 'vendor', 'support']).optional(),
    role: z.string().trim().min(2).optional(),
    department: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.email().optional(),
    address: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  }),
});
