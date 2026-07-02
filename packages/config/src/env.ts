import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3300),
  APP_URL: z.string().url().default("http://localhost:3300"),
  ALLOW_DEV_REGISTRATION: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_ALLOW_DEV_REGISTRATION: z.enum(["true", "false"]).optional(),
  PLATFORM_VERSION: z.string().default("0.0.0"),
  BUILD_NUMBER: z.string().default("local"),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_TEST: z.string().optional(),
  REDIS_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  EMAIL_FROM: z.string().email().default("noreply@apzhub.local"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function resetEnvCache(): void {
  cached = null;
}

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}

export function isDevRegistrationAllowed(): boolean {
  const env = getEnv();
  return env.NODE_ENV === "development" && env.ALLOW_DEV_REGISTRATION;
}

export function getDatabaseUrl(forTest = false): string {
  const env = getEnv();
  if (forTest && env.DATABASE_URL_TEST) return env.DATABASE_URL_TEST;
  return env.DATABASE_URL;
}

export * from "./db/index";
