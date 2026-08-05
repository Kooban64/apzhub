/** Session-scoped Projects UI preferences (no Preference Service redesign). */

const ONBOARDING_DISMISSED_KEY = "apzhub.projects.onboardingDismissed";
const COMPACT_LISTS_KEY = "apzhub.projects.compactLists";
const LAST_PROJECT_KEY = "apzhub.projects.lastProjectId";

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

export function readLastProjectId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(LAST_PROJECT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLastProjectId(projectId: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!projectId) {
      window.sessionStorage.removeItem(LAST_PROJECT_KEY);
      return;
    }
    window.sessionStorage.setItem(LAST_PROJECT_KEY, projectId);
  } catch {
    // Ignore quota / private-mode failures — UI still works without persistence.
  }
}
