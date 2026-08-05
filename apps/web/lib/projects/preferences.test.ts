import { afterEach, describe, expect, it } from "vitest";

import {
  readCompactLists,
  readLastProjectId,
  readOnboardingDismissed,
  writeCompactLists,
  writeLastProjectId,
  writeOnboardingDismissed,
} from "./preferences";

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe("projects preferences", () => {
  it("reads and writes last project id", () => {
    expect(readLastProjectId()).toBe("");
    writeLastProjectId("proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    expect(readLastProjectId()).toBe("proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    writeLastProjectId("");
    expect(readLastProjectId()).toBe("");
  });

  it("reads and writes onboarding and compact prefs", () => {
    expect(readOnboardingDismissed()).toBe(false);
    writeOnboardingDismissed(true);
    expect(readOnboardingDismissed()).toBe(true);
    expect(readCompactLists()).toBe(false);
    writeCompactLists(true);
    expect(readCompactLists()).toBe(true);
  });
});
