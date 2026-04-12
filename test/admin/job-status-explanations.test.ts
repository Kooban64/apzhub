import { describe, expect, it } from "vitest";

import { explainProvisioningJobStatus } from "@/lib/admin/provisioning/job-status-explanations";

describe("explainProvisioningJobStatus", () => {
  it("explains retry exhaustion distinctly from generic failed", () => {
    expect(explainProvisioningJobStatus("failed", { failureCode: "RETRY_EXHAUSTED" })).toContain("retry budget");
    expect(explainProvisioningJobStatus("failed", { failureCode: "MOCK_TERMINAL" })).toContain("Terminal failure");
  });

  it("covers manual and queued", () => {
    expect(explainProvisioningJobStatus("awaiting_manual")).toContain("Manual action");
    expect(explainProvisioningJobStatus("queued")).toContain("Waiting");
  });
});
