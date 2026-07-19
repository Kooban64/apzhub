import type { TimeCustomerId } from "../identifiers";

export type TimeCustomerStatus = "active" | "archived";

export interface TimeCustomer {
  readonly id: TimeCustomerId;
  readonly tenantId: string;
  readonly name: string;
  readonly number?: string;
  readonly status: TimeCustomerStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
