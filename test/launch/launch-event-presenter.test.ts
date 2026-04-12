import { describe, expect, it } from "vitest";

import {
  formatLaunchEventOutcome,
  formatLaunchEventReason,
  formatLaunchMethod,
} from "@/lib/launch/launch-event-presenter";

describe("launch-event-presenter", () => {
  it("formats outcomes", () => {
    expect(formatLaunchEventOutcome("succeeded")).toBe("Succeeded");
    expect(formatLaunchEventOutcome("redirect_started")).toBe("Redirect started");
  });

  it("formats policy and execution reason codes", () => {
    expect(formatLaunchEventReason("not_provisioned")).toContain("not ready");
    expect(formatLaunchEventReason("SESSION_REQUIRED")).toContain("Sign in");
    expect(formatLaunchEventReason(null)).toBe("—");
  });

  it("formats methods", () => {
    expect(formatLaunchMethod("jwt")).toBe("JWT");
    expect(formatLaunchMethod("oidc")).toBe("OIDC");
  });
});
