import { describe, expect, it } from "vitest";

import {
  assertObserveApiPath,
  isObserveApiPath,
  isObserveRoute,
  observeSectionPath,
  OBSERVE_API_BASE,
  OBSERVE_FORBIDDEN_HTTP_SEGMENTS,
  OBSERVE_SECTIONS,
  OBSERVE_WORKSPACE_BASE,
  resolveObserveSection,
} from "./routes";

describe("APZOBSERVE observe routes", () => {
  it("accepts observe API base paths only", () => {
    expect(isObserveApiPath(OBSERVE_API_BASE)).toBe(true);
    expect(isObserveApiPath(`${OBSERVE_API_BASE}/health-checks`)).toBe(true);
    expect(isObserveApiPath("/api/v1/configuration")).toBe(false);
    expect(() =>
      assertObserveApiPath(`${OBSERVE_API_BASE}/health-checks`),
    ).not.toThrow();
  });

  it("lists forbidden provider segments", () => {
    expect(OBSERVE_FORBIDDEN_HTTP_SEGMENTS).toContain("grafana");
    expect(OBSERVE_FORBIDDEN_HTTP_SEGMENTS).toContain("prometheus");
    expect(OBSERVE_FORBIDDEN_HTTP_SEGMENTS).toContain("scrape");
  });

  it("resolves observability workbench sections", () => {
    expect(isObserveRoute(OBSERVE_WORKSPACE_BASE)).toBe(true);
    expect(isObserveRoute(`${OBSERVE_WORKSPACE_BASE}/health-checks`)).toBe(true);
    expect(isObserveRoute("/workspace/configuration")).toBe(false);
    expect(resolveObserveSection(OBSERVE_WORKSPACE_BASE)).toBe("overview");
    expect(resolveObserveSection(`${OBSERVE_WORKSPACE_BASE}/diagnostics`)).toBe(
      "diagnostics",
    );
    expect(resolveObserveSection(`${OBSERVE_WORKSPACE_BASE}/missing`)).toBe(
      "overview",
    );
    expect(observeSectionPath("metric-definitions")).toBe(
      `${OBSERVE_WORKSPACE_BASE}/metric-definitions`,
    );
    expect(OBSERVE_SECTIONS).toContain("health-checks");
    expect(OBSERVE_SECTIONS).toContain("metadata");
  });
});
