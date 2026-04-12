import { describe, expect, it } from "vitest";

import { getDb } from "@/db/client";

import { insertLaunchEvent, listRecentLaunchEvents } from "@/lib/launch/repository/launch-events-repository";

const hasDb = Boolean((process.env.APZHUB_DATABASE_URL ?? process.env.DATABASE_URL ?? "").trim());

describe.skipIf(!hasDb)("launch_events Postgres persistence", () => {
  it("inserts and lists within a transaction (rolled back)", async () => {
    await expect(
      getDb().transaction(async (tx) => {
        await insertLaunchEvent(
          {
            userId: "00000000-0000-4000-8000-000000000099",
            serviceId: "mail",
            launchMethod: "jwt",
            readinessAtDecision: null,
            outcome: "succeeded",
            reasonCode: null,
            userMessage: "ok",
            operatorMessage: "op",
            correlationId: "cid-db-test",
            authSessionId: null,
          },
          tx,
        );
        const recent = await listRecentLaunchEvents({ limit: 50 }, tx);
        const found = recent.find((r) => r.correlationId === "cid-db-test");
        expect(found?.outcome).toBe("succeeded");
        expect(found?.userMessage).toBe("ok");
        throw new Error("intentional rollback");
      }),
    ).rejects.toThrow(/intentional rollback/);
  });
});
