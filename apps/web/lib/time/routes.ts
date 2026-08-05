/** Time workspace route helpers (APZ Time 1.0.0 Phase 1). */

export const TIME_BASE = "/workspace/time";

export const TIME_SECTIONS = [
  "timesheets",
  "activities",
  "customers",
  "tags",
  "search",
  "help",
  "settings",
  "health",
  "diagnostics",
  "new",
] as const;

export type TimeSection = (typeof TIME_SECTIONS)[number];

export type TimeRouteResolution =
  | { readonly kind: "dashboard" }
  | { readonly kind: "timesheets" }
  | { readonly kind: "timesheet-create" }
  | { readonly kind: "timesheet-detail"; readonly timesheetId: string }
  | { readonly kind: "activities" }
  | { readonly kind: "activity-create" }
  | { readonly kind: "customers" }
  | { readonly kind: "customer-create" }
  | { readonly kind: "tags" }
  | { readonly kind: "tag-create" }
  | { readonly kind: "search" }
  | { readonly kind: "help" }
  | { readonly kind: "settings" }
  | { readonly kind: "health" }
  | { readonly kind: "diagnostics" }
  | { readonly kind: "unknown" };

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isTimeRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === TIME_BASE || normalized.startsWith(`${TIME_BASE}/`);
}

export function resolveTimeRoute(pathname: string): TimeRouteResolution {
  const normalized = normalizePath(pathname);
  if (!isTimeRoute(normalized)) {
    return { kind: "unknown" };
  }

  if (normalized === TIME_BASE) {
    return { kind: "dashboard" };
  }

  if (normalized === `${TIME_BASE}/new`) {
    return { kind: "timesheet-create" };
  }

  if (normalized === `${TIME_BASE}/timesheets`) {
    return { kind: "timesheets" };
  }

  if (normalized === `${TIME_BASE}/timesheets/new`) {
    return { kind: "timesheet-create" };
  }

  if (normalized === `${TIME_BASE}/activities`) {
    return { kind: "activities" };
  }

  if (normalized === `${TIME_BASE}/activities/new`) {
    return { kind: "activity-create" };
  }

  if (normalized === `${TIME_BASE}/customers`) {
    return { kind: "customers" };
  }

  if (normalized === `${TIME_BASE}/customers/new`) {
    return { kind: "customer-create" };
  }

  if (normalized === `${TIME_BASE}/tags`) {
    return { kind: "tags" };
  }

  if (normalized === `${TIME_BASE}/tags/new`) {
    return { kind: "tag-create" };
  }

  if (normalized === `${TIME_BASE}/search`) {
    return { kind: "search" };
  }

  if (normalized === `${TIME_BASE}/help`) {
    return { kind: "help" };
  }

  if (normalized === `${TIME_BASE}/settings`) {
    return { kind: "settings" };
  }

  if (normalized === `${TIME_BASE}/health`) {
    return { kind: "health" };
  }

  if (normalized === `${TIME_BASE}/diagnostics`) {
    return { kind: "diagnostics" };
  }

  const timesheetsPrefix = `${TIME_BASE}/timesheets/`;
  if (normalized.startsWith(timesheetsPrefix)) {
    const timesheetId = normalized.slice(timesheetsPrefix.length);
    if (timesheetId && !timesheetId.includes("/")) {
      return { kind: "timesheet-detail", timesheetId };
    }
  }

  return { kind: "unknown" };
}

export function timeDashboardPath(): string {
  return TIME_BASE;
}

export function timesheetsPath(): string {
  return `${TIME_BASE}/timesheets`;
}

export function timesheetCreatePath(): string {
  return `${TIME_BASE}/timesheets/new`;
}

export function timesheetDetailPath(timesheetId: string): string {
  return `${TIME_BASE}/timesheets/${timesheetId}`;
}

export function activitiesPath(): string {
  return `${TIME_BASE}/activities`;
}

export function activityCreatePath(): string {
  return `${TIME_BASE}/activities/new`;
}

export function customersPath(): string {
  return `${TIME_BASE}/customers`;
}

export function customerCreatePath(): string {
  return `${TIME_BASE}/customers/new`;
}

export function tagsPath(): string {
  return `${TIME_BASE}/tags`;
}

export function tagCreatePath(): string {
  return `${TIME_BASE}/tags/new`;
}

export function timeSearchPath(): string {
  return `${TIME_BASE}/search`;
}

export function timeHealthPath(): string {
  return `${TIME_BASE}/health`;
}

export function timeDiagnosticsPath(): string {
  return `${TIME_BASE}/diagnostics`;
}

export function timeHelpPath(): string {
  return `${TIME_BASE}/help`;
}

export function timeSettingsPath(): string {
  return `${TIME_BASE}/settings`;
}
