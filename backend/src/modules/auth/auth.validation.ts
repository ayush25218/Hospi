import { z } from 'zod';

const managedUserRoles = ['doctor', 'patient'] as const;
const organizationSlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9-]+$/)
  .optional();

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.email().transform((value) => value.toLowerCase()),
    phone: z.string().trim().optional(),
    password: z.string().min(8),
    role: z.enum(managedUserRoles),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email().transform((value) => value.toLowerCase()),
    password: z.string().min(8),
    organizationSlug: organizationSlugSchema,
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email().transform((value) => value.toLowerCase()),
    organizationSlug: organizationSlugSchema,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(20),
    password: z.string().min(8),
  }),
});
