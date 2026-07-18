import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parsePathParam, parseQuery } from "../schemas/common";
import {
  teamListQuerySchema,
  teamMemberGetQuerySchema,
  teamMemberIdParamSchema,
} from "../schemas/team";
import { toListQuery, toPlatformApiPage } from "./paging";

/**
 * Team routes expose TeamService membership operations.
 * `GET /teams` requires `projectId` and lists members for that project.
 */
export async function handleListTeams(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(teamListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const listQuery = toListQuery(query);
  const result = await gateway.teams.listTeam(context.serviceContext, query.projectId, {
    page: listQuery.page,
    sort: listQuery.sort as
      readonly { field: "role" | "joinedAt"; direction: "asc" | "desc" }[] | undefined,
  });

  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

/**
 * `GET /teams/{teamId}` resolves a team member by APZHUB member global ID.
 * Requires `projectId` query parameter (TeamService is project-scoped).
 */
export async function handleGetTeam(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const teamId = parsePathParam(
    teamMemberIdParamSchema,
    params?.teamId ?? "",
    "teamId",
  );
  const query = parseQuery(teamMemberGetQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const member = await gateway.teams.getTeamMember(
    context.serviceContext,
    query.projectId,
    teamId,
  );
  return jsonDataResponse(member, context.tracing);
}
