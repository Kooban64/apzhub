/**
 * Flagship F7 — Test Design Assist.
 * Rule-based advisory drafts from F2 impact + F6-style domain gaps.
 * Humans accept → draft specs in native Spec SoR (+ optional suite/trace links).
 * Never auto-runs. Never mutates certification.
 */

import { createHash } from "node:crypto";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type { CreateQepTestSpecificationInput } from "@apzhub/qep-contracts";

import { getPlatformServiceGateway } from "@/lib/api/v1/gateway/bootstrap";
import { collectEvidenceForChange } from "@/lib/qep/certification-runtime";
import { buildChangeImpact, type ChangeImpactView } from "@/lib/qep/scm-impact";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";

export type TestDesignDomain =
  "automation" | "ci" | "accessibility" | "security" | "performance" | "code_quality";

export type TestDesignDraftKind =
  "requirement_smoke" | "domain_gap" | "path_regression";

export type TestDesignDraftProposal = {
  readonly proposalItemId: string;
  readonly kind: TestDesignDraftKind;
  readonly title: string;
  readonly objective: string;
  readonly description: string;
  readonly scope: string;
  readonly type: string;
  readonly classification: string;
  readonly priority: string;
  readonly why: string;
  readonly requirementId?: string;
  readonly suiteId?: string;
  readonly domain?: TestDesignDomain;
  readonly suggestedSteps: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly tags: readonly string[];
};

export type TestDesignPack = {
  readonly changeEventId: string;
  readonly advisory: true;
  readonly note: string;
  readonly drafts: readonly TestDesignDraftProposal[];
  readonly matchedSuiteIds: readonly string[];
  readonly inferredRequirementIds: readonly string[];
  readonly domainGaps: readonly TestDesignDomain[];
};

export type TestDesignAcceptance = {
  readonly changeEventId: string;
  readonly accepted: readonly {
    readonly proposalItemId: string;
    readonly specificationId: string;
    readonly number: string;
    readonly title: string;
    readonly suiteRelationshipId?: string;
    readonly traceLinkId?: string;
    readonly traceSkippedReason?: string;
  }[];
};

const EXPECTED_DOMAINS: readonly {
  readonly domain: TestDesignDomain;
  readonly type: string;
  readonly priority: string;
  readonly label: string;
}[] = [
  {
    domain: "automation",
    type: "functional",
    priority: "high",
    label: "Automation",
  },
  { domain: "ci", type: "regression", priority: "medium", label: "Coverage (CI)" },
  {
    domain: "accessibility",
    type: "accessibility",
    priority: "medium",
    label: "Accessibility",
  },
  { domain: "security", type: "security", priority: "high", label: "Security" },
  {
    domain: "performance",
    type: "performance",
    priority: "medium",
    label: "Performance",
  },
  {
    domain: "code_quality",
    type: "compliance",
    priority: "medium",
    label: "Code quality",
  },
] as const;

function proposalItemId(
  changeEventId: string,
  kind: TestDesignDraftKind,
  salt: string,
): string {
  const digest = createHash("sha256")
    .update(`${changeEventId}|${kind}|${salt}`)
    .digest("hex")
    .slice(0, 12);
  return `tdraft-${kind}-${digest}`;
}

function shortChangeToken(changeEventId: string): string {
  const digest = createHash("sha256").update(changeEventId).digest("hex").slice(0, 8);
  return digest.toUpperCase();
}

