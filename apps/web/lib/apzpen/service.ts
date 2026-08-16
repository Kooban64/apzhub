/**
 * APZPEN platform service orchestration (SPR-APZPEN-001).
 */

import {
  ApzpenDomainError,
  assertRoeApproved,
  computeSecurityPosture,
  defaultAllowedTechniques,
  defaultRestrictedTechniques,
  deriveAssessmentPosition,
  normalizeSeverity,
  transitionEngagementStatus,
  transitionFindingStatus,
} from "./domain";
import { findingFingerprint, ingestProviderPayload } from "./provider-ingest";
import type { ProviderIngestFormat, ProviderToolId } from "./provider-ingest";
import {
  pickDefaultTarget,
  prepareDispatchJob,
  readArtefactText,
  runPreparedDispatch,
  formatForDispatchTool,
  getDispatchJob,
  type DispatchJob,
  type DispatchTool,
  type ExecFn,
} from "./runner-dispatch";
import { buildReportPack, type ReportPack, type ReportPackKind } from "./reports";
import {
  getEngagement,
  getFinding,
  listEngagements,
  listFindings,
  newId,
  saveEngagement,
  saveFinding,
} from "./store";
import {
  appendCertificationRecord,
  listCertificationRecords,
  listGraphEdges,
  listGraphNodes,
  upsertGraphEdge,
  upsertGraphNode,
} from "./meta-store";
import { buildCertificationRecord } from "./certification-ledger";
import { insertCertificationDocument } from "./postgres-store";
import {
  buildAssetNode,
  buildEngagementNode,
  buildFindingNode,
  linkNodes,
  summariseGraph,
  type SecurityGraphSnapshot,
} from "./security-graph";
import {
  planScheduleTick,
  nextRunAfterTick,
  DEFAULT_SCHEDULE_TOOLS,
} from "./schedule-worker";
import {
  putEvidenceObject,
  parseVaultUri,
  readEvidenceBytes,
  getEvidenceObjectMeta,
  type VaultObjectMeta,
} from "./evidence-vault";
import type {
  AssessmentPosition,
  AssetKind,
  CreateEngagementInput,
  CreateFindingInput,
  Engagement,
  Finding,
  FindingStatus,
  ImportFindingSeed,
  ScopeTarget,
  SecurityPosture,
} from "./types";

export type { ReportPack, ReportPackKind };
export type { CertificationLedgerRecord } from "./certification-ledger";
export type { VaultObjectMeta } from "./evidence-vault";
export type { SecurityGraphSnapshot } from "./security-graph";

export type AssuranceAsset = {
  readonly assetKey: string;
  readonly kind: AssetKind;
  readonly label: string;
  readonly identifier: string;
  readonly environment: string;
  readonly engagementIds: readonly string[];
  readonly engagementTitles: readonly string[];
  readonly openFindingCount: number;
};

export type ImportFindingsResult = {
  readonly created: readonly Finding[];
  readonly skipped: number;
  readonly parsedCount: number;
};

function now(): string {
  return new Date().toISOString();
}

export function createEngagement(input: CreateEngagementInput): Engagement {
  const ts = now();
  const engagement: Engagement = {
    engagementId: newId("eng"),
    tenantId: input.tenantId,
    customerName: input.customerName.trim(),
    applicationName: input.applicationName.trim(),
    title: input.title.trim(),
    status: "draft",
    environment: input.environment.trim() || "staging",
    methodology: input.methodology ?? ["OWASP WSTG", "OWASP ASVS"],
    scope: [],
    roe: {
      roeId: newId("roe"),
      status: "draft",
      allowedTechniques: input.allowedTechniques ?? defaultAllowedTechniques(),
      restrictedTechniques: input.restrictedTechniques ?? defaultRestrictedTechniques(),
    },
    assessmentPosition: "not_started",
    createdAt: ts,
    updatedAt: ts,
    createdBy: input.createdBy,
    scheduleMode: input.scheduleMode ?? "once",
  };
  if (!engagement.customerName || !engagement.applicationName || !engagement.title) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "customerName, applicationName and title are required.",
    );
  }
  return saveEngagement(engagement);
}

export function addScopeTarget(
  tenantId: string,
  engagementId: string,
  target: Omit<ScopeTarget, "targetId">,
): Engagement {
  const eng = requireEngagement(tenantId, engagementId);
  const next: Engagement = {
    ...eng,
    scope: [
      ...eng.scope,
      {
        targetId: newId("tgt"),
        kind: target.kind,
        label: target.label.trim(),
        identifier: target.identifier.trim(),
        environment: target.environment.trim() || eng.environment,
        notes: target.notes?.trim() || undefined,
      },
    ],
    status:
      eng.status === "draft"
        ? transitionEngagementStatus(
            eng.status,
            "scoped",
            eng.roe,
            eng.scope.length + 1,
          )
        : eng.status,
    updatedAt: now(),
  };
  if (
    !next.scope[next.scope.length - 1]?.label ||
    !next.scope[next.scope.length - 1]?.identifier
  ) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "Scope label and identifier are required.",
    );
  }
  const saved = saveEngagement(next);
  rebuildSecurityGraphForEngagement(tenantId, engagementId);
  return saved;
}

