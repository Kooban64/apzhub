import { beforeEach, describe, expect, it } from "vitest";

import { executeTestingCommand } from "./commands";
import { TestingClientError } from "./errors";
import { createMockTestingClient, FIXTURE_IDS } from "./mock-client";
import { resetTestingClient } from "./testing-api";

const FULL_PERMISSIONS = [
  "testing.*",
  "certification.*",
  "evidence.*",
] as const;

describe("executeTestingCommand", () => {
  beforeEach(() => {
    resetTestingClient();
  });

  it("creates a plan when permitted", async () => {
    const result = await executeTestingCommand(
      "create_plan",
      { name: "Sprint plan" },
      FULL_PERMISSIONS,
    );
    expect(result).toMatchObject({ name: "Sprint plan", status: "draft" });
  });

  it("creates a suite when permitted", async () => {
    const result = await executeTestingCommand(
      "create_suite",
      { name: "Auth suite", planId: FIXTURE_IDS.plan },
      FULL_PERMISSIONS,
    );
    expect(result).toMatchObject({ name: "Auth suite", planId: FIXTURE_IDS.plan });
  });

  it("creates a case when permitted", async () => {
    const result = await executeTestingCommand(
      "create_case",
      { title: "Login case", suiteId: FIXTURE_IDS.suite },
      FULL_PERMISSIONS,
    );
    expect(result).toMatchObject({ title: "Login case", suiteId: FIXTURE_IDS.suite });
  });

  it("starts, pauses, and resumes execution when permitted", async () => {
    const started = await executeTestingCommand(
      "start_execution",
      { caseId: FIXTURE_IDS.case },
      FULL_PERMISSIONS,
    );
    expect(started).toMatchObject({ status: "in_progress" });

    const paused = await executeTestingCommand(
      "pause_execution",
      { executionId: FIXTURE_IDS.execution },
      FULL_PERMISSIONS,
    );
    expect(paused).toMatchObject({ status: "paused" });

    const resumed = await executeTestingCommand(
      "resume_execution",
      { executionId: FIXTURE_IDS.execution },
      FULL_PERMISSIONS,
    );
    expect(resumed).toMatchObject({ status: "in_progress" });
  });

  it("submits evidence when permitted", async () => {
    const evidence = await executeTestingCommand(
      "submit_evidence",
      { executionId: FIXTURE_IDS.execution, title: "Screenshot" },
      FULL_PERMISSIONS,
    );
    expect(evidence).toMatchObject({
      title: "Screenshot",
      linkedExecutionId: FIXTURE_IDS.execution,
    });
  });

  it("runs certification review, approve, reject, and archive when permitted", async () => {
    const reviewed = await executeTestingCommand(
      "review",
      { certificationId: FIXTURE_IDS.certification, comment: "Needs waiver" },
      FULL_PERMISSIONS,
    );
    expect(reviewed).toMatchObject({ state: "in_review" });

    const approved = await executeTestingCommand(
      "approve",
      { certificationId: FIXTURE_IDS.certification },
      FULL_PERMISSIONS,
    );
    expect(approved).toMatchObject({ state: "approved" });

    resetTestingClient();
    const rejected = await executeTestingCommand(
      "reject",
      { certificationId: FIXTURE_IDS.certification, comment: "Blocked" },
      FULL_PERMISSIONS,
    );
    expect(rejected).toMatchObject({ state: "rejected" });

    resetTestingClient();
    const archived = await executeTestingCommand(
      "archive",
      { certificationId: FIXTURE_IDS.certification },
      ["certification.records.transition"],
    );
    expect(archived).toMatchObject({ state: "archived" });
  });

  it("throws when permission is denied", async () => {
    const forbidden = {
      code: "FORBIDDEN",
      status: 403,
    } satisfies Partial<TestingClientError>;

    await expect(
      executeTestingCommand("create_plan", { name: "Denied" }, []),
    ).rejects.toMatchObject(forbidden);

    await expect(
      executeTestingCommand(
        "create_suite",
        { name: "Denied", planId: FIXTURE_IDS.plan },
        [],
      ),
    ).rejects.toMatchObject(forbidden);

    await expect(
      executeTestingCommand(
        "create_case",
        { title: "Denied", suiteId: FIXTURE_IDS.suite },
        [],
      ),
    ).rejects.toMatchObject(forbidden);

    await expect(
      executeTestingCommand("start_execution", { caseId: FIXTURE_IDS.case }, []),
    ).rejects.toMatchObject(forbidden);

    await expect(
      executeTestingCommand(
        "submit_evidence",
        { executionId: FIXTURE_IDS.execution, title: "Denied" },
        [],
      ),
    ).rejects.toMatchObject(forbidden);

    await expect(
      executeTestingCommand(
        "approve",
        { certificationId: FIXTURE_IDS.certification },
        ["certification.review"],
      ),
    ).rejects.toMatchObject(forbidden);
  });

  it("throws for unknown command ids", async () => {
    await expect(
      executeTestingCommand(
        "not_a_command" as "create_plan",
        { name: "x" },
        FULL_PERMISSIONS,
      ),
    ).rejects.toMatchObject({
      code: "UNKNOWN_COMMAND",
      status: 400,
    } satisfies Partial<TestingClientError>);
  });

  it("uses resetTestingClient between runs", async () => {
    await executeTestingCommand("create_plan", { name: "First" }, FULL_PERMISSIONS);
    resetTestingClient();
    const client = createMockTestingClient();
    const plans = await client.listPlans();
    expect(plans.items.some((plan) => plan.name === "First")).toBe(false);
    expect(plans.items.some((plan) => plan.name === "Release 2.4 Regression")).toBe(true);
  });
});
