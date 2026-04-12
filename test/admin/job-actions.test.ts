import { describe, expect, it } from "vitest";

import { adminProvisioningJobSchema } from "@/lib/admin/provisioning/job-contract";
import { getAllowedJobActions } from "@/lib/admin/provisioning/job-actions";

const base = {
  id: "job-x",
  jobType: "grant" as const,
  subjectLabel: "Test",
  createdAt: "2026-04-11T00:00:00Z",
  updatedAt: "2026-04-11T00:00:00Z",
  retryCount: 0,
};

describe("getAllowedJobActions", () => {
  it("enables retry only for failed jobs", () => {
    const failed = adminProvisioningJobSchema.parse({ ...base, status: "failed" });
    const running = adminProvisioningJobSchema.parse({ ...base, id: "job-y", status: "running" });

    expect(getAllowedJobActions(failed).find((a) => a.id === "retry")?.disabled).toBe(false);
    expect(getAllowedJobActions(running).find((a) => a.id === "retry")?.disabled).toBe(true);
  });

  it("enables mark resolved only for awaiting_manual", () => {
    const manual = adminProvisioningJobSchema.parse({ ...base, status: "awaiting_manual", manualHold: true });
    const queued = adminProvisioningJobSchema.parse({ ...base, id: "job-z", status: "queued" });

    expect(getAllowedJobActions(manual).find((a) => a.id === "mark_resolved")?.disabled).toBe(false);
    expect(getAllowedJobActions(queued).find((a) => a.id === "mark_resolved")?.disabled).toBe(true);
  });

  it("always exposes view details", () => {
    const succeeded = adminProvisioningJobSchema.parse({ ...base, status: "succeeded" });
    expect(getAllowedJobActions(succeeded).find((a) => a.id === "view_detail")?.disabled).toBe(false);
  });
});
