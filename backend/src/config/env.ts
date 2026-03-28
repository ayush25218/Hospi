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
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
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
