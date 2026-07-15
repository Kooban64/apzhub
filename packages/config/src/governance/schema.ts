import { z } from "zod";

const booleanFromEnv = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const platformEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3300),
  APP_URL: z.string().url().default("http://localhost:3300"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  ALLOW_DEV_REGISTRATION: z.enum(["true", "false"]).default("false").transform((v) => v === "true"),
  NEXT_PUBLIC_ALLOW_DEV_REGISTRATION: z.enum(["true", "false"]).optional(),
  PLATFORM_VERSION: z.string().default("0.0.0"),
  BUILD_NUMBER: z.string().default("local"),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_TEST: z.string().optional(),
  REDIS_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  EMAIL_FROM: z.string().email().default("noreply@apzhub.local"),
  LAW_REPOSITORY_MODE: z.enum(["memory", "postgres"]).default("memory"),
  LAW_TENANT_ID: z.string().uuid().optional(),
  ENTITY_MAPPING_STORE_MODE: z.enum(["memory", "postgres"]).default("memory"),
  ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  AUTHORIZATION_PROVIDER_MODE: z
    .enum(["production", "allow-all", "deny-all"])
    .default("allow-all"),
  AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  LAW_OUTBOX_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  CADDY_HTTP_PORT: z.coerce.number().default(3080),
  CADDY_HTTPS_PORT: z.coerce.number().default(3443),
  PLANE_INTEGRATION_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  PLANE_BASE_URL: z.string().url().optional(),
  PLANE_API_BASE_URL: z.string().url().optional(),
  PLANE_API_TOKEN: z.string().min(16).optional(),
  PLANE_WORKSPACE_ID: z.string().min(1).optional(),
  PLANE_WEBHOOK_SECRET: z.string().min(16).optional(),
});

export type PlatformEnv = z.infer<typeof platformEnvSchema>;

export const lawEnvSchema = platformEnvSchema.pick({
  LAW_REPOSITORY_MODE: true,
  LAW_TENANT_ID: true,
  LAW_OUTBOX_ENABLED: true,
});

export type LawEnv = z.infer<typeof lawEnvSchema>;

export const planeEnvSchema = platformEnvSchema.pick({
  PLANE_INTEGRATION_ENABLED: true,
  PLANE_BASE_URL: true,
  PLANE_API_BASE_URL: true,
  PLANE_API_TOKEN: true,
  PLANE_WORKSPACE_ID: true,
  PLANE_WEBHOOK_SECRET: true,
});

export type PlaneEnv = z.infer<typeof planeEnvSchema>;

export { booleanFromEnv };
