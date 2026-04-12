import { describe, expect, it } from "vitest";

import { isProvisioningJobAction, PROVISIONING_JOB_ACTIONS } from "@/lib/provisioning/contracts/provisioning-job-actions";

describe("PROVISIONING_JOB_ACTIONS", () => {
  it("matches grant/revoke/repair/reconcile vocabulary", () => {
    expect([...PROVISIONING_JOB_ACTIONS]).toEqual(["grant", "revoke", "repair", "reconcile"]);
  });

  it("isProvisioningJobAction narrows strings", () => {
    expect(isProvisioningJobAction("grant")).toBe(true);
    expect(isProvisioningJobAction("bogus")).toBe(false);
  });
});
