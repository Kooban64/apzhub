import { createAuth } from "./server";

export type ValidatedSession = NonNullable<
  Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>
>;

/** Better Auth user extended with platform tenant fields (M8-01). */
export type PlatformSessionUser = ValidatedSession["user"] & {
  readonly activeTenantId?: string;
  readonly tenantId?: string;
};
