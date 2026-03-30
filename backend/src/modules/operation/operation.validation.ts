import { z } from 'zod';

export const createOperationSchema = z.object({
  body: z
    .object({
      doctorId: z.string().trim().optional(),
      patientId: z.string().trim().optional(),
      doctorName: z.string().trim().optional(),
      patientName: z.string().trim().optional(),
      operationName: z.string().trim().min(2),
      scheduledAt: z.string().datetime(),
      status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).optional(),
      roomNumber: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    })
    .superRefine((data, context) => {
      if (!data.doctorId && !data.doctorName) {
        context.addIssue({
          code: 'custom',
          path: ['doctorName'],
          message: 'Doctor name or doctor profile is required',
        });
      }

      if (!data.patientId && !data.patientName) {
        context.addIssue({
          code: 'custom',
          path: ['patientName'],
          message: 'Patient name or patient profile is required',
        });
      }
    }),
});

export const updateOperationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
  }),
});
