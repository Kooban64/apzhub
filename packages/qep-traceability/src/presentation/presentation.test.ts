import { describe, expect, it } from "vitest";

import {
  QEP_TRACEABILITY_NAVIGATION,
  QEP_TRACEABILITY_ROUTES,
  isQepTraceHistoryRoute,
  isQepTraceLinksNewRoute,
  isQepTraceMatrixRoute,
  isQepTraceTaxonomyRoute,
  isQepTraceabilityRoute,
  parseQepTraceLinkRouteId,
} from "./index";

describe("APZQEP-ENG-030C Traceability presentation routes", () => {
  it("recognises Traceability workspace routes", () => {
    expect(isQepTraceabilityRoute("/workspace/qep/traceability")).toBe(true);
    expect(isQepTraceabilityRoute("/workspace/qep/traceability/trace-links")).toBe(true);
    expect(isQepTraceMatrixRoute("/workspace/qep/traceability/matrix")).toBe(true);
    expect(isQepTraceTaxonomyRoute("/workspace/qep/traceability/taxonomy")).toBe(true);
    expect(isQepTraceLinksNewRoute(QEP_TRACEABILITY_ROUTES.new)).toBe(true);
  });

  it("parses Trace Link ids and reserves new/supersede", () => {
    expect(parseQepTraceLinkRouteId("/workspace/qep/traceability/trace-links/trl_abc")).toBe(
      "trl_abc",
    );
    expect(
      parseQepTraceLinkRouteId("/workspace/qep/traceability/trace-links/trl_abc/history"),
    ).toBe("trl_abc");
    expect(isQepTraceHistoryRoute("/workspace/qep/traceability/trace-links/trl_abc/history")).toBe(
      true,
    );
    expect(parseQepTraceLinkRouteId(QEP_TRACEABILITY_ROUTES.new)).toBeNull();
    expect(parseQepTraceLinkRouteId(QEP_TRACEABILITY_ROUTES.supersede)).toBeNull();
  });

  it("exposes navigation contributions", () => {
    expect(QEP_TRACEABILITY_NAVIGATION.sidebar.href).toBe("/workspace/qep/traceability");
    expect(QEP_TRACEABILITY_NAVIGATION.additionalViews.length).toBe(3);
  });
});
