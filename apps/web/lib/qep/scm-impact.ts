/**
 * Flagship F2 — Quality Graph & Impact projection for SCM change events.
 * Advisory only: proposes regression packs; humans accept before SoR writes.
 * Flagship F7 Test Design Assist: `./test-design-assist` (propose/accept draft specs).
 */

import {
  impactedPathRoots,
  inferPlatformRefsFromText,
  matchSuitesToChangedPaths,
  type ScmChangeEvent,
  type ScmTraceabilityLink,
} from "@apzhub/platform-scm";
import type { SuiteNode } from "@apzhub/qep-suites";

import { getQepOrchestrationRuntime } from "@/lib/qep/orchestration-runtime";
import { getExecutionPlanRuntime } from "@/lib/qep/execution-plan-runtime";
import { getSuiteRuntime } from "@/lib/qep/suite-runtime";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";

export type QualityGraphNode = {
  readonly nodeId: string;
  readonly assetType: string;
  readonly name: string;
  readonly platformRef?: string;
  readonly reason: string;
  readonly depth: number;
};

export type QualityGraphEdge = {
  readonly edgeId: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly kind: string;
  readonly reason: string;
};

export type ChangeImpactView = {
  readonly changeEventId: string;
  readonly repositoryId?: string;
  readonly correlationId: string;
  readonly riskLevel: "low" | "medium" | "high" | "critical";
  readonly summary: string;
  readonly nodes: readonly QualityGraphNode[];
  readonly edges: readonly QualityGraphEdge[];
  readonly inferredRequirementIds: readonly string[];
  readonly inferredDefectIds: readonly string[];
  readonly matchedSuiteIds: readonly string[];
  readonly orchestrationCorrelationId?: string;
};

export type RegressionProposal = {
  readonly changeEventId: string;
  readonly proposedSuites: readonly {
    readonly suiteId: string;
    readonly name: string;
    readonly matchedPaths: readonly string[];
    readonly matchReasons: readonly string[];
  }[];
  readonly advisory: true;
  readonly note: string;
};

async function findChangeEvent(
  tenantId: string,
  changeEventId: string,
): Promise<ScmChangeEvent | undefined> {
  const runtime = getQepScmRuntime();
  const changes = await runtime.listChangeEvents({ tenantId, limit: 500 });
  return changes.find((change) => change.changeEventId === changeEventId);
}

function textForInference(change: ScmChangeEvent): string {
  return [change.title, change.summary, change.branch, change.externalKey]
    .filter(Boolean)
    .join(" ");
}

