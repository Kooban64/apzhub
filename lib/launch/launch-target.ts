import { z } from "zod";

/**
 * Where to go after a successful **ready** decision. No raw secrets — vault is an opaque delegation id only.
 */
export const launchTargetSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("oidc_redirect"),
    /** Mock OIDC start URL (same-tab navigation in Phase 7). */
    href: z.string(),
  }),
  z.object({
    kind: z.literal("jwt_internal"),
    /** In-app route for internal JWT-style launch mock. */
    appRoute: z.string(),
  }),
  z.object({
    kind: z.literal("vault_delegated"),
    /** Correlation id for a vault delegation request — not a credential. */
    delegationRequestId: z.string(),
  }),
  z.object({
    kind: z.literal("external_redirect"),
    href: z.string(),
  }),
]);

export type LaunchTarget = z.infer<typeof launchTargetSchema>;
