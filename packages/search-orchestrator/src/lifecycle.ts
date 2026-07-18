import type { PublicationStatus } from "./types";

const ALLOWED: Record<PublicationStatus, readonly PublicationStatus[]> = {
  queued: ["publishing", "dead-letter"],
  publishing: ["published", "failed", "retrying", "dead-letter"],
  published: [],
  failed: ["retrying", "dead-letter"],
  retrying: ["publishing", "dead-letter"],
  "dead-letter": [],
};

export function canTransitionPublicationStatus(
  from: PublicationStatus,
  to: PublicationStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function assertPublicationTransition(
  from: PublicationStatus,
  to: PublicationStatus,
): void {
  if (!canTransitionPublicationStatus(from, to)) {
    throw new Error(`Invalid publication lifecycle transition: ${from} → ${to}`);
  }
}