export async function buildChangeImpact(
  tenantId: string,
  changeEventId: string,
  actorId?: string,
): Promise<ChangeImpactView> {
  const change = await findChangeEvent(tenantId, changeEventId);
  if (!change) {
    throw new Error("scm.impact.change_not_found");
  }

  const runtime = getQepScmRuntime();
  const links: readonly ScmTraceabilityLink[] = change.repositoryId
    ? await runtime.listTraceabilityLinks(change.repositoryId)
    : [];

  const inferred = inferPlatformRefsFromText(textForInference(change));
  const suites = await getSuiteRuntime().repository.list({ tenantId });
  const suiteMatches = matchSuitesToChangedPaths(
    suites.map((suite: SuiteNode) => ({
      suiteId: suite.suiteId,
      name: suite.name,
      tags: suite.tags,
      component: suite.component,
      application: suite.application,
      folderPath: suite.folderPath,
      customMetadata: suite.customMetadata,
    })),
    change.filesChanged ?? [],
  );

  const roots = impactedPathRoots(change.filesChanged ?? []);
  const changeNodeId = `change:${change.changeEventId}`;
  const nodes: QualityGraphNode[] = [
    {
      nodeId: changeNodeId,
      assetType: change.kind === "pull_request" ? "pull_request" : "commit",
      name: change.title ?? change.summary,
      reason: "Source change event (F1 heartbeat)",
      depth: 0,
    },
  ];
  const edges: QualityGraphEdge[] = [];

  for (const root of roots) {
    const nodeId = `path:${root}`;
    nodes.push({
      nodeId,
      assetType: "package",
      name: root,
      reason: "Changed path root",
      depth: 1,
    });
    edges.push({
      edgeId: `${changeNodeId}->${nodeId}`,
      fromNodeId: changeNodeId,
      toNodeId: nodeId,
      kind: "contains",
      reason: "Files under path root were modified",
    });
  }

  for (const ref of inferred) {
    const nodeId = `${ref.kind}:${ref.platformRef}`;
    nodes.push({
      nodeId,
      assetType: ref.kind,
      name: ref.platformRef,
      platformRef: ref.platformRef,
      reason: ref.reason,
      depth: 1,
    });
    edges.push({
      edgeId: `${changeNodeId}->${nodeId}`,
      fromNodeId: changeNodeId,
      toNodeId: nodeId,
      kind: ref.kind === "defect" ? "related_to" : "implements",
      reason: ref.reason,
    });
  }

  for (const link of links) {
    if (!link.platformRef) continue;
    const nodeId = `link:${link.kind}:${link.platformRef}`;
    nodes.push({
      nodeId,
      assetType: link.kind,
      name: link.platformRef,
      platformRef: link.platformRef,
      reason: link.note ?? `Existing SCM traceability link (${link.kind})`,
      depth: 1,
    });
    edges.push({
      edgeId: `${changeNodeId}->${nodeId}`,
      fromNodeId: changeNodeId,
      toNodeId: nodeId,
      kind: "related_to",
      reason: "Registered ScmTraceabilityLink",
    });
  }

  for (const match of suiteMatches) {
    const nodeId = `suite:${match.suiteId}`;
    nodes.push({
      nodeId,
      assetType: "test_suite",
      name: match.name,
      platformRef: match.suiteId,
      reason: match.matchReasons.join("; "),
      depth: 1,
    });
    edges.push({
      edgeId: `${changeNodeId}->${nodeId}`,
      fromNodeId: changeNodeId,
      toNodeId: nodeId,
      kind: "covers",
      reason: "Path prefix matched suite regression scope",
    });
  }

  // Persist inferred requirement/defect edges as SCM links (enhance, idempotent-ish).
  if (change.repositoryId) {
    for (const ref of inferred) {
      const exists = links.some(
        (link) =>
          link.kind === ref.kind &&
          link.platformRef === ref.platformRef &&
          link.externalRef === change.externalKey,
      );
      if (!exists) {
        await runtime.addTraceabilityLink({
          tenantId,
          repositoryId: change.repositoryId,
          kind: ref.kind,
          externalRef: change.externalKey,
          platformRef: ref.platformRef,
          createdBy: actorId ?? "system:f2-infer",
          note: ref.reason,
        });
      }
    }
  }

  let orchestrationCorrelationId: string | undefined;
  try {
    const orch = await getQepOrchestrationRuntime();
    const seedAssetIds = [
      changeNodeId,
      ...suiteMatches.map((m) => `suite:${m.suiteId}`),
      ...inferred.map((r) => `${r.kind}:${r.platformRef}`),
    ];
    await orch.impact.registerAsset({
      assetId: changeNodeId,
      assetType: change.kind === "pull_request" ? "pull_request" : "commit",
      name: change.title ?? change.summary,
      tenantId,
      metadata: {
        changeEventId: change.changeEventId,
        sha: change.sha ?? "",
      },
    });
    for (const match of suiteMatches) {
      const assetId = `suite:${match.suiteId}`;
      await orch.impact.registerAsset({
        assetId,
        assetType: "test_suite",
        name: match.name,
        tenantId,
        metadata: { suiteId: match.suiteId },
      });
      await orch.impact.registerRelationship({
        relationshipId: `${changeNodeId}->${assetId}`,
        fromAssetId: changeNodeId,
        toAssetId: assetId,
        kind: "covers",
        strength: 0.7,
        reason: match.matchReasons.join("; ") || "path match",
      });
    }
    const correlation = await orch.impact.createCorrelation({
      change: {
        changeId: change.changeEventId,
        changeKind: change.kind === "pull_request" ? "pull_request" : "commit",
        tenantId,
        correlationId: change.correlationId,
        occurredAt: change.occurredAt,
        refs: change.filesChanged ?? [],
        seedAssetIds,
        actorId,
        metadata: {
          source: change.source,
          externalKey: change.externalKey,
        },
      },
      maxDepth: 4,
    });
    orchestrationCorrelationId = correlation.correlationId;
  } catch {
    // Orchestration KB optional for F2 projection — local graph still returned.
  }

  const riskLevel =
    suiteMatches.length >= 3 || (change.filesChanged?.length ?? 0) > 40
      ? "high"
      : suiteMatches.length >= 1 || inferred.length > 0
        ? "medium"
        : "low";

  return {
    changeEventId: change.changeEventId,
    repositoryId: change.repositoryId,
    correlationId: change.correlationId,
    riskLevel,
    summary: `Impact for ${change.kind}: ${nodes.length - 1} related node(s), ${suiteMatches.length} suite match(es). Advisory only.`,
    nodes,
    edges,
    inferredRequirementIds: inferred
      .filter((r) => r.kind === "requirement")
      .map((r) => r.platformRef),
    inferredDefectIds: inferred
      .filter((r) => r.kind === "defect")
      .map((r) => r.platformRef),
    matchedSuiteIds: suiteMatches.map((m) => m.suiteId),
    orchestrationCorrelationId,
  };
}

