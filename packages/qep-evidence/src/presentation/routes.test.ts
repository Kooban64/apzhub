import { describe, expect, it } from "vitest";

import {
  isQepEvidenceExplorerRoute,
  isQepEvidenceRoute,
  parseQepEvidenceDetailMode,
  parseQepEvidenceRouteId,
  QEP_EVIDENCE_BASE_PATH,
  QEP_EVIDENCE_ROUTES,
} from "./routes";

describe("ENG-110F Evidence presentation routes", () => {
  it("recognises workspace evidence paths", () => {
    expect(isQepEvidenceRoute(QEP_EVIDENCE_BASE_PATH)).toBe(true);
    expect(isQepEvidenceExplorerRoute(QEP_EVIDENCE_ROUTES.explorer)).toBe(true);
    expect(isQepEvidenceRoute("/workspace/qep/executions")).toBe(false);
  });

  it("parses detail id and modes", () => {
    const path = QEP_EVIDENCE_ROUTES.detail("ev-1");
    expect(parseQepEvidenceRouteId(path)).toBe("ev-1");
    expect(parseQepEvidenceDetailMode(path)).toBe("detail");
    expect(parseQepEvidenceDetailMode(QEP_EVIDENCE_ROUTES.provenance("ev-1"))).toBe(
      "provenance",
    );
    expect(parseQepEvidenceDetailMode(QEP_EVIDENCE_ROUTES.versions("ev-1"))).toBe(
      "versions",
    );
  });
});
