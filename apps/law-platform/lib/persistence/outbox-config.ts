import { getLawRepositoryMode } from "./repository-mode";

/** Outbox writes are enabled in postgres mode unless explicitly disabled (LAW-012-03). */
export function isOutboxEnabled(): boolean {
  if (getLawRepositoryMode() !== "postgres") {
    return false;
  }

  const raw = process.env.LAW_OUTBOX_ENABLED?.trim().toLowerCase();
  if (raw === "false") {
    return false;
  }

  return true;
}
