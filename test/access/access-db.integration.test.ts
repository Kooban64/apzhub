import { describe, expect, it } from "vitest";

import { buildAdminAccessDataFromDb } from "@/lib/access/materialize-admin-access";
import { replaceBundleAssignmentsForSubject } from "@/lib/access/repository/access-repository";
import { getDb } from "@/db/client";

const hasDb = Boolean((process.env.APZHUB_DATABASE_URL ?? process.env.DATABASE_URL ?? "").trim());

describe.skipIf(!hasDb)("Postgres access materialization", () => {
  it("read-your-writes: bundle assignments visible inside the same transaction", async () => {
    await expect(
      getDb().transaction(async (tx) => {
        await replaceBundleAssignmentsForSubject("u-1002", ["b-core"], tx);
        const data = await buildAdminAccessDataFromDb(tx);
        expect(data.userAccessByUserId["u-1002"]?.bundleAssignments.map((b) => b.bundleId)).toEqual(["b-core"]);
        throw new Error("intentional rollback");
      }),
    ).rejects.toThrow(/intentional rollback/);
  });
});
