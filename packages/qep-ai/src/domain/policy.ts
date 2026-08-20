import { DESTINATION_PERMISSION, acceptActionFor } from "./guards";
import type {
  AiProposalRecord,
  ComposedAiContext,
  ContextFingerprint,
  DeterministicAnalysis,
  DeterministicGap,
  ProposalType,
} from "./types";

export function hasPermission(granted: readonly string[], required: string): boolean {
  if (granted.includes("*") || granted.includes(required)) return true;
  const parts = required.split(".");
  for (let i = parts.length - 1; i >= 1; i -= 1) {
    if (granted.includes(`${parts.slice(0, i).join(".")}.*`)) return true;
  }
  return false;
}

export function hasSourceRead(granted: readonly string[]): boolean {
  return hasPermission(granted, "source.read");
}

export function assertSourceExclusive(
  granted: readonly string[],
  includeSource: boolean,
): void {
  if (!includeSource) return;
  if (!hasSourceRead(granted)) throw new Error("ai.source.not_authorised");
}

export function assertDestinationAuthz(
  granted: readonly string[],
  proposalType: ProposalType,
): string {
  if (acceptActionFor(proposalType) === "forbidden") {
    throw new Error("ai.accept.forbidden_type");
  }
  const required = DESTINATION_PERMISSION[proposalType];
  if (!required || !hasPermission(granted, required)) {
    throw new Error("ai.accept.destination_forbidden");
  }
  return required;
}

export function validateProposalContent(
  proposalType: ProposalType,
  content: Record<string, unknown>,
): Record<string, unknown> {
  const title = String(content.title ?? "").trim();
  if (!title) throw new Error("ai.proposal.title_required");
  if (proposalType === "quality_risk") {
    const severity = String(content.severity ?? "medium");
    if (!["low", "medium", "high", "critical"].includes(severity)) {
      throw new Error("ai.proposal.invalid_severity");
    }
  }
  return { ...content, title };
}

export function fingerprintsMatch(
  expected: readonly ContextFingerprint[],
  actual: ContextFingerprint | undefined,
): boolean {
  if (expected.length === 0) return true;
  if (!actual) return false;
  return expected.some(
    (row) =>
      row.targetId === actual.targetId &&
      (row.updatedAt === undefined || row.updatedAt === actual.updatedAt) &&
      (row.contentVersionId === undefined ||
        row.contentVersionId === actual.contentVersionId),
  );
}

export function composeDeterministicAnalysis(input: {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly acWithoutVerification: number;
  readonly neverExecuted: number;
  readonly failedWithoutEvidence: number;
  readonly missingTrace: number;
  readonly openDefects: number;
  readonly failedGates: number;
  readonly openRisks: number;
  readonly now?: string;
}): DeterministicAnalysis {
  const gaps: DeterministicGap[] = [
    {
      kind: "ac_without_verification",
      count: input.acWithoutVerification,
      summary: `${input.acWithoutVerification} acceptance criteria have no Test Case verification`,
    },
    {
      kind: "never_executed",
      count: input.neverExecuted,
      summary: `${input.neverExecuted} test cases have never been executed`,
    },
    {
      kind: "failed_without_evidence",
      count: input.failedWithoutEvidence,
      summary: `${input.failedWithoutEvidence} failed executions have no Evidence`,
    },
    {
      kind: "missing_trace",
      count: input.missingTrace,
      summary: `${input.missingTrace} mandatory trace relationships are missing`,
    },
    {
      kind: "open_defects",
      count: input.openDefects,
      summary: `${input.openDefects} open defects`,
    },
    {
      kind: "failed_gates",
      count: input.failedGates,
      summary: `${input.failedGates} failed quality gates`,
    },
    {
      kind: "open_risks",
      count: input.openRisks,
      summary: `${input.openRisks} open quality risks`,
    },
  ];
  return {
    tenantId: input.tenantId,
    applicationId: input.applicationId,
    gaps,
    computedAt: input.now ?? new Date().toISOString(),
    source: "qep_facts",
  };
}

export function redactContextForModel(
  context: ComposedAiContext,
): Record<string, unknown> {
  return {
    tenantId: context.tenantId,
    applicationId: context.applicationId,
    environmentId: context.environmentId,
    sourceAccess: context.sourceAccess,
    sourceAuthorised: context.sourceAuthorised,
    evidenceMode: context.evidenceMode,
    records: context.records,
    evidence: context.evidence.map((row) => ({
      id: row.id,
      title: row.title,
      sourceKind: row.sourceKind,
      status: row.status,
      ...(row.extract ? { extract: row.extract } : {}),
    })),
    ...(context.source && context.sourceAuthorised ? { source: context.source } : {}),
    denied: context.denied,
  };
}

export function assertContextSafeForModel(
  context: ComposedAiContext,
  granted: readonly string[],
): void {
  if (context.sourceAuthorised && !hasSourceRead(granted)) {
    throw new Error("ai.source.leak");
  }
  if (context.source && !context.sourceAuthorised) {
    throw new Error("ai.source.leak");
  }
}

export function proposalAuditRefs(row: AiProposalRecord): Record<string, unknown> {
  return {
    proposalId: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    proposalType: row.proposalType,
    status: row.status,
    sourceAuthorised: row.sourceAuthorised,
    resultingRecordId: row.resultingRecordId,
    provider: row.provider,
    model: row.model,
  };
}
