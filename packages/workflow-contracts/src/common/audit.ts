/** Shared audit timestamp fields (APZWORKFLOW-001). */

export type AuditFields = {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy?: string;
  readonly updatedBy?: string;
};
