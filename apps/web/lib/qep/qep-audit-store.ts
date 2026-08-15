/**
 * QEP audit event ledger (SPR-APZQEP-210) — append-only local trail for M21 MVP.
 */

import { randomUUID } from "node:crypto";

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type QepAuditEvent = {
  readonly auditId: string;
  readonly action: string;
  readonly actor?: string;
  readonly createdAt: string;
  readonly correlationId?: string;
  readonly detail?: string;
};

type Snapshot = { readonly items: readonly QepAuditEvent[] };

const FILE = "events.json";
const MAX = 500;
const events: QepAuditEvent[] = [];
let hydrated = false;

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<Snapshot>(resolveQepDataRoot("qep-audit"), FILE);
  if (snap?.items?.length) events.push(...snap.items.slice(0, MAX));
}

function persist(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(resolveQepDataRoot("qep-audit"), FILE, {
    items: events.slice(0, MAX),
  });
}

export function listQepAuditEvents(): readonly QepAuditEvent[] {
  hydrate();
  return [...events];
}

export function appendQepAuditEvent(input: {
  readonly action: string;
  readonly actor?: string;
  readonly correlationId?: string;
  readonly detail?: string;
}): QepAuditEvent {
  hydrate();
  const event: QepAuditEvent = {
    auditId: `aud_${randomUUID().slice(0, 10)}`,
    action: input.action,
    actor: input.actor,
    createdAt: new Date().toISOString(),
    correlationId: input.correlationId,
    detail: input.detail,
  };
  events.unshift(event);
  if (events.length > MAX) events.length = MAX;
  persist();
  return event;
}
