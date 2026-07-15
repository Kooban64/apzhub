import { describe, expect, it } from "vitest";

import { buildRecoveryGuidance } from "./recovery-guidance";

describe("Recovery guidance", () => {
  it("returns healthy guidance when all dependencies pass", () => {
    const guidance = buildRecoveryGuidance({
      databaseOk: true,
      redisOk: true,
      runtimeReady: true,
      environmentValid: true,
    });
    expect(guidance[0]?.id).toBe("platform-healthy");
  });

  it("returns critical guidance when database fails", () => {
    const guidance = buildRecoveryGuidance({
      databaseOk: false,
      redisOk: true,
      runtimeReady: true,
      environmentValid: true,
    });
    expect(guidance.some((item) => item.id === "database-unreachable")).toBe(true);
  });
});
