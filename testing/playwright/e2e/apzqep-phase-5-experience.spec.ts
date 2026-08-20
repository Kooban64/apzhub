import { expect, test, type APIResponse, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/apzqep-redesign/evidence/phase-5";

async function apiPost(
  page: Page,
  url: string,
  data: Record<string, unknown>,
  timeout = 30_000,
): Promise<APIResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await page.request.post(url, { data, timeout });
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(2_000);
    }
  }
  throw lastError;
}

async function apiGet(page: Page, url: string, timeout = 30_000): Promise<APIResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await page.request.get(url, { timeout });
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(2_000);
    }
  }
  throw lastError;
}

async function loginAs(page: Page, persona: string): Promise<void> {
  let credRes = await apiPost(
    page,
    "/api/v1/demo/quick-login",
    { id: persona },
    60_000,
  );
  for (let attempt = 0; attempt < 20 && !credRes.ok(); attempt += 1) {
    await page.waitForTimeout(2_000);
    credRes = await apiPost(page, "/api/v1/demo/quick-login", { id: persona }, 60_000);
  }
  expect(credRes.ok(), `quick-login ${persona}: ${credRes.status()}`).toBeTruthy();
  const credBody = (await credRes.json()) as {
    data?: { email?: string; password?: string };
  };
  const signIn = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: credBody.data!.email,
      password: credBody.data!.password,
    },
    headers: {
      Origin: ORIGIN,
      Referer: `${ORIGIN}/login`,
    },
    timeout: 30_000,
  });
  expect(signIn.ok(), `sign-in ${persona}: ${signIn.status()}`).toBeTruthy();
}

async function shot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(path.resolve(EVIDENCE), { recursive: true });
  await page.screenshot({ path: `${EVIDENCE}/${name}`, fullPage: true });
}

async function setColorScheme(page: Page, scheme: "light" | "dark"): Promise<void> {
  await page.evaluate((value) => {
    const root = document.documentElement;
    root.classList.toggle("dark", value === "dark");
    root.style.colorScheme = value;
  }, scheme);
  await page.waitForTimeout(250);
}

async function persistApplication(page: Page, applicationId: string): Promise<void> {
  await page.evaluate((id) => {
    window.sessionStorage.setItem("apzqep.selectedApplicationId", id);
  }, applicationId);
}

async function selectApplication(page: Page, applicationId: string): Promise<void> {
  await persistApplication(page, applicationId);
  const appSelect = page.getByTestId("qep-application-selector").locator("select");
  await expect(appSelect).toBeAttached({ timeout: 90_000 });
  await appSelect.selectOption(applicationId, { force: true });
}

async function openQep(page: Page, pathName: string): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto(pathName, { waitUntil: "domcontentloaded", timeout: 90_000 });
    try {
      await expect(page.getByText("Checking product access…")).toBeHidden({
        timeout: 30_000,
      });
      await expect(page.getByText("Opening your workbench…")).toBeHidden({
        timeout: 90_000,
      });
      await expect(page.getByTestId("qep-application-selector")).toBeAttached({
        timeout: 90_000,
      });
      return;
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
}

async function createdId(
  res: APIResponse,
  pick: (body: Record<string, unknown>) => string | undefined,
): Promise<string> {
  const raw = await res.text();
  expect(res.ok(), raw).toBeTruthy();
  const parsed = JSON.parse(raw) as { data?: Record<string, unknown> };
  const id = pick((parsed.data ?? {}) as Record<string, unknown>);
  expect(id).toBeTruthy();
  return id!;
}

