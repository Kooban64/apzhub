import { z } from "zod";

import { envelopeFields } from "./envelope";
import { optionalWorkbenchFields } from "./workbench";
import { optionalKnowledgeFields } from "./knowledge";

/** Document 029 — event definition capability manifest. */
export const eventCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("event"),
    event: z
      .object({
        category: z.string().optional(),
        publisher: z.string(),
        subscribers: z.array(z.string()).optional(),
        payload: z.record(z.string()).optional(),
      })
      .strict(),
    ...optionalWorkbenchFields,
    ...optionalKnowledgeFields,
  })
  .strict();

export type EventCapabilityManifest = z.infer<typeof eventCapabilityManifestSchema>;
