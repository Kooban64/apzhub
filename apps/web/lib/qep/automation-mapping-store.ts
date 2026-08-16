/**
 * QEP Automation mapping / flaky governance ledger (SPR-APZQEP-220-C).
 * Platform metadata only — does not mutate Cap automation execution stores.
 */

import { randomUUID } from "node:crypto";

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type MappingRecord = {
  readonly mappingId: string;
  readonly providerId: string;
  readonly externalKey: string;
  readonly owner?: string;
  readonly flaky: boolean;
  readonly stale: boolean;
  readonly notes?: string;
  /** Optional defect / ticket reference when flaky is suppressed with a linked defect. */
  readonly defectRef?: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

type Snapshot = { readonly items: readonly MappingRecord[] };

const FILE = "mappings.json";
const items: MappingRecord[] = [];
let hydrated = false;

function mappingKey(providerId: string, externalKey: string): string {
  return `${providerId}\0${externalKey}`;
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<Snapshot>(
    resolveQepDataRoot("qep-automation"),
    FILE,
  );
  if (snap?.items?.length) items.push(...snap.items);
}

function persist(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(resolveQepDataRoot("qep-automation"), FILE, {
    items: items.slice(0, 500),
  });
}

export function resetAutomationMappingStoreForTests(): void {
  items.splice(0, items.length);
  hydrated = false;
}

/** @deprecated Alias — prefer resetAutomationMappingStoreForTests */
export const resetForTests = resetAutomationMappingStoreForTests;

export function listMappings(): readonly MappingRecord[] {
  hydrate();
  return [...items];
}

export function upsertMapping(input: {
  readonly providerId: string;
  readonly externalKey: string;
  readonly actorId: string;
  readonly owner?: string;
  readonly flaky?: boolean;
  readonly stale?: boolean;
  readonly notes?: string;
  readonly defectRef?: string;
}): MappingRecord {
  hydrate();
  const providerId = input.providerId.trim();
  const externalKey = input.externalKey.trim();
  const now = new Date().toISOString();
  const key = mappingKey(providerId, externalKey);
  const idx = items.findIndex(
    (row) => mappingKey(row.providerId, row.externalKey) === key,
  );
  const prev = idx >= 0 ? items[idx] : undefined;

  const ownerRaw = input.owner !== undefined ? input.owner.trim() : prev?.owner;
  const owner = ownerRaw && ownerRaw.length > 0 ? ownerRaw : undefined;
  const notesRaw = input.notes !== undefined ? input.notes.trim() : prev?.notes;
  const notes = notesRaw && notesRaw.length > 0 ? notesRaw : undefined;
  const defectRaw =
    input.defectRef !== undefined ? input.defectRef.trim() : prev?.defectRef;
  const defectRef = defectRaw && defectRaw.length > 0 ? defectRaw : undefined;

  const next: MappingRecord = {
    mappingId: prev?.mappingId ?? `map_${randomUUID().slice(0, 8)}`,
    providerId,
    externalKey,
    ...(owner ? { owner } : {}),
    flaky: input.flaky ?? prev?.flaky ?? false,
    stale: input.stale ?? prev?.stale ?? false,
    ...(notes ? { notes } : {}),
    ...(defectRef ? { defectRef } : {}),
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

export function findMapping(
  providerId: string,
  externalKey: string,
): MappingRecord | null {
  hydrate();
  const key = mappingKey(providerId.trim(), externalKey.trim());
  return (
    items.find((row) => mappingKey(row.providerId, row.externalKey) === key) ?? null
  );
}
