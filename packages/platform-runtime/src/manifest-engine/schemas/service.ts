import { z } from "zod";

import { envelopeFields } from "./envelope";
import { optionalWorkbenchFields } from "./workbench";
import { optionalKnowledgeFields } from "./knowledge";

/** Document 027 — platform service capability manifest. */
export const serviceCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("service"),
    service: z
      .object({
        category: z.string().optional(),
      })
      .strict()
      .optional(),
    integrations: z.array(z.string()).optional(),
    events: z
      .object({
        publishes: z.array(z.string()).optional(),
      })
      .strict()
      .optional(),
    permissions: z.array(z.string()).optional(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export type ServiceCapabilityManifest = z.infer<typeof serviceCapabilityManifestSchema>;
