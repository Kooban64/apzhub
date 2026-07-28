import type { ExecutionHistoryEntry } from "../../domain/test-execution/history";
import type {
  ExecutionMode,
  ExecutionOutcome,
  ExecutionStatus,
} from "../../domain/test-execution/value-objects";

export type ExecutionActionDescriptor = {
  readonly action: string;
  readonly label: string;
  readonly requiresConfirmation: boolean;
  readonly reasonRequired: boolean;
  readonly dangerous?: boolean;
};

export type ExecutionSourceRefDto = {
  readonly capability: string;
  readonly id: string;
  readonly versionLabel?: string;
};

export type ExecutionStepDto = {
  readonly order: number;
  readonly instruction: string;
  readonly expectedResult: string;
  readonly outcome?: string;
  readonly actualResult?: string;
  readonly evidenceIds: readonly string[];
  readonly attemptCount: number;
};

export type ExecutionAssignmentDto = {
  readonly ownerId: string;
  readonly executorId?: string;
  readonly reviewerId?: string;
  readonly agentIdentity?: string;
};

export type ExecutionManifestDto = {
  readonly contentHash: string;
  readonly sealedAt: string;
  readonly sealedBy: string;
  readonly stepCount: number;
};

export type ExecutionReviewDto = {
  readonly reviewerId: string;
  readonly decision: string;
  readonly decidedAt: string;
  readonly reason?: string;
  readonly preReviewDerivedOutcome: string;
  readonly outcomeOverride?: string;
};

export type ExecutionObservationDto = {
  readonly id: string;
  readonly body: string;
  readonly actorId: string;
  readonly recordedAt: string;
  readonly severityHint?: string;
};

export type EvidenceReferenceDto = {
  readonly id: string;
  readonly uri: string;
  readonly integrityHash?: string;
  readonly associatedAt: string;
  readonly associatedBy: string;
  readonly stepOrder?: number;
};

export type TestExecutionDto = {
  readonly id: string;
  readonly executionNumber: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly workspaceId: string;
  readonly status: ExecutionStatus;
  readonly mode: ExecutionMode;
  readonly outcome: ExecutionOutcome | null;
  readonly revision: number;
  readonly planRef?: ExecutionSourceRefDto;
  readonly specRef?: ExecutionSourceRefDto;
  readonly assignment: ExecutionAssignmentDto;
  readonly manifest: ExecutionManifestDto | null;
  readonly steps: readonly ExecutionStepDto[];
  readonly observations: readonly ExecutionObservationDto[];
  readonly evidenceReferences: readonly EvidenceReferenceDto[];
  readonly review: ExecutionReviewDto | null;
  readonly blockReason?: string;
  readonly cancelReason?: string;
  readonly supersedesId?: string;
  readonly supersededById?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly availableActions: readonly ExecutionActionDescriptor[];
};

export type ExecutionHistoryDto = {
  readonly executionId: string;
  readonly entries: readonly ExecutionHistoryEntry[];
};

export type PlanExecutionProgressDto = {
  readonly planId: string;
  readonly total: number;
  readonly byStatus: Readonly<Record<string, number>>;
  readonly accepted: number;
  readonly rejected: number;
  readonly inFlight: number;
};
