/**
 * APZ Projects Enterprise Delivery Team Directory — W006 / P2.
 * Projects-owned SoR for reusable delivery teams (not Identity Groups).
 */

export const ENTERPRISE_TEAM_STATUSES = ["active", "inactive"] as const;
export type EnterpriseTeamStatus = (typeof ENTERPRISE_TEAM_STATUSES)[number];

export const TEAM_MEMBERSHIP_ROLES = ["lead", "member", "contributor"] as const;
export type TeamMembershipRole = (typeof TEAM_MEMBERSHIP_ROLES)[number];

export type EnterpriseDeliveryTeam = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly leadUserId: string;
  readonly status: EnterpriseTeamStatus;
  readonly skillTags: readonly string[];
  readonly orgUnitLabel?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type EnterpriseTeamMembership = {
  readonly id: string;
  readonly teamId: string;
  readonly userId: string;
  readonly roleInTeam: TeamMembershipRole;
  readonly from: string;
  readonly to?: string;
  readonly allocationPercent?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateEnterpriseDeliveryTeamInput = {
  readonly name: string;
  readonly leadUserId: string;
  readonly description?: string;
  readonly status?: EnterpriseTeamStatus;
  readonly skillTags?: readonly string[];
  readonly orgUnitLabel?: string;
};

export type UpdateEnterpriseDeliveryTeamInput = {
  readonly name?: string;
  readonly leadUserId?: string;
  readonly description?: string | null;
  readonly status?: EnterpriseTeamStatus;
  readonly skillTags?: readonly string[];
  readonly orgUnitLabel?: string | null;
};

export type CreateEnterpriseTeamMembershipInput = {
  readonly userId: string;
  readonly roleInTeam?: TeamMembershipRole;
  readonly from?: string;
  readonly to?: string;
  readonly allocationPercent?: number;
};
