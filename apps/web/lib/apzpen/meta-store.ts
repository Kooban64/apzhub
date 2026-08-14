/**
 * Extended APZPEN platform metadata store — ledger + security graph.
 * File-backed outside tests; memory under Vitest.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { CertificationLedgerRecord } from "./certification-ledger";
import type { SecurityGraphEdge, SecurityGraphNode } from "./security-graph";

type MetaSnapshot = {
  certifications: CertificationLedgerRecord[];
  graphNodes: SecurityGraphNode[];
  graphEdges: SecurityGraphEdge[];
};

const meta: MetaSnapshot = {
  certifications: [],
  graphNodes: [],
  graphEdges: [],
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

function metaPath(): string {
  return join(dataDir(), "platform-meta.json");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!persistEnabled()) return;
  try {
    const path = metaPath();
    if (!existsSync(path)) return;
    const raw = JSON.parse(readFileSync(path, "utf8")) as Partial<MetaSnapshot>;
    meta.certifications = Array.isArray(raw.certifications) ? raw.certifications : [];
    meta.graphNodes = Array.isArray(raw.graphNodes) ? raw.graphNodes : [];
    meta.graphEdges = Array.isArray(raw.graphEdges) ? raw.graphEdges : [];
  } catch {
    /* empty */
  }
}

function persist(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(metaPath(), JSON.stringify(meta, null, 2), "utf8");
}

export function resetApzpenMetaStoreForTests(): void {
  meta.certifications = [];
  meta.graphNodes = [];
  meta.graphEdges = [];
  hydrated = true;
}

/** Append-only — never updates existing records. */
export function appendCertificationRecord(
  record: CertificationLedgerRecord,
): CertificationLedgerRecord {
  hydrate();
  if (meta.certifications.some((r) => r.recordId === record.recordId)) {
    return record;
  }
  meta.certifications.push(record);
  persist();
  return record;
}

export function listCertificationRecords(
  tenantId: string,
  engagementId?: string,
): readonly CertificationLedgerRecord[] {
  hydrate();
  return meta.certifications
    .filter(
      (r) =>
        r.tenantId === tenantId &&
        (engagementId ? r.engagementId === engagementId : true),
    )
    .slice()
    .sort((a, b) => b.certifiedAt.localeCompare(a.certifiedAt));
}

export function upsertGraphNode(node: SecurityGraphNode): SecurityGraphNode {
  hydrate();
  const idx = meta.graphNodes.findIndex((n) => n.nodeId === node.nodeId);
  if (idx >= 0) {
    meta.graphNodes[idx] = { ...node, createdAt: meta.graphNodes[idx]!.createdAt };
  } else {
    meta.graphNodes.push(node);
  }
  persist();
  return node;
}

export function upsertGraphEdge(edge: SecurityGraphEdge): SecurityGraphEdge {
  hydrate();
  const exists = meta.graphEdges.some(
    (e) =>
      e.fromNodeId === edge.fromNodeId &&
      e.toNodeId === edge.toNodeId &&
      e.relation === edge.relation,
  );
  if (!exists) {
    meta.graphEdges.push(edge);
    persist();
  }
  return edge;
}

export function listGraphNodes(tenantId: string): readonly SecurityGraphNode[] {
  hydrate();
  return meta.graphNodes.filter((n) => n.tenantId === tenantId);
}

export function listGraphEdges(tenantId: string): readonly SecurityGraphEdge[] {
  hydrate();
  return meta.graphEdges.filter((e) => e.tenantId === tenantId);
}

export function getMetaSnapshotForExport(): MetaSnapshot {
  hydrate();
  return {
    certifications: [...meta.certifications],
    graphNodes: [...meta.graphNodes],
    graphEdges: [...meta.graphEdges],
  };
}

export function replaceMetaSnapshot(snapshot: MetaSnapshot): void {
  meta.certifications = [...snapshot.certifications];
  meta.graphNodes = [...snapshot.graphNodes];
  meta.graphEdges = [...snapshot.graphEdges];
  hydrated = true;
  persist();
}
