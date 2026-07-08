import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { createRequestContext } from "../request-context";
import {
  ConflictError,
  LawApiError,
  NotFoundError,
  OptimisticConcurrencyError,
  PermissionError,
  TenantIsolationError,
  ValidationError,
  archivedResponse,
  assertIfMatchVersion,
  buildLawApiRequestDiagnostics,
  compareStrings,
  conflictResponse,
  createdResponse,
  defineResourceAuth,
  encodeListCursor,
  generateETag,
  ifMatchPreconditionResponse,
  lawApiErrorToResponse,
  logLawApiRequest,
  notFoundResponse,
  paginateItems,
  paginatedResponse,
  parseFieldSelection,
  parseFiltering,
  parseIfMatchVersion,
  parseIncludes,
  parsePagination,
  parseSorting,
  preconditionFailedResponse,
  requireRequestFields,
  runValidationPipeline,
  setLawApiLogSink,
  sortItems,
  successResponse,
  translateLawApiError,
  updatedResponse,
  validateIfMatch,
  validationErrorResponse,
  workflowValidationToResponse,
} from "./index";
import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";

function authContext(): LawApiAuthenticatedContext {
  const tracing = createRequestContext("corr-framework");
  return {
    ...tracing,
    authenticated: true,
    user: {
      userId: "user-1",
      email: "counsel@example.com",
      name: "Alex Morgan",
      emailVerified: true,
    },
    tenantId: "t0000001-0000-4000-8000-000000000001",
    tenantSource: "tenant_claim",
    roles: [],
    permissions: ["legal.client.view"],
    permissionChecker: {
      can: () => true,
      roles: [],
      permissions: [],
      adapterKind: "test",
      hasContext: true,
    },
    repositoryMode: "memory",
  };
}

describe("Law API framework — pagination", () => {
  it("parsePagination applies defaults and caps limit", () => {
    const params = new URLSearchParams("limit=999");
    expect(parsePagination(params).limit).toBe(100);
    expect(parsePagination(new URLSearchParams()).limit).toBe(25);
  });

  it("paginateItems produces cursor metadata", () => {
    const items = ["a", "b", "c"];
    const { page, pagination } = paginateItems(items, 1, 0);

    expect(page).toEqual(["a"]);
    expect(pagination.hasMore).toBe(true);
    expect(pagination.nextCursor).toBeTruthy();
    expect(decodeOffset(pagination.nextCursor!)).toBe(1);
  });

  it("encodeListCursor round-trips offset", () => {
    expect(decodeOffset(encodeListCursor(5))).toBe(5);
  });
});

describe("Law API framework — sorting", () => {
  it("parseSorting returns default when absent", () => {
    expect(parseSorting(new URLSearchParams(), { defaultSort: ["title"] })).toEqual([
      "title",
    ]);
  });

  it("sortItems applies descending prefix", () => {
    const items = [{ name: "Beta" }, { name: "Alpha" }];
    const sorted = sortItems(items, ["-name"], {
      name: (left, right) => compareStrings(left.name, right.name),
    });
    expect(sorted.map((item) => item.name)).toEqual(["Beta", "Alpha"]);
  });
});

describe("Law API framework — filtering", () => {
  it("parseFiltering extracts query and enum filters", () => {
    const params = new URLSearchParams(
      "query=harbour&status=active&clientType=organisation",
    );
    const filters = parseFiltering(params, {
      enumParams: ["status", "clientType"],
    });

    expect(filters.query).toBe("harbour");
    expect(filters.enums.status).toBe("active");
    expect(filters.enums.clientType).toBe("organisation");
  });
});

describe("Law API framework — field selection", () => {
  it("parseFieldSelection and parseIncludes parse comma-separated values", () => {
    const params = new URLSearchParams("fields=displayName,status&include=matters");
    expect(parseFieldSelection(params)).toEqual(["displayName", "status"]);
    expect(parseIncludes(params)).toEqual(["matters"]);
  });
});

describe("Law API framework — concurrency", () => {
  it("parseIfMatchVersion handles quoted ETags", () => {
    expect(parseIfMatchVersion('"3"')).toBe(3);
    expect(parseIfMatchVersion('W/"4"')).toBe(4);
  });

  it("validateIfMatch passes when header absent", () => {
    expect(validateIfMatch(undefined, 2)).toBe(true);
  });

  it("assertIfMatchVersion throws OptimisticConcurrencyError on mismatch", () => {
    expect(() => assertIfMatchVersion(1, 2)).toThrow(OptimisticConcurrencyError);
  });

  it("ifMatchPreconditionResponse returns 412 on mismatch", async () => {
    const response = ifMatchPreconditionResponse(authContext(), 1, 2);
    expect(response?.status).toBe(412);
  });

  it("generateETag stringifies version", () => {
    expect(generateETag(7)).toBe("7");
  });
});

