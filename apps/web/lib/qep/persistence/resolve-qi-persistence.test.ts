/**
 * QX-PR-03 — fail-closed QI persistence selection.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  resolveQiPersistence,
  resolveQiPersistenceMode,
} from "./resolve-qi-persistence";

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.unstubAllEnvs();
});

describe("QX-PR-03 resolveQiPersistence", () => {
  it("defaults to postgres in production-like environments", () => {
    process.env.NODE_ENV = "production";
    delete process.env.APZQEP_QI_PERSISTENCE_MODE;
    delete process.env.APZQEP_CORE_QE_PERSISTENCE_MODE;
    expect(resolveQiPersistenceMode()).toBe("postgres");
  });

  it("fail-closed when postgres required and DATABASE_URL missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.APZQEP_QI_PERSISTENCE_MODE;
    expect(() => resolveQiPersistence()).toThrow(/DATABASE_URL/);
  });

  it("fail-closed when memory forced in production", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://example/db";
    process.env.APZQEP_QI_PERSISTENCE_MODE = "memory";
    expect(() => resolveQiPersistence()).toThrow(/forbidden/);
  });

  it("allows memory outside production-like when not forced", () => {
    process.env.NODE_ENV = "test";
    delete process.env.APZQEP_ENV;
    delete process.env.APZQEP_QI_REQUIRE_POSTGRES;
    delete process.env.APZQEP_CORE_QE_REQUIRE_POSTGRES;
    process.env.APZQEP_QI_PERSISTENCE_MODE = "memory";
    const resolved = resolveQiPersistence();
    expect(resolved.mode).toBe("memory");
    expect(resolved.providerLabel).toBe("memory");
  });
});
