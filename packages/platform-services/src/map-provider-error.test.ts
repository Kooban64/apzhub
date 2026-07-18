import { describe, expect, it, vi } from "vitest";

import { IntegrationSdkError } from "@apzhub/integration-sdk/errors";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  mapProviderError,
  withProviderErrorMapping,
} from "./errors/map-provider-error";

describe("mapProviderError", () => {
  it("re-throws existing PlatformServiceError instances", () => {
    const original = new PlatformServiceError({
      category: "not_found",
      code: "NOT_FOUND",
      message: "Missing",
      correlationId: "corr_1",
      retryable: false,
    });

    expect(() => mapProviderError(original, "corr_1")).toThrow(original);
  });

  it("maps IntegrationSdkError to PlatformServiceError", () => {
    const sdkError = new IntegrationSdkError({
      category: "not_found",
      code: "INTEGRATION_NOT_FOUND",
      message: "Resource missing",
      retryable: false,
      correlationId: "corr_2",
    });

    expect(() => mapProviderError(sdkError, "corr_2")).toThrow(PlatformServiceError);

    try {
      mapProviderError(sdkError, "corr_2");
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformServiceError);
      expect((error as PlatformServiceError).code).toBe("NOT_FOUND");
      expect((error as PlatformServiceError).message).toBe("Resource missing");
    }
  });

  it("wraps unknown errors as internal platform service errors", () => {
    expect(() => mapProviderError(new Error("boom"), "corr_3")).toThrow(
      PlatformServiceError,
    );
  });
});

describe("withProviderErrorMapping", () => {
  it("returns successful provider results unchanged", async () => {
    const result = await withProviderErrorMapping("corr_4", async () => ({ ok: true }));
    expect(result).toEqual({ ok: true });
  });

  it("maps thrown provider errors", async () => {
    const operation = vi.fn(async () => {
      throw new IntegrationSdkError({
        category: "validation",
        code: "VALIDATION",
        message: "Invalid",
        retryable: false,
        correlationId: "corr_5",
      });
    });

    await expect(withProviderErrorMapping("corr_5", operation)).rejects.toBeInstanceOf(
      PlatformServiceError,
    );
  });
});
