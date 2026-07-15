import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parsePathParam, parseQuery } from "../schemas/common";
import {
  workspaceIdParamSchema,
  workspaceListQuerySchema,
} from "../schemas/workspace";
import { toListQuery, toPlatformApiPage } from "./paging";

export async function handleListWorkspaces(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(workspaceListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const listQuery = toListQuery(query);
  const result = await gateway.workspaces.listWorkspaces(context.serviceContext, {
    page: listQuery.page,
    sort: listQuery.sort as
      | readonly { field: "name" | "slug" | "createdAt" | "updatedAt"; direction: "asc" | "desc" }[]
      | undefined,
  });

  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetWorkspace(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const workspaceId = parsePathParam(
    workspaceIdParamSchema,
    params?.workspaceId ?? "",
    "workspaceId",
  );
  const gateway = await getPlatformServiceGateway();
  const workspace = await gateway.workspaces.getWorkspace(
    context.serviceContext,
    workspaceId,
  );
  return jsonDataResponse(workspace, context.tracing);
}