export function approveRulesOfEngagement(
  tenantId: string,
  engagementId: string,
  approvedBy: string,
): Engagement {
  const eng = requireEngagement(tenantId, engagementId);
  if (eng.scope.length < 1) {
    throw new ApzpenDomainError(
      "SCOPE_EMPTY",
      "Approve RoE only after at least one scope target exists.",
    );
  }
  const ts = now();
  const next: Engagement = {
    ...eng,
    status: "approved",
    roe: {
      ...eng.roe,
      status: "approved",
      approvedAt: ts,
      approvedBy,
    },
    updatedAt: ts,
  };
  return saveEngagement(next);
}

export function startEngagementTesting(
  tenantId: string,
  engagementId: string,
): Engagement {
  const eng = requireEngagement(tenantId, engagementId);
  const status = transitionEngagementStatus(
    eng.status,
    "in_progress",
    eng.roe,
    eng.scope.length,
  );
  return saveEngagement({
    ...eng,
    status,
    assessmentPosition: "in_progress",
    updatedAt: now(),
  });
}

export function createFinding(input: CreateFindingInput): Finding {
  const eng = requireEngagement(input.tenantId, input.engagementId);
  assertRoeApproved(eng.roe);
  if (eng.status === "draft" || eng.status === "scoped") {
    throw new ApzpenDomainError(
      "ENGAGEMENT_NOT_ACTIVE",
      "Start the engagement before recording findings.",
    );
  }
  const ts = now();
  const finding: Finding = {
    findingId: newId("fnd"),
    engagementId: input.engagementId,
    tenantId: input.tenantId,
    title: input.title.trim(),
    description: input.description.trim(),
    severity: input.severity,
    status: "open",
    cwe: input.cwe,
    cvss: input.cvss,
    owaspCategory: input.owaspCategory,
    assetLabel: input.assetLabel,
    component: input.component,
    location: input.location,
    remediation: input.remediation,
    providerTool: input.providerTool,
    evidence: [],
    createdAt: ts,
    updatedAt: ts,
    createdBy: input.createdBy,
  };
  if (!finding.title) {
    throw new ApzpenDomainError("VALIDATION", "Finding title is required.");
  }
  const saved = saveFinding(finding);
  refreshAssessment(input.tenantId, input.engagementId);
  return saved;
}

export function updateFindingStatus(
  tenantId: string,
  findingId: string,
  nextStatus: FindingStatus,
): Finding {
  const finding = getFinding(tenantId, findingId);
  if (!finding) {
    throw new ApzpenDomainError("NOT_FOUND", "Finding not found.");
  }
  const status = transitionFindingStatus(finding.status, nextStatus);
  const saved = saveFinding({
    ...finding,
    status,
    updatedAt: now(),
    riskAcceptance: status === "risk_accepted" ? finding.riskAcceptance : undefined,
  });
  refreshAssessment(tenantId, finding.engagementId);
  return saved;
}

/**
 * Governed risk acceptance — justification required (P3-07).
 */
export function acceptFindingRisk(
  tenantId: string,
  findingId: string,
  input: { readonly reason: string; readonly acceptedBy: string },
): Finding {
  const reason = input.reason.trim();
  if (reason.length < 8) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "Risk acceptance requires a justification (at least 8 characters).",
    );
  }
  const finding = getFinding(tenantId, findingId);
  if (!finding) {
    throw new ApzpenDomainError("NOT_FOUND", "Finding not found.");
  }
  const status = transitionFindingStatus(finding.status, "risk_accepted");
  const saved = saveFinding({
    ...finding,
    status,
    updatedAt: now(),
    riskAcceptance: {
      reason,
      acceptedBy: input.acceptedBy.trim() || "unknown",
      acceptedAt: now(),
    },
  });
  refreshAssessment(tenantId, finding.engagementId);
  return saved;
}

export function linkFindingRemediationChange(
  tenantId: string,
  findingId: string,
  remediationChangeRef: string,
): Finding {
  const ref = remediationChangeRef.trim();
  if (!ref) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "Remediation change reference is required.",
    );
  }
  const finding = getFinding(tenantId, findingId);
  if (!finding) {
    throw new ApzpenDomainError("NOT_FOUND", "Finding not found.");
  }
  return saveFinding({
    ...finding,
    remediationChangeRef: ref,
    updatedAt: now(),
  });
}

