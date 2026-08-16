import { describe, expect, it } from "vitest";

import {
  isQepQualityGraphRoute,
  parseQepQualityGraphChangeId,
  QEP_QUALITY_GRAPH_BASE_PATH,
  QEP_QUALITY_GRAPH_ROUTES,
} from "./quality-graph-routes";
import { isQepDomainsRoute, QEP_DOMAINS_BASE_PATH } from "./domains-routes";

describe("quality-graph routes", () => {
  it("matches list and detail", () => {
    expect(isQepQualityGraphRoute(QEP_QUALITY_GRAPH_BASE_PATH)).toBe(true);
    expect(isQepQualityGraphRoute(QEP_QUALITY_GRAPH_ROUTES.byChange("chg-1"))).toBe(
      true,
    );
    expect(parseQepQualityGraphChangeId(QEP_QUALITY_GRAPH_ROUTES.byChange("x"))).toBe(
      "x",
    );
  });
});

describe("domains routes", () => {
  it("matches domain hub", () => {
    expect(isQepDomainsRoute(QEP_DOMAINS_BASE_PATH)).toBe(true);
    expect(isQepDomainsRoute("/workspace/qep/home")).toBe(false);
  });
});
