/**
 * Enterprise Context composition HTTP handler (APZHUB-CONTEXT-001 / CONTEXT-002).
 * Projection only — never mutates product Systems of Record.
 */

import type { NextRequest } from "next/server";

import {
  CONTEXT_FOCUS_TYPES,
  type ContextFocusType,
} from "@apzhub/platform-service-contracts";
import {
  composeEnterpriseContextFromGateway,
  createOrganisationalMemoryService,
  getMemoryOrganisationalMemoryStore,
  setOrganisationalMemoryStoreForTests,
  type EnterpriseContextGatewaySlice,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function trySlice<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

function organisationalMemoryService() {
  try {
    return createOrganisationalMemoryService();
  } catch {
    setOrganisationalMemoryStoreForTests(getMemoryOrganisationalMemoryStore());
    return createOrganisationalMemoryService(getMemoryOrganisationalMemoryStore());
  }
}

function isFocusType(value: string): value is ContextFocusType {
  return (CONTEXT_FOCUS_TYPES as readonly string[]).includes(value);
}

async function buildEnterpriseContextGatewaySlice(): Promise<EnterpriseContextGatewaySlice> {
  const gateway = await getPlatformServiceGateway();
  const slice: EnterpriseContextGatewaySlice = {};

  const projects = trySlice(() => gateway.projects);
  if (projects?.getProject) {
    Object.assign(slice, {
      projects: {
        getProject: (
          ctx: Parameters<typeof projects.getProject>[0],
          projectId: Parameters<typeof projects.getProject>[1],
        ) => projects.getProject(ctx, projectId),
        listProjects: projects.listProjects
          ? (
              ctx: Parameters<typeof projects.listProjects>[0],
              query?: { readonly page?: { readonly perPage?: number } },
            ) =>
              projects.listProjects(ctx, {
                page: { perPage: query?.page?.perPage ?? 50 },
              })
          : undefined,
      },
    });
  }

  const support = trySlice(() => gateway.support);
  if (support?.listSupportRequests) {
    Object.assign(slice, {
      support: {
        listSupportRequests: (
          ctx: Parameters<typeof support.listSupportRequests>[0],
          query: Parameters<typeof support.listSupportRequests>[1],
        ) => support.listSupportRequests(ctx, query),
      },
    });
  }

  const workflow = trySlice(() => gateway.workflow);
  if (workflow?.tasks?.listInbox) {
    Object.assign(slice, {
      workflow: {
        tasks: {
          listInbox: (
            ctx: Parameters<typeof workflow.tasks.listInbox>[0],
            input: Parameters<typeof workflow.tasks.listInbox>[1],
          ) => workflow.tasks.listInbox(ctx, input),
        },
      },
    });
  }

  const documentSearchMetadata = trySlice(() => gateway.documentSearchMetadata);
  if (documentSearchMetadata?.find) {
    Object.assign(slice, {
      documentSearchMetadata: {
        find: (
          ctx: Parameters<typeof documentSearchMetadata.find>[0],
          input: Parameters<typeof documentSearchMetadata.find>[1],
        ) => documentSearchMetadata.find(ctx, input),
      },
    });
  }

  Object.assign(slice, {
    organisationalMemory: {
      list: (
        ctx: Parameters<ReturnType<typeof organisationalMemoryService>["list"]>[0],
      ) => organisationalMemoryService().list(ctx),
    },
  });

  return slice;
}

export async function handleGetEnterpriseContext(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const url = new URL(request.url);
  const focusTypeRaw = url.searchParams.get("focusType") ?? "project";
  const focusId = url.searchParams.get("focusId")?.trim();

  if (!isFocusType(focusTypeRaw)) {
    return jsonErrorResponse(
      400,
      {
        code: "VALIDATION_ERROR",
        message: "focusType must be one of: project, workflow, support, knowledge.",
      },
      context.tracing,
    );
  }

  if (!focusId) {
    return jsonErrorResponse(
      400,
      {
        code: "VALIDATION_ERROR",
        message: "focusId is required.",
      },
      context.tracing,
    );
  }

  const slice = await buildEnterpriseContextGatewaySlice();
  try {
    const composition = await composeEnterpriseContextFromGateway(
      context.serviceContext,
      slice,
      {
        focusType: focusTypeRaw,
        focusId,
        projectName: url.searchParams.get("projectName") ?? undefined,
        projectIdentifier: url.searchParams.get("projectIdentifier") ?? undefined,
        focusName:
          url.searchParams.get("focusName") ??
          url.searchParams.get("projectName") ??
          undefined,
        focusIdentifier:
          url.searchParams.get("focusIdentifier") ??
          url.searchParams.get("projectIdentifier") ??
          undefined,
      },
    );
    return jsonDataResponse(composition, context.tracing);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "enterprise_context_compose_failed";
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message },
      context.tracing,
    );
  }
}
