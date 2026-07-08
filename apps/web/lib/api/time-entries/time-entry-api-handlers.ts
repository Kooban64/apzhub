import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import type { ManagedTimeEntry } from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import {
  archivedResponse,
  createLawApiController,
  createdResponse,
  defineResourceAuth,
  ifMatchPreconditionResponse,
  internalErrorResponse,
  malformedRequestResponse,
  notFoundResponse,
  paginatedResponse,
  parseIfMatchVersion,
  successResponse,
  updatedResponse,
  validationErrorResponse,
  workflowValidationToResponse,
} from "../framework";
import { parseJsonBody } from "../validation";
import {
  LAW_API_TIME_ENTRY_CREATE_PERMISSION,
  LAW_API_TIME_ENTRY_DELETE_PERMISSION,
  LAW_API_TIME_ENTRY_EDIT_PERMISSION,
  LAW_API_TIME_ENTRY_VIEW_PERMISSION,
  TIME_ENTRY_AUTH,
} from "./time-entry-api-permissions";
import {
  mapTimeEntryToDetailV1,
  mapTimeEntryToSummaryV1,
  type TimeEntryDeleteResponseV1,
} from "./time-entry-dto-mapper";
import {
  createTimeEntryFormValuesFromRequest,
  mergeUpdateTimeEntryFormValues,
  recordTimeEntryMetadataAfterWrite,
  resolveTimeEntryMetadata,
  withTimeEntryWorkflowService,
} from "./time-entry-api-service";
import {
  paginateTimeEntrySummaries,
  parseTimeEntryListQuery,
  sortTimeEntriesForApi,
} from "./time-entry-query-parser";

function toTimeEntryList(results: {
  timeEntry?: unknown;
}): readonly ManagedTimeEntry[] {
  const raw = results.timeEntry;
  if (Array.isArray(raw)) {
    return raw;
  }
  return raw ? [raw as ManagedTimeEntry] : [];
}

async function handleListTimeEntriesImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const query = parseTimeEntryListQuery(request.nextUrl.searchParams);

  return withTimeEntryWorkflowService(context, (service) => {
    const results = service.searchTimeEntries(query.criteria);
    const entries = sortTimeEntriesForApi(
      toTimeEntryList(results).map((entry) => ({
        ...entry,
        createdAt: resolveTimeEntryMetadata(entry.timeEntryId).createdAt,
      })),
      query.sort,
    );

    const summaries = entries.map((entry) =>
      mapTimeEntryToSummaryV1(entry, resolveTimeEntryMetadata(entry.timeEntryId)),
    );
    const { page, pagination } = paginateTimeEntrySummaries(
      summaries,
      query.limit,
      query.cursorOffset,
    );

    return paginatedResponse(page, pagination, context);
  });
}

async function handleGetTimeEntryImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
  timeEntryId: string,
): Promise<NextResponse> {
  return withTimeEntryWorkflowService(context, (service) => {
    const opened = service.openTimeEntry(timeEntryId);
    if (!opened.timeEntry || Array.isArray(opened.timeEntry)) {
      return notFoundResponse(context, "Time entry not found.");
    }

    const metadata = resolveTimeEntryMetadata(opened.timeEntry.timeEntryId);
    return successResponse(
      mapTimeEntryToDetailV1(opened.timeEntry, metadata),
      context,
      {
        headers: { ETag: String(metadata.version) },
      },
    );
  });
}

async function handleCreateTimeEntryImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as Record<string, unknown>;
  const missing: string[] = [];
  if (typeof body.matterId !== "string" || !body.matterId.trim()) {
    missing.push("matterId");
  }
  if (typeof body.entryDate !== "string" || !body.entryDate.trim()) {
    missing.push("entryDate");
  }
  if (typeof body.durationMinutes !== "number" || body.durationMinutes < 1) {
    missing.push("durationMinutes");
  }
  if (typeof body.narrative !== "string") {
    missing.push("narrative");
  }
  if (typeof body.billable !== "boolean") {
    missing.push("billable");
  }
  if (missing.length > 0) {
    return malformedRequestResponse(
      context,
      `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required.`,
    );
  }

  return withTimeEntryWorkflowService(context, (service) => {
    const result = service.createTimeEntry(
      createTimeEntryFormValuesFromRequest(body as never, context.user?.userId),
    );
    if (result.validationErrors) {
      return workflowValidationToResponse(context, result.validationErrors);
    }

    if (!result.timeEntry || Array.isArray(result.timeEntry)) {
      return internalErrorResponse(context, "Time entry could not be created.");
    }

    recordTimeEntryMetadataAfterWrite(result.timeEntry, true);

    return createdResponse(
      mapTimeEntryToDetailV1(
        result.timeEntry,
        resolveTimeEntryMetadata(result.timeEntry.timeEntryId),
      ),
      context,
    );
  });
}

async function handleUpdateTimeEntryImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  timeEntryId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveTimeEntryMetadata(timeEntryId).version,
  );
  if (precondition) {
    return precondition;
  }

  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  return withTimeEntryWorkflowService(context, (service) => {
    const existing = service.openTimeEntry(timeEntryId);
    if (!existing.timeEntry || Array.isArray(existing.timeEntry)) {
      return notFoundResponse(context, "Time entry not found.");
    }

    const result = service.updateTimeEntry(
      timeEntryId,
      mergeUpdateTimeEntryFormValues(existing.timeEntry, bodyResult.value as never),
    );

    if (result.validationErrors) {
      return validationErrorResponse(context, result.validationErrors);
    }

    if (!result.timeEntry || Array.isArray(result.timeEntry)) {
      return notFoundResponse(context, "Time entry not found.");
    }

    recordTimeEntryMetadataAfterWrite(result.timeEntry, false);
    const metadata = resolveTimeEntryMetadata(result.timeEntry.timeEntryId);

    return updatedResponse(
      mapTimeEntryToDetailV1(result.timeEntry, metadata),
      context,
      {
        etag: metadata.version,
      },
    );
  });
}

async function handleDeleteTimeEntryImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  timeEntryId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveTimeEntryMetadata(timeEntryId).version,
  );
  if (precondition) {
    return precondition;
  }

  return withTimeEntryWorkflowService(context, (service) => {
    const result = service.deleteTimeEntry(timeEntryId);
    if (!result.timeEntry || Array.isArray(result.timeEntry)) {
      return notFoundResponse(context, "Time entry not found.");
    }

    recordTimeEntryMetadataAfterWrite(result.timeEntry, false);

    const payload: TimeEntryDeleteResponseV1 = {
      timeEntryId: result.timeEntry.timeEntryId,
      status: "deleted",
    };

    return archivedResponse(payload, context);
  });
}

export const handleListTimeEntries = createLawApiController(handleListTimeEntriesImpl, {
  operation: "listTimeEntries",
});

export async function handleGetTimeEntry(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  timeEntryId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleGetTimeEntryImpl(req, ctx, timeEntryId),
    { operation: "getTimeEntry" },
  )(request, context);
}

export const handleCreateTimeEntry = createLawApiController(handleCreateTimeEntryImpl, {
  operation: "createTimeEntry",
});

export async function handleUpdateTimeEntry(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  timeEntryId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleUpdateTimeEntryImpl(req, ctx, timeEntryId),
    { operation: "updateTimeEntry" },
  )(request, context);
}

export async function handleDeleteTimeEntry(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  timeEntryId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleDeleteTimeEntryImpl(req, ctx, timeEntryId),
    { operation: "deleteTimeEntry" },
  )(request, context);
}

const timeEntryAuthPresets = defineResourceAuth(TIME_ENTRY_AUTH);

export const TIME_ENTRY_COLLECTION_AUTH = timeEntryAuthPresets.collection;
export const TIME_ENTRY_LIST_AUTH = timeEntryAuthPresets.list;
export const TIME_ENTRY_READ_AUTH = timeEntryAuthPresets.read;
export const TIME_ENTRY_CREATE_AUTH = timeEntryAuthPresets.create;
export const TIME_ENTRY_UPDATE_AUTH = timeEntryAuthPresets.update;
export const TIME_ENTRY_DELETE_AUTH = timeEntryAuthPresets.delete;

export {
  LAW_API_TIME_ENTRY_CREATE_PERMISSION,
  LAW_API_TIME_ENTRY_DELETE_PERMISSION,
  LAW_API_TIME_ENTRY_EDIT_PERMISSION,
  LAW_API_TIME_ENTRY_VIEW_PERMISSION,
};
