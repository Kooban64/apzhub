/**
 * Transport-agnostic request context — APZQEP-ENG-110D / ENG-110E.
 * Reusable by REST / CLI / batch / messaging without modification.
 * Domain never depends on authentication mechanisms.
 */
export type EvidenceRequestContext = {
  readonly tenantId: string;
  readonly userId: string;
  /** Platform-resolved permission keys for PermissionPort evaluation. */
  readonly permissions?: readonly string[];
  readonly correlationId?: string;
  readonly locale?: string;
  readonly timezone?: string;
};
