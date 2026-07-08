import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET as getHealth } from "../../app/api/law/v1/health/route";
import {
  LAW_API_CORRELATION_ID_HEADER,
  LAW_API_REQUEST_ID_HEADER,
  buildLawApiHealthData,
  createRequestContext,
  jsonErrorResponse,
  jsonSuccessResponse,
  methodNotAllowedResponse,
  parseJsonBody,
  resolveRequestContext,
  sanitizeCorrelationId,
  validateHttpMethod,
  validateJsonContentType,
} from "./index";

describe("Law API request context", () => {
  it("generates a requestId per request", () => {
    const request = new NextRequest("http://localhost/api/law/v1/health");
    const context = resolveRequestContext(request);

    expect(context.requestId).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i,
    );
    expect(context.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("propagates a valid x-correlation-id header", () => {
    const request = new NextRequest("http://localhost/api/law/v1/health", {
      headers: {
        [LAW_API_CORRELATION_ID_HEADER]: "partner-corr-123",
      },
    });
    const context = resolveRequestContext(request);

    expect(context.correlationId).toBe("partner-corr-123");
  });

  it("rejects unsafe correlation IDs and falls back to requestId", () => {
    expect(sanitizeCorrelationId("bad id with spaces")).toBeUndefined();

    const request = new NextRequest("http://localhost/api/law/v1/health", {
      headers: {
        [LAW_API_CORRELATION_ID_HEADER]: "bad id with spaces",
      },
    });
    const context = resolveRequestContext(request);

    expect(context.correlationId).toBe(context.requestId);
  });
});

describe("Law API response envelopes", () => {
  it("returns the standard success envelope", async () => {
    const context = createRequestContext("corr-success");
    const response = jsonSuccessResponse({ status: "healthy" }, context);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      data: { status: "healthy" },
      meta: {
        requestId: context.requestId,
        correlationId: "corr-success",
        timestamp: context.timestamp,
      },
    });
    expect(response.headers.get(LAW_API_REQUEST_ID_HEADER)).toBe(context.requestId);
    expect(response.headers.get(LAW_API_CORRELATION_ID_HEADER)).toBe("corr-success");
  });

  it("returns the standard error envelope", async () => {
    const context = createRequestContext();
    const response = jsonErrorResponse(
      400,
      {
        code: "MALFORMED_REQUEST",
        message: "Invalid request",
        details: { field: "body" },
      },
      context,
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("MALFORMED_REQUEST");
    expect(body.meta.requestId).toBe(context.requestId);
  });
});

describe("Law API validation helpers", () => {
  it("rejects unsupported HTTP methods", async () => {
    const request = new NextRequest("http://localhost/api/law/v1/health", {
      method: "POST",
    });
    const context = resolveRequestContext(request);
    const result = validateHttpMethod(request, ["GET"], context);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(405);
      expect(result.response.headers.get("Allow")).toBe("GET");
      const body = await result.response.json();
      expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
    }
  });

  it("rejects non-JSON content types", async () => {
    const request = new NextRequest("http://localhost/api/law/v1/health", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    });
    const context = resolveRequestContext(request);
    const result = validateJsonContentType(request, context);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      const body = await result.response.json();
      expect(body.error.code).toBe("MALFORMED_REQUEST");
    }
  });

  it("returns MALFORMED_REQUEST for invalid JSON bodies", async () => {
    const request = new NextRequest("http://localhost/api/law/v1/health", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    });
    const context = resolveRequestContext(request);
    const result = await parseJsonBody(request, context);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      const body = await result.response.json();
      expect(body.error.code).toBe("MALFORMED_REQUEST");
    }
  });
});

describe("Law API method-not-allowed helper", () => {
  it("returns 405 with Allow header", async () => {
    const response = methodNotAllowedResponse(["GET"], createRequestContext(), "POST");
    const body = await response.json();

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET");
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
  });
});

describe("Law API scaffold payloads", () => {
  it("builds safe health data", () => {
    const health = buildLawApiHealthData();

    expect(health.status).toBe("healthy");
    expect(health.basePath).toBe("/api/law/v1");
    expect(JSON.stringify(health)).not.toMatch(/password|secret|token/i);
  });
});

describe("Law API route handlers", () => {
  it("GET /api/law/v1/health returns success envelope", async () => {
    const request = new NextRequest("http://localhost/api/law/v1/health", {
      headers: { [LAW_API_CORRELATION_ID_HEADER]: "health-corr" },
    });
    const response = await getHealth(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe("healthy");
    expect(body.meta.correlationId).toBe("health-corr");
    expect(response.headers.get(LAW_API_REQUEST_ID_HEADER)).toBeTruthy();
  });
});
