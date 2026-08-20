/**
 * Flagship F4/F5 — Certification Engine + RC Quality OS face projection.
 * Advisory gate evaluation from F1–F3 change/evidence; human GO/NO-GO only via ApprovalEngine.
 * F5 adds domain tiles (masked providers) for the single Release Candidate workbench.
 */

import { randomUUID } from "node:crypto";

import type {
  EvidenceReference,
  GateEvaluationResult,
} from "@apzhub/platform-orchestration";

import { buildChangeImpact } from "@/lib/qep/scm-impact";
import { getQepOrchestrationRuntime } from "@/lib/qep/orchestration-runtime";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";
import { getApplicationService } from "@/lib/qep/application-runtime";
import { getAssuranceService } from "@/lib/qep/assurance-runtime";
import type {
  CertificationOutcome,
  ReadinessSnapshot,
  QualityGateEvaluationRecord,
  CertificationExceptionRecord,
  EnvironmentSnapshot,
  ScmIdentity,
} from "@apzhub/qep-assurance/domain";
import { assertCertificationOutcomeAllowed } from "@apzhub/qep-assurance/domain";

export const F4_CERTIFIER_AUTHORITY = "quality_certifier";
export const F4_CO_APPROVER_AUTHORITY = "quality_co_approver";
export const F4_REQUIRED_AUTHORITIES = [
  F4_CERTIFIER_AUTHORITY,
  F4_CO_APPROVER_AUTHORITY,
] as const;

const DOC = "docs/products/apzqep/FLAGSHIP-PROGRAMME.md#f4";
const F4_TEMPLATE_ID = "release_candidate" as const;
/** Dual-authority template (SPR-210 WF-24). Legacy single-authority id remains unused for new bundles. */
const F4_APPROVAL_TEMPLATE = "tpl_f4_change_rc_dual";
const F4_AUTHORITY = F4_CERTIFIER_AUTHORITY;
const F4_CO_AUTHORITY = F4_CO_APPROVER_AUTHORITY;
const ARTEFACT_KIND = "decision_package" as const;

export type CertificationGateView = {
  readonly gateId: string;
  readonly name: string;
  readonly status: string;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
  readonly outstandingWork: readonly string[];
  readonly category: string;
};

export type CertificationEvidenceLink = {
  readonly evidenceId: string;
  readonly domain: string;
  readonly ref: string;
  readonly note?: string;
};

export type HumanCertificationDecision = {
  readonly outcome: CertificationOutcome;
  readonly actorId: string;
  readonly rationale: string;
  readonly decidedAt: string;
  readonly approvalDecisionId: string;
  readonly approvalBundleId: string;
  /** SPR-210 — both certifier and co-approver when dual GO / CONDITIONAL_GO. */
  readonly coApproverActorId?: string;
};

/** Partial authority vote before terminal humanDecision (SPR-210 WF-24). */
export type CertificationAuthorityVote = {
  readonly authorityId: string;
  readonly outcome: CertificationOutcome;
  readonly actorId: string;
  readonly rationale: string;
  readonly decidedAt: string;
  readonly approvalDecisionId: string;
};

export type Phase6CertificationSnapshot = {
  readonly applicationId: string;
  readonly environmentId: string;
  readonly environmentSnapshot: EnvironmentSnapshot;
  readonly scmIdentity: ScmIdentity;
  readonly gateEvaluations: readonly QualityGateEvaluationRecord[];
  readonly readinessSnapshot: ReadinessSnapshot;
  readonly exceptionsUsed: readonly CertificationExceptionRecord[];
  readonly frozen: true;
};

/** F5 RC face domain tile — user sees domains, never provider brands. */
export type RcDomainId =
  | "requirements"
  | "automation"
  | "security"
  | "performance"
  | "accessibility"
  | "coverage"
  | "risk"
  | "certification"
  | "code_quality";

export type RcDomainStatus = "pass" | "fail" | "not_present" | "info";

export type RcDomainTile = {
  readonly domainId: RcDomainId;
  readonly label: string;
  readonly status: RcDomainStatus;
  readonly summary: string;
  readonly evidenceIds: readonly string[];
  readonly explainRefs: readonly string[];
};

export type RcImpactSummary = {
  readonly riskLevel: string;
  readonly requirementCount: number;
  readonly suiteMatchCount: number;
  readonly nodeCount: number;
};

