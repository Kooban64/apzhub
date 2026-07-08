/** Formats minutes as a human-readable duration (e.g. 1h 30m). */
export function formatDurationMinutes(minutes: number): string {
  if (minutes <= 0) {
    return "0m";
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder}m`;
  }

  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

/** Formats decimal hours from minutes. */
export function formatDecimalHours(minutes: number): string {
  return (minutes / 60).toFixed(2);
}
