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
  CLIENT_AUTH,
  LAW_API_CLIENT_CREATE_PERMISSION,
  LAW_API_CLIENT_DELETE_PERMISSION,
  LAW_API_CLIENT_EDIT_PERMISSION,
  LAW_API_CLIENT_VIEW_PERMISSION,
} from "./client-api-permissions";
import {
  mapClientToDetailV1,
  mapClientToSummaryV1,
  type ClientDeleteResponseV1,
} from "./client-dto-mapper";
import {
  createClientFormValuesFromRequest,
  mergeUpdateClientFormValues,
  recordClientMetadataAfterWrite,
  resolveClientMetadata,
  withClientWorkflowService,
} from "./client-api-service";
import {
  paginateClientSummaries,
  parseClientListQuery,
  sortClientsForApi,
} from "./client-query-parser";

async function handleListClientsImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const query = parseClientListQuery(request.nextUrl.searchParams);

  return withClientWorkflowService(context, (service) => {
    const results = service.searchClients(query.criteria);
    const clients = sortClientsForApi(
      (results.client ?? []).map((client) => ({
        ...client,
        createdAt: resolveClientMetadata(client.clientId).createdAt,
      })),
      query.sort,
    );

    const summaries = clients.map((client) =>
      mapClientToSummaryV1(client, resolveClientMetadata(client.clientId)),
    );
    const { page, pagination } = paginateClientSummaries(
      summaries,
      query.limit,
      query.cursorOffset,
    );

    return paginatedResponse(page, pagination, context);
  });
}

async function handleGetClientImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
  clientId: string,
): Promise<NextResponse> {
  return withClientWorkflowService(context, (service) => {
    const opened = service.openClient(clientId);
    if (!opened.client) {
      return notFoundResponse(context, "Client not found.");
    }

    const metadata = resolveClientMetadata(opened.client.clientId);
    return successResponse(mapClientToDetailV1(opened.client, metadata), context, {
      headers: { ETag: String(metadata.version) },
    });
  });
}

async function handleCreateClientImpl(
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
    ["displayName", "clientType", "status"],
    context,
  );
  if (!required.ok) {
    return required.response;
  }

  return withClientWorkflowService(context, (service) => {
    const result = service.createClient(
      createClientFormValuesFromRequest(body as never),
    );
    if (result.validationErrors) {
      return workflowValidationToResponse(context, result.validationErrors);
    }

    if (!result.client) {
      return internalErrorResponse(context, "Client could not be created.");
    }

    recordClientMetadataAfterWrite(result.client, true);

    return createdResponse(
      mapClientToDetailV1(result.client, resolveClientMetadata(result.client.clientId)),
      context,
    );
  });
}

async function handleUpdateClientImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  clientId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveClientMetadata(clientId).version,
  );
  if (precondition) {
    return precondition;
  }

  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  return withClientWorkflowService(context, (service) => {
    const existing = service.openClient(clientId);
    if (!existing.client) {
      return notFoundResponse(context, "Client not found.");
    }

    const result = service.updateClient(
      clientId,
      mergeUpdateClientFormValues(existing.client, bodyResult.value as never),
    );

    if (result.validationErrors) {
      return validationErrorResponse(context, result.validationErrors);
    }

    if (!result.client) {
      return notFoundResponse(context, "Client not found.");
    }

    recordClientMetadataAfterWrite(result.client, false);
    const metadata = resolveClientMetadata(result.client.clientId);

    return updatedResponse(mapClientToDetailV1(result.client, metadata), context, {
      etag: metadata.version,
    });
  });
}

async function handleDeleteClientImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  clientId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveClientMetadata(clientId).version,
  );
  if (precondition) {
    return precondition;
  }

  return withClientWorkflowService(context, (service) => {
    const result = service.deleteClient(clientId);
    if (!result.client) {
      return notFoundResponse(context, "Client not found.");
    }

    recordClientMetadataAfterWrite(result.client, false);

    const payload: ClientDeleteResponseV1 = {
      clientId: result.client.clientId,
      status: "archived",
    };

    return archivedResponse(payload, context);
  });
}

export const handleListClients = createLawApiController(handleListClientsImpl, {
  operation: "listClients",
});

export async function handleGetClient(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  clientId: string,
): Promise<NextResponse> {
  return createLawApiController((req, ctx) => handleGetClientImpl(req, ctx, clientId), {
    operation: "getClient",
  })(request, context);
}

export const handleCreateClient = createLawApiController(handleCreateClientImpl, {
  operation: "createClient",
});

export async function handleUpdateClient(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  clientId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleUpdateClientImpl(req, ctx, clientId),
    { operation: "updateClient" },
  )(request, context);
}

export async function handleDeleteClient(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  clientId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleDeleteClientImpl(req, ctx, clientId),
    { operation: "deleteClient" },
  )(request, context);
}

const clientAuthPresets = defineResourceAuth(CLIENT_AUTH);

export const CLIENT_COLLECTION_AUTH = clientAuthPresets.collection;
export const CLIENT_LIST_AUTH = clientAuthPresets.list;
export const CLIENT_READ_AUTH = clientAuthPresets.read;
export const CLIENT_CREATE_AUTH = clientAuthPresets.create;
export const CLIENT_UPDATE_AUTH = clientAuthPresets.update;
export const CLIENT_DELETE_AUTH = clientAuthPresets.delete;

export {
  LAW_API_CLIENT_CREATE_PERMISSION,
  LAW_API_CLIENT_DELETE_PERMISSION,
  LAW_API_CLIENT_EDIT_PERMISSION,
  LAW_API_CLIENT_VIEW_PERMISSION,
};
