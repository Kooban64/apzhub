import { describe, expect, it } from "vitest";

import {
  isReportingRoute,
  REPORTING_BASE,
  reportingSectionPath,
  resolveReportingSection,
} from "./routes";

describe("reporting routes", () => {
  it("detects reporting workspace paths", () => {
    expect(isReportingRoute(REPORTING_BASE)).toBe(true);
    expect(isReportingRoute(`${REPORTING_BASE}/`)).toBe(true);
    expect(isReportingRoute(`${REPORTING_BASE}/templates`)).toBe(true);
    expect(isReportingRoute("/workspace/testing")).toBe(false);
  });

  it("resolves sections with trailing slash and fallback", () => {
    expect(resolveReportingSection(REPORTING_BASE)).toBe("templates");
    expect(resolveReportingSection(`${REPORTING_BASE}/`)).toBe("templates");
    expect(resolveReportingSection(`${REPORTING_BASE}/generations`)).toBe(
      "generations",
    );
    expect(resolveReportingSection(`${REPORTING_BASE}/history/`)).toBe("history");
    expect(resolveReportingSection(`${REPORTING_BASE}/formats`)).toBe("formats");
    expect(resolveReportingSection(`${REPORTING_BASE}/unknown`)).toBe("templates");
  });

  it("builds section paths", () => {
    expect(reportingSectionPath()).toBe(`${REPORTING_BASE}/templates`);
    expect(reportingSectionPath("templates")).toBe(`${REPORTING_BASE}/templates`);
    expect(reportingSectionPath("history")).toBe(`${REPORTING_BASE}/history`);
  });
});
