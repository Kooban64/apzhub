import { describe, expect, it } from "vitest";

import {
  createPlaneVendorErrorMapper,
  mapPlaneUnknownError,
  PLANE_INTEGRATION_ID,
} from "./plane-error-mapper";

const context = {
  correlationId: "corr-err-001",
  integrationId: PLANE_INTEGRATION_ID,
  adapterId: "plane-adapter",
  operation: "getProject",
  tenantId: "tenant-1",
};

describe("PlaneVendorErrorMapper", () => {
  const mapper = createPlaneVendorErrorMapper();

  it("maps Plane vendor error codes to SDK categories", () => {
    const translated = mapper.map({
      statusCode: 401,
      body: { error_code: "INVALID_TOKEN", message: "Token invalid" },
      context,
    });

    expect(translated).not.toBeNull();
    expect(translated?.error.category).toBe("authentication");
    expect(translated?.error.code).toBe("plane.invalid_token");
    expect(translated?.error.message).toBe("Plane authentication failed");
    expect(translated?.vendorDiagnostics?.vendorCode).toBe("INVALID_TOKEN");
  });

  it("maps HTTP status codes when vendor code is absent", () => {
    const notFound = mapper.map({ statusCode: 404, context });
    expect(notFound?.error.category).toBe("not_found");

    const rateLimited = mapper.map({ statusCode: 429, context });
    expect(rateLimited?.error.category).toBe("rate_limited");

    const unavailable = mapper.map({ statusCode: 503, context });
    expect(unavailable?.error.category).toBe("vendor_unavailable");
  });

  it("maps workspace not found vendor code", () => {
    const translated = mapper.map({
      statusCode: 404,
      body: { error_code: "WORKSPACE_NOT_FOUND", message: "Missing workspace" },
      context,
    });

    expect(translated?.error.category).toBe("not_found");
    expect(translated?.error.code).toBe("plane.workspace_not_found");
  });

  it("returns null when no status or vendor signal exists", () => {
    expect(mapper.map({ context })).toBeNull();
  });

  it("maps unknown thrown errors via mapPlaneUnknownError", () => {
    const error = Object.assign(new Error("Plane API request failed with status 403"), {
      statusCode: 403,
      body: { error_code: "PERMISSION_DENIED" },
    });

    const translated = mapPlaneUnknownError(error, context);
    expect(translated.error.category).toBe("authorization");
    expect(translated.vendorDiagnostics?.vendorCode).toBe("PERMISSION_DENIED");
  });

  it("maps timeout and network failures", () => {
    const timeoutError = new Error("Plane API request timed out");
    timeoutError.name = "AbortError";
    const timeout = mapPlaneUnknownError(timeoutError, context);
    expect(timeout.error.category).toBe("timeout");

    const network = mapPlaneUnknownError(
      { code: "ECONNREFUSED", message: "refused" },
      context,
    );
    expect(network.error.category).toBe("vendor_unavailable");
  });

  it("maps webhook and sync vendor codes", () => {
    const webhook = mapper.map({
      statusCode: 404,
      body: { error_code: "WEBHOOK_NOT_FOUND" },
      context: { ...context, operation: "plane.webhooks.get" },
    });
    expect(webhook?.error.category).toBe("not_found");
    expect(webhook?.error.message).toBe("Plane webhook was not found");

    const sync = mapper.map({
      statusCode: 503,
      body: { error_code: "SYNC_FAILED" },
      context: { ...context, operation: "plane.sync.full" },
    });
    expect(sync?.error.category).toBe("vendor_unavailable");
    expect(sync?.error.message).toBe("Plane synchronisation failed");
  });
});
