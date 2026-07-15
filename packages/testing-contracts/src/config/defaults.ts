/** Configuration types for APZ TCMS — no config engine. */

import type { ApprovalStageConfig } from "../domain/certification";

export interface ApzTcmsRetentionConfig {
  readonly auditEventDays: number;
  readonly evidenceMetadataDays: number;
  readonly executionResultDays: number;
  readonly dashboardSnapshotDays: number;
}

export interface ApzTcmsEvidenceConfig {
  readonly maxEvidencePerRun: number;
  readonly allowedEvidenceTypes: readonly string[];
  readonly requireHash: boolean;
}

export interface ApzTcmsAttachmentConfig {
  readonly maxAttachmentsPerParent: number;
  readonly maxSizeBytes: number;
  readonly allowedContentTypes: readonly string[];
}

export interface ApzTcmsStorageConfig {
  readonly evidenceBucketRef: string;
  readonly attachmentBucketRef: string;
  readonly storageProvider: "s3_compatible" | "local_stub";
}

export interface ApzTcmsCertificationConfig {
  readonly requireSignatureForCertified: boolean;
  readonly allowConditionalApproval: boolean;
  readonly requireWitness: boolean;
  readonly defaultGateKeys: readonly string[];
}

export interface ApzTcmsAiConfig {
  readonly suggestionsEnabled: boolean;
  readonly autoAcceptForbidden: true;
  readonly maxPendingSuggestionsPerUser: number;
}

export interface ApzTcmsAutomationConfig {
  readonly ingestionEnabled: boolean;
  readonly maxConcurrentJobs: number;
  readonly allowedAdapterSourceIds: readonly string[];
}

export interface ApzTcmsLimitsConfig {
  readonly maxStepsPerCase: number;
  readonly maxCasesPerSuite: number;
  readonly maxSuitesPerPlan: number;
  readonly maxResultsPerRun: number;
}

export interface ApzTcmsExecutionConfig {
  /** Optional multi-stage approval configuration for manual executions. */
  readonly approvalStages?: readonly ApprovalStageConfig[];
}

export interface ApzTcmsConfiguration {
  readonly retention: ApzTcmsRetentionConfig;
  readonly evidence: ApzTcmsEvidenceConfig;
  readonly attachments: ApzTcmsAttachmentConfig;
  readonly storage: ApzTcmsStorageConfig;
  readonly certification: ApzTcmsCertificationConfig;
  readonly ai: ApzTcmsAiConfig;
  readonly automation: ApzTcmsAutomationConfig;
  readonly limits: ApzTcmsLimitsConfig;
  readonly execution?: ApzTcmsExecutionConfig;
}

export const DEFAULT_APZ_TCMS_CONFIGURATION: ApzTcmsConfiguration = {
  retention: {
    auditEventDays: 365,
    evidenceMetadataDays: 730,
    executionResultDays: 365,
    dashboardSnapshotDays: 90,
  },
  evidence: {
    maxEvidencePerRun: 50,
    allowedEvidenceTypes: [
      "screenshot",
      "log",
      "video",
      "trace",
      "report",
      "note",
      "other",
    ],
    requireHash: true,
  },
  attachments: {
    maxAttachmentsPerParent: 25,
    maxSizeBytes: 50 * 1024 * 1024,
    allowedContentTypes: [
      "image/png",
      "image/jpeg",
      "application/pdf",
      "text/plain",
      "application/json",
    ],
  },
  storage: {
    evidenceBucketRef: "apz-tcms-evidence",
    attachmentBucketRef: "apz-tcms-attachments",
    storageProvider: "s3_compatible",
  },
  certification: {
    requireSignatureForCertified: true,
    allowConditionalApproval: true,
    requireWitness: false,
    defaultGateKeys: [
      "execution_complete",
      "coverage_threshold",
      "evidence_complete",
      "manual_testing_complete",
      "automation_complete",
      "approvals_complete",
      "no_critical_defects",
      "risk_accepted",
    ],
  },
  ai: {
    suggestionsEnabled: false,
    autoAcceptForbidden: true,
    maxPendingSuggestionsPerUser: 20,
  },
  automation: {
    ingestionEnabled: false,
    maxConcurrentJobs: 5,
    allowedAdapterSourceIds: [],
  },
  limits: {
    maxStepsPerCase: 100,
    maxCasesPerSuite: 500,
    maxSuitesPerPlan: 100,
    maxResultsPerRun: 10_000,
  },
  execution: {
    approvalStages: undefined,
  },
};

export function createDefaultApzTcmsConfiguration(
  overrides?: DeepPartial<ApzTcmsConfiguration>,
): ApzTcmsConfiguration {
  if (!overrides) {
    return structuredClone(DEFAULT_APZ_TCMS_CONFIGURATION);
  }

  return {
    retention: { ...DEFAULT_APZ_TCMS_CONFIGURATION.retention, ...overrides.retention },
    evidence: {
      ...DEFAULT_APZ_TCMS_CONFIGURATION.evidence,
      ...overrides.evidence,
      allowedEvidenceTypes:
        overrides.evidence?.allowedEvidenceTypes ??
        DEFAULT_APZ_TCMS_CONFIGURATION.evidence.allowedEvidenceTypes,
    },
    attachments: {
      ...DEFAULT_APZ_TCMS_CONFIGURATION.attachments,
      ...overrides.attachments,
      allowedContentTypes:
        overrides.attachments?.allowedContentTypes ??
        DEFAULT_APZ_TCMS_CONFIGURATION.attachments.allowedContentTypes,
    },
    storage: { ...DEFAULT_APZ_TCMS_CONFIGURATION.storage, ...overrides.storage },
    certification: {
      ...DEFAULT_APZ_TCMS_CONFIGURATION.certification,
      ...overrides.certification,
      defaultGateKeys:
        overrides.certification?.defaultGateKeys ??
        DEFAULT_APZ_TCMS_CONFIGURATION.certification.defaultGateKeys,
    },
    ai: {
      ...DEFAULT_APZ_TCMS_CONFIGURATION.ai,
      ...overrides.ai,
      autoAcceptForbidden: true,
    },
    automation: {
      ...DEFAULT_APZ_TCMS_CONFIGURATION.automation,
      ...overrides.automation,
      allowedAdapterSourceIds:
        overrides.automation?.allowedAdapterSourceIds ??
        DEFAULT_APZ_TCMS_CONFIGURATION.automation.allowedAdapterSourceIds,
    },
    limits: { ...DEFAULT_APZ_TCMS_CONFIGURATION.limits, ...overrides.limits },
    execution: {
      ...DEFAULT_APZ_TCMS_CONFIGURATION.execution,
      ...overrides.execution,
      approvalStages:
        overrides.execution?.approvalStages ??
        DEFAULT_APZ_TCMS_CONFIGURATION.execution?.approvalStages,
    },
  };
}

type DeepPartial<T> = {
  readonly [K in keyof T]?: T[K] extends readonly (infer U)[]
    ? readonly U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};
