import { z } from "zod";

import { CAPABILITY_KINDS, MANIFEST_SCHEMA_VERSION } from "../capability-kinds";

export const capabilityKindSchema = z.enum(CAPABILITY_KINDS);

export const manifestSchemaVersionSchema = z.literal(MANIFEST_SCHEMA_VERSION);

export const metadataSchema = z
  .object({
    category: z.string().optional(),
    description: z.string().optional(),
    owner: z.string().optional(),
    tags: z.array(z.string()).optional(),
    icon: z.string().optional(),
  })
  .strict();

export const dependenciesSchema = z
  .object({
    platform: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    integrations: z.array(z.string()).optional(),
    modules: z.array(z.string()).optional(),
  })
  .strict();

export const healthSchema = z
  .object({
    enabled: z.boolean(),
    endpoint: z.string().optional(),
  })
  .strict();

export const documentationSchema = z.record(
  z.union([z.string(), z.boolean(), z.number()]),
);

export const testsSchema = z.record(z.union([z.boolean(), z.string()]));

export const capabilityIdSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z][a-z0-9-]*$/,
    "Capability id must be kebab-case starting with a letter",
  );

/** Shared envelope fields per ADR-0011. */
export const envelopeFields = {
  manifestSchemaVersion: manifestSchemaVersionSchema,
  id: capabilityIdSchema,
  name: z.string().min(1),
  version: z.string().min(1),
  kind: capabilityKindSchema,
  metadata: metadataSchema,
  dependencies: dependenciesSchema.optional(),
  health: healthSchema.optional(),
  documentation: documentationSchema.optional(),
  tests: testsSchema.optional(),
};

export const compatibilitySchema = z
  .object({
    platformVersion: z.string().optional(),
    requires: z.array(z.string()).optional(),
  })
  .strict();

export type CapabilityMetadata = z.infer<typeof metadataSchema>;
export type CapabilityDependencies = z.infer<typeof dependenciesSchema>;
export type CapabilityHealth = z.infer<typeof healthSchema>;
