import { describe, expect, it } from "vitest";

import { createIntegrationError } from "../factory";
import { DefaultErrorTranslator } from "./error-translator";
import { buildDefaultTranslatedError, normalizeUnknownError } from "./default-mapping";
import type { VendorErrorMapper } from "./types";

const correlationId = "corr-translate-001";
const integrationId = "mock-integration";

const context = {
  correlationId,
  integrationId,
  adapterId: "mock-adapter",
  operation: "fetchResource",
  tenantId: "tenant-alpha",
  requestId: "req-001",
};

describe("error translation", () => {
  it("maps HTTP status codes to platform categories", () => {
    const translated = buildDefaultTranslatedError(
      {
        statusCode: 404,
        context,
      },
      "2026-07-10T08:00:00.000Z",
    );

    expect(translated.error.category).toBe("not_found");
    expect(translated.error.retryable).toBe(false);
    expect(translated.severity).toBe("warning");
    expect(translated.error.message).not.toContain("Plane");
  });

  it("marks retryable categories correctly", () => {
    const translated = buildDefaultTranslatedError(
      {
        statusCode: 503,
        context,
      },
      "2026-07-10T08:00:00.000Z",
    );

    expect(translated.error.category).toBe("vendor_unavailable");
    expect(translated.error.retryable).toBe(true);
    expect(translated.severity).toBe("error");
  });

  it("preserves vendor diagnostics without leaking raw vendor message to platform error", () => {
    const rawVendorMessage = "Invalid token: super-secret-token-value";
    const translated = buildDefaultTranslatedError(
      {
        statusCode: 401,
        vendorCode: "invalid_token",
        vendorMessage: rawVendorMessage,
        context,
      },
      "2026-07-10T08:00:00.000Z",
    );

    expect(translated.error.message).not.toContain("super-secret-token-value");
    expect(translated.vendorDiagnostics?.vendorCode).toBe("invalid_token");
    expect(translated.vendorDiagnostics?.vendorMessageSummary).toContain(
      "Invalid token",
    );
    expect(translated.error.correlationId).toBe(correlationId);
  });

  it("registers and applies vendor-specific mappers before defaults", () => {
    const mapper: VendorErrorMapper = {
      integrationId,
      map: (input) => ({
        error: createIntegrationError({
          category: "validation",
          code: "mock.validation.custom",
          message: "Custom mapped validation failure",
          correlationId: input.context.correlationId,
        }),
        severity: "warning",
      }),
    };

    const translator = new DefaultErrorTranslator();
    translator.registerMapper(mapper);

    const translated = translator.translate({
      statusCode: 500,
      context,
    });

    expect(translated.error.code).toBe("mock.validation.custom");
    expect(translated.error.category).toBe("validation");

    translator.unregisterMapper(integrationId);
    const fallback = translator.translate({ statusCode: 500, context });
    expect(fallback.error.category).toBe("internal");
  });

  it("normalizes unknown errors and propagates correlation IDs", () => {
    const translator = new DefaultErrorTranslator();
    const translated = translator.translateUnknown(
      { statusCode: 429, message: "Too many requests" },
      context,
    );

    expect(translated.error.category).toBe("rate_limited");
    expect(translated.error.correlationId).toBe(correlationId);
  });

  it("normalizes timeout and network errors", () => {
    const timeoutInput = normalizeUnknownError({ name: "TimeoutError" }, context);
    expect(timeoutInput.timeout).toBe(true);

    const networkInput = normalizeUnknownError({ code: "ECONNREFUSED" }, context);
    expect(networkInput.networkError).toBe(true);
  });
});
