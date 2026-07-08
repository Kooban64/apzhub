import { describe, expect, it } from "vitest";

import { buildLawPlatformHealthSummary } from "./law-platform-health-summary";
import {
  LAW_PLATFORM_MODULES,
  LAW_PLATFORM_NAME,
  LAW_PLATFORM_VERSION,
} from "./law-platform-constants";

describe("buildLawPlatformHealthSummary", () => {
  it("reports Law Platform version, module count, and placeholder statistics", () => {
    const summary = buildLawPlatformHealthSummary({
      registeredCommandCount: 10,
      registeredKnowledgeSourceCount: 10,
      registeredNotificationRouteCount: 2,
      registeredActivityTypeCount: 3,
    });

    expect(summary.applicationName).toBe(LAW_PLATFORM_NAME);
    expect(summary.applicationVersion).toBe(LAW_PLATFORM_VERSION);
    expect(summary.moduleCount).toBe(LAW_PLATFORM_MODULES.length);
    expect(summary.placeholderModuleCount).toBe(LAW_PLATFORM_MODULES.length);
    expect(summary.registeredCommandCount).toBe(10);
    expect(summary.registeredKnowledgeSourceCount).toBe(10);
    expect(summary.registeredNotificationRouteCount).toBe(2);
    expect(summary.registeredActivityTypeCount).toBe(3);
    expect(summary.workspaceId).toBe("law");
  });
});
