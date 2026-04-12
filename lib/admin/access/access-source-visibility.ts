import { z } from "zod";

/** Single vocabulary for how access is attributed (matrix + inspector must match). */
export const accessSourceVisibilitySchema = z.enum([
  "bundle",
  "override",
  "bundle_plus_override",
  "direct",
  "none",
]);

export type AccessSourceVisibility = z.infer<typeof accessSourceVisibilitySchema>;

/** Canonical short labels for UI — do not invent copy elsewhere. */
export const ACCESS_SOURCE_LABELS: Record<AccessSourceVisibility, string> = {
  bundle: "Bundle",
  override: "Override",
  bundle_plus_override: "Bundle + override",
  direct: "Direct",
  none: "None",
};
