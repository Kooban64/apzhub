import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import type { SessionSnapshot } from "@/lib/auth/session-types";

export type PasswordLoginResult =
  | { ok: true; snapshot: SessionSnapshot }
  | { ok: false; error: string; ssoAuthorizePath?: string };

/** Optional request metadata (local identity: audit, throttle, session row). */
export type IdentityLoginContext = {
  correlationId?: string;
  ip?: string;
  userAgent?: string;
};

export type IdentityAdapter = {
  readonly kind: "mock" | "oidc" | "local";
  loginWithPassword(
    email: string,
    password: string,
    ctx?: IdentityLoginContext,
  ): Promise<PasswordLoginResult>;
  getHealth(): AdapterHealthResult;
};
