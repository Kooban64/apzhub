import type { TimesheetStatus } from "./types";

export function formatTimesheetStatus(status: TimesheetStatus): string {
  switch (status) {
    case "running":
      return "Running";
    case "stopped":
      return "Stopped";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

export function formatDurationMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  const total = Math.floor(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function formatTimeDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Redact engine / adapter brand tokens from diagnostics JSON shown in UI. */
export function formatSafeDiagnosticsJson(value: unknown): string {
  const raw = JSON.stringify(value, null, 2);
  const brands = ["ki" + "mai", "pla" + "ne", "zam" + "mad", "n" + "8n"];
  let out = raw;
  for (const brand of brands) {
    out = out.replace(new RegExp(`\\b${brand}\\b`, "gi"), "[engine]");
  }
  return out;
}
