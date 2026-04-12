/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { readMatrixPostureForUserSync } from "@/lib/launch/workspace-launch-bridge";

describe("readMatrixPostureForUserSync", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns pending fallback when client env is not mock (avoid leaking bundled mock matrix)", () => {
    vi.stubEnv("NEXT_PUBLIC_APZHUB_ACCESS_SOURCE", "real");
    const r = readMatrixPostureForUserSync("u-1001", "mail");
    expect(r.effectiveRole).toBe("none");
    expect(r.realization).toBe("pending");
  });
});