export function requestRetest(
  tenantId: string,
  findingId: string,
  _actor?: string,
): Finding {
  return updateFindingStatus(tenantId, findingId, "retest_requested");
}

export function assignFinding(
  tenantId: string,
  findingId: string,
  assignedTo: string,
): Finding {
  const finding = getFinding(tenantId, findingId);
  if (!finding) {
    throw new ApzpenDomainError("NOT_FOUND", "Finding not found.");
  }
  const saved = saveFinding({
    ...finding,
    assignedTo: assignedTo.trim() || undefined,
    updatedAt: now(),
  });
  return saved;
}

export function updateFindingDetails(
  tenantId: string,
  findingId: string,
  patch: {
    readonly title?: string;
    readonly description?: string;
    readonly remediation?: string;
    readonly location?: string;
    readonly cwe?: string;
    readonly severity?: Finding["severity"];
  },
): Finding {
  const finding = getFinding(tenantId, findingId);
  if (!finding) {
    throw new ApzpenDomainError("NOT_FOUND", "Finding not found.");
  }
  const title = patch.title?.trim();
  const description = patch.description?.trim();
  const saved = saveFinding({
    ...finding,
    title: title || finding.title,
    description: description || finding.description,
    remediation:
      patch.remediation !== undefined
        ? patch.remediation.trim() || undefined
        : finding.remediation,
    location:
      patch.location !== undefined
        ? patch.location.trim() || undefined
        : finding.location,
    cwe: patch.cwe !== undefined ? patch.cwe.trim() || undefined : finding.cwe,
    severity: patch.severity ?? finding.severity,
    updatedAt: now(),
  });
  refreshAssessment(tenantId, finding.engagementId);
  return saved;
}

export function updateRoeDraft(
  tenantId: string,
  engagementId: string,
  patch: {
    readonly allowedTechniques?: readonly string[];
    readonly restrictedTechniques?: readonly string[];
    readonly emergencyContact?: string;
    readonly notes?: string;
    readonly testingWindowStart?: string;
    readonly testingWindowEnd?: string;
    readonly methodology?: readonly string[];
  },
): Engagement {
  const eng = requireEngagement(tenantId, engagementId);
  if (eng.roe.status === "approved") {
    throw new ApzpenDomainError(
      "ROE_LOCKED",
      "Approved Rules of Engagement cannot be edited. Create a new engagement or supersede later.",
    );
  }
  const allowed =
    patch.allowedTechniques?.map((t) => t.trim()).filter(Boolean) ??
    eng.roe.allowedTechniques;
  const restricted =
    patch.restrictedTechniques?.map((t) => t.trim()).filter(Boolean) ??
    eng.roe.restrictedTechniques;
  if (allowed.length === 0) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "At least one allowed technique is required.",
    );
  }
  const windowStart =
    patch.testingWindowStart !== undefined
      ? patch.testingWindowStart.trim() || undefined
      : eng.roe.testingWindowStart;
  const windowEnd =
    patch.testingWindowEnd !== undefined
      ? patch.testingWindowEnd.trim() || undefined
      : eng.roe.testingWindowEnd;
  if (windowStart && windowEnd && windowEnd < windowStart) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "Testing window end must be on or after start.",
    );
  }
  const methodology =
    patch.methodology !== undefined
      ? patch.methodology.map((m) => m.trim()).filter(Boolean)
      : eng.methodology;
  if (patch.methodology !== undefined && methodology.length === 0) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "At least one methodology entry is required.",
    );
  }
  return saveEngagement({
    ...eng,
    methodology,
    roe: {
      ...eng.roe,
      allowedTechniques: allowed,
      restrictedTechniques: restricted,
      testingWindowStart: windowStart,
      testingWindowEnd: windowEnd,
      emergencyContact:
        patch.emergencyContact !== undefined
          ? patch.emergencyContact.trim() || undefined
          : eng.roe.emergencyContact,
      notes:
        patch.notes !== undefined ? patch.notes.trim() || undefined : eng.roe.notes,
    },
    updatedAt: now(),
  });
}

export function addFindingEvidence(
  tenantId: string,
  findingId: string,
  input: {
    readonly kind: string;
    readonly label: string;
    readonly ref: string;
    readonly createdBy: string;
  },
): Finding {
  const finding = getFinding(tenantId, findingId);
  if (!finding) {
    throw new ApzpenDomainError("NOT_FOUND", "Finding not found.");
  }
  const label = input.label.trim();
  const ref = input.ref.trim();
  if (!label || !ref) {
    throw new ApzpenDomainError("VALIDATION", "Evidence label and ref are required.");
  }
  const evidence = {
    evidenceId: newId("evd"),
    kind: input.kind.trim() || "note",
    label,
    ref,
    createdAt: now(),
    createdBy: input.createdBy,
  };
  return saveFinding({
    ...finding,
    evidence: [...finding.evidence, evidence],
    updatedAt: now(),
  });
}

