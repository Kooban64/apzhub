/** Session-scoped Time UI preferences (no Preference Service redesign). */

const LAST_TIMESHEET_KEY = "apzhub.time.lastTimesheetId";
const LAST_CUSTOMER_KEY = "apzhub.time.lastCustomerId";

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