export type CertificationEvaluation = {
  readonly evaluationId: string;
  readonly changeEventId: string;
  readonly tenantId: string;
  readonly createdAt: string;
  readonly actorId: string;
  readonly score: number;
  readonly readiness: "READY" | "BLOCKED";
  readonly summary: string;
  readonly advisory: true;
  readonly governanceDecisionId: string;
  readonly approvalBundleId?: string;
  readonly residualRisk: string;
  readonly compositionSatisfied: boolean;
  readonly gates: readonly CertificationGateView[];
  readonly evidenceLinks: readonly CertificationEvidenceLink[];
  readonly explainability: readonly {
    readonly gateId: string;
    readonly reason: string;
    readonly evidenceEvaluated: readonly string[];
  }[];
  readonly humanDecision?: HumanCertificationDecision;
  /** SPR-210 — authority votes collected before terminal GO. */
  readonly authorityVotes?: readonly CertificationAuthorityVote[];
  /** F5 — domain strip for RC Quality OS face. */
  readonly domains: readonly RcDomainTile[];
  readonly impactSummary?: RcImpactSummary;
  readonly title: string;
  /** Phase 6 — application isolation. Absent on historical F4 records. */
  readonly applicationId?: string;
  readonly environmentId?: string;
  readonly phase6?: Phase6CertificationSnapshot;
};

let seedPromise: Promise<void> | undefined;

function isExistsError(error: unknown): boolean {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "";
  const message = error instanceof Error ? error.message : String(error);
  return (
    code === "GATE_EXISTS" ||
    code === "TEMPLATE_EXISTS" ||
    code === "AUTHORITY_EXISTS" ||
    message.includes("already registered") ||
    message.includes("GATE_EXISTS") ||
    message.includes("TEMPLATE_EXISTS") ||
    message.includes("AUTHORITY_EXISTS")
  );
}

async function ensureF4Seed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const orch = await getQepOrchestrationRuntime();
      const tryGate = async (
        input: Parameters<typeof orch.governance.registerGate>[0],
      ) => {
        try {
          await orch.governance.registerGate(input);
        } catch (error) {
          if (!isExistsError(error)) throw error;
        }
      };
      await tryGate({
        gateId: "gate_f4_automation",
        name: "Automation evidence present",
        version: "1.0.0",
        category: { family: "mandatory", label: "coverage" },
        description: "F4: at least one automation-domain evidence ref on the change",
        criteria: { type: "evidence_ref_present", refKey: "automation" },
        documentationRef: DOC,
        overrideEligible: false,
      });
      await tryGate({
        gateId: "gate_f4_ci",
        name: "CI / unit evidence present",
        version: "1.0.0",
        category: { family: "mandatory", label: "coverage" },
        description: "F4: Vitest/CI evidence linked to the change",
        criteria: { type: "evidence_ref_present", refKey: "ci" },
        documentationRef: DOC,
        overrideEligible: false,
      });
      await tryGate({
        gateId: "gate_f4_a11y_or_regression",
        name: "Accessibility evidence or accepted regression pack",
        version: "1.0.0",
        category: { family: "mandatory", label: "accessibility" },
        description:
          "F4: axe/a11y evidence OR human-accepted regression plan for the change",
        criteria: {
          type: "or",
          criteria: [
            { type: "evidence_ref_present", refKey: "accessibility" },
            { type: "evidence_ref_present", refKey: "regression" },
          ],
        },
        documentationRef: DOC,
        overrideEligible: false,
      });
      await tryGate({
        gateId: "gate_f4_security",
        name: "Security evidence present",
        version: "1.0.0",
        category: { family: "mandatory", label: "security" },
        description: "F3 deepen: security scan evidence linked to the change",
        criteria: { type: "evidence_ref_present", refKey: "security" },
        documentationRef: DOC,
        overrideEligible: false,
      });
      await tryGate({
        gateId: "gate_f4_performance",
        name: "Performance evidence present",
        version: "1.0.0",
        category: { family: "mandatory", label: "performance" },
        description: "F3 deepen: performance evidence linked to the change",
        criteria: { type: "evidence_ref_present", refKey: "performance" },
        documentationRef: DOC,
        overrideEligible: false,
      });
      await tryGate({
        gateId: "gate_f4_code_quality",
        name: "Code quality evidence present",
        version: "1.0.0",
        category: { family: "mandatory", label: "coverage" },
        description: "F3 deepen: static/code-quality evidence linked to the change",
        criteria: { type: "evidence_ref_present", refKey: "code_quality" },
        documentationRef: DOC,
        overrideEligible: false,
      });

      try {
        orch.governance.registerTemplate({
          templateId: F4_TEMPLATE_ID,
          name: "F4 Change Release Candidate",
          description:
            "Flagship F4 gates for a single SCM change — advisory readiness only",
          policyProfileId: "release_candidate",
          documentationRef: DOC,
          composition: {
            mode: "all",
            gateIds: [
              "gate_f4_automation",
              "gate_f4_ci",
              "gate_f4_a11y_or_regression",
              "gate_f4_security",
              "gate_f4_performance",
              "gate_f4_code_quality",
            ],
          },
          metadata: { flagship: "F3-deepen", slice: "f4_change_rc_matrix" },
        });
      } catch (error) {
        if (!isExistsError(error)) throw error;
      }

      try {
        orch.approvals.registerAuthority({
          authorityId: F4_AUTHORITY,
          name: "Quality Certifier",
          scope: "enterprise",
          delegationSupported: false,
          escalationSupported: false,
          metadata: { flagship: "F4" },
        });
      } catch (error) {
        if (!isExistsError(error)) throw error;
      }

      try {
        orch.approvals.registerAuthority({
          authorityId: F4_CO_AUTHORITY,
          name: "Quality Co-Approver",
          scope: "enterprise",
          delegationSupported: false,
          escalationSupported: false,
          metadata: { flagship: "F4", programme: "SPR-APZQEP-210" },
        });
      } catch (error) {
        if (!isExistsError(error)) throw error;
      }

      try {
        await orch.approvals.registerTemplate({
          templateId: F4_APPROVAL_TEMPLATE,
          name: "F4 Change Certification (dual authority)",
          version: "2.0.0",
          requiredAuthorities: [F4_AUTHORITY, F4_CO_AUTHORITY],
          decisionRule: { type: "all_required" },
          sodRules: [
            { type: "mandatory_authority", authorityId: F4_AUTHORITY },
            { type: "mandatory_authority", authorityId: F4_CO_AUTHORITY },
            { type: "independent_approval" },
          ],
          documentationRef: DOC,
          metadata: { flagship: "F4", programme: "SPR-APZQEP-210" },
        });
      } catch (error) {
        if (!isExistsError(error)) throw error;
      }
    })().catch((error) => {
      seedPromise = undefined;
      throw error;
    });
  }
  await seedPromise;
}