/** Map inferred platform refs (REQ-*, req-*) to Trace endpoint artefact IDs (req_*). */
function toTraceRequirementArtefactId(platformRef: string): string | undefined {
  const trimmed = platformRef.trim();
  if (/^req_[A-Za-z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/^req[-_]?(.+)$/i);
  if (!match?.[1]) return undefined;
  const candidate = `req_${match[1].replace(/[^A-Za-z0-9_-]/g, "_")}`;
  return /^req_[A-Za-z0-9_-]+$/.test(candidate) ? candidate : undefined;
}

function domainGapsFromEvidence(
  evidenceDomains: ReadonlySet<string>,
): TestDesignDomain[] {
  const gaps: TestDesignDomain[] = [];
  for (const item of EXPECTED_DOMAINS) {
    const present =
      evidenceDomains.has(item.domain) ||
      (item.domain === "accessibility" && evidenceDomains.has("regression"));
    if (!present) gaps.push(item.domain);
  }
  return gaps;
}

function stepsForDomain(domain: TestDesignDomain): readonly string[] {
  switch (domain) {
    case "automation":
      return [
        "Identify critical user journey touched by changed paths",
        "Author or extend automated checks for happy path + one failure path",
        "Attach run report to this change as automation evidence",
      ];
    case "ci":
      return [
        "Confirm CI pipeline runs on the change branch",
        "Capture coverage / pipeline report for ingest",
        "Link CI evidence to the change before RC evaluate",
      ];
    case "accessibility":
      return [
        "Run accessibility checks on the critical journey for changed UI",
        "Triage critical/serious findings",
        "Ingest a11y report against this change",
      ];
    case "security":
      return [
        "Run security scan appropriate to changed surface",
        "Triage high/critical findings",
        "Ingest security findings (SARIF or findings JSON) against this change",
      ];
    case "performance":
      return [
        "Identify performance-sensitive path impacted by the change",
        "Run load/perf check (or smoke threshold)",
        "Ingest performance report against this change",
      ];
    case "code_quality":
      return [
        "Run static analysis / quality gate on changed packages",
        "Confirm no new blocker-class findings",
        "Ingest code quality report against this change",
      ];
    default: {
      const _exhaustive: never = domain;
      return [_exhaustive];
    }
  }
}

/**
 * Pure composition — used by proposeTestDesignPack and unit tests (no I/O).
 */
export function composeTestDesignPack(input: {
  readonly changeEventId: string;
  readonly impact: ChangeImpactView;
  readonly evidenceDomains: ReadonlySet<string> | readonly string[];
}): TestDesignPack {
  const { changeEventId, impact } = input;
  const domains = new Set(
    Array.isArray(input.evidenceDomains)
      ? input.evidenceDomains
      : [...input.evidenceDomains],
  );
  const gaps = domainGapsFromEvidence(domains);
  const drafts: TestDesignDraftProposal[] = [];
  const primarySuiteId = impact.matchedSuiteIds[0];

  for (const requirementId of impact.inferredRequirementIds.slice(0, 5)) {
    drafts.push({
      proposalItemId: proposalItemId(changeEventId, "requirement_smoke", requirementId),
      kind: "requirement_smoke",
      title: `${requirementId} smoke — change impact`,
      objective: `Verify ${requirementId} still holds after this change.`,
      description:
        `Advisory draft from Test Design Assist (F7). Inferred requirement ${requirementId} ` +
        `from change text/graph. Human must edit steps before execution.`,
      scope: `Requirement ${requirementId}; paths and suites matched on change ${changeEventId}.`,
      type: "functional",
      classification: "standard",
      priority: impact.riskLevel === "critical" ? "critical" : "high",
      why: `Requirement ${requirementId} was inferred on the quality graph for this change.`,
      requirementId,
      suiteId: primarySuiteId,
      suggestedSteps: [
        `Confirm ${requirementId} acceptance criteria still apply`,
        "Exercise the primary flow for this requirement on the changed surface",
        "Record pass/fail and attach evidence to the change",
      ],
      acceptanceCriteria: [
        `${requirementId} critical path passes`,
        "No new blocker defect opened for this requirement",
      ],
      tags: ["f7-design-assist", "requirement-smoke", requirementId],
    });
  }

  for (const gap of gaps) {
    const meta = EXPECTED_DOMAINS.find((row) => row.domain === gap);
    if (!meta) continue;
    drafts.push({
      proposalItemId: proposalItemId(changeEventId, "domain_gap", gap),
      kind: "domain_gap",
      title: `${meta.label} verification for changed paths`,
      objective: `Close the ${meta.label} evidence gap on this change before READY.`,
      description:
        `Advisory draft from Test Design Assist (F7). Domain ${gap} has no evidence ` +
        `linked to this change (same lens as Quality Intelligence).`,
      scope: `Domain ${gap}; change ${changeEventId}.`,
      type: meta.type,
      classification: gap === "security" ? "security-critical" : "standard",
      priority: meta.priority,
      why: `No ${meta.label} evidence linked to this change — design coverage before tool runs prove it.`,
      domain: gap,
      suiteId: primarySuiteId,
      suggestedSteps: stepsForDomain(gap),
      acceptanceCriteria: [
        `${meta.label} evidence linked to change ${changeEventId}`,
        "RC domain tile no longer empty for this domain",
      ],
      tags: ["f7-design-assist", "domain-gap", gap],
    });
  }

  if (
    drafts.length === 0 &&
    (impact.matchedSuiteIds.length > 0 || impact.riskLevel !== "low")
  ) {
    drafts.push({
      proposalItemId: proposalItemId(
        changeEventId,
        "path_regression",
        primarySuiteId ?? "paths",
      ),
      kind: "path_regression",
      title: "Path regression smoke for change",
      objective:
        "Cover path-matched suites / changed roots with a draft regression specification.",
      description:
        "Advisory draft from Test Design Assist (F7). No inferred requirements and domains already have evidence — still recommend a path regression draft.",
      scope: `Matched suites: ${impact.matchedSuiteIds.join(", ") || "none"}.`,
      type: "regression",
      classification: "standard",
      priority: "medium",
      why: "Change has path impact without requirement-linked design drafts.",
      suiteId: primarySuiteId,
      suggestedSteps: [
        "Review matched suite coverage against changed files",
        "Add missing cases for uncovered path roots",
        "Accept regression pack (F2) when suite execution is ready",
      ],
      acceptanceCriteria: [
        "Critical changed paths covered by at least one draft or suite",
      ],
      tags: ["f7-design-assist", "path-regression"],
    });
  }

  const capped = drafts.slice(0, 12);
  return {
    changeEventId,
    advisory: true,
    note:
      capped.length === 0
        ? "No design drafts suggested — add requirement refs in the change message or wait for path/suite matches."
        : `Advisory test design pack (${capped.length} draft spec(s)). Human must accept before Spec SoR writes. Tools still prove domains for READY.`,
    drafts: capped,
    matchedSuiteIds: impact.matchedSuiteIds,
    inferredRequirementIds: impact.inferredRequirementIds,
    domainGaps: gaps,
  };
}

export async function proposeTestDesignPack(
  tenantId: string,
  changeEventId: string,
): Promise<TestDesignPack> {
  const impact = await buildChangeImpact(tenantId, changeEventId);
  let evidenceDomains = new Set<string>();
  try {
    const collected = await collectEvidenceForChange(tenantId, changeEventId);
    evidenceDomains = new Set(collected.evidenceLinks.map((link) => link.domain));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message !== "certification.change_not_found") throw error;
  }
  return composeTestDesignPack({
    changeEventId,
    impact,
    evidenceDomains,
  });
}

