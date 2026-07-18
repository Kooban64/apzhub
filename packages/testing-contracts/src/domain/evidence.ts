import type { AuditFields } from "./audit";
import type { WorkItemRef } from "./requirement";
import type {
  AttachmentId,
  DefectLinkId,
  EvidenceId,
  ManualExecutionId,
  TestResultId,
  TestRunId,
  TestStepId,
} from "../identifiers";
import type {
  DefectLinkTarget,
  DefectProviderKind,
  DefectStatus,
  EvidenceLifecycleStatus,
  EvidenceType,
  Priority,
  Severity,
} from "../enums";

export interface EvidenceRelationship {
  readonly kind: string;
  readonly targetId: string;
  readonly label?: string;
}

/** Evidence metadata — blob bytes live in object storage, not SoR tables. */
export interface Evidence extends AuditFields {
  readonly id: EvidenceId;
  readonly type: EvidenceType;
  readonly title: string;
  readonly description?: string;
  readonly storageRef: string;
  readonly contentType?: string;
  readonly contentHash?: string;
  readonly sizeBytes?: number;
  readonly runId?: TestRunId;
  readonly resultId?: TestResultId;
  readonly stepId?: TestStepId;
  readonly url?: string;
  readonly checksum?: string;
  readonly mimeType?: string;
  readonly relationships?: readonly EvidenceRelationship[];
  readonly executionId?: ManualExecutionId;
  readonly lifecycleStatus?: EvidenceLifecycleStatus;
  readonly verificationState?: string;
  readonly approvalState?: string;
  readonly captureTime?: string;
  readonly authorUserId?: string;
}

export interface Attachment extends AuditFields {
  readonly id: AttachmentId;
  readonly fileName: string;
  readonly storageRef: string;
  readonly contentType?: string;
  readonly contentHash?: string;
  readonly sizeBytes?: number;
  readonly parentKind:
    "test_case" | "test_run" | "certification" | "evidence" | "comment" | "other";
  readonly parentId: string;
}

/**
 * Defect link — platform-owned defect relationship metadata.
 * Provider refs are soft references; APZHUB never owns external defect SoR data.
 */
export interface DefectLink extends AuditFields {
  readonly id: DefectLinkId;
  readonly tenantId: string;
  readonly providerKind: DefectProviderKind;
  readonly providerKey?: string;
  readonly status: DefectStatus;
  readonly internalRef?: string;
  readonly externalRef?: string;
  readonly severity?: Severity;
  readonly priority?: Priority;
  readonly ownerUserId?: string;
  readonly resolution?: string;
  readonly verificationState?: string;
  readonly summary?: string;
  readonly url?: string;
  readonly requirementIds?: readonly string[];
  readonly planIds?: readonly string[];
  readonly suiteIds?: readonly string[];
  readonly caseIds?: readonly string[];
  readonly manualExecutionIds?: readonly string[];
  readonly automationExecutionIds?: readonly string[];
  readonly evidenceIds?: readonly string[];
  readonly releaseLabel?: string;
  readonly riskIds?: readonly string[];
  readonly workItemRefs?: readonly WorkItemRef[];
  /** @deprecated Prefer explicit relationship id arrays + providerKind. */
  readonly target?: DefectLinkTarget;
  /** @deprecated Prefer externalRef / internalRef. */
  readonly externalId?: string;
  readonly resultId?: TestResultId;
  readonly runId?: TestRunId;
}
