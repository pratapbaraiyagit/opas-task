import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z
    .string()
    .default('http://localhost:5173')
    .refine(
      (value) =>
        value.split(',').every((url) => {
          try {
            new URL(url.trim());
            return true;
          } catch {
            return false;
          }
        }),
      { message: 'CLIENT_URL must be one or more valid URLs separated by commas' },
    ),

  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT access secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  SMTP_HOST: z.string().default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('noreply@opash-software-task.io'),

  SHARE_LINK_SECRET: z.string().min(16).default('default-share-secret-key-change-me'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.format();
  const errors = Object.entries(formatted)
    .filter(([key]) => key !== '_errors')
    .map(([key, value]) => {
      const errorMessages = (value as { _errors: string[] })._errors;
      return `  ${key}: ${errorMessages.join(', ')}`;
    })
    .join('\n');

  // eslint-disable-next-line no-console
  console.error(`\n❌ Environment validation failed:\n${errors}\n`);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;

export const getClientOrigins = (): string[] =>
  env.CLIENT_URL.split(',').map((url) => url.trim());
