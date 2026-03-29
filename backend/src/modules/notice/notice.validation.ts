import { z } from 'zod';

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2),
    content: z.string().trim().min(3),
    category: z.enum(['urgent', 'hr', 'clinical', 'events', 'general']).optional(),
    author: z.string().trim().min(2).optional(),
    audience: z.enum(['all-staff', 'doctors-only', 'nurses-only', 'admin']).optional(),
    isPinned: z.boolean().optional(),
  }),
});

export const updateNoticeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).optional(),
    content: z.string().trim().min(3).optional(),
    category: z.enum(['urgent', 'hr', 'clinical', 'events', 'general']).optional(),
    author: z.string().trim().min(2).optional(),
    audience: z.enum(['all-staff', 'doctors-only', 'nurses-only', 'admin']).optional(),
    isPinned: z.boolean().optional(),
  }),
});
