import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/hospi'),
  DB_REQUIRED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(12).default('change-this-super-secret-key'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  APP_BASE_URL: z.string().default('http://localhost:3000'),
  DEFAULT_ORGANIZATION_NAME: z.string().min(2).default('Hospi Main Workspace'),
  DEFAULT_ORGANIZATION_SLUG: z.string().min(2).default('main-hospital'),
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().min(5).max(240).default(30),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
  EMAIL_PROVIDER: z.enum(['console', 'resend']).default('console'),
  EMAIL_FROM: z.string().trim().optional(),
  RESEND_API_KEY: z.string().trim().optional(),
  ALLOW_LOCAL_FILE_STORAGE_IN_PRODUCTION: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  ADMIN_NAME: z.string().min(2).default('Hospi Admin'),
  ADMIN_EMAIL: z.email().default('admin@hospi.com'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin@12345'),
});

const parsedEnvironment = envSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error('Invalid backend environment configuration', parsedEnvironment.error.flatten().fieldErrors);
  throw new Error('Backend environment validation failed');
}

const configuration = parsedEnvironment.data;

if (configuration.NODE_ENV === 'production') {
  if (configuration.JWT_SECRET === 'change-this-super-secret-key') {
    throw new Error('JWT_SECRET must be overridden in production');
  }

  if (configuration.ADMIN_PASSWORD === 'Admin@12345') {
    throw new Error('ADMIN_PASSWORD must be overridden in production');
  }

  if (!configuration.ALLOW_LOCAL_FILE_STORAGE_IN_PRODUCTION) {
    throw new Error(
      'Local file storage is blocked in production. Set ALLOW_LOCAL_FILE_STORAGE_IN_PRODUCTION=true only if you are intentionally using local disk.',
    );
  }

  if (configuration.EMAIL_PROVIDER !== 'resend') {
    throw new Error('EMAIL_PROVIDER must be set to resend in production');
  }

  if (!configuration.RESEND_API_KEY || !configuration.EMAIL_FROM) {
    throw new Error('RESEND_API_KEY and EMAIL_FROM are required when EMAIL_PROVIDER=resend');
  }
}

export const env = {
  ...configuration,
  corsOrigins: configuration.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
