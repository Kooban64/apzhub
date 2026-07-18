import type { PlaneCoreServices } from "@apzhub/integration-plane";
import type {
  AddTeamMemberInput,
  ListQuery,
  MemberListFilter,
  PageResult,
  ServiceRequestContext,
  TeamMember,
  TeamSortField,
  UpdateTeamMemberInput,
  UserId,
} from "@apzhub/platform-service-contracts";
import type { ProjectId, TeamMemberId } from "@apzhub/platform-service-contracts";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { TeamProvider } from "../capability-providers";

const PLANE_INTEGRATION_ID = "plane";
const PLANE_TEAM_PROVIDER_ID = "plane-team";

/** Delegates team membership operations to Plane adapter core member services. */
export function createPlaneTeamProvider(core: PlaneCoreServices): TeamProvider {
  return {
    async listTeam(
      ctx: ServiceRequestContext,
      projectId: ProjectId,
      query?: ListQuery<MemberListFilter, TeamSortField>,
    ): Promise<PageResult<TeamMember>> {
      const { page, sort, filter } = unwrapListQuery(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.members.list(toIntegrationContext(ctx), projectId, filter, page, sort),
      );
    },

    async getTeamMember(
      ctx: ServiceRequestContext,
      projectId: ProjectId,
      memberId: TeamMemberId,
    ): Promise<TeamMember> {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.members.get(toIntegrationContext(ctx), projectId, memberId),
      );
    },

    async addTeamMember(
      ctx: ServiceRequestContext,
      projectId: ProjectId,
      input: AddTeamMemberInput,
    ): Promise<TeamMember> {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.members.add(toIntegrationContext(ctx), projectId, input),
      );
    },

    async updateTeamMember(
      ctx: ServiceRequestContext,
      projectId: ProjectId,
      memberId: TeamMemberId,
      input: UpdateTeamMemberInput,
    ): Promise<TeamMember> {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.members.update(toIntegrationContext(ctx), projectId, memberId, input),
      );
    },

    async removeTeamMember(
      ctx: ServiceRequestContext,
      projectId: ProjectId,
      userId: UserId,
    ): Promise<void> {
      await withProviderErrorMapping(ctx.correlationId, async () => {
        const members = await core.members.list(
          toIntegrationContext(ctx),
          projectId,
          {},
          { page: 1, perPage: 100 },
        );

        const member = members.items.find((entry) => entry.userId === userId);
        if (!member) {
          throw new PlatformServiceError({
            category: "not_found",
            code: "NOT_FOUND",
            message: "Team member not found",
            correlationId: ctx.correlationId,
            retryable: false,
          });
        }

        await core.members.remove(toIntegrationContext(ctx), projectId, member.id);
      });
    },
  };
}

export const PLANE_TEAM_PROVIDER_REGISTRATION = {
  providerId: PLANE_TEAM_PROVIDER_ID,
  integrationId: PLANE_INTEGRATION_ID,
  capability: "team" as const,
  priority: 100,
};
