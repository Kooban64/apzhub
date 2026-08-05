import { afterEach, describe, expect, it } from "vitest";

import {
  readCompactLists,
  readLastRequestId,
  readOnboardingDismissed,
  writeCompactLists,
  writeLastRequestId,
  writeOnboardingDismissed,
} from "./preferences";

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("support preferences", () => {
  it("persists onboarding dismissal and compact lists", () => {
    expect(readOnboardingDismissed()).toBe(false);
    writeOnboardingDismissed(true);
    expect(readOnboardingDismissed()).toBe(true);
    writeOnboardingDismissed(false);
    expect(readOnboardingDismissed()).toBe(false);

    expect(readCompactLists()).toBe(false);
    writeCompactLists(true);
    expect(readCompactLists()).toBe(true);
  });

  it("persists last request id in session storage", () => {
    expect(readLastRequestId()).toBe("");
    writeLastRequestId("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    expect(readLastRequestId()).toBe("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    writeLastRequestId("");
    expect(readLastRequestId()).toBe("");
  });
});
