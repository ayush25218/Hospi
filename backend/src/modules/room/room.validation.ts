import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    roomNumber: z.string().trim().min(2),
    floor: z.string().trim().min(2),
    roomType: z.string().trim().min(2),
    bedLabel: z.string().trim().optional(),
    status: z.enum(['available', 'occupied', 'cleaning', 'maintenance']).optional(),
    notes: z.string().trim().optional(),
  }),
});

export const updateRoomSchema = z.object({
  body: z.object({
    roomNumber: z.string().trim().min(2).optional(),
    floor: z.string().trim().min(2).optional(),
    roomType: z.string().trim().min(2).optional(),
    bedLabel: z.string().trim().optional(),
    status: z.enum(['available', 'occupied', 'cleaning', 'maintenance']).optional(),
    notes: z.string().trim().optional(),
  }),
});

export const assignRoomSchema = z.object({
  body: z.object({
    patientId: z.string().trim().min(1),
    doctorId: z.string().trim().min(1),
    admittedAt: z.string().datetime().optional(),
    bedLabel: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  }),
});

export const updateRoomStatusSchema = z.object({
  body: z.object({
    status: z.enum(['available', 'occupied', 'cleaning', 'maintenance']),
  }),
});

export const vacateRoomSchema = z.object({
  body: z.object({
    status: z.enum(['available', 'cleaning', 'maintenance']).optional(),
  }),
});
