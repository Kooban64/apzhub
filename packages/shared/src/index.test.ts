import { describe, expect, it, vi } from "vitest";

import { AppError, createLogger } from "./index";

describe("shared", () => {
  it("creates structured log lines", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const logger = createLogger("test");
    logger.info("ready", { ok: true });
    expect(info).toHaveBeenCalledWith('[apzhub:test] ready {"ok":true}');
    info.mockRestore();
  });

  it("creates AppError with code and status", () => {
    const error = new AppError("failed", "FAILED", 400);
    expect(error.message).toBe("failed");
    expect(error.code).toBe("FAILED");
    expect(error.statusCode).toBe(400);
  });
});
