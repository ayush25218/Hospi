import { z } from 'zod';

export const createPatientSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.email().transform((value) => value.toLowerCase()),
    phone: z.string().trim().optional(),
    password: z.string().min(8),
    gender: z.enum(['male', 'female', 'other']),
    dateOfBirth: z.string().datetime(),
    bloodGroup: z.string().trim().optional(),
    address: z.string().trim().optional(),
    emergencyContact: z.string().trim().optional(),
    medicalHistory: z.array(z.string().trim().min(2)).optional(),
  }),
});
