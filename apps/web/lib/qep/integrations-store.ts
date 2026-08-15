/**
 * QEP Integration Centre connector ledger (SPR-APZQEP-220-D) — platform metadata, not Cap SoR.
 */

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type ConnectorSource = "automation" | "scm";

export type ConnectorState = {
  readonly providerId: string;
  readonly source: ConnectorSource;
  readonly enabled: boolean;
  readonly lastSyncAt?: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

type Snapshot = { readonly items: readonly ConnectorState[] };

const FILE = "connectors.json";
const items: ConnectorState[] = [];
let hydrated = false;

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<Snapshot>(
    resolveQepDataRoot("qep-integrations"),
    FILE,
  );
  if (snap?.items?.length) items.push(...snap.items);
}

function persist(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(resolveQepDataRoot("qep-integrations"), FILE, {
    items: items.slice(0, 500),
  });
}

export function resetIntegrationsStoreForTests(): void {
  items.splice(0, items.length);
  hydrated = false;
}

export function listConnectorStates(): readonly ConnectorState[] {
  hydrate();
  return [...items];
}

export function upsertConnectorState(input: {
  readonly providerId: string;
  readonly source: ConnectorSource;
  readonly enabled: boolean;
  readonly actorId: string;
}): ConnectorState {
  hydrate();
  const now = new Date().toISOString();
  const providerId = input.providerId.trim();
  const idx = items.findIndex(
    (row) => row.providerId === providerId && row.source === input.source,
  );
  const prev = idx >= 0 ? items[idx] : undefined;
  const next: ConnectorState = {
    providerId,
    source: input.source,
    enabled: input.enabled,
    ...(prev?.lastSyncAt ? { lastSyncAt: prev.lastSyncAt } : {}),
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

export function recordSync(
  providerId: string,
  source?: ConnectorSource,
): ConnectorState | null {
  hydrate();
  const id = providerId.trim();
  const idx = items.findIndex(
    (row) => row.providerId === id && (source === undefined || row.source === source),
  );
  if (idx < 0) return null;
  const prev = items[idx]!;
  const now = new Date().toISOString();
  const next: ConnectorState = {
    ...prev,
    lastSyncAt: now,
    updatedAt: now,
  };
  items[idx] = next;
  persist();
  return next;
}