function toCreateInput(
  draft: TestDesignDraftProposal,
  changeEventId: string,
  actorId: string,
  index: number,
): CreateQepTestSpecificationInput {
  const token = shortChangeToken(changeEventId);
  const number = `F7-${token}-${String(index + 1).padStart(2, "0")}`;
  const metadata: Record<string, string> = {
    sourceChangeEventId: changeEventId,
    assistOrigin: "f7_test_design",
    proposalItemId: draft.proposalItemId,
    designKind: draft.kind,
  };
  if (draft.requirementId) metadata.requirementId = draft.requirementId;
  if (draft.suiteId) metadata.matchedSuiteId = draft.suiteId;
  if (draft.domain) metadata.domainGap = draft.domain;

  return {
    number,
    title: draft.title.slice(0, 240),
    description: [
      draft.description,
      "",
      "Suggested steps:",
      ...draft.suggestedSteps.map((step, i) => `${i + 1}. ${step}`),
      "",
      `Why: ${draft.why}`,
    ].join("\n"),
    objective: draft.objective,
    scope: draft.scope,
    type: draft.type,
    classification: draft.classification,
    owner: actorId,
    author: actorId,
    priority: draft.priority,
    complexity: "simple",
    preconditions: [
      "Change is durable in SCM heartbeat",
      "Human accepted this F7 design draft",
    ],
    postconditions: ["Draft remains editable until reviewed/approved"],
    acceptanceCriteria: [...draft.acceptanceCriteria],
    dependencies: draft.requirementId
      ? [
          {
            id: `dep-${draft.proposalItemId}`.slice(0, 64),
            summary: `Covers inferred requirement ${draft.requirementId}`,
            referenceKind: "requirement",
            referenceId: draft.requirementId,
          },
        ]
      : draft.suiteId
        ? [
            {
              id: `dep-${draft.proposalItemId}`.slice(0, 64),
              summary: `Matched suite ${draft.suiteId}`,
              referenceKind: "test_suite",
              referenceId: draft.suiteId,
            },
          ]
        : undefined,
    tags: [...draft.tags, "draft", "f7"],
    metadata,
  };
}

