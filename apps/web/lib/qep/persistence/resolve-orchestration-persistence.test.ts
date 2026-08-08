/**
 * QX-PR-05 — fail-closed orchestration persistence selection.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  resolveOrchestrationPersistence,
  resolveOrchestrationPersistenceMode,
} from "./resolve-orchestration-persistence";

const ORIGINAL = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL);
  vi.unstubAllEnvs();
});

describe("QX-PR-05 resolveOrchestrationPersistence", () => {
  it("defaults to postgres in production-like environments", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.APZQEP_ORCHESTRATION_PERSISTENCE_MODE;
    delete process.env.APZQEP_CORE_QE_PERSISTENCE_MODE;
    expect(resolveOrchestrationPersistenceMode()).toBe("postgres");
  });

  it("fail-closed when postgres required and DATABASE_URL missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.DATABASE_URL;
    delete process.env.APZQEP_ORCHESTRATION_PERSISTENCE_MODE;
    expect(() => resolveOrchestrationPersistence()).toThrow(/DATABASE_URL/);
  });

  it("fail-closed when memory forced in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.DATABASE_URL = "postgresql://example/db";
    process.env.APZQEP_ORCHESTRATION_PERSISTENCE_MODE = "memory";
    expect(() => resolveOrchestrationPersistence()).toThrow(/forbidden/);
  });

  it("allows memory outside production-like when not forced", () => {
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.APZQEP_ENV;
    delete process.env.APZQEP_ORCHESTRATION_REQUIRE_POSTGRES;
    delete process.env.APZQEP_CORE_QE_REQUIRE_POSTGRES;
    process.env.APZQEP_ORCHESTRATION_PERSISTENCE_MODE = "memory";
    const resolved = resolveOrchestrationPersistence();
    expect(resolved.mode).toBe("memory");
    expect(resolved.providerLabel).toBe("memory");
  });
});
