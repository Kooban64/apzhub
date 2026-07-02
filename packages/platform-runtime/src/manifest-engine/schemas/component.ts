import { z } from "zod";

import { envelopeFields } from "./envelope";
import { optionalWorkbenchFields } from "./workbench";

const componentPayloadSchema = z
  .object({
    theme: z
      .object({
        supportsDarkMode: z.boolean().optional(),
      })
      .strict()
      .optional(),
    props: z.record(z.unknown()).optional(),
  })
  .strict();

/** Document 028 — UI component capability manifest. */
export const componentCapabilityManifestSchema = z
  .object({
    ...envelopeFields,
    kind: z.literal("component"),
    component: componentPayloadSchema,
    ...optionalWorkbenchFields,
  })
  .strict();

export type ComponentCapabilityManifest = z.infer<
  typeof componentCapabilityManifestSchema
>;
