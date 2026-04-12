import { z } from "zod";

/** How a service is opened after a successful launch decision (Phase 7 mock paths only). */
export const launchMethodSchema = z.enum(["oidc", "jwt", "vault", "external"]);

export type LaunchMethod = z.infer<typeof launchMethodSchema>;
