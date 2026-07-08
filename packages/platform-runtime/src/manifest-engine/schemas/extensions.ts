import { z } from "zod";

import { compatibilitySchema, envelopeFields } from "./envelope";
import { optionalWorkbenchFields } from "./workbench";
import { optionalKnowledgeFields } from "./knowledge";

export const themeCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("theme"),
    compatibility: compatibilitySchema.optional(),
    theme: z
      .object({
        mode: z.enum(["light", "dark", "system"]).optional(),
        tokenSet: z.string().optional(),
        extends: z.string().optional(),
      })
      .strict(),
    presentation: z
      .object({
        tokenSet: z.string().optional(),
        extends: z.string().optional(),
      })
      .strict()
      .optional(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export const commandCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("command"),
    command: z
      .object({
        label: z.string(),
        category: z.string().optional(),
        shortcut: z.string().optional(),
        permission: z.string().optional(),
      })
      .strict(),
    execution: z
      .object({
        type: z.string(),
        handler: z.string().optional(),
      })
      .strict()
      .optional(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export const searchProviderCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("search-provider"),
    searchProvider: z
      .object({
        scope: z.string(),
        priority: z.number().optional(),
      })
      .strict(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export const workerCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("worker"),
    worker: z
      .object({
        schedule: z
          .object({
            type: z.string(),
            expression: z.string().optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
    events: z
      .object({
        subscribes: z.array(z.string()).optional(),
      })
      .strict()
      .optional(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export const dashboardCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("dashboard"),
    dashboard: z
      .object({
        layout: z.string().optional(),
      })
      .strict(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export const widgetCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("widget"),
    widget: z
      .object({
        size: z.string().optional(),
      })
      .strict(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export const reportCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("report"),
    report: z
      .object({
        format: z.string().optional(),
      })
      .strict(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export const aiProviderCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("ai-provider"),
    aiProvider: z
      .object({
        status: z.enum(["enabled", "disabled"]).optional(),
      })
      .strict(),
  })
  .strict();

export const featureFlagCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("feature-flag"),
    featureFlag: z
      .object({
        default: z.boolean(),
        description: z.string().optional(),
      })
      .strict(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export type ThemeCapabilityManifest = z.infer<typeof themeCapabilityManifestSchema>;
export type CommandCapabilityManifest = z.infer<typeof commandCapabilityManifestSchema>;
