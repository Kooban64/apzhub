export const PROPOSAL_TYPES = [
  "user_story",
  "acceptance_criterion",
  "test_case",
  "suite",
  "test_plan",
  "exploratory_charter",
  "ui_ux_criteria",
  "trace_link",
  "quality_risk",
  "issue",
  "defect",
  "gate_evaluation",
  "certification",
] as const;

export type ProposalType = (typeof PROPOSAL_TYPES)[number];

export const PROPOSAL_STATUSES = [
  "pending",
  "modified",
  "accepted",
  "rejected",
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const ACCEPT_ACTIONS = ["accept", "analyse_only", "forbidden"] as const;
export type AcceptAction = (typeof ACCEPT_ACTIONS)[number];

export type ContextFingerprint = {
  readonly targetId?: string;
  readonly updatedAt?: string;
  readonly contentVersionId?: string;
};

export type AiProposalRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly environmentId?: string;
  readonly proposalType: ProposalType;
  readonly status: ProposalStatus;
  readonly targetId?: string;
  readonly originalContent: Record<string, unknown>;
  readonly reviewedContent: Record<string, unknown>;
  readonly contextRefs: readonly string[];
  readonly fingerprints: readonly ContextFingerprint[];
  readonly sourceAuthorised: boolean;
  readonly evidenceExtractUsed: boolean;
  readonly provider: string;
  readonly model: string;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly reviewedAt?: string;
  readonly reviewedBy?: string;
  readonly decisionNote?: string;
  readonly resultingRecordId?: string;
  readonly resultingRecordKind?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DeterministicGap = {
  readonly kind: string;
  readonly count: number;
  readonly summary: string;
};

export type DeterministicAnalysis = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly gaps: readonly DeterministicGap[];
  readonly computedAt: string;
  readonly source: "qep_facts";
};

export type ComposedAiContext = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly environmentId?: string;
  readonly sourceAccess: "authorised" | "not_authorised";
  readonly sourceAuthorised: boolean;
  readonly evidenceMode: "metadata" | "bounded_extract";
  readonly records: readonly {
    readonly kind: string;
    readonly id: string;
    readonly title: string;
    readonly updatedAt?: string;
  }[];
  readonly evidence: readonly {
    readonly id: string;
    readonly title: string;
    readonly sourceKind: string;
    readonly status: string;
    readonly extract?: string;
  }[];
  readonly source?: {
    readonly repositoryId: string;
    readonly path: string;
    readonly revision?: string;
  };
  readonly denied: readonly string[];
};

export type DestinationWriteResult = {
  readonly recordId: string;
  readonly recordKind: string;
};

export type DestinationWriter = {
  write(input: {
    readonly tenantId: string;
    readonly applicationId: string;
    readonly actorId: string;
    readonly proposalType: ProposalType;
    readonly content: Record<string, unknown>;
  }): Promise<DestinationWriteResult>;
};

export type TargetReader = {
  fingerprint(input: {
    readonly tenantId: string;
    readonly proposalType: ProposalType;
    readonly targetId: string;
  }): Promise<ContextFingerprint | undefined>;
};
