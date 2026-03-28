import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string().trim().min(1),
    doctorId: z.string().trim().min(1),
    scheduledAt: z.string().datetime(),
    reason: z.string().trim().min(3),
    notes: z.string().trim().optional(),
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).optional(),
  }),
});
