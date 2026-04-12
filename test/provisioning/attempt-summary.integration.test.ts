import { describe, expect, it } from "vitest";

const hasDb = Boolean((process.env.APZHUB_DATABASE_URL ?? process.env.DATABASE_URL)?.trim());

describe.skipIf(!hasDb)("provisioning attempt summary (Postgres)", () => {
  it("returns null for unknown job id", async () => {
    const { getProvisioningAttemptSummary } = await import("@/lib/provisioning/repository/jobs-repository");
    await expect(getProvisioningAttemptSummary("00000000-0000-4000-8000-000000000000")).resolves.toBeNull();
  });
});
