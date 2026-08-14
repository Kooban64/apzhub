/**
 * APZPEN PostgreSQL SoR — document tables (SPR-APZPEN-014).
 * Activated when APZPEN_STORE=postgres (and DATABASE_URL is set).
 */

import { sql } from "drizzle-orm";
import { createDb, type DatabaseExecutor } from "@apzhub/config";

import type { Engagement, Finding } from "./types";
import type { CertificationLedgerRecord } from "./certification-ledger";
import type { SecurityGraphEdge, SecurityGraphNode } from "./security-graph";

export type ApzpenStoreMode = "memory" | "file" | "postgres";

export function resolveApzpenStoreMode(): ApzpenStoreMode {
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") {
    return "memory";
  }
  const explicit = process.env.APZPEN_STORE?.trim().toLowerCase();
  if (explicit === "postgres") return "postgres";
  if (explicit === "memory") return "memory";
  if (explicit === "file") return "file";
  if (process.env.DATABASE_URL?.trim() && process.env.APZPEN_PREFER_POSTGRES === "1") {
    return "postgres";
  }
  return "file";
}

export type ApzpenPostgresSnapshot = {
  engagements: Engagement[];
  findings: Finding[];
  certifications: CertificationLedgerRecord[];
  graphNodes: SecurityGraphNode[];
  graphEdges: SecurityGraphEdge[];
};

function asDocuments<T>(result: unknown): T[] {
  const rows = Array.isArray(result)
    ? result
    : result &&
        typeof result === "object" &&
        "rows" in result &&
        Array.isArray((result as { rows: unknown }).rows)
      ? (result as { rows: unknown[] }).rows
      : [];
  return rows
    .map((row) => {
      if (!row || typeof row !== "object") return undefined;
      const doc = (row as { document?: unknown }).document;
      return doc as T | undefined;
    })
    .filter((d): d is T => Boolean(d));
}

export async function loadApzpenPostgresSnapshot(
  db: DatabaseExecutor = createDb(),
  tenantId?: string,
): Promise<ApzpenPostgresSnapshot> {
  const engResult = tenantId
    ? await db.execute(
        sql`SELECT document FROM apzpen_engagement WHERE tenant_id = ${tenantId}`,
      )
    : await db.execute(sql`SELECT document FROM apzpen_engagement`);
  const findingResult = tenantId
    ? await db.execute(
        sql`SELECT document FROM apzpen_finding WHERE tenant_id = ${tenantId}`,
      )
    : await db.execute(sql`SELECT document FROM apzpen_finding`);
  const certResult = tenantId
    ? await db.execute(
        sql`SELECT document FROM apzpen_certification_ledger WHERE tenant_id = ${tenantId}`,
      )
    : await db.execute(sql`SELECT document FROM apzpen_certification_ledger`);
  const nodeResult = tenantId
    ? await db.execute(
        sql`SELECT document FROM apzpen_graph_node WHERE tenant_id = ${tenantId}`,
      )
    : await db.execute(sql`SELECT document FROM apzpen_graph_node`);
  const edgeResult = tenantId
    ? await db.execute(
        sql`SELECT document FROM apzpen_graph_edge WHERE tenant_id = ${tenantId}`,
      )
    : await db.execute(sql`SELECT document FROM apzpen_graph_edge`);

  return {
    engagements: asDocuments<Engagement>(engResult),
    findings: asDocuments<Finding>(findingResult),
    certifications: asDocuments<CertificationLedgerRecord>(certResult),
    graphNodes: asDocuments<SecurityGraphNode>(nodeResult),
    graphEdges: asDocuments<SecurityGraphEdge>(edgeResult),
  };
}

export async function upsertEngagementDocument(
  engagement: Engagement,
  db: DatabaseExecutor = createDb(),
): Promise<void> {
  const payload = JSON.stringify(engagement);
  await db.execute(sql`
    INSERT INTO apzpen_engagement (engagement_id, tenant_id, document, updated_at)
    VALUES (
      ${engagement.engagementId},
      ${engagement.tenantId},
      ${payload}::jsonb,
      ${engagement.updatedAt}::timestamptz
    )
    ON CONFLICT (engagement_id) DO UPDATE SET
      document = EXCLUDED.document,
      updated_at = EXCLUDED.updated_at
  `);
}

export async function upsertFindingDocument(
  finding: Finding,
  db: DatabaseExecutor = createDb(),
): Promise<void> {
  const payload = JSON.stringify(finding);
  await db.execute(sql`
    INSERT INTO apzpen_finding (finding_id, tenant_id, engagement_id, document, updated_at)
    VALUES (
      ${finding.findingId},
      ${finding.tenantId},
      ${finding.engagementId},
      ${payload}::jsonb,
      ${finding.updatedAt}::timestamptz
    )
    ON CONFLICT (finding_id) DO UPDATE SET
      document = EXCLUDED.document,
      engagement_id = EXCLUDED.engagement_id,
      updated_at = EXCLUDED.updated_at
  `);
}

export async function insertCertificationDocument(
  record: CertificationLedgerRecord,
  db: DatabaseExecutor = createDb(),
): Promise<void> {
  const payload = JSON.stringify(record);
  await db.execute(sql`
    INSERT INTO apzpen_certification_ledger (record_id, tenant_id, engagement_id, document, certified_at)
    VALUES (
      ${record.recordId},
      ${record.tenantId},
      ${record.engagementId},
      ${payload}::jsonb,
      ${record.certifiedAt}::timestamptz
    )
    ON CONFLICT (record_id) DO NOTHING
  `);
}

export async function upsertGraphNodeDocument(
  node: SecurityGraphNode,
  db: DatabaseExecutor = createDb(),
): Promise<void> {
  const payload = JSON.stringify(node);
  await db.execute(sql`
    INSERT INTO apzpen_graph_node (node_id, tenant_id, document, updated_at)
    VALUES (
      ${node.nodeId},
      ${node.tenantId},
      ${payload}::jsonb,
      ${node.updatedAt}::timestamptz
    )
    ON CONFLICT (node_id) DO UPDATE SET
      document = EXCLUDED.document,
      updated_at = EXCLUDED.updated_at
  `);
}

export async function upsertGraphEdgeDocument(
  edge: SecurityGraphEdge,
  db: DatabaseExecutor = createDb(),
): Promise<void> {
  const payload = JSON.stringify(edge);
  await db.execute(sql`
    INSERT INTO apzpen_graph_edge (edge_id, tenant_id, document, created_at)
    VALUES (
      ${edge.edgeId},
      ${edge.tenantId},
      ${payload}::jsonb,
      ${edge.createdAt}::timestamptz
    )
    ON CONFLICT (edge_id) DO NOTHING
  `);
}

export async function migrateApzpenSnapshotToPostgres(
  snapshot: ApzpenPostgresSnapshot,
  db: DatabaseExecutor = createDb(),
): Promise<{ readonly written: number }> {
  let written = 0;
  for (const eng of snapshot.engagements) {
    await upsertEngagementDocument(eng, db);
    written += 1;
  }
  for (const finding of snapshot.findings) {
    await upsertFindingDocument(finding, db);
    written += 1;
  }
  for (const cert of snapshot.certifications) {
    await insertCertificationDocument(cert, db);
    written += 1;
  }
  for (const node of snapshot.graphNodes) {
    await upsertGraphNodeDocument(node, db);
    written += 1;
  }
  for (const edge of snapshot.graphEdges) {
    await upsertGraphEdgeDocument(edge, db);
    written += 1;
  }
  return { written };
}
