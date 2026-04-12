import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const hasDb = Boolean((process.env.APZHUB_DATABASE_URL ?? process.env.DATABASE_URL ?? "").trim());

describe.skipIf(!hasDb)("runProvisioningWorkerTick + simulated connectors", () => {
  beforeEach(() => {
    vi.stubEnv("APZHUB_PROVISIONING_CONNECTOR_PROFILE", "simulated");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("persists verification_json with connector readback", async () => {
    const { resetSimulatedEntitlementStore } = await import("@/lib/provisioning/connectors/simulated-store");
    const { createProvisioningJob } = await import("@/lib/provisioning/service/provisioning-service");
    const { runProvisioningWorkerTick } = await import("@/lib/provisioning/worker/runner");
    const { getProvisioningJobById } = await import("@/lib/provisioning/repository/jobs-repository");

    resetSimulatedEntitlementStore();

    const job = await createProvisioningJob({
      userId: "u-int-mail",
      serviceId: "mail",
      jobType: "grant",
      desiredEffectiveRole: "r-mail-view",
      triggerSource: "admin_manual_request",
      subjectLabel: "integration",
      deferWorkerTick: true,
    });

    await runProvisioningWorkerTick();

    const row = await getProvisioningJobById(job.id);
    expect(row?.status).toBe("succeeded");
    expect(row?.verificationJson).toMatchObject({
      connectorId: "mail.simulated.v1",
      userId: "u-int-mail",
      serviceId: "mail",
      observedRole: "r-mail-view",
    });
  });
});
