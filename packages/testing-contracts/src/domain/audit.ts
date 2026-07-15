/** Shared audit fields for APZ TCMS domain entities (011). */

export interface AuditFields {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tenantId: string;
  readonly createdBy?: string;
  readonly updatedBy?: string;
  readonly archivedAt?: string;
}
