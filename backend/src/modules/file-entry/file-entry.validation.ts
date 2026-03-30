import { z } from 'zod';

export const createFolderSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    visibility: z.enum(['admin', 'doctor', 'patient', 'clinical', 'authenticated']).optional(),
  }),
});
