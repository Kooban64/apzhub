/** APZ Documents product preferences — never engine/adapter configuration. */

const ONBOARDING_KEY = "apzhub.documents.onboardingDismissed";
const COMPACT_KEY = "apzhub.documents.compactLists";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readOnboardingDismissed(): boolean {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function writeOnboardingDismissed(dismissed: boolean): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ONBOARDING_KEY, dismissed ? "1" : "0");
}

export function readCompactLists(): boolean {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(COMPACT_KEY) === "1";
}

export function writeCompactLists(compact: boolean): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(COMPACT_KEY, compact ? "1" : "0");
}
