/** Session-scoped Time UI preferences (no Preference Service redesign). */

const LAST_TIMESHEET_KEY = "apzhub.time.lastTimesheetId";
const LAST_CUSTOMER_KEY = "apzhub.time.lastCustomerId";
const ONBOARDING_DISMISSED_KEY = "apzhub.time.onboardingDismissed";
const COMPACT_LISTS_KEY = "apzhub.time.compactLists";

export function readLastTimesheetId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(LAST_TIMESHEET_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLastTimesheetId(timesheetId: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!timesheetId) {
      window.sessionStorage.removeItem(LAST_TIMESHEET_KEY);
      return;
    }
    window.sessionStorage.setItem(LAST_TIMESHEET_KEY, timesheetId);
  } catch {
    // Ignore quota / private-mode failures — UI still works without persistence.
  }
}

export function readLastCustomerId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(LAST_CUSTOMER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLastCustomerId(customerId: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!customerId) {
      window.sessionStorage.removeItem(LAST_CUSTOMER_KEY);
      return;
    }
    window.sessionStorage.setItem(LAST_CUSTOMER_KEY, customerId);
  } catch {
    // Ignore quota / private-mode failures — UI still works without persistence.
  }
}

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
