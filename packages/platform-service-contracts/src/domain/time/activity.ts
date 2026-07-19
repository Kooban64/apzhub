import type { TimeActivityId, TimeProjectId } from "../identifiers";

export type TimeActivityStatus = "active" | "archived";

export interface TimeActivity {
  readonly id: TimeActivityId;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly projectId?: TimeProjectId;
  readonly status: TimeActivityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
