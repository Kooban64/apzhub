import { getIdentitySource } from "@/lib/adapters/env";
import { createLocalIdentityAdapter } from "@/lib/adapters/identity/local-identity-adapter";
import { createMockIdentityAdapter } from "@/lib/adapters/identity/mock-identity-adapter";
import { createOidcIdentityAdapter } from "@/lib/adapters/identity/oidc-identity-adapter";
import type { IdentityAdapter } from "@/lib/adapters/identity/types";

export type { IdentityAdapter, IdentityLoginContext, PasswordLoginResult } from "@/lib/adapters/identity/types";

let cached: IdentityAdapter | null = null;

export function getIdentityAdapter(): IdentityAdapter {
  if (cached) {
    return cached;
  }
  const src = getIdentitySource();
  cached =
    src === "oidc"
      ? createOidcIdentityAdapter()
      : src === "local"
        ? createLocalIdentityAdapter()
        : createMockIdentityAdapter();
  return cached;
}

/** Test-only reset when switching env in same process. */
export function resetIdentityAdapterCache(): void {
  cached = null;
}
