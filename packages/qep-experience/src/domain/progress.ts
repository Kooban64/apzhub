import type { WorkProgress } from "./types";

export function deriveWorkProgress(completed: number, total: number): WorkProgress {
  if (total <= 0) {
    return { completed: 0, total: 0 };
  }
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

export function formatDuration(ms: number): string {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function liveElapsedMs(input: {
  readonly status: string;
  readonly elapsedMs: number;
  readonly startedAt?: string;
  readonly pausedAt?: string;
  readonly now?: number;
}): number {
  if (input.status !== "in_progress" || input.pausedAt || !input.startedAt) {
    return input.elapsedMs;
  }
  const now = input.now ?? Date.now();
  const started = Date.parse(input.startedAt);
  if (Number.isNaN(started)) return input.elapsedMs;
  return input.elapsedMs + Math.max(0, now - started);
}
