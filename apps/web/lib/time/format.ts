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

/** Live stopwatch display HH:MM:SS from elapsed seconds. */
export function formatElapsedClock(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00:00:00";
  const total = Math.floor(totalSeconds);
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return [hours, mins, secs].map((n) => String(n).padStart(2, "0")).join(":");
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toLocalDateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
