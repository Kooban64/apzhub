/** Reconciliation boundary contracts (APZDOCS-002) — no workers/schedulers. */

export type DocumentReconciliationIssueKind =
  | "orphaned_storage_object"
  | "metadata_without_object"
  | "checksum_mismatch"
  | "failed_deletion"
  | "incomplete_version_commit";

export type DocumentReconciliationIssue = {
  readonly id: string;
  readonly kind: DocumentReconciliationIssueKind;
  readonly tenantId: string;
  readonly documentId?: string;
  readonly versionId?: string;
  readonly storageKeyHint?: string;
  readonly details: Readonly<Record<string, string>>;
  readonly detectedAt: string;
};

export type DocumentReconciliationInspectionResult = {
  readonly issues: readonly DocumentReconciliationIssue[];
  readonly inspectedAt: string;
};

export type DocumentReconciliationRepairResult = {
  readonly issueId: string;
  readonly repaired: boolean;
  readonly message: string;
};
