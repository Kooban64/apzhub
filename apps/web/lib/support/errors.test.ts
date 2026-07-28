import { describe, expect, it } from "vitest";

import { isSupportApiError, shouldRetrySupportQuery, SupportApiError } from "./errors";

describe("SupportApiError", () => {
  it("maps statuses and sanitizes provider leakage", () => {
    const forbidden = SupportApiError.fromHttp({
      status: 403,
      message: "zammad upstream denied",
      code: "FORBIDDEN",
      correlationId: "c1",
      requestId: "r1",
    });
    expect(forbidden.code).toBe("FORBIDDEN");
    expect(forbidden.message).toBe(
      "You do not have permission to perform this action.",
    );
    expect(forbidden.correlationId).toBe("c1");

    const unavailable = SupportApiError.fromHttp({
      status: 503,
      message: "engine timeout",
    });
    expect(unavailable.code).toBe("UNAVAILABLE");
    expect(unavailable.message).toBe(
      "Support is temporarily unavailable. Try again later.",
    );

    const conflict = SupportApiError.fromHttp({
      status: 409,
      message: "Already closed",
      code: "CONFLICT",
    });
    expect(conflict.message).toBe("Already closed");

    const validation = SupportApiError.fromHttp({
      status: 422,
      code: "VALIDATION",
    });
    expect(validation.code).toBe("VALIDATION");
    expect(validation.message).toBe("The request could not be validated.");

    const unknown = SupportApiError.fromHttp({ status: 500 });
    expect(unknown.code).toBe("UNKNOWN");
    expect(isSupportApiError(unknown)).toBe(true);
    expect(isSupportApiError(new Error("x"))).toBe(false);
  });

  it("treats stack/adapter keywords as unsafe", () => {
    const error = SupportApiError.fromHttp({
      status: 404,
      message: "stack mapping missing",
    });
    expect(error.message).toBe("The requested Support resource was not found.");
  });

  it("does not retry terminal Support API codes", () => {
    const forbidden = SupportApiError.fromHttp({
      status: 403,
      code: "FORBIDDEN",
    });
    expect(shouldRetrySupportQuery(0, forbidden)).toBe(false);

    const unavailable = SupportApiError.fromHttp({
      status: 503,
      code: "UNAVAILABLE",
    });
    expect(shouldRetrySupportQuery(0, unavailable)).toBe(false);

    expect(shouldRetrySupportQuery(0, new Error("network"))).toBe(true);
    expect(shouldRetrySupportQuery(1, new Error("network"))).toBe(false);
  });
});
