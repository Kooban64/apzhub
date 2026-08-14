/**
 * APZPEN file-backed store (tenant-scoped). Tests use in-memory only.
 */

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Engagement, Finding } from "./types";

type Snapshot = {
  engagements: Engagement[];
  findings: Finding[];
};

const store: Snapshot = {
  engagements: [],
  findings: [],
};
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") {
    return false;
  }
  return true;
}

function dataDir(): string {
  const override = process.env.APZPEN_DATA_DIR?.trim();
  if (override) return override;
  return join(process.cwd(), ".data", "apzpen");
}

function snapshotPath(): string {
  return join(dataDir(), "assurance.json");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!persistEnabled()) return;
  try {
    const path = snapshotPath();
    if (!existsSync(path)) return;
    const raw = JSON.parse(readFileSync(path, "utf8")) as Snapshot;
    store.engagements = Array.isArray(raw.engagements) ? raw.engagements : [];
    store.findings = Array.isArray(raw.findings) ? raw.findings : [];
  } catch {
    /* soft-fail empty */
  }
}

function persist(): void {
  if (!persistEnabled()) return;
  const dir = dataDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    snapshotPath(),
    JSON.stringify(
      { engagements: store.engagements, findings: store.findings },
      null,
      2,
    ),
    "utf8",
  );
}

export function resetApzpenStoreForTests(): void {
  store.engagements = [];
  store.findings = [];
  hydrated = true;
}

export function listEngagements(tenantId: string): readonly Engagement[] {
  hydrate();
  return store.engagements
    .filter((e) => e.tenantId === tenantId)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getEngagement(
  tenantId: string,
  engagementId: string,
): Engagement | undefined {
  hydrate();
  return store.engagements.find(
    (e) => e.tenantId === tenantId && e.engagementId === engagementId,
  );
}

export function saveEngagement(engagement: Engagement): Engagement {
  hydrate();
  const idx = store.engagements.findIndex(
    (e) => e.engagementId === engagement.engagementId,
  );
  if (idx >= 0) {
    store.engagements[idx] = engagement;
  } else {
    store.engagements.push(engagement);
  }
  persist();
  return engagement;
}

export function listFindings(
  tenantId: string,
  engagementId?: string,
): readonly Finding[] {
  hydrate();
  return store.findings
    .filter(
      (f) =>
        f.tenantId === tenantId &&
        (engagementId ? f.engagementId === engagementId : true),
    )
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getFinding(tenantId: string, findingId: string): Finding | undefined {
  hydrate();
  return store.findings.find(
    (f) => f.tenantId === tenantId && f.findingId === findingId,
  );
}

export function saveFinding(finding: Finding): Finding {
  hydrate();
  const idx = store.findings.findIndex((f) => f.findingId === finding.findingId);
  if (idx >= 0) {
    store.findings[idx] = finding;
  } else {
    store.findings.push(finding);
  }
  persist();
  return finding;
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
