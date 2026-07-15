import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { TeamMember } from "../domain";
import type { AddTeamMemberInput, UpdateTeamMemberInput } from "../inputs";
import type { MemberListFilter, TeamListFilter, TeamSortField } from "../queries";
import type { ProjectId, TeamMemberId, UserId } from "../domain/identifiers";

/** Vendor-neutral team membership operations. */
export interface TeamService {
  listTeam(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<TeamListFilter | MemberListFilter, TeamSortField>,
  ): Promise<PageResult<TeamMember>>;

  getTeamMember(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    memberId: TeamMemberId,
  ): Promise<TeamMember>;

  addTeamMember(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: AddTeamMemberInput,
  ): Promise<TeamMember>;

  updateTeamMember(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    memberId: TeamMemberId,
    input: UpdateTeamMemberInput,
  ): Promise<TeamMember>;

  removeTeamMember(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    userId: UserId,
  ): Promise<void>;
}
