import { describe, expect, it } from "vitest";

import { clearTestingQueries, testingQueryKeys } from "./query-keys";

describe("testing query keys", () => {
  it("builds stable hierarchical keys", () => {
    expect(testingQueryKeys.all).toEqual(["testing"]);
    expect(testingQueryKeys.dashboard()).toEqual(["testing", "dashboard"]);
    expect(testingQueryKeys.plans.list({ status: "active" })).toEqual([
      "testing",
      "plans",
      "list",
      { status: "active" },
    ]);
    expect(testingQueryKeys.plans.detail("plan_1")).toEqual([
      "testing",
      "plans",
      "detail",
      "plan_1",
    ]);
    expect(testingQueryKeys.executions.detail("exec_1")).toEqual([
      "testing",
      "executions",
      "detail",
      "exec_1",
    ]);
    expect(testingQueryKeys.certification.detail("cert_1")).toEqual([
      "testing",
      "certification",
      "detail",
      "cert_1",
    ]);
  });

  it("uses empty object default for list params", () => {
    const a = testingQueryKeys.requirements.list();
    const b = testingQueryKeys.requirements.list(undefined);
    expect(a).toEqual(b);
    expect(a).toEqual(["testing", "requirements", "list", {}]);
  });

  it("clearTestingQueries returns the root key", () => {
    expect(clearTestingQueries()).toEqual(["testing"]);
  });
});
