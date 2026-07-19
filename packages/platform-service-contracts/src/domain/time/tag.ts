import type { TimeTagId } from "../identifiers";

export type TimeTagStatus = "active" | "archived";

export interface TimeTag {
  readonly id: TimeTagId;
  readonly tenantId: string;
  readonly name: string;
  readonly color?: string;
  readonly status: TimeTagStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
