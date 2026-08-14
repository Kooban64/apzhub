/**
 * Thin Security Graph — first-class assets + edges (SPR-APZPEN-014).
 */

import { createHash } from "node:crypto";

import type { AssetKind } from "./types";
import { newId } from "./store";

export type GraphNodeKind = "engagement" | "asset" | "finding" | "repository";

export type SecurityGraphNode = {
  readonly nodeId: string;
  readonly tenantId: string;
  readonly kind: GraphNodeKind;
  readonly label: string;
  readonly ref: string;
  readonly assetKind?: AssetKind;
  readonly engagementId?: string;
  readonly findingId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SecurityGraphEdge = {
  readonly edgeId: string;
  readonly tenantId: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly relation:
    | "engagement_has_asset"
    | "asset_has_finding"
    | "engagement_has_finding"
    | "asset_is_repository";
  readonly createdAt: string;
};

export type SecurityGraphSnapshot = {
  readonly nodes: readonly SecurityGraphNode[];
  readonly edges: readonly SecurityGraphEdge[];
};

export function assetKey(kind: AssetKind, identifier: string): string {
  return `${kind}|${identifier}`.toLowerCase();
}

export function buildAssetNode(input: {
  readonly tenantId: string;
  readonly kind: AssetKind;
  readonly label: string;
  readonly identifier: string;
  readonly engagementId?: string;
}): SecurityGraphNode {
  const ts = new Date().toISOString();
  const key = assetKey(input.kind, input.identifier);
  const nodeId = `asset_${createHash("sha256").update(key).digest("hex").slice(0, 24)}`;
  return {
    nodeId,
    tenantId: input.tenantId,
    kind: "asset",
    label: input.label,
    ref: key,
    assetKind: input.kind,
    engagementId: input.engagementId,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildEngagementNode(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly title: string;
}): SecurityGraphNode {
  const ts = new Date().toISOString();
  return {
    nodeId: `engnode_${input.engagementId}`,
    tenantId: input.tenantId,
    kind: "engagement",
    label: input.title,
    ref: input.engagementId,
    engagementId: input.engagementId,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function buildFindingNode(input: {
  readonly tenantId: string;
  readonly findingId: string;
  readonly title: string;
  readonly engagementId: string;
}): SecurityGraphNode {
  const ts = new Date().toISOString();
  return {
    nodeId: `findnode_${input.findingId}`,
    tenantId: input.tenantId,
    kind: "finding",
    label: input.title,
    ref: input.findingId,
    engagementId: input.engagementId,
    findingId: input.findingId,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function linkNodes(input: {
  readonly tenantId: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly relation: SecurityGraphEdge["relation"];
}): SecurityGraphEdge {
  return {
    edgeId: newId("edge"),
    tenantId: input.tenantId,
    fromNodeId: input.fromNodeId,
    toNodeId: input.toNodeId,
    relation: input.relation,
    createdAt: new Date().toISOString(),
  };
}

export function summariseGraph(snapshot: SecurityGraphSnapshot): {
  readonly nodeCounts: Record<GraphNodeKind, number>;
  readonly edgeCount: number;
} {
  const nodeCounts: Record<GraphNodeKind, number> = {
    engagement: 0,
    asset: 0,
    finding: 0,
    repository: 0,
  };
  for (const n of snapshot.nodes) {
    nodeCounts[n.kind] += 1;
  }
  return { nodeCounts, edgeCount: snapshot.edges.length };
}
