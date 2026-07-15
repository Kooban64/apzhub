/**
 * Document lifecycle transitions (APZDOCS-001).
 * Catalogue + allowed transitions only — no workflow engine.
 */

import type { DocumentLifecycleState } from "@apzhub/document-contracts";
import { DOCUMENT_LIFECYCLE_STATES } from "@apzhub/document-contracts";

import { DocumentDomainError } from "../ports/types";

const ALLOWED: Readonly<
  Record<DocumentLifecycleState, readonly DocumentLifecycleState[]>
> = {
  draft: ["active", "archived", "deleted"],
  active: ["archived", "retained", "deleted", "expired"],
  archived: ["active", "retained", "deleted", "restored"],
  retained: ["archived", "expired", "deleted"],
  deleted: ["restored"],
  restored: ["active", "archived", "deleted"],
  expired: ["retained", "deleted"],
};

export function isDocumentLifecycleState(
  value: string,
): value is DocumentLifecycleState {
  return (DOCUMENT_LIFECYCLE_STATES as readonly string[]).includes(value);
}

export function canTransitionDocumentLifecycle(
  from: DocumentLifecycleState,
  to: DocumentLifecycleState,
): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function assertDocumentLifecycleTransition(
  from: DocumentLifecycleState,
  to: DocumentLifecycleState,
): void {
  if (!canTransitionDocumentLifecycle(from, to)) {
    throw new DocumentDomainError(
      "invalid_lifecycle_transition",
      `Cannot transition document lifecycle from ${from} to ${to}`,
      { from, to },
    );
  }
}
