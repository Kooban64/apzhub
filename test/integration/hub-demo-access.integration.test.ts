/** @vitest-environment node */
import { describe, expect, it, vi } from "vitest";

import { buildAdminAccessDataFromDb } from "@/lib/access/materialize-admin-access";
import { applyHubDemoAccessForSubject } from "@/lib/dev/apply-hub-demo-access";
import { getDb } from "@/db/client";
import { userCredentials, users } from "@/db/schema";
import type { SessionSnapshot } from "@/lib/auth/session-types";
import { directorySubjectIdForSession, readMatrixPostureFromModel } from "@/lib/launch/workspace-launch-bridge";
import { resolveLaunchDecision } from "@/lib/launch/resolve-launch-decision";
import { defaultWorkspaceConfig } from "@/lib/workspace/workspace-config";
import { effectiveLauncherVisibleForSubject } from "@/lib/workspace/launcher-semantics";
import argon2 from "argon2";
const hasDb = Boolean((process.env.APZHUB_DATABASE_URL ?? process.env.DATABASE_URL ?? "").trim());

describe.skipIf(!hasDb)("hub demo access (Postgres)", () => {
  it("materializes non-none roles for every catalog service after applyHubDemoAccessForSubject", async () => {
    await expect(
      getDb().transaction(async (tx) => {
        const email = `integration-hub-${crypto.randomUUID()}@example.com`;
        const norm = email.toLowerCase();
        const hash = await argon2.hash("TestPassword-Hub-12!", { type: argon2.argon2id });
        const [row] = await tx
          .insert(users)
          .values({
            email,
            emailNormalized: norm,
            displayName: "Hub integration",
            status: "active",
            platformRole: "user",
            emailVerifiedAt: new Date(),
          })
          .returning({ id: users.id });
        if (!row) {
          throw new Error("no user");
        }
        await tx.insert(userCredentials).values({ userId: row.id, passwordHash: hash });
        await applyHubDemoAccessForSubject(row.id, tx);

        const data = await buildAdminAccessDataFromDb(tx);
        const detail = data.userAccessByUserId[row.id];
        expect(detail, "user in directory").toBeTruthy();
        const serviceIds = data.services.services.map((s) => s.id);
        expect(serviceIds.length).toBeGreaterThanOrEqual(10);

        for (const serviceId of serviceIds) {
          const line = detail!.serviceAccess.find((s) => s.serviceId === serviceId);
          expect(line, `line ${serviceId}`).toBeTruthy();
          expect(line!.effectiveRole.toLowerCase()).not.toBe("none");
        }

        vi.stubEnv("APZHUB_ACCESS_OPTIMISTIC_REALIZATION", "true");
        const optimistic = await buildAdminAccessDataFromDb(tx);
        vi.unstubAllEnvs();
        const mailCell = optimistic.matrix.cells.find((c) => c.userId === row.id && c.serviceId === "mail");
        expect(mailCell?.realizationStatus).toBe("provisioned");

        const snap: SessionSnapshot = {
          sessionStatus: "active",
          user: {
            id: row.id,
            email,
            displayName: "Hub integration",
            status: "active",
          },
          platformRole: "user",
          availableModes: ["workspace"],
          defaultLandingMode: "workspace",
          defaultLandingPath: "/workspace",
          linkedAccounts: { google: "not_linked" },
        };
        const dir = directorySubjectIdForSession(snap);
        expect(dir).toBe(row.id);
        const posture = readMatrixPostureFromModel(optimistic, row.id, "plane");
        expect(posture.effectiveRole.toLowerCase()).not.toBe("none");

        const cfg = defaultWorkspaceConfig;
        for (const serviceId of cfg.allowedServices) {
          const cell = optimistic.matrix.cells.find((c) => c.userId === row.id && c.serviceId === serviceId);
          expect(cell?.realizationStatus).toBe("provisioned");
          const tenantAllows = cfg.allowedServices.includes(serviceId);
          const visible = effectiveLauncherVisibleForSubject(cfg, detail!.platformRole).includes(serviceId);
          const decision = resolveLaunchDecision({
            serviceId,
            tenantAllowsService: tenantAllows,
            launcherShowsService: visible,
            effectiveRole: cell?.effectiveRole ?? "none",
            realization: cell?.realizationStatus ?? null,
          });
          if (tenantAllows && visible) {
            expect(decision.allowed, `launch ${serviceId}`).toBe(true);
          }
        }

        throw new Error("intentional rollback");
      }),
    ).rejects.toThrow(/intentional rollback/);
  });
});
