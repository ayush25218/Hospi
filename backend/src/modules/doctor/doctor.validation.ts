import { z } from 'zod';

export const createDoctorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.email().transform((value) => value.toLowerCase()),
    phone: z.string().trim().optional(),
    password: z.string().min(8),
    department: z.string().trim().min(2),
    specialization: z.string().trim().min(2),
    yearsOfExperience: z.number().int().min(0).optional(),
    consultationFee: z.number().min(0).optional(),
    bio: z.string().trim().optional(),
    availability: z.array(z.string().trim().min(2)).optional(),
  }),
});
