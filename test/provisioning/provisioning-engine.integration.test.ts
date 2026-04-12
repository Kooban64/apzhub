import { describe, expect, it } from "vitest";

const hasDb = Boolean((process.env.APZHUB_DATABASE_URL ?? process.env.DATABASE_URL)?.trim());

describe.skipIf(!hasDb)("provisioning engine (Postgres)", () => {
  it("lists jobs via service without throwing", async () => {
    const { listProvisioningJobsForAdmin } = await import("@/lib/provisioning/service/provisioning-service");
    await expect(listProvisioningJobsForAdmin()).resolves.toEqual(expect.any(Array));
  });
});
