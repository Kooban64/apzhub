/**
 * Continuous verification freshness signals (SPR-APZQEP-230-A).
 * Advisory only — never flips certification or GO/NO-GO.
 */

import { randomUUID } from "node:crypto";

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type ContinuousVerificationStatus = "fresh" | "stale" | "acknowledged";

export type ContinuousVerificationSignal = {
  readonly signalId: string;
  readonly source: string;
  readonly subjectRef: string;
  readonly lastSeenAt: string;
  /** Hours after lastSeenAt before the signal is considered stale. */
  readonly staleAfterHours: number;
  readonly status: ContinuousVerificationStatus;
  readonly notes?: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

type Snapshot = { readonly items: readonly ContinuousVerificationSignal[] };

const FILE = "signals.json";
const DEFAULT_STALE_HOURS = 24;
const items: ContinuousVerificationSignal[] = [];
let hydrated = false;

function signalKey(source: string, subjectRef: string): string {
  return `${source}\0${subjectRef}`;
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<Snapshot>(
    resolveQepDataRoot("qep-continuous-verification"),
    FILE,
  );
  if (snap?.items?.length) items.push(...snap.items);
}

function persist(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(resolveQepDataRoot("qep-continuous-verification"), FILE, {
    items: items.slice(0, 500),
  });
}

function deriveFreshOrStale(
  lastSeenAt: string,
  staleAfterHours: number,
  nowMs: number = Date.now(),
): "fresh" | "stale" {
  const ageMs = nowMs - Date.parse(lastSeenAt);
  if (!Number.isFinite(ageMs) || ageMs > staleAfterHours * 3_600_000) {
    return "stale";
  }
  return "fresh";
}

function withDerivedStatus(
  row: ContinuousVerificationSignal,
): ContinuousVerificationSignal {
  if (row.status === "acknowledged") return row;
  return {
    ...row,
    status: deriveFreshOrStale(row.lastSeenAt, row.staleAfterHours),
  };
}

export function resetContinuousVerificationStoreForTests(): void {
  items.splice(0, items.length);
  hydrated = false;
}

export function listContinuousVerificationSignals(): readonly ContinuousVerificationSignal[] {
  hydrate();
  return items.map(withDerivedStatus);
}

export function upsertContinuousVerificationSignal(input: {
  readonly source: string;
  readonly subjectRef: string;
  readonly actorId: string;
  readonly lastSeenAt?: string;
  readonly staleAfterHours?: number;
  readonly notes?: string;
  readonly status?: ContinuousVerificationStatus;
}): ContinuousVerificationSignal {
  hydrate();
  const source = input.source.trim();
  const subjectRef = input.subjectRef.trim();
  const now = new Date().toISOString();
  const lastSeenAt = input.lastSeenAt?.trim() || now;
  const key = signalKey(source, subjectRef);
  const idx = items.findIndex((row) => signalKey(row.source, row.subjectRef) === key);
  const prev = idx >= 0 ? items[idx] : undefined;

  const staleAfterHours =
    input.staleAfterHours ?? prev?.staleAfterHours ?? DEFAULT_STALE_HOURS;
  const notesRaw = input.notes !== undefined ? input.notes.trim() : prev?.notes;
  const notes = notesRaw && notesRaw.length > 0 ? notesRaw : undefined;

  let status: ContinuousVerificationStatus;
  if (input.status === "acknowledged" || input.status === "stale") {
    status = input.status;
  } else if (input.status === "fresh" || input.lastSeenAt) {
    status = deriveFreshOrStale(lastSeenAt, staleAfterHours);
  } else if (prev?.status === "acknowledged") {
    status = "acknowledged";
  } else {
    status = deriveFreshOrStale(lastSeenAt, staleAfterHours);
  }

  const next: ContinuousVerificationSignal = {
    signalId: prev?.signalId ?? `cvs_${randomUUID().slice(0, 8)}`,
    source,
    subjectRef,
    lastSeenAt,
    staleAfterHours,
    status,
    ...(notes ? { notes } : {}),
    updatedAt: now,
    updatedBy: input.actorId,
  };

  if (idx >= 0) {
    items[idx] = next;
  } else {
    items.unshift(next);
  }
  persist();
  return next;
}

export function findContinuousVerificationSignal(
  source: string,
  subjectRef: string,
): ContinuousVerificationSignal | null {
  hydrate();
  const key = signalKey(source.trim(), subjectRef.trim());
  const row = items.find((item) => signalKey(item.source, item.subjectRef) === key);
  return row ? withDerivedStatus(row) : null;
}