export async function acceptTestDesignProposal(input: {
  readonly serviceContext: ServiceRequestContext;
  readonly changeEventId: string;
  readonly proposalItemIds?: readonly string[];
  readonly acceptAll?: boolean;
}): Promise<TestDesignAcceptance> {
  const tenantId = input.serviceContext.tenantId;
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("scm.design.change_id_required");
  }

  const proposal = await proposeTestDesignPack(tenantId, changeEventId);
  if (proposal.drafts.length === 0) {
    throw new Error("scm.design.empty_proposal");
  }

  const allowed = new Set(proposal.drafts.map((draft) => draft.proposalItemId));
  let selectedIds: string[];
  if (input.acceptAll) {
    selectedIds = proposal.drafts.map((draft) => draft.proposalItemId);
  } else {
    const requested = (input.proposalItemIds ?? [])
      .map((id) => id.trim())
      .filter(Boolean);
    if (requested.length === 0) {
      throw new Error("scm.design.proposal_item_required");
    }
    for (const id of requested) {
      if (!allowed.has(id)) {
        throw new Error("scm.design.item_not_in_proposal");
      }
    }
    selectedIds = requested;
  }

  const selected = proposal.drafts.filter((draft) =>
    selectedIds.includes(draft.proposalItemId),
  );
  const gateway = await getPlatformServiceGateway();
  const actorId = input.serviceContext.userId;
  const impact = await buildChangeImpact(tenantId, changeEventId);
  const accepted: TestDesignAcceptance["accepted"][number][] = [];

  for (let index = 0; index < selected.length; index += 1) {
    const draft = selected[index]!;
    const created = await gateway.qep.specifications.create(
      input.serviceContext,
      toCreateInput(draft, changeEventId, actorId, index),
    );

    let suiteRelationshipId: string | undefined;
    if (draft.suiteId) {
      try {
        const withRel = await gateway.qep.specifications.addRelationship(
          input.serviceContext,
          created.id,
          {
            id: `tsr-f7-${created.id.slice(0, 24)}`.slice(0, 64),
            kind: "test_suite",
            artefactId: draft.suiteId,
            owningDomain: "suites",
            label: "F7 matched suite",
          },
        );
        suiteRelationshipId = withRel.relationships.find(
          (rel) => rel.artefactId === draft.suiteId,
        )?.id;
      } catch {
        // Suite attach is best-effort; draft spec remains the SoR write.
      }
    }

    let traceLinkId: string | undefined;
    let traceSkippedReason: string | undefined;
    if (draft.requirementId) {
      const requirementArtefactId = toTraceRequirementArtefactId(draft.requirementId);
      if (!requirementArtefactId) {
        traceSkippedReason = `Requirement ref ${draft.requirementId} is not a valid trace artefactId`;
      } else {
        try {
          const trace = await gateway.qep.traceability.createTraceLink(
            input.serviceContext,
            {
              type: "requirement_specified_by",
              source: {
                kind: "requirement",
                artefactId: requirementArtefactId,
              },
              target: {
                kind: "test_specification",
                artefactId: created.id,
              },
              origin: "ai_suggestion",
              authority: { kind: "human", actorId },
              provenance: {
                actorId,
                correlationId: input.serviceContext.correlationId,
                sourceSystem: "apzqep.f7.test_design_assist",
              },
              rationale: draft.why,
              metadata: {
                sourceChangeEventId: changeEventId,
                assistOrigin: "f7_test_design",
                proposalItemId: draft.proposalItemId,
                inferredRequirementRef: draft.requirementId,
              },
            },
          );
          traceLinkId = trace.id;
        } catch (error) {
          traceSkippedReason = error instanceof Error ? error.message : String(error);
        }
      }
    }

    if (impact.repositoryId) {
      try {
        await getQepScmRuntime().addTraceabilityLink({
          tenantId,
          repositoryId: impact.repositoryId,
          kind: "quality_report",
          externalRef: changeEventId,
          platformRef: created.id,
          createdBy: actorId,
          note: "F7 accepted test design draft → draft specification",
        });
      } catch {
        // SCM link is advisory relationship only.
      }
    }

    accepted.push({
      proposalItemId: draft.proposalItemId,
      specificationId: created.id,
      number: created.number,
      title: created.title,
      suiteRelationshipId,
      traceLinkId,
      traceSkippedReason,
    });
  }

  return { changeEventId, accepted };
}