function domainFromEvidenceNote(note: string | undefined, platformRef: string): string {
  const text = `${note ?? ""} ${platformRef}`.toLowerCase();
  if (
    text.includes("domain:security") ||
    text.includes("provider:security") ||
    text.includes("(security)")
  ) {
    return "security";
  }
  if (
    text.includes("domain:performance") ||
    text.includes("provider:k6") ||
    text.includes("(performance)") ||
    text.includes("(k6)")
  ) {
    return "performance";
  }
  if (
    text.includes("domain:code_quality") ||
    text.includes("provider:codequality") ||
    text.includes("(code_quality)") ||
    text.includes("(codequality)")
  ) {
    return "code_quality";
  }
  if (text.includes("vitest") || text.includes("(ci)") || text.includes("domain:ci")) {
    return "ci";
  }
  if (
    text.includes("accessibility") ||
    text.includes("axe") ||
    text.includes("a11y") ||
    text.includes("domain:a11y")
  ) {
    return "accessibility";
  }
  if (
    text.includes("playwright") ||
    text.includes("selenium") ||
    text.includes("cypress") ||
    text.includes("appium") ||
    text.includes("domain:automation")
  ) {
    return "automation";
  }
  return "automation";
}

/** Read-only evidence + regression links for a change (F3/F4/F6 consumers). */
export async function collectEvidenceForChange(
  tenantId: string,
  changeEventId: string,
): Promise<{
  readonly evidenceRefs: EvidenceReference[];
  readonly evidenceLinks: CertificationEvidenceLink[];
  readonly changeExternalKey?: string;
  readonly repositoryId?: string;
}> {
  const scm = getQepScmRuntime();
  const changes = await scm.listChangeEvents({ tenantId, limit: 500 });
  const change = changes.find((c) => c.changeEventId === changeEventId);
  if (!change) {
    throw new Error("certification.change_not_found");
  }

  const links = change.repositoryId
    ? await scm.listTraceabilityLinks(change.repositoryId)
    : [];
  const forChange = links.filter(
    (link) =>
      link.externalRef === change.externalKey ||
      link.note?.includes(changeEventId) === true,
  );

  const evidenceLinks: CertificationEvidenceLink[] = [];
  const evidenceRefs: EvidenceReference[] = [];

  for (const link of forChange) {
    if (link.kind === "evidence" && link.platformRef) {
      const domain = domainFromEvidenceNote(link.note, link.platformRef);
      evidenceLinks.push({
        evidenceId: link.platformRef,
        domain,
        ref: `evidence://${link.platformRef}`,
        note: link.note,
      });
      evidenceRefs.push({
        evidenceId: link.platformRef,
        kind: domain,
        ref: `evidence://${link.platformRef}`,
        relatedGateHints: [domain],
        integrityOk: true,
        metadata: { changeEventId, linkId: link.linkId },
      });
    }
    if (link.kind === "execution_plan" && link.platformRef) {
      evidenceLinks.push({
        evidenceId: link.platformRef,
        domain: "regression",
        ref: `execution_plan://${link.platformRef}`,
        note: link.note,
      });
      evidenceRefs.push({
        evidenceId: link.platformRef,
        kind: "regression",
        ref: `execution_plan://${link.platformRef}`,
        relatedGateHints: ["regression"],
        integrityOk: true,
        metadata: { changeEventId, source: "f2-accepted-regression" },
      });
    }
  }

  return {
    evidenceRefs,
    evidenceLinks,
    changeExternalKey: change.externalKey,
    repositoryId: change.repositoryId,
  };
}

