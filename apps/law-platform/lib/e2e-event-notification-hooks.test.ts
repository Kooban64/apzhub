import { afterEach, describe, expect, it, vi } from "vitest";

import { isE2eTestHooksEnabled } from "./e2e-event-notification-hooks";

describe("isE2eTestHooksEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when NEXT_PUBLIC_E2E_TEST_HOOKS is true", () => {
    vi.stubEnv("NEXT_PUBLIC_E2E_TEST_HOOKS", "true");
    expect(isE2eTestHooksEnabled()).toBe(true);
  });

  it("returns false when NEXT_PUBLIC_E2E_TEST_HOOKS is unset or false", () => {
    vi.stubEnv("NEXT_PUBLIC_E2E_TEST_HOOKS", "false");
    expect(isE2eTestHooksEnabled()).toBe(false);
  });
});
