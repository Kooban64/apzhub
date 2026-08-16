import { describe, expect, it } from "vitest";

import { ApzpenDomainError } from "./domain";
import { transitionFindingStatus } from "./domain";

/**
 * Pure-domain checks for P3-07 risk acceptance transitions.
 * Full service I/O covered in service.test when node ALS is available.
 */
describe("APZPEN risk acceptance transitions", () => {
  it("allows open/remediating/retest_failed → risk_accepted", () => {
    expect(transitionFindingStatus("open", "risk_accepted")).toBe("risk_accepted");
    expect(transitionFindingStatus("remediating", "risk_accepted")).toBe(
      "risk_accepted",
    );
    expect(transitionFindingStatus("retest_failed", "risk_accepted")).toBe(
      "risk_accepted",
    );
  });

  it("rejects closed → risk_accepted", () => {
    expect(() => transitionFindingStatus("closed", "risk_accepted")).toThrow(
      ApzpenDomainError,
    );
  });
});
