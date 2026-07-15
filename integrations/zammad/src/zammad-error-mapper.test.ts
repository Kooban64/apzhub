import { describe, expect, it } from "vitest";

import {
  createZammadVendorErrorMapper,
  mapZammadUnknownError,
  ZAMMAD_INTEGRATION_ID,
} from "./zammad-error-mapper";

const context = {
  correlationId: "corr-zammad-err-001",
  integrationId: ZAMMAD_INTEGRATION_ID,
  adapterId: "zammad-adapter",
  operation: "connection_test",
  tenantId: "tenant-1",
};

describe("ZammadVendorErrorMapper", () => {
  const mapper = createZammadVendorErrorMapper();

  it("maps authentication failures", () => {
    const translated = mapper.map({
      statusCode: 401,
      body: { error: "UNAUTHORIZED", message: "Token invalid" },
      context,
    });

    expect(translated).not.toBeNull();
    expect(translated?.error.category).toBe("authentication");
    expect(translated?.error.code).toBe("zammad.unauthorized");
    expect(translated?.error.message).toBe("Zammad authentication failed");
  });

  it("maps authorization, validation, not found, conflict, and rate limiting", () => {
    expect(mapper.map({ statusCode: 403, context })?.error.category).toBe(
      "authorization",
    );
    expect(mapper.map({ statusCode: 404, context })?.error.category).toBe("not_found");
    expect(mapper.map({ statusCode: 409, context })?.error.category).toBe("conflict");
    expect(mapper.map({ statusCode: 422, context })?.error.category).toBe("validation");
    expect(mapper.map({ statusCode: 429, context })?.error.category).toBe(
      "rate_limited",
    );
    expect(mapper.map({ statusCode: 501, context })?.error.category).toBe(
      "not_implemented",
    );
    expect(mapper.map({ statusCode: 503, context })?.error.category).toBe(
      "vendor_unavailable",
    );
  });

  it("maps unsupported operation vendor codes", () => {
    const translated = mapper.map({
      statusCode: 501,
      body: { error_code: "UNSUPPORTED", message: "Not supported" },
      context,
    });

    expect(translated?.error.category).toBe("not_implemented");
    expect(translated?.error.code).toBe("zammad.unsupported");
  });

  it("returns null when no status or vendor signal exists", () => {
    expect(mapper.map({ context })).toBeNull();
  });

  it("maps unknown thrown errors via mapZammadUnknownError", () => {
    const error = Object.assign(
      new Error("Zammad API request failed with status 403"),
      {
        statusCode: 403,
        body: { error: "FORBIDDEN" },
      },
    );

    const translated = mapZammadUnknownError(error, context);
    expect(translated.error.category).toBe("authorization");
  });

  it("maps timeout and network failures", () => {
    const timeoutError = new Error("Zammad API request timed out");
    timeoutError.name = "AbortError";
    const timeout = mapZammadUnknownError(timeoutError, context);
    expect(timeout.error.category).toBe("timeout");

    const network = mapZammadUnknownError(
      { code: "ECONNREFUSED", message: "refused" },
      context,
    );
    expect(network.error.category).toBe("vendor_unavailable");
  });
});
