/**
 * QX-PR-02 — fail-closed SCM persistence selection.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  resolveScmPersistence,
  resolveScmPersistenceMode,
} from "./resolve-scm-persistence";

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.unstubAllEnvs();
});

describe("QX-PR-02 resolveScmPersistence", () => {
  it("defaults to postgres in production-like environments", () => {
    process.env.NODE_ENV = "production";
    delete process.env.APZQEP_SCM_PERSISTENCE_MODE;
    delete process.env.APZQEP_CORE_QE_PERSISTENCE_MODE;
    expect(resolveScmPersistenceMode()).toBe("postgres");
  });

  it("fail-closed when postgres required and DATABASE_URL missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.APZQEP_SCM_PERSISTENCE_MODE;
    expect(() => resolveScmPersistence()).toThrow(/DATABASE_URL/);
  });

  it("fail-closed when memory forced in production", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://example/db";
    process.env.APZQEP_SCM_PERSISTENCE_MODE = "memory";
    expect(() => resolveScmPersistence()).toThrow(/forbidden/);
  });

  it("allows memory outside production-like when not forced", () => {
    process.env.NODE_ENV = "test";
    delete process.env.APZQEP_ENV;
    delete process.env.APZQEP_SCM_REQUIRE_POSTGRES;
    delete process.env.APZQEP_CORE_QE_REQUIRE_POSTGRES;
    process.env.APZQEP_SCM_PERSISTENCE_MODE = "memory";
    const resolved = resolveScmPersistence();
    expect(resolved.mode).toBe("memory");
    expect(resolved.providerLabel).toBe("memory");
  });
});
