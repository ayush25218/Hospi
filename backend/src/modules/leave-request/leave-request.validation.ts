import { z } from 'zod';

export const createLeaveRequestSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.email(),
    department: z.string().trim().min(2),
    leaveType: z.string().trim().min(2),
    fromDate: z.string().datetime(),
    toDate: z.string().datetime(),
    reason: z.string().trim().min(3),
  }),
});

export const updateLeaveRequestStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
  }),
});