describe("Law API framework — responses", () => {
  it("successResponse returns standard envelope", async () => {
    const context = createRequestContext();
    const response = successResponse({ id: "1" }, context);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({ id: "1" });
  });

  it("createdResponse returns 201", async () => {
    const response = createdResponse({ id: "1" }, createRequestContext());
    expect(response.status).toBe(201);
  });

  it("updatedResponse sets ETag header", () => {
    const response = updatedResponse({ id: "1" }, createRequestContext(), { etag: 3 });
    expect(response.headers.get("ETag")).toBe("3");
  });

  it("archivedResponse returns 200 archive payload", async () => {
    const response = archivedResponse(
      { clientId: "c1", status: "archived" },
      createRequestContext(),
    );
    const body = await response.json();
    expect(body.data.status).toBe("archived");
  });

  it("paginatedResponse includes pagination block", async () => {
    const response = paginatedResponse(
      [{ id: "1" }],
      { limit: 1, hasMore: false, nextCursor: null, prevCursor: null },
      createRequestContext(),
    );
    const body = await response.json();
    expect(body.pagination.limit).toBe(1);
  });
});

describe("Law API framework — errors", () => {
  it("maps typed errors to standard envelopes", async () => {
    const context = createRequestContext();
    const cases: Array<[LawApiError, number, string]> = [
      [new ValidationError(), 422, "VALIDATION_FAILED"],
      [new NotFoundError(), 404, "NOT_FOUND"],
      [new ConflictError(), 409, "CONFLICT"],
      [new PermissionError(), 403, "FORBIDDEN"],
      [new TenantIsolationError(), 403, "TENANT_MISMATCH"],
      [new OptimisticConcurrencyError(), 412, "PRECONDITION_FAILED"],
    ];

    for (const [error, status, code] of cases) {
      const response = lawApiErrorToResponse(error, context);
      const body = await response.json();
      expect(response.status).toBe(status);
      expect(body.error.code).toBe(code);
    }
  });

  it("validationErrorResponse maps field errors", async () => {
    const response = validationErrorResponse(createRequestContext(), {
      displayName: "Required",
    });
    const body = await response.json();
    expect(body.error.details[0].field).toBe("displayName");
  });

  it("workflowValidationToResponse returns 422", () => {
    expect(
      workflowValidationToResponse(createRequestContext(), { status: "Invalid" })
        .status,
    ).toBe(422);
  });

  it("translateLawApiError handles unknown errors", async () => {
    const response = translateLawApiError(new Error("boom"), createRequestContext());
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });

  it("notFoundResponse and conflictResponse use helper wrappers", () => {
    expect(notFoundResponse(createRequestContext()).status).toBe(404);
    expect(conflictResponse(createRequestContext()).status).toBe(409);
    expect(preconditionFailedResponse(createRequestContext()).status).toBe(412);
  });
});

describe("Law API framework — validation pipeline", () => {
  it("requireRequestFields rejects missing string fields", async () => {
    const context = createRequestContext();
    const result = requireRequestFields({ displayName: 1 }, ["displayName"], context);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
    }
  });

  it("runValidationPipeline stops at first failure", async () => {
    const context = createRequestContext();
    const result = await runValidationPipeline<Record<string, unknown>>([
      () => requireRequestFields({ name: 1 }, ["name"], context),
      () => ({ ok: true, value: { name: "ok" } }),
    ]);
    expect(result.ok).toBe(false);
  });
});

describe("Law API framework — resource auth", () => {
  it("defineResourceAuth builds permission presets", () => {
    const auth = defineResourceAuth({
      view: "legal.client.view",
      create: "legal.client.create",
      edit: "legal.client.edit",
      delete: "legal.client.delete",
    });

    expect(auth.list.requiredPermission).toBe("legal.client.view");
    expect(auth.create.requiredPermission).toBe("legal.client.create");
    expect(auth.delete.requiredPermission).toBe("legal.client.delete");
  });
});

describe("Law API framework — logging and diagnostics", () => {
  it("logLawApiRequest emits structured entries", () => {
    const entries: unknown[] = [];
    setLawApiLogSink((entry) => entries.push(entry));

    const request = new NextRequest("http://localhost/api/law/v1/clients?limit=1");
    logLawApiRequest(request, authContext());

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ method: "GET", path: "/api/law/v1/clients" });
  });

  it("buildLawApiRequestDiagnostics captures parsed query state", () => {
    const request = new NextRequest(
      "http://localhost/api/law/v1/clients?limit=2&sort=-displayName&query=alpha&status=active",
      { headers: { "if-match": "2" } },
    );
    const diagnostics = buildLawApiRequestDiagnostics(request, authContext(), {
      filterSpec: { enumParams: ["status"] },
      defaultSort: ["displayName"],
    });

    expect(diagnostics.pagination.limit).toBe(2);
    expect(diagnostics.sorting).toEqual(["-displayName"]);
    expect(diagnostics.filtering.query).toBe("alpha");
    expect(diagnostics.ifMatchVersion).toBe(2);
  });
});

function decodeOffset(cursor: string): number {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")).offset as number;
}