export function importProviderFindings(
  tenantId: string,
  engagementId: string,
  createdBy: string,
  seeds: readonly ImportFindingSeed[],
): ImportFindingsResult {
  const eng = requireEngagement(tenantId, engagementId);
  assertRoeApproved(eng.roe);
  if (eng.status === "draft" || eng.status === "scoped") {
    startEngagementTesting(tenantId, engagementId);
  }
  const existing = listFindings(tenantId, engagementId);
  const seen = new Set(
    existing.map((f) =>
      findingFingerprint({
        title: f.title,
        location: f.location,
        providerTool: f.providerTool,
      }),
    ),
  );
  const created: Finding[] = [];
  let skipped = 0;
  for (const seed of seeds) {
    const fp = findingFingerprint(seed);
    if (seen.has(fp)) {
      skipped += 1;
      continue;
    }
    seen.add(fp);
    created.push(
      createFinding({
        tenantId,
        engagementId,
        title: seed.title,
        description: seed.description,
        severity: normalizeSeverity(String(seed.severity)),
        createdBy,
        providerTool: seed.providerTool,
        location: seed.location,
        remediation: seed.remediation,
        cwe: seed.cwe,
        owaspCategory: seed.owaspCategory,
      }),
    );
  }
  return { created, skipped, parsedCount: seeds.length };
}

export function ingestProviderArtefact(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly createdBy: string;
  readonly format?: ProviderIngestFormat;
  readonly toolId?: ProviderToolId;
  readonly payload?: unknown;
  readonly rawText?: string;
}): ImportFindingsResult & {
  readonly format: ProviderIngestFormat;
  readonly toolId: ProviderToolId;
} {
  const parsed = ingestProviderPayload({
    format: input.format,
    toolId: input.toolId,
    payload: input.payload,
    rawText: input.rawText,
  });
  if (parsed.seeds.length === 0) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "No findings parsed from provider artefact.",
    );
  }
  const result = importProviderFindings(
    input.tenantId,
    input.engagementId,
    input.createdBy,
    parsed.seeds,
  );
  return {
    ...result,
    format: parsed.format,
    toolId: parsed.toolId,
    parsedCount: parsed.parsedCount,
  };
}

export async function dispatchSecurityTool(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly createdBy: string;
  readonly tool: DispatchTool;
  readonly target?: string;
  readonly dryRun?: boolean;
  readonly execFn?: ExecFn;
  readonly timeoutMs?: number;
}): Promise<{
  readonly job: DispatchJob;
  readonly ingest?: ImportFindingsResult & {
    readonly format: ProviderIngestFormat;
    readonly toolId: ProviderToolId;
  };
}> {
  const eng = requireEngagement(input.tenantId, input.engagementId);
  assertRoeApproved(eng.roe);
  if (eng.status === "draft" || eng.status === "scoped") {
    startEngagementTesting(input.tenantId, input.engagementId);
  }
  const live = requireEngagement(input.tenantId, input.engagementId);

  const target =
    input.target?.trim() || pickDefaultTarget(input.tool, live.scope) || "";
  if (!target) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "No dispatch target — add scope or pass target.",
    );
  }

  let prepared;
  try {
    prepared = prepareDispatchJob({
      jobId: newId("job"),
      engagement: live,
      tool: input.tool,
      target,
      dryRun: Boolean(input.dryRun),
    });
  } catch (error) {
    throw new ApzpenDomainError(
      "VALIDATION",
      error instanceof Error ? error.message : "Dispatch preparation failed",
    );
  }

  const job = await runPreparedDispatch({
    job: prepared.job,
    dockerArgs: prepared.dockerArgs,
    artefactAbs: prepared.artefactAbs,
    execFn: input.execFn,
    timeoutMs: input.timeoutMs,
  });

  if (job.dryRun || job.status !== "succeeded") {
    return { job };
  }

  const rawText = job.artefactPath ? readArtefactText(job.artefactPath) : undefined;
  if (!rawText) {
    return { job };
  }

  const format = formatForDispatchTool(input.tool) as ProviderIngestFormat;
  const toolId: ProviderToolId = input.tool;

  let payload: unknown;
  if (format !== "nuclei_jsonl") {
    try {
      payload = JSON.parse(rawText) as unknown;
    } catch {
      payload = undefined;
    }
  }

  try {
    const ingest = ingestProviderArtefact({
      tenantId: input.tenantId,
      engagementId: input.engagementId,
      createdBy: input.createdBy,
      format,
      toolId,
      payload,
      rawText: format === "nuclei_jsonl" ? rawText : undefined,
    });
    return { job, ingest };
  } catch {
    // Successful scan with zero parseable findings is still a valid job
    return { job };
  }
}

