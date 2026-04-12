import { describe, expect, it, beforeEach } from "vitest";

import { createCalendarSimulatedConnector } from "@/lib/provisioning/connectors/calendar-simulated";
import { CONNECTOR_ERROR_CODES } from "@/lib/provisioning/connectors/errors";
import { resetSimulatedEntitlementStore, simulatedGetRole } from "@/lib/provisioning/connectors/simulated-store";
import type { ProvisioningJobRow } from "@/lib/provisioning/repository/jobs-repository";

function baseRow(partial: Partial<ProvisioningJobRow>): ProvisioningJobRow {
  return {
    id: "00000000-0000-4000-8000-000000000002",
    userId: "u-2",
    serviceId: "calendar",
    jobType: "grant",
    desiredEffectiveRole: "r-cal-view",
    status: "running",
    priority: 0,
    idempotencyKey: "k2",
    triggerSource: "bundle_assignment",
    requestedBy: null,
    correlationId: null,
    requestedAt: new Date(),
    scheduledAt: new Date(),
    startedAt: null,
    completedAt: null,
    failedAt: null,
    manualActionReason: null,
    lastErrorCode: null,
    lastErrorMessage: null,
    retryCount: 0,
    maxRetries: 3,
    subjectLabel: "test",
    payloadJson: {},
    verificationJson: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  } as ProvisioningJobRow;
}

describe("createCalendarSimulatedConnector", () => {
  beforeEach(() => {
    resetSimulatedEntitlementStore();
  });

  it("revoke with no prior entitlement is manual_action", async () => {
    const c = createCalendarSimulatedConnector();
    const r = await c.execute(baseRow({ jobType: "revoke", desiredEffectiveRole: null }));
    expect(r.outcome).toBe("manual_action");
    expect(r.errorCode).toBe(CONNECTOR_ERROR_CODES.POLICY_REQUIRES_MANUAL);
  });

  it("rejects unknown role", async () => {
    const c = createCalendarSimulatedConnector();
    const r = await c.execute(baseRow({ desiredEffectiveRole: "r-mail-admin" }));
    expect(r.outcome).toBe("terminal_failure");
    expect(r.errorCode).toBe(CONNECTOR_ERROR_CODES.UNKNOWN_ROLE);
  });

  it("grant then revoke succeeds", async () => {
    const c = createCalendarSimulatedConnector();
    await c.execute(baseRow({ jobType: "grant", desiredEffectiveRole: "r-cal-admin" }));
    const r = await c.execute(baseRow({ jobType: "revoke", desiredEffectiveRole: null }));
    expect(r.outcome).toBe("success");
    expect(simulatedGetRole("u-2", "calendar")).toBeNull();
  });
});
