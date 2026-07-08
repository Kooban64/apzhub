import { describe, expect, it } from "vitest";

import {
  isTrustModuleRoute,
  parseTrustRoute,
  trustAccountsRoute,
  trustDashboardRoute,
  trustReportsRoute,
  trustTransactionsRoute,
} from "./trust-routes";

describe("trust routes", () => {
  it("detects trust module routes", () => {
    expect(isTrustModuleRoute("/workspace/law/trust")).toBe(true);
    expect(isTrustModuleRoute("/workspace/law/trust/transactions")).toBe(true);
    expect(isTrustModuleRoute("/workspace/law/clients")).toBe(false);
  });

  it("parses dashboard and sub-routes", () => {
    expect(parseTrustRoute("/workspace/law/trust")).toEqual({ kind: "dashboard" });
    expect(parseTrustRoute("/workspace/law/trust/accounts")).toEqual({
      kind: "accounts",
    });
    expect(parseTrustRoute("/workspace/law/trust/transactions")).toEqual({
      kind: "transactions",
    });
    expect(parseTrustRoute("/workspace/law/trust/reports")).toEqual({
      kind: "reports",
    });
  });

  it("builds route helpers", () => {
    expect(trustDashboardRoute()).toBe("/workspace/law/trust");
    expect(trustAccountsRoute()).toBe("/workspace/law/trust/accounts");
    expect(trustTransactionsRoute()).toBe("/workspace/law/trust/transactions");
    expect(trustReportsRoute()).toBe("/workspace/law/trust/reports");
  });
});
