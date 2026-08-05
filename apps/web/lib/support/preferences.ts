/** Session-scoped Support UI preferences (no Preference Service redesign). */

const ONBOARDING_DISMISSED_KEY = "apzhub.support.onboardingDismissed";
const COMPACT_LISTS_KEY = "apzhub.support.compactLists";
const LAST_REQUEST_KEY = "apzhub.support.lastRequestId";

export function readOnboardingDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ONBOARDING_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeOnboardingDismissed(dismissed: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (!dismissed) {
      window.localStorage.removeItem(ONBOARDING_DISMISSED_KEY);
      return;
    }
    window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
  } catch {
    // Ignore persistence failures.
  }
}

export function readCompactLists(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COMPACT_LISTS_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeCompactLists(compact: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (!compact) {
      window.localStorage.removeItem(COMPACT_LISTS_KEY);
      return;
    }
    window.localStorage.setItem(COMPACT_LISTS_KEY, "1");
  } catch {
    // Ignore persistence failures.
  }
}

export function readLastRequestId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(LAST_REQUEST_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLastRequestId(supportRequestId: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!supportRequestId) {
      window.sessionStorage.removeItem(LAST_REQUEST_KEY);
      return;
    }
    window.sessionStorage.setItem(LAST_REQUEST_KEY, supportRequestId);
  } catch {
    // Ignore quota / private-mode failures.
  }
}
