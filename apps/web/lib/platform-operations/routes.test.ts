import { describe, expect, it } from "vitest";

import {
  PLATFORM_OPERATIONS_BASE,
  isPlatformOperationsRoute,
  resolvePlatformOperationsSection,
} from "./routes";

describe("platform operations routes", () => {
  it("detects operations workspace routes", () => {
    expect(isPlatformOperationsRoute(PLATFORM_OPERATIONS_BASE)).toBe(true);
    expect(isPlatformOperationsRoute("/workspace/administration/tenants")).toBe(true);
    expect(isPlatformOperationsRoute("/workspace/home")).toBe(false);
  });

  it("resolves operations sections from pathname", () => {
    expect(resolvePlatformOperationsSection(PLATFORM_OPERATIONS_BASE)).toBe("dashboard");
    expect(resolvePlatformOperationsSection("/workspace/administration/roles")).toBe("roles");
    expect(resolvePlatformOperationsSection("/workspace/administration/governance")).toBe(
      "governance",
    );
    expect(resolvePlatformOperationsSection("/workspace/administration/capabilities")).toBe(
      "capabilities",
    );
  });
});
