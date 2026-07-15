import type { UserId } from "./identifiers";

export type UserStatus = "active" | "inactive" | "invited";

export interface User {
  readonly id: UserId;
  readonly tenantId: string;
  readonly email: string;
  readonly displayName: string;
  readonly status: UserStatus;
  readonly avatarUrl?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserSummary {
  readonly id: UserId;
  readonly email: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
}

export interface UserProfile {
  readonly id: UserId;
  readonly email: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly locale?: string;
  readonly timezone?: string;
}