test.describe("APZQEP redesign Phase 5 — Exploratory & UI/UX verification", () => {
  test("two workflow roots, shared capture, isolation, derived matrix, and visual evidence", async ({
    page,
  }) => {
    test.setTimeout(600_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");
    await page.waitForTimeout(1000);

    const key = `P5${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const appRes = await apiPost(page, "/api/v1/qep/applications", {
      name: "Experience App",
      key,
      status: "active",
    });
    const applicationId = await createdId(
      appRes,
      (data) => (data.application as { id?: string } | undefined)?.id,
    );
    const otherApp = await apiPost(page, "/api/v1/qep/applications", {
      name: "Other Experience App",
      key: `${key}B`,
      status: "active",
    });
    const otherApplicationId = await createdId(
      otherApp,
      (data) => (data.application as { id?: string } | undefined)?.id,
    );
    const envRes = await apiPost(
      page,
      `/api/v1/qep/applications/${encodeURIComponent(applicationId)}/environments`,
      { name: "QA", category: "test" },
    );
    const environmentId = await createdId(
      envRes,
      (data) => (data.item as { id?: string } | undefined)?.id,
    );

    await apiGet(page, "/api/v1/qep/exploratory-sessions?applicationId=warmup", 60_000);

    const unbound = await apiPost(
      page,
      "/api/v1/qep/exploratory-sessions",
      {
        name: "Unbound",
        mission: "x",
        scope: "y",
      },
      60_000,
    );
    expect(unbound.status()).toBe(400);

    const sessionRes = await apiPost(
      page,
      "/api/v1/qep/exploratory-sessions",
      {
        applicationId,
        environmentId,
        name: "Checkout Flow Exploration",
        mission: "Explore checkout usability",
        scope: "Web checkout only",
        areas: ["Cart behaviour", "Address validation"],
      },
      60_000,
    );
    const sessionId = await createdId(
      sessionRes,
      (data) => (data.session as { id?: string } | undefined)?.id,
    );
    expect(sessionId.startsWith("qes_")).toBeTruthy();

    const otherList = await apiGet(
      page,
      `/api/v1/qep/exploratory-sessions?applicationId=${encodeURIComponent(otherApplicationId)}`,
    );
    expect(otherList.ok(), await otherList.text()).toBeTruthy();
    const otherBody = (await otherList.json()) as { data?: unknown[] };
    expect(otherBody.data ?? []).toHaveLength(0);

    const startRes = await apiPost(
      page,
      `/api/v1/qep/exploratory-sessions/${encodeURIComponent(sessionId)}/actions`,
      { action: "start" },
    );
    expect(startRes.ok(), await startRes.text()).toBeTruthy();

    const observationRes = await apiPost(page, "/api/v1/qep/quality-capture", {
      kind: "observation",
      hostKind: "exploratory_session",
      hostId: sessionId,
      title: "Cart icon unclear",
      body: "Icon looks like a bag",
    });
    expect(observationRes.ok(), await observationRes.text()).toBeTruthy();

    const issueRes = await apiPost(page, "/api/v1/qep/quality-capture", {
      kind: "issue",
      hostKind: "exploratory_session",
      hostId: sessionId,
      title: "Checkout confusion",
      body: "Users hesitate at payment",
    });
    const issueId = await createdId(
      issueRes,
      (data) => (data.issue as { id?: string } | undefined)?.id,
    );

    const noteRes = await apiPost(page, "/api/v1/qep/quality-capture", {
      kind: "note",
      hostKind: "exploratory_session",
      hostId: sessionId,
      body: "Retry on tablet later",
    });
    expect(noteRes.ok(), await noteRes.text()).toBeTruthy();

    const bytes = Buffer.from("checkout screenshot", "utf8");
    const captureRes = await apiPost(page, "/api/v1/qep/evidence", {
      projectId: applicationId,
      mediaType: "text/plain",
      contentBase64: bytes.toString("base64"),
      contentHash: createHash("sha256").update(bytes).digest("hex"),
      title: "Checkout screenshot",
    });
    const captured = (await captureRes.json()) as { data?: { id?: string } };
    expect(captureRes.ok(), JSON.stringify(captured)).toBeTruthy();
    const evidenceId = captured.data?.id;
    expect(evidenceId).toBeTruthy();
    const attachRes = await apiPost(page, "/api/v1/qep/quality-evidence", {
      evidenceId,
      targetKind: "exploratory_session",
      targetId: sessionId,
    });
    expect(attachRes.ok(), await attachRes.text()).toBeTruthy();

    const promoteRes = await apiPost(
      page,
      `/api/v1/qep/quality-issues/${encodeURIComponent(issueId)}/actions`,
      { action: "promote_defect" },
    );
    expect(promoteRes.ok(), await promoteRes.text()).toBeTruthy();
    const promoted = (await promoteRes.json()) as {
      data?: { defect?: { defectId?: string }; issue?: { status?: string } };
    };
    expect(promoted.data?.defect?.defectId).toBeTruthy();
    expect(promoted.data?.issue?.status).toBe("promoted");

    const planRes = await apiPost(page, "/api/v1/qep/experience-plans", {
      applicationId,
      environmentId,
      name: "Checkout UI/UX Review",
      mission: "Verify checkout experience",
      scope: "Web checkout",
      disciplines: ["functional_ux", "responsive"],
    });
    const planId = await createdId(
      planRes,
      (data) => (data.plan as { id?: string } | undefined)?.id,
    );
    expect(planId.startsWith("uxp_")).toBeTruthy();

    const ctxRes = await apiPost(
      page,
      `/api/v1/qep/experience-plans/${encodeURIComponent(planId)}/actions`,
      { action: "add_context", label: "Desktop 1920x1080", deviceClass: "desktop" },
    );
    expect(ctxRes.ok(), await ctxRes.text()).toBeTruthy();
    const ctx2 = await apiPost(
      page,
      `/api/v1/qep/experience-plans/${encodeURIComponent(planId)}/actions`,
      { action: "add_context", label: "Mobile 375x667", deviceClass: "mobile" },
    );
    expect(ctx2.ok(), await ctx2.text()).toBeTruthy();
    const criterionRes = await apiPost(
      page,
      `/api/v1/qep/experience-plans/${encodeURIComponent(planId)}/actions`,
      {
        action: "add_criterion",
        discipline: "functional_ux",
        statement: "Primary CTA remains visible",
      },
    );
    expect(criterionRes.ok(), await criterionRes.text()).toBeTruthy();
    const startActivity = await apiPost(
      page,
      `/api/v1/qep/experience-plans/${encodeURIComponent(planId)}/actions`,
      { action: "start" },
    );
    const activityId = await createdId(
      startActivity,
      (data) => (data.activity as { id?: string } | undefined)?.id,
    );
    expect(activityId.startsWith("qxa_")).toBeTruthy();

    const activityGet = await apiGet(
      page,
      `/api/v1/qep/experience-activities/${encodeURIComponent(activityId)}`,
    );
    const activityBody = (await activityGet.json()) as {
      data?: {
        activity?: {
          viewportMatrix?: readonly { status?: string }[];
          progress?: { percent?: number; total?: number };
          plan?: {
            criteria?: readonly { id?: string }[];
            contexts?: readonly { id?: string }[];
          };
          currentContextId?: string;
          history?: readonly { eventType?: string }[];
        };
      };
    };
    const activity = activityBody.data?.activity;
    expect(activity?.viewportMatrix?.length).toBe(2);
    expect(activity?.progress?.total).toBe(2);
    expect(
      activity?.history?.some((entry) => entry.eventType === "verification_started"),
    ).toBe(true);
    const criterionId = activity?.plan?.criteria?.[0]?.id;
    const contextId = activity?.currentContextId ?? activity?.plan?.contexts?.[0]?.id;
    expect(criterionId).toBeTruthy();
    expect(contextId).toBeTruthy();
    const resultRes = await apiPost(
      page,
      `/api/v1/qep/experience-activities/${encodeURIComponent(activityId)}/actions`,
      {
        action: "record_result",
        criterionId,
        contextId,
        state: "verified",
      },
    );
    expect(resultRes.ok(), await resultRes.text()).toBeTruthy();
    const afterResult = (await resultRes.json()) as {
      data?: {
        activity?: {
          progress?: { percent?: number };
          viewportMatrix?: readonly { status?: string }[];
        };
      };
    };
    expect(afterResult.data?.activity?.progress?.percent).toBeGreaterThan(0);
    expect(
      afterResult.data?.activity?.viewportMatrix?.some(
        (cell) => cell.status === "verified",
      ),
    ).toBe(true);

    const forbidden = await apiPost(
      page,
      `/api/v1/qep/experience-plans/${encodeURIComponent(planId)}/actions`,
      { action: "add_context", label: "Runner", deviceClass: "managed_runner" },
    );
    expect(forbidden.ok()).toBeFalsy();

    await openQep(page, "/workspace/qep/home");
    await selectApplication(page, applicationId);
    await openQep(page, "/workspace/qep/exploratory-sessions");
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-exploratory-sessions")).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByRole("heading", { name: "Exploratory Sessions" }),
    ).toBeVisible();
    await expect(page.getByTestId("qep-exploratory-table")).toBeVisible();
    await expect(page.getByTestId(`qep-session-row-${sessionId}`)).toBeVisible({
      timeout: 30_000,
    });
    const sidebar = page.getByTestId("workbench-context-sidebar");
    await expect(sidebar).toContainText("Exploratory Sessions");
    await expect(sidebar).toContainText("UI / UX Plans");
    await expect(sidebar).not.toContainText("User Stories");
    await shot(page, "01-exploratory-sessions-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "01-exploratory-sessions-desktop-dark.png");
    await setColorScheme(page, "light");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("qep-exploratory-cards")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("qep-exploratory-table")).toBeHidden();
    await shot(page, "01-exploratory-sessions-mobile-light.png");
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.locator(`[data-testid="qep-session-row-${sessionId}"]`).click();
    await expect(page.getByTestId("qep-exploratory-workspace")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("qep-exploratory-charter")).toContainText(
      "Cart behaviour",
    );
    await expect(page.getByTestId("qep-exploratory-activity")).toContainText(
      "session started",
    );
    await expect(page.getByTestId("qep-exploratory-progress")).toBeVisible();
    await expect(page.getByTestId("qep-exploratory-issues")).toContainText(
      "Checkout confusion",
    );
    await shot(page, "02-exploratory-workspace-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "02-exploratory-workspace-desktop-dark.png");
    await setColorScheme(page, "light");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("qep-exploratory-mobile-nav")).toBeVisible();
    await shot(page, "02-exploratory-workspace-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "02-exploratory-workspace-mobile-dark.png");
    await setColorScheme(page, "light");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByTestId("qep-capture-title").fill("Payment declined with test card");
    await page.getByTestId("qep-capture-body").fill("Error copy is unhelpful");
    const captureWait = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/v1/qep/quality-capture"),
      { timeout: 45_000 },
    );
    await page.getByTestId("qep-capture-issue").click();
    expect((await captureWait).ok()).toBeTruthy();
    await expect(page.getByTestId("qep-exploratory-issues")).toContainText(
      /Payment declined|Checkout confusion/,
    );

    await persistApplication(page, applicationId);
    await openQep(page, "/workspace/qep/ui-ux-plans");
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-experience-plans")).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByRole("heading", { name: "UI / UX Verification Plans" }),
    ).toBeVisible();
    await expect(page.getByTestId("qep-experience-table")).toBeVisible();
    await expect(page.getByTestId(`qep-plan-row-${planId}`)).toBeVisible({
      timeout: 30_000,
    });
    await shot(page, "03-ui-ux-plans-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "03-ui-ux-plans-desktop-dark.png");
    await setColorScheme(page, "light");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("qep-experience-cards")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("qep-experience-table")).toBeHidden();
    await shot(page, "03-ui-ux-plans-mobile-light.png");
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.locator(`[data-testid="qep-plan-row-${planId}"]`).click();
    await expect(page.getByTestId("qep-experience-workspace")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("qep-experience-pause")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("qep-experience-activity")).toContainText(
      "verification started",
    );
    await expect(page.getByTestId("qep-viewport-matrix")).toBeVisible();
    await expect(page.getByTestId("qep-viewport-matrix")).toContainText(
      /verified|partially verified/,
    );
    await expect(page.getByTestId("qep-experience-progress")).toBeVisible();
    await expect(page.getByTestId("qep-experience-progress")).not.toContainText(
      "0 of 0",
    );
    await shot(page, "04-ui-ux-workspace-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "04-ui-ux-workspace-desktop-dark.png");
    await setColorScheme(page, "light");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("qep-experience-mobile-nav")).toBeVisible();
    await shot(page, "04-ui-ux-workspace-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "04-ui-ux-workspace-mobile-dark.png");
  });
});
