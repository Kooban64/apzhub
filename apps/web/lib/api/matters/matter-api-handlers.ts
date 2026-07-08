import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import {
  archivedResponse,
  createLawApiController,
  createdResponse,
  defineResourceAuth,
  ifMatchPreconditionResponse,
  internalErrorResponse,
  notFoundResponse,
  paginatedResponse,
  parseIfMatchVersion,
  requireRequestFields,
  successResponse,
  updatedResponse,
  validationErrorResponse,
  workflowValidationToResponse,
} from "../framework";
import { parseJsonBody } from "../validation";
import {
  LAW_API_MATTER_ARCHIVE_PERMISSION,
  LAW_API_MATTER_CREATE_PERMISSION,
  LAW_API_MATTER_EDIT_PERMISSION,
  LAW_API_MATTER_VIEW_PERMISSION,
  MATTER_AUTH,
} from "./matter-api-permissions";
import {
  mapMatterToDetailV1,
  mapMatterToSummaryV1,
  type MatterDeleteResponseV1,
} from "./matter-dto-mapper";
import {
  createMatterFormValuesFromRequest,
  mergeUpdateMatterFormValues,
  recordMatterMetadataAfterWrite,
  resolveMatterMetadata,
  withMatterWorkflowService,
} from "./matter-api-service";
import {
  paginateMatterSummaries,
  parseMatterListQuery,
  sortMattersForApi,
} from "./matter-query-parser";

async function handleListMattersImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const query = parseMatterListQuery(request.nextUrl.searchParams);

  return withMatterWorkflowService(context, (service) => {
    const results = service.searchMatters(query.criteria);
    const matters = sortMattersForApi(
      (results.matter ?? []).map((matter) => ({
        ...matter,
        createdAt: resolveMatterMetadata(matter.matterId).createdAt,
      })),
      query.sort,
    );

    const summaries = matters.map((matter) =>
      mapMatterToSummaryV1(matter, resolveMatterMetadata(matter.matterId)),
    );
    const { page, pagination } = paginateMatterSummaries(
      summaries,
      query.limit,
      query.cursorOffset,
    );

    return paginatedResponse(page, pagination, context);
  });
}

async function handleGetMatterImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
  matterId: string,
): Promise<NextResponse> {
  return withMatterWorkflowService(context, (service) => {
    const opened = service.openMatter(matterId);
    if (!opened.matter) {
      return notFoundResponse(context, "Matter not found.");
    }

    const metadata = resolveMatterMetadata(opened.matter.matterId);
    return successResponse(mapMatterToDetailV1(opened.matter, metadata), context, {
      headers: { ETag: String(metadata.version) },
    });
  });
}

async function handleCreateMatterImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as Record<string, unknown>;
  const required = requireRequestFields(
    body,
    ["title", "clientId", "matterTypeId", "practiceAreaId", "leadAttorneyId"],
    context,
  );
  if (!required.ok) {
    return required.response;
  }

  return withMatterWorkflowService(context, (service) => {
    const result = service.createMatter(
      createMatterFormValuesFromRequest(body as never),
    );
    if (result.validationErrors) {
      return workflowValidationToResponse(context, result.validationErrors);
    }

    if (!result.matter) {
      return internalErrorResponse(context, "Matter could not be created.");
    }

    recordMatterMetadataAfterWrite(result.matter, true);

    return createdResponse(
      mapMatterToDetailV1(result.matter, resolveMatterMetadata(result.matter.matterId)),
      context,
    );
  });
}

async function handleUpdateMatterImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  matterId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveMatterMetadata(matterId).version,
  );
  if (precondition) {
    return precondition;
  }

  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  return withMatterWorkflowService(context, (service) => {
    const existing = service.openMatter(matterId);
    if (!existing.matter) {
      return notFoundResponse(context, "Matter not found.");
    }

    const result = service.updateMatter(
      matterId,
      mergeUpdateMatterFormValues(existing.matter, bodyResult.value as never),
    );

    if (result.validationErrors) {
      return validationErrorResponse(context, result.validationErrors);
    }

    if (!result.matter) {
      return notFoundResponse(context, "Matter not found.");
    }

    recordMatterMetadataAfterWrite(result.matter, false);
    const metadata = resolveMatterMetadata(result.matter.matterId);

    return updatedResponse(mapMatterToDetailV1(result.matter, metadata), context, {
      etag: metadata.version,
    });
  });
}

async function handleDeleteMatterImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  matterId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveMatterMetadata(matterId).version,
  );
  if (precondition) {
    return precondition;
  }

  return withMatterWorkflowService(context, (service) => {
    const result = service.archiveMatter(matterId);
    if (!result.matter) {
      return notFoundResponse(context, "Matter not found.");
    }

    recordMatterMetadataAfterWrite(result.matter, false);

    const payload: MatterDeleteResponseV1 = {
      matterId: result.matter.matterId,
      status: "archived",
    };

    return archivedResponse(payload, context);
  });
}

export const handleListMatters = createLawApiController(handleListMattersImpl, {
  operation: "listMatters",
});

export async function handleGetMatter(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  matterId: string,
): Promise<NextResponse> {
  return createLawApiController((req, ctx) => handleGetMatterImpl(req, ctx, matterId), {
    operation: "getMatter",
  })(request, context);
}

export const handleCreateMatter = createLawApiController(handleCreateMatterImpl, {
  operation: "createMatter",
});

export async function handleUpdateMatter(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  matterId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleUpdateMatterImpl(req, ctx, matterId),
    { operation: "updateMatter" },
  )(request, context);
}

export async function handleDeleteMatter(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  matterId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleDeleteMatterImpl(req, ctx, matterId),
    { operation: "deleteMatter" },
  )(request, context);
}

const matterAuthPresets = defineResourceAuth(MATTER_AUTH);

export const MATTER_COLLECTION_AUTH = matterAuthPresets.collection;
export const MATTER_LIST_AUTH = matterAuthPresets.list;
export const MATTER_READ_AUTH = matterAuthPresets.read;
export const MATTER_CREATE_AUTH = matterAuthPresets.create;
export const MATTER_UPDATE_AUTH = matterAuthPresets.update;
export const MATTER_DELETE_AUTH = matterAuthPresets.delete;

export {
  LAW_API_MATTER_ARCHIVE_PERMISSION,
  LAW_API_MATTER_CREATE_PERMISSION,
  LAW_API_MATTER_EDIT_PERMISSION,
  LAW_API_MATTER_VIEW_PERMISSION,
};
