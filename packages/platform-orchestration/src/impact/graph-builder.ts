/**
 * Deterministic impact graph builder (QO-005).
 * BFS traversal in stable relationshipId order — no visual rendering.
 */

import type {
  AssetRelationship,
  ChangeMagnitude,
  ExplainabilityRecord,
  ImpactGraph,
  ImpactGraphEdge,
  ImpactGraphNode,
  QualityAsset,
  RiskFactor,
  RiskLevel,
} from "../contracts/impact-correlation";
import { assessNodeConfidence } from "./confidence";
import type { ImpactKnowledgeBase } from "./knowledge-base";
import { assessNodeRisk } from "./risk";

export interface BuildImpactGraphInput {
  readonly graphId: string;
  readonly knowledge: ImpactKnowledgeBase;
  readonly seedAssetIds: readonly string[];
  readonly maxDepth: number;
  readonly changeMagnitude: ChangeMagnitude;
  readonly historicalScore: (fromAssetId: string, toAssetId: string) => number;
}

export interface BuiltImpactGraph {
  readonly graph: ImpactGraph;
  readonly explanations: readonly ExplainabilityRecord[];
  readonly nodeRiskLevels: readonly RiskLevel[];
  readonly nodeRiskFactors: readonly RiskFactor[];
  readonly nodeConfidenceScores: readonly number[];
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

export function buildImpactGraph(input: BuildImpactGraphInput): BuiltImpactGraph {
  const nodes = new Map<string, ImpactGraphNode>();
  const edges: ImpactGraphEdge[] = [];
  const explanations: ExplainabilityRecord[] = [];
  const nodeRiskLevels: RiskLevel[] = [];
  const nodeRiskFactors: ReturnType<typeof assessNodeRisk>["factors"][] = [];
  const nodeConfidenceScores: number[] = [];
  const traversalOrder: string[] = [];

  // Stable seed order
  const seeds = [
    ...new Set(input.seedAssetIds.map((s) => s.trim()).filter(Boolean)),
  ].sort();
  const queue: Array<{ assetId: string; depth: number; viaStrength: number }> = [];

  for (const seedId of seeds) {
    const asset = input.knowledge.tryGetAsset(seedId);
    if (!asset) continue;
    enqueueNode({
      asset,
      depth: 0,
      viaStrength: 1,
      isDirect: true,
      relationship: undefined,
      fromNodeId: undefined,
    });
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= input.maxDepth) continue;

    const outgoing = [...input.knowledge.outgoingRelationships(current.assetId)].sort(
      (a, b) => a.relationshipId.localeCompare(b.relationshipId),
    );

    for (const rel of outgoing) {
      const target = input.knowledge.tryGetAsset(rel.toAssetId);
      if (!target) continue;
      const fromNode = nodes.get(current.assetId);
      if (!fromNode) continue;

      const already = nodes.has(target.assetId);
      if (!already) {
        enqueueNode({
          asset: target,
          depth: current.depth + 1,
          viaStrength: rel.strength,
          isDirect: current.depth + 1 === 1,
          relationship: rel,
          fromNodeId: fromNode.nodeId,
        });
      }

      const toNode = nodes.get(target.assetId);
      if (!toNode) continue;

      const hist = input.historicalScore(rel.fromAssetId, rel.toAssetId);
      const edgeConfidence = assessNodeConfidence({
        depth: current.depth + 1,
        relationshipStrength: rel.strength,
        isDirect: current.depth + 1 === 1,
        asset: target,
        changeMagnitude: input.changeMagnitude,
        historicalCorrelation: hist,
      }).score;

      const edgeId = `edge_${rel.relationshipId}`;
      if (!edges.some((e) => e.edgeId === edgeId)) {
        edges.push({
          edgeId,
          fromNodeId: fromNode.nodeId,
          toNodeId: toNode.nodeId,
          kind: rel.kind,
          strength: rel.strength,
          confidence: edgeConfidence,
          reason: rel.reason,
          evidenceRefs: [...(rel.evidenceRefs ?? [])],
        });
        explanations.push({
          recordId: createId("exp"),
          subjectId: edgeId,
          subjectKind: "edge",
          why: rel.reason,
          evidenceRefs: [...(rel.evidenceRefs ?? [])],
          confidenceExplanation: `Edge confidence ${edgeConfidence} from strength ${rel.strength} and historical ${hist}`,
          contributingDependencies: [rel.fromAssetId, rel.toAssetId],
          riskFactors: target.knownRegression ? ["known_regression"] : [],
        });
      }
    }
  }

  function enqueueNode(args: {
    readonly asset: QualityAsset;
    readonly depth: number;
    readonly viaStrength: number;
    readonly isDirect: boolean;
    readonly relationship: AssetRelationship | undefined;
    readonly fromNodeId: string | undefined;
  }): void {
    if (nodes.has(args.asset.assetId)) return;

    const hist = args.relationship
      ? input.historicalScore(
          args.relationship.fromAssetId,
          args.relationship.toAssetId,
        )
      : args.depth === 0
        ? 1
        : 0;

    const confidence = assessNodeConfidence({
      depth: args.depth,
      relationshipStrength: args.viaStrength,
      isDirect: args.isDirect || args.depth === 0,
      asset: args.asset,
      changeMagnitude: input.changeMagnitude,
      historicalCorrelation: hist,
    });

    const risk = assessNodeRisk({
      confidence: confidence.score,
      depth: args.depth,
      knownRegression: Boolean(args.asset.knownRegression),
      changeMagnitude: input.changeMagnitude,
      assetType: args.asset.assetType,
    });

    const node: ImpactGraphNode = {
      nodeId: `node_${args.asset.assetId}`,
      assetId: args.asset.assetId,
      assetType: args.asset.assetType,
      name: args.asset.name,
      version: args.asset.version,
      metadata: { ...(args.asset.metadata ?? {}) },
      relationshipStrength: args.viaStrength,
      confidence: confidence.score,
      riskContribution: risk.level,
      depth: args.depth,
    };

    nodes.set(args.asset.assetId, node);
    traversalOrder.push(node.nodeId);
    queue.push({
      assetId: args.asset.assetId,
      depth: args.depth,
      viaStrength: args.viaStrength,
    });
    nodeConfidenceScores.push(confidence.score);
    nodeRiskLevels.push(risk.level);
    nodeRiskFactors.push(risk.factors);

    explanations.push({
      recordId: createId("exp"),
      subjectId: node.nodeId,
      subjectKind: "node",
      why:
        args.depth === 0
          ? "Seed asset from normalized change"
          : (args.relationship?.reason ?? "Correlated via dependency traversal"),
      evidenceRefs: [...(args.relationship?.evidenceRefs ?? [])],
      confidenceExplanation: confidence.summary,
      contributingDependencies: args.relationship
        ? [args.relationship.fromAssetId, args.relationship.toAssetId]
        : [args.asset.assetId],
      riskFactors: risk.factors.map((f) => f.factorId),
    });
  }

  const rootNodeIds = seeds
    .map((id) => nodes.get(id)?.nodeId)
    .filter((id): id is string => Boolean(id));

  // Stable edge order
  edges.sort((a, b) => a.edgeId.localeCompare(b.edgeId));

  return {
    graph: {
      graphId: input.graphId,
      nodes: [...nodes.values()].sort((a, b) => a.nodeId.localeCompare(b.nodeId)),
      edges,
      rootNodeIds,
      traversalOrder,
    },
    explanations,
    nodeRiskLevels,
    nodeRiskFactors: nodeRiskFactors.flat(),
    nodeConfidenceScores,
  };
}
