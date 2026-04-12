import { z } from "zod";

export const sessionCredentialStateSchema = z.enum(["none", "invalid", "expired", "active"]);
export type SessionCredentialState = z.infer<typeof sessionCredentialStateSchema>;
