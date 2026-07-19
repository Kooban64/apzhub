import type { TimeCustomerId, TimeProjectId } from "../identifiers";

export type TimeProjectStatus = "active" | "archived";

/** Time-domain project (engine-backed) — distinct from APZ Projects / Plane Project. */
export interface TimeProject {
  readonly id: TimeProjectId;
  readonly tenantId: string;
  readonly name: string;
  readonly customerId?: TimeCustomerId;
  readonly status: TimeProjectStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