function toGateViews(
  results: readonly GateEvaluationResult[],
): CertificationGateView[] {
  return results.map((gate) => ({
    gateId: gate.gateId,
    name: gate.name,
    status: gate.status,
    reason: gate.reason,
    evidenceRefs: gate.evidenceRefs,
    outstandingWork: gate.outstandingWork,
    category: `${gate.category.family}:${gate.category.label}`,
  }));
}

function gateStatus(
  gates: readonly CertificationGateView[],
  gateId: string,
): string | undefined {
  return gates.find((gate) => gate.gateId === gateId)?.status;
}

function evidenceIdsForDomain(
  links: readonly CertificationEvidenceLink[],
  domain: string,
): string[] {
  return links.filter((link) => link.domain === domain).map((link) => link.evidenceId);
}

function shortChangeLabel(changeEventId: string): string {
  const sha = changeEventId.match(/commit-([a-f0-9]+)/i)?.[1];
  if (sha) return sha.slice(0, 7);
  const pr = changeEventId.match(/pr-(\d+)/i)?.[1];
  if (pr) return `PR-${pr}`;
  return changeEventId.slice(-12);
}

/** Build F5 domain tiles from gates + evidence (provider brands masked). */
export function buildRcDomainTiles(
  evaluation: Pick<
    CertificationEvaluation,
    | "gates"
    | "evidenceLinks"
    | "readiness"
    | "residualRisk"
    | "score"
    | "humanDecision"
    | "impactSummary"
    | "explainability"
  >,
): readonly RcDomainTile[] {
  const autoGate = gateStatus(evaluation.gates, "gate_f4_automation");
  const ciGate = gateStatus(evaluation.gates, "gate_f4_ci");
  const a11yGate = gateStatus(evaluation.gates, "gate_f4_a11y_or_regression");
  const securityGate = gateStatus(evaluation.gates, "gate_f4_security");
  const performanceGate = gateStatus(evaluation.gates, "gate_f4_performance");
  const codeQualityGate = gateStatus(evaluation.gates, "gate_f4_code_quality");
  const automationIds = evidenceIdsForDomain(evaluation.evidenceLinks, "automation");
  const ciIds = evidenceIdsForDomain(evaluation.evidenceLinks, "ci");
  const a11yIds = evidenceIdsForDomain(evaluation.evidenceLinks, "accessibility");
  const securityIds = evidenceIdsForDomain(evaluation.evidenceLinks, "security");
  const performanceIds = evidenceIdsForDomain(evaluation.evidenceLinks, "performance");
  const codeQualityIds = evidenceIdsForDomain(evaluation.evidenceLinks, "code_quality");
  const regressionIds = evidenceIdsForDomain(evaluation.evidenceLinks, "regression");
  const reqCount = evaluation.impactSummary?.requirementCount ?? 0;

  const tileFromGate = (
    gate: string | undefined,
    evidenceIds: string[],
  ): RcDomainStatus => {
    if (gate === "satisfied") return "pass";
    if (gate === "failed") return "fail";
    if (evidenceIds.length > 0) return "pass";
    return "not_present";
  };

  const tiles: RcDomainTile[] = [
    {
      domainId: "requirements",
      label: "Requirements",
      status: reqCount > 0 ? "pass" : "not_present",
      summary:
        reqCount > 0
          ? `${reqCount} requirement link(s) on quality graph`
          : "No requirement refs inferred for this change yet",
      evidenceIds: [],
      explainRefs: reqCount > 0 ? ["impact:requirements"] : [],
    },
    {
      domainId: "automation",
      label: "Automation",
      status: tileFromGate(autoGate, automationIds),
      summary:
        automationIds.length > 0
          ? `${automationIds.length} automation evidence item(s)`
          : "No automation evidence linked",
      evidenceIds: automationIds,
      explainRefs: ["gate_f4_automation"],
    },
    {
      domainId: "security",
      label: "Security",
      status: tileFromGate(securityGate, securityIds),
      summary:
        securityIds.length > 0
          ? `${securityIds.length} security evidence item(s)`
          : "No security evidence linked",
      evidenceIds: securityIds,
      explainRefs: ["gate_f4_security"],
    },
    {
      domainId: "performance",
      label: "Performance",
      status: tileFromGate(performanceGate, performanceIds),
      summary:
        performanceIds.length > 0
          ? `${performanceIds.length} performance evidence item(s)`
          : "No performance evidence linked",
      evidenceIds: performanceIds,
      explainRefs: ["gate_f4_performance"],
    },
    {
      domainId: "accessibility",
      label: "Accessibility",
      status:
        a11yIds.length > 0
          ? "pass"
          : a11yGate === "satisfied" && regressionIds.length > 0
            ? "pass"
            : a11yGate === "failed"
              ? "fail"
              : "not_present",
      summary:
        a11yIds.length > 0
          ? `${a11yIds.length} accessibility evidence item(s)`
          : regressionIds.length > 0 && a11yGate === "satisfied"
            ? "Satisfied via accepted regression pack (no a11y scan yet)"
            : "No accessibility evidence linked",
      evidenceIds: a11yIds.length > 0 ? a11yIds : regressionIds,
      explainRefs: ["gate_f4_a11y_or_regression"],
    },
    {
      domainId: "coverage",
      label: "Coverage",
      status: tileFromGate(ciGate, ciIds),
      summary:
        ciIds.length > 0
          ? `${ciIds.length} CI / unit evidence item(s)`
          : "No CI / unit evidence linked",
      evidenceIds: ciIds,
      explainRefs: ["gate_f4_ci"],
    },
    {
      domainId: "code_quality",
      label: "Code quality",
      status: tileFromGate(codeQualityGate, codeQualityIds),
      summary:
        codeQualityIds.length > 0
          ? `${codeQualityIds.length} code quality evidence item(s)`
          : "No code quality evidence linked",
      evidenceIds: codeQualityIds,
      explainRefs: ["gate_f4_code_quality"],
    },
    {
      domainId: "risk",
      label: "Risk",
      status: "info",
      summary: `Residual risk ${evaluation.residualRisk}${
        evaluation.impactSummary
          ? ` · graph nodes ${evaluation.impactSummary.nodeCount}`
          : ""
      }`,
      evidenceIds: [],
      explainRefs: ["impact:risk"],
    },
    {
      domainId: "certification",
      label: "Certification",
      status:
        evaluation.humanDecision?.outcome === "GO"
          ? "pass"
          : evaluation.humanDecision?.outcome === "NO_GO"
            ? "fail"
            : evaluation.readiness === "READY"
              ? "info"
              : "fail",
      summary: evaluation.humanDecision
        ? `Human ${evaluation.humanDecision.outcome}`
        : `Advisory ${evaluation.readiness} (${evaluation.score}%) — awaiting human`,
      evidenceIds: [],
      explainRefs: evaluation.explainability.map((row) => row.gateId),
    },
  ];
  return tiles;
}

