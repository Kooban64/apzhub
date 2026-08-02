/**
 * APZQEP-151 — production fail-closed persistence selection.
 */
import { afterEach, describe, expect, it } from "vitest";

import {
  getCoreQePersistenceHealth,
  resolveCoreQePersistence,
  resolveCoreQePersistenceMode,
} from "../../apps/web/lib/qep/persistence/resolve-core-qe-persistence";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("APZQEP-151 provider selection", () => {
  it("forbids memory in production-like environments", () => {
    process.env.NODE_ENV = "production";
    process.env.APZQEP_CORE_QE_PERSISTENCE_MODE = "memory";
    expect(() => resolveCoreQePersistence()).toThrow(/forbidden/);
  });

  it("requires DATABASE_URL when postgres is mandatory", () => {
    process.env.NODE_ENV = "production";
    delete process.env.APZQEP_CORE_QE_PERSISTENCE_MODE;
    delete process.env.DATABASE_URL;
    expect(() => resolveCoreQePersistence()).toThrow(/DATABASE_URL/);
  });

  it("allows explicit memory outside production-like", () => {
    process.env.NODE_ENV = "test";
    process.env.APZQEP_ENV = "development";
    delete process.env.APZQEP_CORE_QE_REQUIRE_POSTGRES;
    process.env.APZQEP_CORE_QE_PERSISTENCE_MODE = "memory";
    expect(resolveCoreQePersistenceMode()).toBe("memory");
    const resolved = resolveCoreQePersistence();
    expect(resolved.providerLabel).toBe("memory");
    expect(getCoreQePersistenceHealth().provider).toBe("memory");
  });
});
