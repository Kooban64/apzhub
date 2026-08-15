/**
 * QEP Risk register ledger (SPR-APZQEP-210) — platform metadata, not Cap SoR.
 */

import { randomUUID } from "node:crypto";

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskStatus = "open" | "mitigated" | "accepted" | "waived";

export type RiskItem = {
  readonly riskId: string;
  readonly title: string;
  readonly severity: RiskSeverity;
  readonly status: RiskStatus;
  readonly waiverNote?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

type Snapshot = { readonly items: readonly RiskItem[] };

const FILE = "risks.json";
const items: RiskItem[] = [];
let hydrated = false;

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<Snapshot>(resolveQepDataRoot("qep-risk"), FILE);
  if (snap?.items?.length) items.push(...snap.items);
}

function persist(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(resolveQepDataRoot("qep-risk"), FILE, {
    items: items.slice(0, 500),
  });
}

export function listRisks(): readonly RiskItem[] {
  hydrate();
  return [...items];
}

export function createRisk(input: {
  readonly title: string;
  readonly severity: RiskSeverity;
  readonly actorId: string;
}): RiskItem {
  hydrate();
  const now = new Date().toISOString();
  const item: RiskItem = {
    riskId: `risk_${randomUUID().slice(0, 8)}`,
    title: input.title.trim(),
    severity: input.severity,
    status: "open",
    createdAt: now,
    updatedAt: now,
    createdBy: input.actorId,
  };
  items.unshift(item);
  persist();
  return item;
}

export function updateRiskStatus(input: {
  readonly riskId: string;
  readonly status: RiskStatus;
  readonly waiverNote?: string;
}): RiskItem | null {
  hydrate();
  const idx = items.findIndex((r) => r.riskId === input.riskId);
  if (idx < 0) return null;
  const prev = items[idx]!;
  const next: RiskItem = {
    ...prev,
    status: input.status,
    waiverNote:
      input.status === "waived"
        ? input.waiverNote?.trim() || prev.waiverNote
        : prev.waiverNote,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = next;
  persist();
  return next;
}