function withRcFace(evaluation: CertificationEvaluation): CertificationEvaluation {
  const domains =
    evaluation.domains?.length > 0
      ? evaluation.domains
      : buildRcDomainTiles(evaluation);
  const title =
    evaluation.title?.trim() ||
    `Release Candidate ${shortChangeLabel(evaluation.changeEventId)}`;
  return { ...evaluation, domains, title };
}

async function persistEvaluation(evaluation: CertificationEvaluation): Promise<void> {
  const orch = await getQepOrchestrationRuntime();
  const store = orch.documentStore;
  if (!store) return;
  await store.upsert({
    artefactKind: ARTEFACT_KIND,
    artefactKey: evaluation.evaluationId,
    tenantId: evaluation.tenantId,
    correlationId: evaluation.changeEventId,
    status: evaluation.humanDecision?.outcome ?? evaluation.readiness,
    payload: { ...evaluation, kind: "f4_certification_evaluation" },
    actorId: evaluation.actorId,
  });
}

async function loadEvaluation(
  evaluationId: string,
): Promise<CertificationEvaluation | undefined> {
  const orch = await getQepOrchestrationRuntime();
  const store = orch.documentStore;
  if (!store) return undefined;
  const doc = await store.get(ARTEFACT_KIND, evaluationId);
  if (!doc?.payload || doc.payload.kind !== "f4_certification_evaluation") {
    return undefined;
  }
  return withRcFace(doc.payload as unknown as CertificationEvaluation);
}

