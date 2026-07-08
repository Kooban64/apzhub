const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export interface FormatNotificationRelativeTimestampOptions {
  readonly now?: Date | string;
  readonly locale?: string;
}

/**
 * Formats an ISO timestamp for notification list presentation.
 * Pure helper — inject `now` for deterministic tests.
 */
export function formatNotificationRelativeTimestamp(
  timestamp: string,
  options: FormatNotificationRelativeTimestampOptions = {},
): string {
  const target = Date.parse(timestamp);
  if (Number.isNaN(target)) {
    return timestamp;
  }

  const now =
    options.now instanceof Date
      ? options.now.getTime()
      : options.now
        ? Date.parse(options.now)
        : Date.now();

  if (Number.isNaN(now)) {
    return timestamp;
  }

  const elapsedMs = Math.max(0, now - target);

  if (elapsedMs < MINUTE_MS) {
    return "Just now";
  }

  if (elapsedMs < HOUR_MS) {
    const minutes = Math.floor(elapsedMs / MINUTE_MS);
    return `${minutes}m ago`;
  }

  if (elapsedMs < DAY_MS) {
    const hours = Math.floor(elapsedMs / HOUR_MS);
    return `${hours}h ago`;
  }

  if (elapsedMs < DAY_MS * 7) {
    const days = Math.floor(elapsedMs / DAY_MS);
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(options.locale, {
    month: "short",
    day: "numeric",
    year: now - target >= DAY_MS * 365 ? "numeric" : undefined,
  }).format(new Date(target));
}
