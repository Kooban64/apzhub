import { describe, expect, it, vi } from "vitest";

import { getIdentityAdapter, resetIdentityAdapterCache } from "@/lib/adapters/identity";

describe("identity adapter", () => {
  it("mock adapter accepts password login shape", async () => {
    vi.stubEnv("APZHUB_IDENTITY_SOURCE", "mock");
    resetIdentityAdapterCache();
    const adapter = getIdentityAdapter();
    expect(adapter.kind).toBe("mock");
    expect(adapter.getHealth().signal).toBe("healthy");
    const r = await adapter.loginWithPassword("ops.admin@example.com", "x");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.snapshot.user?.email).toBe("ops.admin@example.com");
    }
    vi.unstubAllEnvs();
    resetIdentityAdapterCache();
  });

  it("local adapter reports misconfiguration without database URL", () => {
    vi.stubEnv("APZHUB_IDENTITY_SOURCE", "local");
    resetIdentityAdapterCache();
    const adapter = getIdentityAdapter();
    expect(adapter.kind).toBe("local");
    expect(adapter.getHealth().signal).toBe("misconfigured");
    vi.unstubAllEnvs();
    resetIdentityAdapterCache();
  });

  it("oidc adapter rejects password login with SSO path", async () => {
    vi.stubEnv("APZHUB_IDENTITY_SOURCE", "oidc");
    resetIdentityAdapterCache();
    const adapter = getIdentityAdapter();
    expect(adapter.kind).toBe("oidc");
    expect(["healthy", "degraded", "misconfigured"]).toContain(adapter.getHealth().signal);
    const r = await adapter.loginWithPassword("any@example.com", "pw");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.ssoAuthorizePath).toBe("/api/auth/oidc/authorize");
    }
    vi.unstubAllEnvs();
    resetIdentityAdapterCache();
  });
});