async function listEvaluationsForChange(
  tenantId: string,
  changeEventId: string,
): Promise<CertificationEvaluation[]> {
  const orch = await getQepOrchestrationRuntime();
  const store = orch.documentStore;
  if (!store) return [];
  const docs = await store.listByKind(ARTEFACT_KIND, tenantId);
  return docs
    .filter((doc) => doc.payload?.kind === "f4_certification_evaluation")
    .map((doc) => withRcFace(doc.payload as unknown as CertificationEvaluation))
    .filter((item) => item.changeEventId === changeEventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function evaluateChangeCertification(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly actorId: string;
  readonly applicationId: string;
  readonly environmentId: string;
}): Promise<CertificationEvaluation> {
  await ensureF4Seed();
  if (!input.applicationId.trim()) {
    throw new Error("certification.application_required");
  }
  if (!input.environmentId.trim()) {
    throw new Error("certification.environment_required");
  }
  const application = await getApplicationService().get(
    input.tenantId,
    input.applicationId,
  );
  const environment = await getApplicationService().getEnvironment(
    input.tenantId,
    input.applicationId,
    input.environmentId,
  );
  const orch = await getQepOrchestrationRuntime();
  let collected: Awaited<ReturnType<typeof collectEvidenceForChange>> = {
    evidenceRefs: [],
    evidenceLinks: [],
  };
  let scmIdentity: ScmIdentity = { changeEventId: input.changeEventId };
  try {
    collected = await collectEvidenceForChange(input.tenantId, input.changeEventId);
    const scm = getQepScmRuntime();
    const changes = await scm.listChangeEvents({
      tenantId: input.tenantId,
      limit: 500,
    });
    const change = changes.find((c) => c.changeEventId === input.changeEventId);
    if (change) {
      scmIdentity = {
        changeEventId: change.changeEventId,
        kind: change.kind,
        externalKey: change.externalKey,
        ...(change.sha ? { sha: change.sha } : {}),
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message !== "certification.change_not_found") throw error;
    scmIdentity = { changeEventId: input.changeEventId };
  }

  // F2 impact projection (graph edges) + F5 requirements/risk tiles.
  let impactSummary: RcImpactSummary | undefined;
  try {
    const impact = await buildChangeImpact(
      input.tenantId,
      input.changeEventId,
      input.actorId,
    );
    impactSummary = {
      riskLevel: impact.riskLevel,
      requirementCount: impact.inferredRequirementIds.length,
      suiteMatchCount: impact.matchedSuiteIds.length,
      nodeCount: impact.nodes.length,
    };
  } catch {
    // Impact optional for gate evaluation.
  }

  const evalInput = {
    tenantId: input.tenantId,
    actorId: input.actorId,
    evidenceRefs: collected.evidenceRefs,
  };
  const decision = await orch.governance.evaluateTemplate(F4_TEMPLATE_ID, evalInput);

  // F3 deepen: existing release_candidate template may predate security/perf/CQ gates.
  // Always evaluate the full matrix and merge (handover-ready composition).
  const deepenGateIds = [
    "gate_f4_security",
    "gate_f4_performance",
    "gate_f4_code_quality",
  ] as const;
  const deepenResults = deepenGateIds.map((gateId) =>
    orch.governance.evaluateGate(gateId, evalInput),
  );
  const templateResults = orch.governance.getGateResults(decision.decisionId);
  const byGateId = new Map(
    [...templateResults, ...deepenResults].map((gate) => [gate.gateId, gate]),
  );
  const requiredGateIds = [
    "gate_f4_automation",
    "gate_f4_ci",
    "gate_f4_a11y_or_regression",
    ...deepenGateIds,
  ] as const;
  const gateResults = requiredGateIds
    .map((gateId) => byGateId.get(gateId))
    .filter((gate): gate is NonNullable<typeof gate> => gate !== undefined);
  const failedGates = gateResults.filter((gate) => gate.status === "failed");
  const compositionSatisfied = gateResults.every(
    (gate) => gate.status === "satisfied" || gate.status === "waived",
  );
  const explain = orch.governance.getExplainability(decision.decisionId);
  const deepenExplain = deepenResults.map((gate) => ({
    gateId: gate.gateId,
    reason: gate.reason,
    evidenceEvaluated: gate.evidenceRefs,
  }));
  const satisfiedCount = gateResults.filter(
    (gate) => gate.status === "satisfied" || gate.status === "waived",
  ).length;
  const score =
    gateResults.length <= 0
      ? 0
      : Math.round((satisfiedCount / gateResults.length) * 100);
  const readiness = compositionSatisfied ? "READY" : "BLOCKED";
  const title = `Release Candidate ${shortChangeLabel(input.changeEventId)}`;

  const base: CertificationEvaluation = {
    evaluationId: `cert-${randomUUID()}`,
    changeEventId: input.changeEventId,
    tenantId: input.tenantId,
    createdAt: new Date().toISOString(),
    actorId: input.actorId,
    score,
    readiness,
    title,
    summary:
      readiness === "READY"
        ? `${title}: advisory READY (${score}%) — human certification still required`
        : `${title}: advisory BLOCKED (${score}%) — ${failedGates.length} gate(s) failed; human may still record NO_GO or remediate`,
    advisory: true,
    governanceDecisionId: decision.decisionId,
    residualRisk: decision.residualRisk,
    compositionSatisfied,
    gates: toGateViews(gateResults),
    evidenceLinks: collected.evidenceLinks,
    explainability: [
      ...explain.map((row) => ({
        gateId: row.gateId,
        reason: row.evaluationReason,
        evidenceEvaluated: row.evidenceEvaluated,
      })),
      ...deepenExplain.filter(
        (row) => !explain.some((existing) => existing.gateId === row.gateId),
      ),
    ],
    impactSummary,
    domains: [],
  };

  // Create approval bundle ready for human GO/NO-GO (does not auto-decide).
  const bundle = await orch.approvals.createApprovalBundle({
    templateId: F4_APPROVAL_TEMPLATE,
    tenantId: input.tenantId,
    actorId: input.actorId,
    subject: {
      governanceDecisionRef: decision.decisionId,
      changeOwnerActorId: "system:f4-certification",
      qualityFlowRef: input.changeEventId,
    },
  });

  const withBundle = withRcFace({
    ...base,
    approvalBundleId: bundle.bundleId,
  });

  const decisionContext = {
    applicationId: application.id,
    applicationName: application.name,
    environmentId: environment.id,
    environmentSnapshot: { id: environment.id, name: environment.name },
    changeEventId: input.changeEventId,
    scmIdentity,
  };
  const gateEvaluations = await getAssuranceService().evaluateActiveGates({
    tenantId: input.tenantId,
    applicationId: application.id,
    actorId: input.actorId,
    context: decisionContext,
  });
  const composed = await getAssuranceService().composeReadiness({
    tenantId: input.tenantId,
    applicationId: application.id,
    changeEventId: input.changeEventId,
  });
  const exceptions = await getAssuranceService().listExceptions(
    input.tenantId,
    application.id,
    input.changeEventId,
  );
  const phase6: Phase6CertificationSnapshot = {
    applicationId: application.id,
    environmentId: environment.id,
    environmentSnapshot: { id: environment.id, name: environment.name },
    scmIdentity,
    gateEvaluations: [...gateEvaluations],
    readinessSnapshot: composed.snapshot,
    exceptionsUsed: exceptions.filter((row) => row.status === "authorised"),
    frozen: true,
  };
  const withPhase6 = withRcFace({
    ...withBundle,
    applicationId: application.id,
    environmentId: environment.id,
    phase6,
    summary: `${withBundle.summary} · Current Readiness Posture ${composed.snapshot.posture.replaceAll("_", " ")}`,
  });
  await persistEvaluation(withPhase6);
  return withPhase6;
}

export async function getCertificationEvaluation(
  evaluationId: string,
): Promise<CertificationEvaluation | undefined> {
  return loadEvaluation(evaluationId);
}

export async function getCertificationByChange(
  tenantId: string,
  changeEventId: string,
): Promise<{
  readonly changeEventId: string;
  readonly evaluations: readonly CertificationEvaluation[];
}> {
  return {
    changeEventId,
    evaluations: await listEvaluationsForChange(tenantId, changeEventId),
  };
}

export async function recordHumanCertificationDecision(input: {
  readonly evaluationId: string;
  readonly actorId: string;
  readonly outcome: CertificationOutcome;
  readonly rationale: string;
  /** Defaults to quality_certifier; co-approver uses quality_co_approver. */
  readonly authorityId?: string;
}): Promise<CertificationEvaluation> {
  // Never allow automation/QI actors to flip certification (check before load).
  const actor = input.actorId.trim();
  if (
    !actor ||
    actor.startsWith("system:") ||
    actor.startsWith("qi:") ||
    actor.startsWith("automation:")
  ) {
    throw new Error("certification.human_actor_required");
  }

  await ensureF4Seed();
  const evaluation = await loadEvaluation(input.evaluationId);
  if (!evaluation) {
    throw new Error("certification.evaluation_not_found");
  }
  if (evaluation.humanDecision) {
    throw new Error("certification.decision_already_recorded");
  }
  if (!evaluation.approvalBundleId) {
    throw new Error("certification.approval_bundle_missing");
  }
  const rationale = input.rationale.trim();
  if (rationale.length < 3) {
    throw new Error("certification.rationale_required");
  }

  const outcome = input.outcome;
  if (
    outcome !== "GO" &&
    outcome !== "CONDITIONAL_GO" &&
    outcome !== "NO_GO" &&
    outcome !== "DEFER"
  ) {
    throw new Error("certification.outcome_invalid");
  }
  if (!evaluation.phase6 && outcome !== "GO" && outcome !== "NO_GO") {
    throw new Error("certification.outcome_legacy_go_no_go_only");
  }
  if (evaluation.phase6) {
    const exceptions = await getAssuranceService().listExceptions(
      evaluation.tenantId,
      evaluation.phase6.applicationId,
      evaluation.changeEventId,
    );
    assertCertificationOutcomeAllowed({
      outcome,
      blockingEvaluations: evaluation.phase6.gateEvaluations.filter(
        (row) => row.definitionSnapshot.gateType === "blocking",
      ),
      exceptions: exceptions.filter(
        (row) => row.environmentId === evaluation.phase6?.environmentId,
      ),
    });
  }

  const authorityId = (input.authorityId ?? F4_AUTHORITY).trim();
  if (authorityId !== F4_AUTHORITY && authorityId !== F4_CO_AUTHORITY) {
    throw new Error("certification.authority_invalid");
  }

  const priorVotes = evaluation.authorityVotes ?? [];
  if (priorVotes.some((v) => v.authorityId === authorityId)) {
    throw new Error("certification.authority_already_voted");
  }

  // independent_approval SoD: distinct actors for certifier vs co-approver
  if (priorVotes.some((v) => v.actorId === actor && v.authorityId !== authorityId)) {
    throw new Error("certification.independent_approval_required");
  }

  const orch = await getQepOrchestrationRuntime();
  const bundle = await orch.approvals.submitDecision(evaluation.approvalBundleId, {
    authorityId,
    actorId: actor,
    state: input.outcome === "NO_GO" ? "rejected" : "approved",
    comments: rationale,
    metadata: {
      flagship: "F4",
      programme: "SPR-APZQEP-210",
      changeEventId: evaluation.changeEventId,
      evaluationId: evaluation.evaluationId,
      outcome: input.outcome,
    },
  });

  const decision =
    bundle.authorityDecisions.find((d) => d.authorityId === authorityId) ??
    bundle.authorityDecisions[bundle.authorityDecisions.length - 1];

  const vote: CertificationAuthorityVote = {
    authorityId,
    outcome: input.outcome,
    actorId: actor,
    rationale,
    decidedAt: decision?.timestamp ?? new Date().toISOString(),
    approvalDecisionId: decision?.decisionId ?? "unknown",
  };
  const votes = [...priorVotes, vote];

  // Fail-closed: any NO_GO or DEFER finalises immediately.
  if (input.outcome === "NO_GO" || input.outcome === "DEFER") {
    const updated = withRcFace({
      ...evaluation,
      authorityVotes: votes,
      humanDecision: {
        outcome: input.outcome,
        actorId: actor,
        rationale,
        decidedAt: vote.decidedAt,
        approvalDecisionId: vote.approvalDecisionId,
        approvalBundleId: bundle.bundleId,
      },
    });
    await persistEvaluation(updated);
    return updated;
  }

  const certVote = votes.find((v) => v.authorityId === F4_AUTHORITY);
  const coVote = votes.find((v) => v.authorityId === F4_CO_AUTHORITY);
  const dualOutcome =
    certVote?.outcome &&
    certVote.outcome === coVote?.outcome &&
    (certVote.outcome === "GO" || certVote.outcome === "CONDITIONAL_GO")
      ? certVote.outcome
      : undefined;

  if (!dualOutcome) {
    const updated = withRcFace({
      ...evaluation,
      authorityVotes: votes,
    });
    await persistEvaluation(updated);
    return updated;
  }

  let exceptionsUsed = evaluation.phase6?.exceptionsUsed ?? [];
  if (evaluation.phase6) {
    exceptionsUsed = await getAssuranceService().listExceptions(
      evaluation.tenantId,
      evaluation.phase6.applicationId,
      evaluation.changeEventId,
    );
  }

  const updated = withRcFace({
    ...evaluation,
    authorityVotes: votes,
    ...(evaluation.phase6
      ? {
          phase6: {
            ...evaluation.phase6,
            exceptionsUsed,
            frozen: true as const,
          },
        }
      : {}),
    humanDecision: {
      outcome: dualOutcome,
      actorId: certVote!.actorId,
      coApproverActorId: coVote!.actorId,
      rationale: `Certifier: ${certVote!.rationale} · Co-approver: ${coVote!.rationale}`,
      decidedAt: coVote!.decidedAt,
      approvalDecisionId: coVote!.approvalDecisionId,
      approvalBundleId: bundle.bundleId,
    },
  });
  await persistEvaluation(updated);
  return updated;
}

/** WF-27 — immutable reproduce snapshot of a decided evaluation (read-only). */
export async function reproduceCertificationEvaluation(evaluationId: string): Promise<{
  readonly mode: "reproduce";
  readonly immutable: true;
  readonly lockedAt: string;
  readonly evaluation: CertificationEvaluation;
  readonly reportPackHref: string;
}> {
  const evaluation = await loadEvaluation(evaluationId);
  if (!evaluation) {
    throw new Error("certification.evaluation_not_found");
  }
  if (!evaluation.humanDecision) {
    throw new Error("certification.not_decided");
  }
  return {
    mode: "reproduce",
    immutable: true,
    lockedAt: evaluation.humanDecision.decidedAt,
    evaluation,
    reportPackHref: `/api/v1/qep/report-packs/by-change/${encodeURIComponent(evaluation.changeEventId)}?format=json`,
  };
}

/** Test helper */
export function resetCertificationSeedForTests(): void {
  seedPromise = undefined;
}
