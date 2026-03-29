import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    description: z.string().trim().optional(),
    headDoctorId: z.string().trim().optional(),
    staffCount: z.number().int().min(0).optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().optional(),
    headDoctorId: z.string().trim().optional(),
    staffCount: z.number().int().min(0).optional(),
  }),
});
