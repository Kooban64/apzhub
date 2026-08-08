/**
 * WF-PR-02 — business-process store fail-closed (no silent memory).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getMemoryBusinessProcessStore,
  resolveBusinessProcessStore,
  setBusinessProcessStoreForTests,
} from "./index";

const ORIGINAL = { ...process.env };

afterEach(() => {
  setBusinessProcessStoreForTests(undefined);
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL);
  vi.unstubAllEnvs();
});

describe("WF-PR-02 resolveBusinessProcessStore", () => {
  it("forbids memory mode in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.APZHUB_BUSINESS_PROCESS_STORE = "memory";
    process.env.DATABASE_URL = "postgresql://example/db";
    expect(() => resolveBusinessProcessStore()).toThrow(/forbidden in production/);
  });

  it("requires DATABASE_URL in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.DATABASE_URL;
    delete process.env.APZHUB_BUSINESS_PROCESS_STORE;
    expect(() => resolveBusinessProcessStore()).toThrow(/DATABASE_URL/);
  });

  it("allows explicit memory outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    process.env.APZHUB_BUSINESS_PROCESS_STORE = "memory";
    delete process.env.DATABASE_URL;
    const store = resolveBusinessProcessStore();
    expect(store).toBeTruthy();
  });

  it("honours test store override", () => {
    const memory = getMemoryBusinessProcessStore();
    setBusinessProcessStoreForTests(memory);
    expect(resolveBusinessProcessStore()).toBe(memory);
  });
});
