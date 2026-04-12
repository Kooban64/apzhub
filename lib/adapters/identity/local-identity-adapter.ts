import type { IdentityAdapter, IdentityLoginContext } from "@/lib/adapters/identity/types";
import {
  assertLocalIdentityPrerequisites,
  loginWithPasswordLocal,
} from "@/lib/identity/local-auth-service";

export function createLocalIdentityAdapter(): IdentityAdapter {
  return {
    kind: "local",
    getHealth() {
      try {
        assertLocalIdentityPrerequisites();
        return {
          domain: "identity",
          signal: "healthy",
          detail: "Local identity: Postgres users, Argon2id passwords, signed session cookies.",
        };
      } catch (e) {
        return {
          domain: "identity",
          signal: "misconfigured",
          detail: (e as Error).message,
        };
      }
    },
    async loginWithPassword(email: string, password: string, ctx?: IdentityLoginContext) {
      try {
        assertLocalIdentityPrerequisites();
      } catch {
        return { ok: false, error: "Identity service is not configured." };
      }
      return loginWithPasswordLocal(email, password, {
        correlationId: ctx?.correlationId ?? "",
        ip: ctx?.ip,
        userAgent: ctx?.userAgent,
      });
    },
  };
}
