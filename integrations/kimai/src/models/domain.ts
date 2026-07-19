/** Adapter-canonical Time domain models — Kimai-backed, not platform contracts. */

export type KimaiDomainEntityStatus = "active" | "archived";
export type KimaiDomainTimesheetStatus = "running" | "stopped" | "archived";

export interface KimaiDomainTimesheet {
  readonly id: string;
  readonly engineId: number;
  readonly userId: string;
  readonly description?: string;
  readonly status: KimaiDomainTimesheetStatus;
  readonly durationMinutes: number;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly activityId?: string;
  readonly customerId?: string;
  readonly projectId?: string;
  readonly tagIds: readonly string[];
  readonly billable: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface KimaiDomainActivity {
  readonly id: string;
  readonly engineId: number;
  readonly name: string;
  readonly description?: string;
  readonly projectId?: string;
  readonly status: KimaiDomainEntityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface KimaiDomainCustomer {
  readonly id: string;
  readonly engineId: number;
  readonly name: string;
  readonly number?: string;
  readonly status: KimaiDomainEntityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface KimaiDomainProject {
  readonly id: string;
  readonly engineId: number;
  readonly name: string;
  readonly customerId?: string;
  readonly status: KimaiDomainEntityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface KimaiDomainTag {
  readonly id: string;
  readonly engineId: number;
  readonly name: string;
  readonly color?: string;
  readonly status: KimaiDomainEntityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface KimaiDomainPageResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly page: number;
  readonly perPage: number;
  readonly hasNextPage: boolean;
}

export interface KimaiDomainListQuery {
  readonly page?: number;
  readonly perPage?: number;
  readonly search?: string;
}