/** Re-ingest a previously written dispatch job artefact into findings. */
export function ingestDispatchJobArtefact(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly jobId: string;
  readonly createdBy: string;
}): ImportFindingsResult & {
  readonly format: ProviderIngestFormat;
  readonly toolId: ProviderToolId;
  readonly job: DispatchJob;
} {
  const job = getDispatchJob(input.jobId);
  if (!job) {
    throw new ApzpenDomainError("NOT_FOUND", "Dispatch job not found.");
  }
  if (job.engagementId !== input.engagementId) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "Job does not belong to this engagement.",
    );
  }
  if (job.tenantId !== input.tenantId) {
    throw new ApzpenDomainError("VALIDATION", "Job does not belong to this tenant.");
  }
  if (!job.artefactPath) {
    throw new ApzpenDomainError("VALIDATION", "Job has no artefact path to ingest.");
  }
  const rawText = readArtefactText(job.artefactPath);
  if (!rawText) {
    throw new ApzpenDomainError(
      "VALIDATION",
      `Artefact missing or empty: ${job.artefactPath}`,
    );
  }
  const format = formatForDispatchTool(job.tool) as ProviderIngestFormat;
  const toolId: ProviderToolId = job.tool;
  let payload: unknown;
  if (format !== "nuclei_jsonl") {
    try {
      payload = JSON.parse(rawText) as unknown;
    } catch {
      payload = undefined;
    }
  }
  const ingest = ingestProviderArtefact({
    tenantId: input.tenantId,
    engagementId: input.engagementId,
    createdBy: input.createdBy,
    format,
    toolId,
    payload,
    rawText: format === "nuclei_jsonl" ? rawText : undefined,
  });
  return { ...ingest, format, toolId, job };
}

/**
 * Re-dispatch a failed (or skipped) job with the same tool and target.
 * Creates a new job — does not mutate the prior job record.
 */
export async function redispatchFailedJob(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly jobId: string;
  readonly createdBy: string;
  readonly dryRun?: boolean;
  readonly execFn?: ExecFn;
  readonly timeoutMs?: number;
}): Promise<{
  readonly job: DispatchJob;
  readonly ingest?: ImportFindingsResult & {
    readonly format: ProviderIngestFormat;
    readonly toolId: ProviderToolId;
  };
  readonly priorJobId: string;
}> {
  const prior = getDispatchJob(input.jobId);
  if (!prior) {
    throw new ApzpenDomainError("NOT_FOUND", "Dispatch job not found.");
  }
  if (prior.engagementId !== input.engagementId) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "Job does not belong to this engagement.",
    );
  }
  if (prior.tenantId !== input.tenantId) {
    throw new ApzpenDomainError("VALIDATION", "Job does not belong to this tenant.");
  }
  if (prior.status !== "failed" && prior.status !== "skipped") {
    throw new ApzpenDomainError(
      "VALIDATION",
      `Only failed or skipped jobs can be re-dispatched (status=${prior.status}).`,
    );
  }
  const result = await dispatchSecurityTool({
    tenantId: input.tenantId,
    engagementId: input.engagementId,
    createdBy: input.createdBy,
    tool: prior.tool,
    target: prior.target,
    dryRun: input.dryRun ?? prior.dryRun,
    execFn: input.execFn,
    timeoutMs: input.timeoutMs,
  });
  return { ...result, priorJobId: prior.jobId };
}

export function updateEngagementSchedule(
  tenantId: string,
  engagementId: string,
  scheduleMode: Engagement["scheduleMode"],
  nextRunAt?: string,
): Engagement {
  const eng = requireEngagement(tenantId, engagementId);
  return saveEngagement({
    ...eng,
    scheduleMode,
    nextRunAt,
    updatedAt: now(),
  });
}

