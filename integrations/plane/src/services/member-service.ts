import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { PlaneMemberRecord, PlanePaginatedResponse } from "../internal/plane-api-types";
import {
  extractPlaneUserId,
  mapMemberToPlaneBody,
  mapPlaneMember,
  resolveProjectPlaneId,
} from "../mappers/member-mapper";
import type { TeamMember } from "../models/canonical";
import type { AddMemberInput, UpdateMemberInput } from "../models/inputs";
import type { MemberListFilter, PageRequest, PageResult, SortField } from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import { validatePlaneMemberResponse, validatePlanePaginatedResponse } from "../validation/response-validation";
import { applyClientFilters, applyClientSort, buildPlaneListQuery, mapPaginatedResult } from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

const MEMBER_SORT_FIELDS = ["role", "joinedAt"] as const;

export class PlaneMemberService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    projectId: string,
    filter: MemberListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<(typeof MEMBER_SORT_FIELDS)[number]>[] = [],
  ): Promise<PageResult<TeamMember>> {
    assertValid(
      mergeValidation(validatePageRequest(page), validateSortFields(sort, MEMBER_SORT_FIELDS)),
      "members.list",
    );

    return this.deps.runner.run(context, "members.list", async () => {
      const response = (await this.deps.client.listMembers(
        context,
        resolveProjectPlaneId(projectId),
        buildPlaneListQuery(page, sort),
      )) as PlanePaginatedResponse<PlaneMemberRecord>;

      assertValid(validatePlanePaginatedResponse(response), "members.list.response");

      let result = mapPaginatedResult(
        response,
        (item) => {
          assertValid(validatePlaneMemberResponse(item), "member.entity");
          return mapPlaneMember(item, projectId);
        },
        page,
      );

      if (filter.role) {
        result = {
          ...result,
          items: applyClientFilters(result.items, (item) => item.role === filter.role),
        };
      }

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(result.items, sort, (item, field) => {
            if (field === "joinedAt") return item.joinedAt;
            return item.role;
          }),
        };
      }

      return result;
    });
  }

  async get(context: IntegrationRequestContext, projectId: string, memberId: string): Promise<TeamMember> {
    return this.deps.runner.run(context, "members.get", async () => {
      const record = await this.deps.client.getMember(
        context,
        resolveProjectPlaneId(projectId),
        memberId.replace(/^member_plane_/, ""),
      );
      assertValid(validatePlaneMemberResponse(record), "member.entity");
      return mapPlaneMember(record, projectId);
    });
  }

  async add(
    context: IntegrationRequestContext,
    projectId: string,
    input: AddMemberInput,
  ): Promise<TeamMember> {
    assertValid(validateRequiredString(input.userId, "userId"), "members.add");

    return this.deps.runner.run(context, "members.add", async () => {
      const record = await this.deps.client.addMember(
        context,
        resolveProjectPlaneId(projectId),
        mapMemberToPlaneBody({ userId: extractPlaneUserId(input.userId), role: input.role }),
      );
      assertValid(validatePlaneMemberResponse(record), "member.entity");
      return mapPlaneMember(record, projectId);
    });
  }

  async update(
    context: IntegrationRequestContext,
    projectId: string,
    memberId: string,
    input: UpdateMemberInput,
  ): Promise<TeamMember> {
    return this.deps.runner.run(context, "members.update", async () => {
      const record = await this.deps.client.updateMember(
        context,
        resolveProjectPlaneId(projectId),
        memberId.replace(/^member_plane_/, ""),
        mapMemberToPlaneBody(input),
      );
      assertValid(validatePlaneMemberResponse(record), "member.entity");
      return mapPlaneMember(record, projectId);
    });
  }

  async remove(context: IntegrationRequestContext, projectId: string, memberId: string): Promise<void> {
    await this.deps.runner.run(context, "members.remove", async () => {
      await this.deps.client.removeMember(
        context,
        resolveProjectPlaneId(projectId),
        memberId.replace(/^member_plane_/, ""),
      );
    });
  }
}
