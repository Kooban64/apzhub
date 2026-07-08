import { z } from "zod";

import { envelopeFields } from "./envelope";
import { optionalWorkbenchFields } from "./workbench";
import { optionalKnowledgeFields } from "./knowledge";

/** Document 026 — integration capability manifest. */
export const integrationCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("integration"),
    integration: z
      .object({
        type: z.string(),
        capabilities: z.array(z.string()).optional(),
      })
      .strict(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export type IntegrationCapabilityManifest = z.infer<
  typeof integrationCapabilityManifestSchema
>;
