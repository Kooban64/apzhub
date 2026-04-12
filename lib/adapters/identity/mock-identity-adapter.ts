import type { IdentityAdapter, IdentityLoginContext, PasswordLoginResult } from "@/lib/adapters/identity/types";
import { buildMockSessionFromCredentials } from "@/lib/auth/mock-session";
import type { SessionSnapshot } from "@/lib/auth/session-types";

export function createMockIdentityAdapter(): IdentityAdapter {
  return {
    kind: "mock",
    getHealth() {
      return { domain: "identity", signal: "healthy", detail: "Mock password login (dev/CI)." };
    },
    async loginWithPassword(email: string, password: string, ctx?: IdentityLoginContext): Promise<PasswordLoginResult> {
      void ctx;
      if (!email.trim() || !password) {
        return { ok: false, error: "Email and password are required." };
      }
      const snapshot: SessionSnapshot = buildMockSessionFromCredentials(email.trim());
      return { ok: true, snapshot };
    },
  };
}
