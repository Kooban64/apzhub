import { describe, expect, it, beforeEach } from "vitest";

import { createMailSimulatedConnector } from "@/lib/provisioning/connectors/mail-simulated";
import { CONNECTOR_ERROR_CODES } from "@/lib/provisioning/connectors/errors";
import { resetSimulatedEntitlementStore, simulatedGetRole } from "@/lib/provisioning/connectors/simulated-store";
import type { ProvisioningJobRow } from "@/lib/provisioning/repository/jobs-repository";

function baseRow(partial: Partial<ProvisioningJobRow>): ProvisioningJobRow {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    userId: "u-1",
    serviceId: "mail",
    jobType: "grant",
    desiredEffectiveRole: "r-mail-view",
    status: "running",
    priority: 0,
    idempotencyKey: "k",
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

describe("createMailSimulatedConnector", () => {
  beforeEach(() => {
    resetSimulatedEntitlementStore();
  });

  it("rejects unknown role with terminal failure", async () => {
    const c = createMailSimulatedConnector();
    const r = await c.execute(baseRow({ desiredEffectiveRole: "r-cal-view" }));
    expect(r.outcome).toBe("terminal_failure");
    expect(r.errorCode).toBe(CONNECTOR_ERROR_CODES.UNKNOWN_ROLE);
  });

  it("grant then readback observed role", async () => {
    const c = createMailSimulatedConnector();
    const r = await c.execute(baseRow({ jobType: "grant", desiredEffectiveRole: "r-mail-std" }));
    expect(r.outcome).toBe("success");
    expect(r.verificationPayload?.observedRole).toBe("r-mail-std");
    expect(simulatedGetRole("u-1", "mail")).toBe("r-mail-std");
  });

  it("revoke clears entitlement", async () => {
    const c = createMailSimulatedConnector();
    await c.execute(baseRow({ jobType: "grant", desiredEffectiveRole: "r-mail-view" }));
    const r = await c.execute(baseRow({ jobType: "revoke", desiredEffectiveRole: null }));
    expect(r.outcome).toBe("success");
    expect(simulatedGetRole("u-1", "mail")).toBeNull();
  });
});
