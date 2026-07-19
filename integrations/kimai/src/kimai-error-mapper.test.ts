import { describe, expect, it } from "vitest";

import {
  createKimaiVendorErrorMapper,
  mapKimaiUnknownError,
} from "./kimai-error-mapper";

describe("kimai-error-mapper", () => {
  it("maps 401 to authentication", () => {
    const mapper = createKimaiVendorErrorMapper();
    const translated = mapper.map({
      statusCode: 401,
      body: { code: 401, message: "Unauthorized" },
      context: {
        correlationId: "c1",
        operation: "connection_test",
        integrationId: "kimai",
      },
    });
    expect(translated?.error.category).toBe("authentication");
    expect(translated?.error.message).toMatch(/authentication failed/i);
  });

  it("maps network failures to vendor_unavailable", () => {
    const translated = mapKimaiUnknownError(
      { code: "ECONNREFUSED", message: "refused" },
      { correlationId: "c1", operation: "ping", integrationId: "kimai" },
    );
    expect(translated.error.category).toBe("vendor_unavailable");
  });

  it("maps timeouts", () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    const translated = mapKimaiUnknownError(err, {
      correlationId: "c1",
      operation: "version",
      integrationId: "kimai",
    });
    expect(translated.error.category).toBe("timeout");
  });
});