/** Move engagement into reporting, then certify when no open critical findings. */
export function certifyEngagement(
  tenantId: string,
  engagementId: string,
  certifiedBy: string = "system",
): Engagement {
  const eng = requireEngagement(tenantId, engagementId);
  assertRoeApproved(eng.roe);
  const findings = listFindings(tenantId, engagementId);
  const openCritical = findings.filter(
    (f) =>
      f.severity === "critical" &&
      f.status !== "closed" &&
      f.status !== "risk_accepted" &&
      f.status !== "false_positive" &&
      f.status !== "retest_passed",
  ).length;
  if (openCritical > 0) {
    throw new ApzpenDomainError(
      "CERTIFY_BLOCKED",
      "Cannot certify while critical findings remain open.",
    );
  }

  let status = eng.status;
  if (status === "in_progress" || status === "approved") {
    status = "reporting";
  }
  status = transitionEngagementStatus(status, "certified", eng.roe, eng.scope.length);
  const saved = saveEngagement({
    ...eng,
    status,
    assessmentPosition: "complete",
    updatedAt: now(),
  });
  const posture = computeSecurityPosture(saved, findings);
  const record = buildCertificationRecord({
    engagement: saved,
    posture,
    findings,
    certifiedBy,
  });
  appendCertificationRecord(record);
  try {
    if (process.env.APZPEN_STORE === "postgres" && process.env.DATABASE_URL) {
      void insertCertificationDocument(record).catch(() => undefined);
    }
  } catch {
    /* postgres optional */
  }
  return saved;
}

export function setAssessmentPosition(
  tenantId: string,
  engagementId: string,
  position: AssessmentPosition,
  actor: string = "system",
): Engagement {
  if (position === "complete") {
    return certifyEngagement(tenantId, engagementId, actor);
  }
  const eng = requireEngagement(tenantId, engagementId);
  return saveEngagement({
    ...eng,
    assessmentPosition: position,
    updatedAt: now(),
  });
}

/** Recompute assessment position from findings (does not certify). */
export function syncAssessmentFromFindings(
  tenantId: string,
  engagementId: string,
): Engagement {
  refreshAssessment(tenantId, engagementId);
  return requireEngagement(tenantId, engagementId);
}

export function suggestAssessmentPosition(
  tenantId: string,
  engagementId: string,
): AssessmentPosition {
  const eng = requireEngagement(tenantId, engagementId);
  const findings = listFindings(tenantId, engagementId);
  return deriveAssessmentPosition(eng, findings);
}

export function getEngagementPosture(
  tenantId: string,
  engagementId: string,
): SecurityPosture {
  const eng = requireEngagement(tenantId, engagementId);
  const findings = listFindings(tenantId, engagementId);
  return computeSecurityPosture(eng, findings);
}

export function listTenantEngagements(tenantId: string): readonly Engagement[] {
  return listEngagements(tenantId);
}

export function listTenantFindings(
  tenantId: string,
  engagementId?: string,
): readonly Finding[] {
  return listFindings(tenantId, engagementId);
}

export function getTenantFinding(
  tenantId: string,
  findingId: string,
): Finding | undefined {
  return getFinding(tenantId, findingId);
}

export function getTenantEngagement(
  tenantId: string,
  engagementId: string,
): Engagement {
  return requireEngagement(tenantId, engagementId);
}

