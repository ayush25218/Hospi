import { z } from 'zod';

export const updateAppSettingSchema = z.object({
  body: z.object({
    appTitle: z.string().trim().min(2).optional(),
    address: z.string().trim().optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().optional(),
    footerText: z.string().trim().optional(),
    themeColor: z.string().trim().min(4).optional(),
    sidebarColor: z.string().trim().min(4).optional(),
    pageBgColor: z.string().trim().min(4).optional(),
    language: z.string().trim().min(2).optional(),
    timeZone: z.string().trim().min(2).optional(),
    currency: z.string().trim().min(2).optional(),
    logoUrl: z.string().trim().url().optional(),
    faviconUrl: z.string().trim().url().optional(),
  }),
});
