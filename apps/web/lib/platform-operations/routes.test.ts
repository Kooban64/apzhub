import { describe, expect, it } from "vitest";

import {
  PLATFORM_OPERATIONS_BASE,
  isPlatformOperationsRoute,
  resolvePlatformOperationsSection,
} from "./routes";

describe("platform operations routes", () => {
  it("detects operations workspace routes", () => {
    expect(isPlatformOperationsRoute(PLATFORM_OPERATIONS_BASE)).toBe(true);
    expect(isPlatformOperationsRoute("/workspace/operations/tenants")).toBe(true);
    expect(isPlatformOperationsRoute("/workspace/home")).toBe(false);
  });

  it("resolves operations sections from pathname", () => {
    expect(resolvePlatformOperationsSection(PLATFORM_OPERATIONS_BASE)).toBe(
      "dashboard",
    );
    expect(resolvePlatformOperationsSection("/workspace/operations/roles")).toBe(
      "roles",
    );
    expect(resolvePlatformOperationsSection("/workspace/operations/governance")).toBe(
      "governance",
    );
    expect(resolvePlatformOperationsSection("/workspace/operations/capabilities")).toBe(
      "capabilities",
    );
  });
});
