import { describe, expect, it, vi, afterEach } from "vitest";
import { z } from "zod";

import { ApiError, apiRequest } from "@/lib/api/client";
import { healthResponseSchema } from "@/lib/api/schemas/health";

describe("apiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("parses successful JSON with Zod schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: "ok", service: "apzhub" }),
      }),
    );

    const result = await apiRequest("/health", healthResponseSchema);
    expect(result).toEqual({ status: "ok", service: "apzhub" });
  });

  it("throws ApiError on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ error: "down" }),
      }),
    );

    await expect(apiRequest("/health", healthResponseSchema)).rejects.toBeInstanceOf(ApiError);
  });

  it("throws ApiError when validation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ wrong: true }),
      }),
    );

    await expect(apiRequest("/health", healthResponseSchema)).rejects.toBeInstanceOf(ApiError);
  });

  it("throws ApiError with flattened Zod error in body field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: "bad", service: "" }),
      }),
    );

    const schema = z.object({ status: z.literal("ok"), service: z.string().min(1) });
    try {
      await apiRequest("/health", schema);
      expect.fail("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.message).toBe("Response validation failed");
      }
    }
  });
});
