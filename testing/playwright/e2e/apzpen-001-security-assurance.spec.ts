/**
 * APZPEN foundation smoke — API lifecycle + authenticated shell.
 * Uses demo Superadmin when available; otherwise signs in as DEV and
 * validates API entitlement path soft-fails closed or succeeds.
 */
import { expect, test, type Page } from "@playwright/test";

import { DEV_EMAIL, DEV_PASSWORD, signInDevUser } from "./auth-helpers";

const SUPER_EMAIL = "super@apzhub.local";
const SUPER_PASSWORD = "DemoPassword123!";

async function trySignIn(
  page: Page,
  email: string,
  password: string,
): Promise<boolean> {
  const origin =
    process.env.PLAYWRIGHT_BASE_URL ??
    `http://localhost:${process.env.PLAYWRIGHT_WEB_PORT ?? "3300"}`;
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: { email, password },
    headers: {
      origin,
      referer: `${origin}/login`,
    },
  });
  return response.ok();
}

async function ensureApzpenSession(page: Page): Promise<boolean> {
  const asSuper = await trySignIn(page, SUPER_EMAIL, SUPER_PASSWORD);
  if (!asSuper) {
    await signInDevUser(page);
  }
  return true;
}

test.describe("APZPEN security assurance", () => {
  test("engagement lifecycle via API + /apzpen shell", async ({ page }) => {
    await ensureApzpenSession(page);

    const create = await page.request.post("/api/v1/apzpen/engagements", {
      data: {
        customerName: "E2E Customer",
        applicationName: "E2E App",
        title: `E2E Engagement ${Date.now()}`,
        environment: "staging",
        scheduleMode: "on_demand",
      },
    });

    // Soft bootstrap may allow any authenticated user; 401/403 means auth gap.
    if (create.status() === 401 || create.status() === 403) {
      test.skip(
        true,
        "APZPEN API not authorised for this credential in this environment",
      );
      return;
    }

    expect(create.ok()).toBeTruthy();
    const createdBody = (await create.json()) as {
      data: { engagement: { engagementId: string } };
    };
    const engagementId = createdBody.data.engagement.engagementId;

    const scope = await page.request.post(
      `/api/v1/apzpen/engagements/${engagementId}`,
      {
        data: {
          action: "add_scope",
          kind: "web_application",
          label: "Portal",
          identifier: "https://staging.e2e.test",
          environment: "staging",
        },
      },
    );
    expect(scope.ok()).toBeTruthy();

    const bind = await page.request.post(`/api/v1/apzpen/engagements/${engagementId}`, {
      data: {
        action: "bind_source",
        source: {
          providerId: "github",
          externalRef: "e2e-org/e2e-app",
          mode: "granted_read",
        },
      },
    });
    expect(bind.ok()).toBeTruthy();
    const bindBody = (await bind.json()) as {
      data: {
        engagement: {
          scope: Array<{ kind: string; identifier: string }>;
        };
      };
    };
    expect(
      bindBody.data.engagement.scope.some(
        (s) => s.kind === "repository" && s.identifier === "e2e-org/e2e-app",
      ),
    ).toBeTruthy();

    const roe = await page.request.post(`/api/v1/apzpen/engagements/${engagementId}`, {
      data: { action: "approve_roe" },
    });
    expect(roe.ok()).toBeTruthy();

    const start = await page.request.post(
      `/api/v1/apzpen/engagements/${engagementId}`,
      { data: { action: "start_testing" } },
    );
    expect(start.ok()).toBeTruthy();

    const ingest = await page.request.post(
      `/api/v1/apzpen/engagements/${engagementId}/ingest`,
      {
        data: {
          format: "zap",
          payload: {
            alerts: [
              {
                name: "E2E Missing CSP",
                riskdesc: "Medium",
                desc: "CSP missing",
                solution: "Add CSP",
              },
            ],
          },
        },
      },
    );
    expect(ingest.ok()).toBeTruthy();
    const ingestBody = (await ingest.json()) as {
      data: { createdCount: number; findings?: Array<{ findingId: string }> };
    };
    expect(ingestBody.data.createdCount).toBeGreaterThanOrEqual(1);

    const findingsList = await page.request.get("/api/v1/apzpen/findings");
    expect(findingsList.ok()).toBeTruthy();
    const findingsBody = (await findingsList.json()) as {
      data: {
        findings: Array<{
          findingId: string;
          engagementId: string;
          title: string;
          status: string;
        }>;
      };
    };
    const finding = findingsBody.data.findings.find(
      (f) => f.engagementId === engagementId && f.title.includes("E2E Missing CSP"),
    );
    expect(finding).toBeTruthy();
    const findingId = finding!.findingId;

    const remediate = await page.request.post("/api/v1/apzpen/findings", {
      data: {
        action: "update_status",
        findingId,
        status: "remediating",
      },
    });
    expect(remediate.ok()).toBeTruthy();

    const assign = await page.request.post("/api/v1/apzpen/findings", {
      data: {
        action: "assign",
        findingId,
        assignedTo: "dev@e2e.test",
      },
    });
    expect(assign.ok()).toBeTruthy();

    const evidence = await page.request.post("/api/v1/apzpen/findings", {
      data: {
        action: "add_evidence",
        findingId,
        kind: "note",
        label: "E2E proof",
        ref: "https://e2e.test/evidence/1",
      },
    });
    expect(evidence.ok()).toBeTruthy();

    const retest = await page.request.post("/api/v1/apzpen/findings", {
      data: { action: "request_retest", findingId },
    });
    expect(retest.ok()).toBeTruthy();

    const schedule = await page.request.post(
      `/api/v1/apzpen/engagements/${engagementId}`,
      {
        data: {
          action: "set_schedule",
          scheduleMode: "frequent",
          nextRunAt: "2026-09-01T09:00:00.000Z",
        },
      },
    );
    expect(schedule.ok()).toBeTruthy();

    const sync = await page.request.post(`/api/v1/apzpen/engagements/${engagementId}`, {
      data: { action: "sync_assessment" },
    });
    expect(sync.ok()).toBeTruthy();

    const dry = await page.request.post(
      `/api/v1/apzpen/engagements/${engagementId}/dispatch`,
      {
        data: {
          tool: "zap",
          dryRun: true,
          target: "https://staging.e2e.test",
        },
      },
    );
    // Dry-run may fail if docker/compose missing — accept 201 or domain validation.
    if (dry.status() !== 401 && dry.status() !== 403) {
      expect([200, 201, 400, 409]).toContain(dry.status());
    }

    const grant = await page.request.post("/api/v1/apzpen/grants", {
      data: {
        engagementId,
        customerEmail: "customer@e2e.test",
        label: "E2E portal",
      },
    });
    expect(grant.ok()).toBeTruthy();
    const grantBody = (await grant.json()) as {
      data: { token: string; portalPath: string; grant: { grantId: string } };
    };
    expect(grantBody.data.token.length).toBeGreaterThan(8);
    expect(grantBody.data.portalPath).toContain("/portal?token=");

    await page.goto(`/apzpen/engagements/${engagementId}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("APZHUB")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Rules of Engagement")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("E2E Missing CSP")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("apzpen-dispatch-target")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("apzpen-sync-assessment")).toBeVisible();

    await page.goto(`/apzpen/findings/${findingId}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("E2E Missing CSP")).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/apzpen", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Work queues")).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/apzpen/remediation", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Remediation" })).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/apzpen/my-work", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "My Work" })).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/apzpen/retests", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Retests" })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("E2E Missing CSP")).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/apzpen/evidence", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Evidence" })).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/apzpen/certification", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Certification" })).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/apzpen/intelligence", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Security intelligence" }),
    ).toBeVisible({ timeout: 20_000 });

    await page.goto(grantBody.data.portalPath, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Security assurance status")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("E2E Missing CSP")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("E2E proof")).toBeVisible();

    const revoke = await page.request.post("/api/v1/apzpen/grants", {
      data: {
        action: "revoke",
        grantId: grantBody.data.grant.grantId,
      },
    });
    expect(revoke.ok()).toBeTruthy();

    void DEV_EMAIL;
    void DEV_PASSWORD;
  });
});
