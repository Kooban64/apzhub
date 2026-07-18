import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  createProjectBodySchema,
  projectIdParamSchema,
  projectListQuerySchema,
  updateProjectBodySchema,
} from "../schemas/project";
import { toListQuery, toPlatformApiPage } from "./paging";

export async function handleListProjects(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(projectListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const listQuery = toListQuery(query);
  const result = await gateway.projects.listProjects(context.serviceContext, {
    page: listQuery.page,
    sort: listQuery.sort as
      | readonly {
          field: "name" | "createdAt" | "updatedAt" | "identifier" | "status";
          direction: "asc" | "desc";
        }[]
      | undefined,
    filter: {
      workspaceId: query.workspaceId,
      status: query.status,
    },
  });

  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetProject(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const gateway = await getPlatformServiceGateway();
  const project = await gateway.projects.getProject(context.serviceContext, projectId);
  return jsonDataResponse(project, context.tracing);
}

export async function handleCreateProject(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createProjectBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const project = await gateway.projects.createProject(context.serviceContext, body);
  return jsonDataResponse(project, context.tracing, { status: 201 });
}

export async function handleUpdateProject(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const body = await parseJsonBody(
    request,
    updateProjectBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const project = await gateway.projects.updateProject(
    context.serviceContext,
    projectId,
    body,
  );
  return jsonDataResponse(project, context.tracing);
}

/**
 * DELETE maps to archiveProject — soft-retire semantics per platform contract.
 * Hard-delete is not exposed.
 */
export async function handleArchiveProject(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const gateway = await getPlatformServiceGateway();
  const project = await gateway.projects.archiveProject(
    context.serviceContext,
    projectId,
  );
  return jsonDataResponse(project, context.tracing);
}
