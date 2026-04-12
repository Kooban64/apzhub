import { describe, expect, it } from "vitest";

import { retryBackoffSeconds, shouldRequeueAfterOutcome } from "@/lib/provisioning/retry-policy/policy";

describe("retry policy", () => {
  it("requeues only transient outcomes under the cap", () => {
    expect(shouldRequeueAfterOutcome("transient_failure", 0, 3)).toBe(true);
    expect(shouldRequeueAfterOutcome("transient_failure", 2, 3)).toBe(true);
    expect(shouldRequeueAfterOutcome("transient_failure", 3, 3)).toBe(false);
    expect(shouldRequeueAfterOutcome("terminal_failure", 0, 3)).toBe(false);
    expect(shouldRequeueAfterOutcome("success", 0, 3)).toBe(false);
  });

  it("uses stepped backoff", () => {
    expect(retryBackoffSeconds(0)).toBe(5);
    expect(retryBackoffSeconds(1)).toBe(30);
    expect(retryBackoffSeconds(2)).toBe(120);
    expect(retryBackoffSeconds(99)).toBe(120);
  });
});
