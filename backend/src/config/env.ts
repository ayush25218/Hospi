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
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().min(5).max(240).default(30),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
  ADMIN_NAME: z.string().min(2).default('Hospi Admin'),
  ADMIN_EMAIL: z.email().default('admin@hospi.com'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin@12345'),
});

const parsedEnvironment = envSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error('Invalid backend environment configuration', parsedEnvironment.error.flatten().fieldErrors);
  throw new Error('Backend environment validation failed');
}

export const env = {
  ...parsedEnvironment.data,
  corsOrigins: parsedEnvironment.data.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