export async function proposeRegressionPack(
  tenantId: string,
  changeEventId: string,
): Promise<RegressionProposal> {
  const impact = await buildChangeImpact(tenantId, changeEventId);
  const change = await findChangeEvent(tenantId, changeEventId);
  if (!change) {
    throw new Error("scm.impact.change_not_found");
  }
  const suites = await getSuiteRuntime().repository.list({ tenantId });
  const suiteMatches = matchSuitesToChangedPaths(
    suites.map((suite) => ({
      suiteId: suite.suiteId,
      name: suite.name,
      tags: suite.tags,
      component: suite.component,
      application: suite.application,
      folderPath: suite.folderPath,
      customMetadata: suite.customMetadata,
    })),
    change.filesChanged ?? [],
  );

  // Prefer path matches; if none, fall back to suites tagged "regression".
  const proposed =
    suiteMatches.length > 0
      ? suiteMatches
      : suites
          .filter((suite) => suite.tags.includes("regression"))
          .slice(0, 5)
          .map((suite) => ({
            suiteId: suite.suiteId,
            name: suite.name,
            matchedPaths: [] as string[],
            matchReasons: ["fallback: suite tagged regression"],
          }));

  return {
    changeEventId,
    proposedSuites: proposed,
    advisory: true,
    note:
      proposed.length === 0
        ? "No suites matched changed paths. Tag suites with path:<prefix> or customMetadata.pathPrefixes, then re-propose."
        : `Advisory pack for risk=${impact.riskLevel}. Human must accept before an execution plan is created.`,
  };
}

export async function acceptRegressionProposal(input: {
  readonly tenantId: string;
  readonly userId: string;
  readonly permissions: readonly string[];
  readonly changeEventId: string;
  readonly suiteId: string;
  readonly planName?: string;
}): Promise<{
  readonly planId: string;
  readonly suiteId: string;
  readonly changeEventId: string;
  readonly linkId?: string;
}> {
  const change = await findChangeEvent(input.tenantId, input.changeEventId);
  if (!change) {
    throw new Error("scm.impact.change_not_found");
  }
  const proposal = await proposeRegressionPack(input.tenantId, input.changeEventId);
  const allowed = new Set(proposal.proposedSuites.map((s) => s.suiteId));
  if (!allowed.has(input.suiteId) && proposal.proposedSuites.length > 0) {
    throw new Error("scm.impact.suite_not_in_proposal");
  }

  const actor = {
    userId: input.userId,
    tenantId: input.tenantId,
    permissions: input.permissions,
  };
  const plan = await getExecutionPlanRuntime().service.create(
    actor,
    {
      name:
        input.planName?.trim() ||
        `Regression from ${change.kind} ${change.sha?.slice(0, 7) ?? change.externalKey}`,
      description: `F2 human-accepted regression pack for change ${change.changeEventId}`,
      suiteId: input.suiteId,
      tags: ["regression", "f2-impact", change.kind],
      customMetadata: {
        sourceChangeEventId: change.changeEventId,
        sourceExternalKey: change.externalKey,
        sourceSha: change.sha ?? null,
        sourceRepositoryId: change.repositoryId ?? null,
        advisoryAccepted: true,
      },
      scope: {
        mode: "complete_suite",
        notes: "Created from F2 regression proposal accept — draft only",
      },
    },
    new Date().toISOString(),
  );

  let linkId: string | undefined;
  if (change.repositoryId) {
    const link = await getQepScmRuntime().addTraceabilityLink({
      tenantId: input.tenantId,
      repositoryId: change.repositoryId,
      kind: "execution_plan",
      externalRef: change.externalKey,
      platformRef: plan.planId,
      createdBy: input.userId,
      note: "F2 accepted regression proposal → draft execution plan",
    });
    linkId = link.linkId;
  }

  return {
    planId: plan.planId,
    suiteId: input.suiteId,
    changeEventId: change.changeEventId,
    linkId,
  };
}
