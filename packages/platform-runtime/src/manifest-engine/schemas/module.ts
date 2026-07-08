import { z } from "zod";

import { compatibilitySchema, envelopeFields } from "./envelope";
import { optionalWorkbenchFields } from "./workbench";
import { optionalKnowledgeFields } from "./knowledge";

const navigationItemSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    route: z.string().optional(),
    icon: z.string().optional(),
    permission: z.string().optional(),
  })
  .strict();

/** Document 025 — module capability manifest (validation subset). */
export const moduleCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("module"),
    compatibility: compatibilitySchema.optional(),
    module: z
      .object({
        category: z.string().optional(),
        status: z.enum(["enabled", "disabled", "maintenance"]).optional(),
        description: z.string().optional(),
      })
      .strict()
      .optional(),
    navigation: z
      .object({
        activityBar: z
          .object({
            enabled: z.boolean(),
            label: z.string().optional(),
            icon: z.string().optional(),
            order: z.number().optional(),
            permission: z.string().optional(),
          })
          .strict()
          .optional(),
        sidebar: z.array(navigationItemSchema).optional(),
      })
      .strict()
      .optional(),
    permissions: z
      .array(
        z
          .object({
            id: z.string(),
            description: z.string().optional(),
          })
          .strict(),
      )
      .optional(),
    commands: z
      .array(
        z
          .object({
            id: z.string(),
            label: z.string(),
            category: z.string().optional(),
            permission: z.string().optional(),
          })
          .strict(),
      )
      .optional(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export type ModuleCapabilityManifest = z.infer<typeof moduleCapabilityManifestSchema>;
