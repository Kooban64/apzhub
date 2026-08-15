/**
 * Continuous certification advisory signals (SPR-APZQEP-230-B).
 * Expiry / drift / freshness — human re-approve only; never auto-certify.
 */

import { randomUUID } from "node:crypto";

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type ContinuousCertKind = "expiry" | "drift" | "freshness";
export type ContinuousCertStatus = "open" | "acknowledged" | "escalated";

export type ContinuousCertSignal = {
  readonly signalId: string;
  readonly evaluationId: string;
  readonly kind: ContinuousCertKind;
  readonly detail: string;
  readonly status: ContinuousCertStatus;
  readonly detectedAt: string;
  readonly expiresAt?: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

type Snapshot = { readonly items: readonly ContinuousCertSignal[] };

const FILE = "signals.json";
const items: ContinuousCertSignal[] = [];
let hydrated = false;

const KINDS = new Set<ContinuousCertKind>(["expiry", "drift", "freshness"]);

export function isContinuousCertKind(value: unknown): value is ContinuousCertKind {
  return typeof value === "string" && KINDS.has(value as ContinuousCertKind);
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<Snapshot>(
    resolveQepDataRoot("qep-continuous-cert"),
    FILE,
  );
  if (snap?.items?.length) items.push(...snap.items);
}

function persist(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(resolveQepDataRoot("qep-continuous-cert"), FILE, {
    items: items.slice(0, 500),
  });
}

export function resetContinuousCertStoreForTests(): void {
  items.splice(0, items.length);
  hydrated = false;
}

export function listContinuousCertSignals(): readonly ContinuousCertSignal[] {
  hydrate();
  return [...items];
}

export function getContinuousCertSignal(signalId: string): ContinuousCertSignal | null {
  hydrate();
  return items.find((row) => row.signalId === signalId) ?? null;
}

export function createContinuousCertSignal(input: {
  readonly evaluationId: string;
  readonly kind: ContinuousCertKind;
  readonly detail: string;
  readonly actorId: string;
  readonly expiresAt?: string;
}): ContinuousCertSignal {
  hydrate();
  const now = new Date().toISOString();
  const expiresAt = input.expiresAt?.trim();
  const next: ContinuousCertSignal = {
    signalId: `ccs_${randomUUID().slice(0, 8)}`,
    evaluationId: input.evaluationId.trim(),
    kind: input.kind,
    detail: input.detail.trim(),
    status: "open",
    detectedAt: now,
    ...(expiresAt ? { expiresAt } : {}),
    updatedAt: now,
    updatedBy: input.actorId,
  };
  items.unshift(next);
  persist();
  return next;
}

export function updateContinuousCertSignalStatus(input: {
  readonly signalId: string;
  readonly status: ContinuousCertStatus;
  readonly actorId: string;
}): ContinuousCertSignal | null {
  hydrate();
  const idx = items.findIndex((row) => row.signalId === input.signalId);
  if (idx < 0) return null;
  const prev = items[idx]!;
  if (input.status === "escalated" && prev.status === "acknowledged") {
    // Allow escalate after ack — re-cert request
  }
  const next: ContinuousCertSignal = {
    ...prev,
    status: input.status,
    updatedAt: new Date().toISOString(),
    updatedBy: input.actorId,
  };
  items[idx] = next;
  persist();
  return next;
}