/** Assets derived from engagement scope — Security Graph seed. */
export function listTenantAssets(tenantId: string): readonly AssuranceAsset[] {
  const openByEngagement = new Map<string, number>();
  for (const f of listTenantFindings(tenantId)) {
    if (
      f.status === "closed" ||
      f.status === "false_positive" ||
      f.status === "risk_accepted"
    ) {
      continue;
    }
    openByEngagement.set(
      f.engagementId,
      (openByEngagement.get(f.engagementId) ?? 0) + 1,
    );
  }

  const map = new Map<string, AssuranceAsset>();
  for (const eng of listEngagements(tenantId)) {
    for (const s of eng.scope) {
      const key = `${s.kind}|${s.identifier}`.toLowerCase();
      const existing = map.get(key);
      const openDelta = openByEngagement.get(eng.engagementId) ?? 0;
      if (existing) {
        map.set(key, {
          ...existing,
          engagementIds: [...existing.engagementIds, eng.engagementId],
          engagementTitles: [...existing.engagementTitles, eng.title],
          openFindingCount: existing.openFindingCount + openDelta,
        });
      } else {
        map.set(key, {
          assetKey: key,
          kind: s.kind,
          label: s.label,
          identifier: s.identifier,
          environment: s.environment,
          engagementIds: [eng.engagementId],
          engagementTitles: [eng.title],
          openFindingCount: openDelta,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function generateEngagementReport(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly kind: ReportPackKind;
}): ReportPack {
  const engagement = requireEngagement(input.tenantId, input.engagementId);
  const findings = listFindings(input.tenantId, input.engagementId);
  const posture = computeSecurityPosture(engagement, findings);
  return buildReportPack({
    kind: input.kind,
    engagement,
    findings,
    posture,
  });
}

function requireEngagement(tenantId: string, engagementId: string): Engagement {
  const eng = getEngagement(tenantId, engagementId);
  if (!eng) {
    throw new ApzpenDomainError("NOT_FOUND", "Engagement not found.");
  }
  return eng;
}

function refreshAssessment(tenantId: string, engagementId: string): void {
  const eng = requireEngagement(tenantId, engagementId);
  const findings = listFindings(tenantId, engagementId);
  const assessmentPosition = deriveAssessmentPosition(eng, findings);
  let status = eng.status;
  if (
    findings.some(
      (f) => f.status === "remediating" || f.status === "retest_requested",
    ) &&
    (status === "in_progress" || status === "reporting")
  ) {
    status = "remediating";
  }
  saveEngagement({
    ...eng,
    status,
    assessmentPosition,
    updatedAt: now(),
  });
}

/** Demo seed for empty tenants — idempotent by title. */
export function ensureDemoEngagement(tenantId: string, createdBy: string): Engagement {
  const existing = listEngagements(tenantId).find(
    (e) => e.title === "Demo — Customer Banking Portal Assessment",
  );
  if (existing) return existing;

  let eng = createEngagement({
    tenantId,
    customerName: "Demo Financial",
    applicationName: "Customer Banking Portal",
    title: "Demo — Customer Banking Portal Assessment",
    environment: "staging",
    createdBy,
    scheduleMode: "on_demand",
    methodology: ["OWASP WSTG", "OWASP API Security", "PTES"],
  });
  eng = addScopeTarget(tenantId, eng.engagementId, {
    kind: "web_application",
    label: "Banking Portal",
    identifier: "https://staging.bank.example",
    environment: "staging",
  });
  eng = addScopeTarget(tenantId, eng.engagementId, {
    kind: "api",
    label: "Payments API",
    identifier: "https://api.staging.bank.example/v1",
    environment: "staging",
  });
  eng = addScopeTarget(tenantId, eng.engagementId, {
    kind: "repository",
    label: "banking-portal monorepo",
    identifier: "demo-financial/banking-portal",
    environment: "staging",
  });
  eng = addScopeTarget(tenantId, eng.engagementId, {
    kind: "mobile",
    label: "Banking Android app",
    identifier: "/work/jobs/mobsf/banking.apk",
    environment: "staging",
    notes: "Authorised MobSF static analysis only",
  });
  eng = approveRulesOfEngagement(tenantId, eng.engagementId, createdBy);
  eng = startEngagementTesting(tenantId, eng.engagementId);
  importProviderFindings(tenantId, eng.engagementId, createdBy, [
    {
      title: "Broken object-level authorisation on transfer endpoint",
      description:
        "Authenticated user can access another customer's transfer history by changing accountId.",
      severity: "critical",
      providerTool: "manual",
      owaspCategory: "API1:2023",
      location: "/v1/transfers?accountId=",
      remediation: "Enforce object-level authorisation on every account-scoped route.",
    },
    {
      title: "Missing security headers on login",
      description: "CSP and HSTS not present on authentication responses.",
      severity: "medium",
      providerTool: "zap",
      location: "/auth/login",
      remediation: "Apply platform security headers centrally.",
    },
    {
      title: "Container base image with known CVE",
      description: "api-gateway image includes openssl CVE in transitive layer.",
      severity: "high",
      providerTool: "trivy",
      location: "registry.example/api-gateway:1.4.2",
      remediation: "Rebuild from patched base and regenerate SBOM.",
    },
  ]);
  return getTenantEngagement(tenantId, eng.engagementId);
}

export function listCertificationLedger(
  tenantId: string,
  engagementId?: string,
): ReturnType<typeof listCertificationRecords> {
  return listCertificationRecords(tenantId, engagementId);
}

export function rebuildSecurityGraphForEngagement(
  tenantId: string,
  engagementId: string,
): SecurityGraphSnapshot {
  const eng = requireEngagement(tenantId, engagementId);
  const engNode = buildEngagementNode({
    tenantId,
    engagementId,
    title: eng.title,
  });
  upsertGraphNode(engNode);
  for (const s of eng.scope) {
    const asset = buildAssetNode({
      tenantId,
      kind: s.kind,
      label: s.label,
      identifier: s.identifier,
      engagementId,
    });
    upsertGraphNode(asset);
    upsertGraphEdge(
      linkNodes({
        tenantId,
        fromNodeId: engNode.nodeId,
        toNodeId: asset.nodeId,
        relation: "engagement_has_asset",
      }),
    );
  }
  for (const f of listFindings(tenantId, engagementId)) {
    const fNode = buildFindingNode({
      tenantId,
      findingId: f.findingId,
      title: f.title,
      engagementId,
    });
    upsertGraphNode(fNode);
    upsertGraphEdge(
      linkNodes({
        tenantId,
        fromNodeId: engNode.nodeId,
        toNodeId: fNode.nodeId,
        relation: "engagement_has_finding",
      }),
    );
    if (f.assetLabel) {
      const match = eng.scope.find(
        (s) =>
          s.label === f.assetLabel ||
          s.identifier === f.assetLabel ||
          s.identifier === f.location,
      );
      if (match) {
        const asset = buildAssetNode({
          tenantId,
          kind: match.kind,
          label: match.label,
          identifier: match.identifier,
          engagementId,
        });
        upsertGraphEdge(
          linkNodes({
            tenantId,
            fromNodeId: asset.nodeId,
            toNodeId: fNode.nodeId,
            relation: "asset_has_finding",
          }),
        );
      }
    }
  }
  return getSecurityGraph(tenantId);
}

export function getSecurityGraph(tenantId: string): SecurityGraphSnapshot {
  const nodes = listGraphNodes(tenantId);
  const edges = listGraphEdges(tenantId);
  return { nodes, edges };
}

export function getSecurityGraphSummary(tenantId: string) {
  return summariseGraph(getSecurityGraph(tenantId));
}

export function uploadFindingEvidenceFile(input: {
  readonly tenantId: string;
  readonly findingId: string;
  readonly createdBy: string;
  readonly originalName: string;
  readonly contentType?: string;
  readonly bytes: Buffer | Uint8Array | string;
  readonly label?: string;
}): { readonly finding: Finding; readonly object: VaultObjectMeta } {
  const finding = getFinding(input.tenantId, input.findingId);
  if (!finding) {
    throw new ApzpenDomainError("NOT_FOUND", "Finding not found.");
  }
  const object = putEvidenceObject({
    tenantId: input.tenantId,
    engagementId: finding.engagementId,
    findingId: finding.findingId,
    createdBy: input.createdBy,
    originalName: input.originalName,
    contentType: input.contentType,
    bytes: input.bytes,
  });
  const updated = addFindingEvidence(input.tenantId, input.findingId, {
    kind: "file",
    label: input.label?.trim() || object.originalName,
    ref: object.vaultUri,
    createdBy: input.createdBy,
  });
  return { finding: updated, object };
}

export function downloadVaultEvidence(
  tenantId: string,
  refOrObjectId: string,
): { readonly meta: VaultObjectMeta; readonly bytes: Buffer } {
  const objectId = parseVaultUri(refOrObjectId) ?? refOrObjectId;
  const meta = getEvidenceObjectMeta(tenantId, objectId);
  if (!meta) {
    throw new ApzpenDomainError("NOT_FOUND", "Evidence object not found.");
  }
  const bytes = readEvidenceBytes(tenantId, objectId);
  if (!bytes) {
    throw new ApzpenDomainError("NOT_FOUND", "Evidence bytes missing from vault.");
  }
  return { meta, bytes };
}

export async function runScheduleTick(input: {
  readonly tenantId: string;
  readonly createdBy: string;
  readonly dryRun?: boolean;
  readonly execFn?: ExecFn;
  readonly nowMs?: number;
}): Promise<{
  readonly dueCount: number;
  readonly dispatched: readonly {
    readonly engagementId: string;
    readonly tool: DispatchTool;
    readonly jobId: string;
    readonly status: string;
  }[];
  readonly skipped: readonly {
    readonly engagementId: string;
    readonly reason: string;
  }[];
}> {
  const engagements = listEngagements(input.tenantId);
  const plan = planScheduleTick({
    engagements,
    nowMs: input.nowMs,
    tools: DEFAULT_SCHEDULE_TOOLS,
  });
  const dispatched: {
    engagementId: string;
    tool: DispatchTool;
    jobId: string;
    status: string;
  }[] = [];

  for (const candidate of plan.due) {
    for (const tool of candidate.tools) {
      try {
        const result = await dispatchSecurityTool({
          tenantId: input.tenantId,
          engagementId: candidate.engagement.engagementId,
          createdBy: input.createdBy,
          tool,
          dryRun: input.dryRun ?? true,
          execFn: input.execFn,
          timeoutMs: 60_000,
        });
        dispatched.push({
          engagementId: candidate.engagement.engagementId,
          tool,
          jobId: result.job.jobId,
          status: result.job.status,
        });
      } catch (error) {
        dispatched.push({
          engagementId: candidate.engagement.engagementId,
          tool,
          jobId: "none",
          status: error instanceof Error ? error.message : "dispatch_failed",
        });
      }
    }
    const next = nextRunAfterTick(candidate.engagement);
    updateEngagementSchedule(
      input.tenantId,
      candidate.engagement.engagementId,
      candidate.engagement.scheduleMode,
      next,
    );
  }

  return {
    dueCount: plan.due.length,
    dispatched,
    skipped: plan.skipped,
  };
}
