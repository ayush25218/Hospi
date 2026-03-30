import { z } from 'zod';

const baseStaffMemberSchema = z.object({
  staffId: z.string().trim().min(3).optional(),
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  department: z.string().trim().min(2),
  role: z.string().trim().min(2),
  status: z.enum(['active', 'on-leave', 'inactive']).optional(),
  joinedAt: z.string().datetime().optional(),
  photoUrl: z.string().trim().url().optional(),
  notes: z.string().trim().optional(),
});

export const createStaffMemberSchema = z.object({
  body: baseStaffMemberSchema,
});

export const updateStaffMemberSchema = z.object({
  body: baseStaffMemberSchema.partial(),
});
