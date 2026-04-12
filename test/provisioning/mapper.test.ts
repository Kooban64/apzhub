import { describe, expect, it } from "vitest";

import { provisioningRowToAdminJob } from "@/lib/provisioning/contracts/mappers";
import type { ProvisioningJobRow } from "@/lib/provisioning/repository/jobs-repository";

describe("provisioningRowToAdminJob", () => {
  it("maps DB row to admin contract", () => {
    const created = new Date("2026-04-11T10:00:00.000Z");
    const updated = new Date("2026-04-11T10:05:00.000Z");
    const row = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      userId: "u-1001",
      serviceId: "mail",
      jobType: "grant",
      desiredEffectiveRole: "editor",
      status: "failed",
      priority: 0,
      idempotencyKey: "k1",
      triggerSource: "admin_manual_request",
      requestedBy: null,
      correlationId: "c1",
      requestedAt: created,
      scheduledAt: created,
      startedAt: created,
      completedAt: null,
      failedAt: updated,
      manualActionReason: null,
      lastErrorCode: "X",
      lastErrorMessage: "boom",
      retryCount: 2,
      maxRetries: 3,
      subjectLabel: "Test · Mail",
      payloadJson: {},
      verificationJson: null,
      createdAt: created,
      updatedAt: updated,
    } as unknown as ProvisioningJobRow;

    const job = provisioningRowToAdminJob(row);
    expect(job.id).toBe(row.id);
    expect(job.status).toBe("failed");
    expect(job.failureCode).toBe("X");
    expect(job.failureMessage).toBe("boom");
    expect(job.retryCount).toBe(2);
    expect(job.jobType).toBe("grant");
  });

  it("sets manualHold for awaiting_manual", () => {
    const row = {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      userId: "u-1",
      serviceId: "mail",
      jobType: "revoke",
      desiredEffectiveRole: null,
      status: "awaiting_manual",
      priority: 0,
      idempotencyKey: "k2",
      triggerSource: "admin_manual_request",
      requestedBy: null,
      correlationId: null,
      requestedAt: new Date(),
      scheduledAt: new Date(),
      startedAt: null,
      completedAt: null,
      failedAt: null,
      manualActionReason: "Needs human",
      lastErrorCode: null,
      lastErrorMessage: null,
      retryCount: 0,
      maxRetries: 3,
      subjectLabel: "Hold",
      payloadJson: {},
      verificationJson: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ProvisioningJobRow;

    const job = provisioningRowToAdminJob(row);
    expect(job.manualHold).toBe(true);
    expect(job.failureMessage).toBe("Needs human");
  });
});
