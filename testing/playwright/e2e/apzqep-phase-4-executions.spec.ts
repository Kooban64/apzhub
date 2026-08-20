import { expect, test, type APIResponse, type Page } from "@playwright/test";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/apzqep-redesign/evidence/phase-4";

async function apiPost(
  page: Page,
  url: string,
  data: Record<string, unknown>,
  timeout = 30_000,
  headers?: Record<string, string>,
): Promise<APIResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await page.request.post(url, {
        data,
        timeout,
        ...(headers ? { headers } : {}),
      });
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(2_000);
    }
  }
  throw lastError;
}

async function apiPatch(
  page: Page,
  url: string,
  data: Record<string, unknown>,
  timeout = 30_000,
): Promise<APIResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await page.request.patch(url, { data, timeout });
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
  const signIn = await apiPost(
    page,
    "/api/auth/sign-in/email",
    {
      email: credBody.data!.email,
      password: credBody.data!.password,
    },
    30_000,
    {
      Origin: ORIGIN,
      Referer: `${ORIGIN}/login`,
    },
  );
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

async function openQep(page: Page, pathName: string): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto(pathName, { waitUntil: "domcontentloaded", timeout: 90_000 });
    try {
      await expect(page.getByText("Opening your workbench…")).toBeHidden({
        timeout: 90_000,
      });
      return;
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
}

async function openExecutionDetail(page: Page, executionId: string): Promise<void> {
  await page.locator(`[data-testid="qep-execution-row-${executionId}"]`).click();
  await page.waitForURL(new RegExp(`/test-execution/executions/${executionId}`), {
    timeout: 30_000,
  });
  await expect(page.getByText("Opening your workbench…")).toBeHidden({
    timeout: 90_000,
  });
}

async function selectApplication(page: Page, applicationId: string): Promise<void> {
  const appSelect = page.getByTestId("qep-application-selector").locator("select");
  await expect(appSelect).toBeAttached({ timeout: 90_000 });
  await appSelect.selectOption(applicationId, { force: true });
}

async function sessionUserId(page: Page): Promise<string> {
  const sessionRes = await apiGet(page, "/api/auth/get-session", 30_000);
  const raw = await sessionRes.text();
  expect(sessionRes.ok(), raw).toBeTruthy();
  const session = JSON.parse(raw) as { user?: { id?: string } };
  expect(session.user?.id).toBeTruthy();
  return session.user!.id!;
}

async function readJson<T>(res: APIResponse): Promise<T> {
  const raw = await res.text();
  expect(res.ok(), raw).toBeTruthy();
  return JSON.parse(raw) as T;
}

async function createdId(
  res: APIResponse,
  pick: (body: Record<string, unknown>) => string | undefined,
): Promise<string> {
  const parsed = await readJson<{ data?: Record<string, unknown> }>(res);
  const id = pick((parsed.data ?? {}) as Record<string, unknown>);
  expect(id).toBeTruthy();
  return id!;
}

async function waitStepWrite(page: Page, executionId: string, order: number) {
  return page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response
        .url()
        .includes(
          `/api/v1/qep/executions/${encodeURIComponent(executionId)}/steps/${order}/results`,
        ),
    { timeout: 45_000 },
  );
}

test.describe("APZQEP redesign Phase 4 — Executions", () => {
  test("manual write path, evidence, result, rerun, and retest", async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");
    const userId = await sessionUserId(page);

    const key = `EX${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const appRes = await apiPost(page, "/api/v1/qep/applications", {
      name: "Execution App",
      key,
      status: "active",
    });
    const applicationId = await createdId(
      appRes,
      (data) => (data.application as { id?: string } | undefined)?.id,
    );

    const otherApp = await apiPost(page, "/api/v1/qep/applications", {
      name: "Other App",
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

    const targetRes = await apiPost(
      page,
      `/api/v1/qep/applications/${encodeURIComponent(applicationId)}/execution-targets`,
      { name: "Managed runner", targetType: "managed_runner" },
    );
    const targetId = await createdId(
      targetRes,
      (data) => (data.item as { id?: string } | undefined)?.id,
    );

    const caseRes = await apiPost(page, "/api/v1/qep/test-cases", {
      applicationId,
      title: "Login with valid credentials",
      steps: [
        {
          order: 1,
          action: "Open /login",
          testDataRef: "sku:DEMO",
          expectedResult: "Login form is visible",
        },
        {
          order: 2,
          action: "Submit valid credentials",
          expectedResult: "Home workspace is shown",
        },
      ],
    });
    const testCaseId = await createdId(
      caseRes,
      (data) => (data.testCase as { id?: string } | undefined)?.id,
    );

    const otherCase = await apiPost(page, "/api/v1/qep/test-cases", {
      applicationId: otherApplicationId,
      title: "Other app case",
      steps: [{ order: 1, action: "Other", expectedResult: "Other" }],
    });
    const otherCaseId = await createdId(
      otherCase,
      (data) => (data.testCase as { id?: string } | undefined)?.id,
    );

    const planRes = await apiPost(page, "/api/v1/qep/test-plans", {
      applicationId,
      title: "Sprint regression",
      objective: "Cover login",
    });
    const planId = await createdId(
      planRes,
      (data) => (data.plan as { id?: string } | undefined)?.id,
    );

    const memberRes = await apiPost(
      page,
      `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/members`,
      { specificationId: testCaseId },
    );
    expect(memberRes.ok(), await memberRes.text()).toBeTruthy();

    const cross = await apiPost(
      page,
      `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/members`,
      { specificationId: otherCaseId },
    );
    expect(cross.ok()).toBeFalsy();
    await cross.text().catch(() => undefined);

    const strategyRes = await apiPost(
      page,
      `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/strategy`,
      {
        name: "QA browsers",
        verificationCapability: "manual_verification",
        executionSurface: "manual",
        environmentId,
        infrastructureTargetId: targetId,
        infrastructureTargetType: "managed_runner",
      },
    );
    expect(strategyRes.ok(), await strategyRes.text()).toBeTruthy();

    const startRes = await apiPost(
      page,
      `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/start-execution`,
      {},
      60_000,
    );
    const started = await readJson<{
      data?: { executions?: readonly { id?: string; status?: string }[] };
    }>(startRes);
    const executionId = started.data?.executions?.[0]?.id;
    expect(executionId).toBeTruthy();
    expect(started.data?.executions?.[0]?.status).not.toBe("not_run");

    await apiGet(
      page,
      `/api/v1/qep/executions/${encodeURIComponent(executionId!)}/steps/1/results`,
    );
    await apiGet(
      page,
      `/api/v1/qep/executions/${encodeURIComponent(executionId!)}/retest`,
    );

    const listed = await apiGet(
      page,
      `/api/v1/qep/presented-executions?applicationId=${encodeURIComponent(applicationId)}`,
    );
    const listedBody = await readJson<{
      data?: readonly {
        id?: string;
        status?: string;
        result?: string;
        applicationId?: string;
      }[];
    }>(listed);
    const row = listedBody.data?.find((item) => item.id === executionId);
    expect(row?.status).toBe("in_progress");
    expect(row?.result).toBe("not_run");
    expect(row?.applicationId).toBe(applicationId);

    const otherList = await apiGet(
      page,
      `/api/v1/qep/presented-executions?applicationId=${encodeURIComponent(otherApplicationId)}`,
    );
    const otherBody = await readJson<{ data?: readonly { id?: string }[] }>(otherList);
    expect(otherBody.data?.some((item) => item.id === executionId)).toBeFalsy();

    await apiPatch(page, `/api/v1/qep/test-cases/${encodeURIComponent(testCaseId)}`, {
      steps: [
        {
          order: 1,
          action: "Changed after execution",
          expectedResult: "Must not appear",
        },
      ],
    });

    await openQep(page, "/workspace/qep/test-execution");
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-executions")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("qep-execution-table")).toContainText("In Progress", {
      timeout: 30_000,
    });
    await expect(page.getByTestId("qep-execution-result").first()).toContainText(
      "Not Run",
    );
    await shot(page, "01-executions-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "02-executions-desktop-dark.png");
    await setColorScheme(page, "light");

    await openExecutionDetail(page, executionId!);
    await expect(page.getByTestId("qep-manual-execution")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("qep-engine-present")).toBeAttached({
      timeout: 30_000,
    });
    await expect(page.getByTestId("qep-step-action")).toContainText("Open /login");
    await expect(page.getByTestId("qep-step-expected")).toContainText(
      "Login form is visible",
    );
    await expect(page.getByTestId("qep-step-testdata")).toContainText("sku:DEMO");
    await shot(page, "03-manual-desktop.png");

    await page.getByTestId("qep-manual-step-1").click();
    await page.getByTestId("qep-step-actual").fill("Login form opened");
    await page.getByTestId("qep-step-outcome").selectOption("passed");
    await shot(page, "04-manual-active-step.png");

    const saveWait = waitStepWrite(page, executionId!, 1);
    await page.getByTestId("qep-step-save").click();
    const saveRes = await saveWait;
    expect(saveRes.ok(), await saveRes.text()).toBeTruthy();
    await expect(page.getByTestId("qep-step-actual-persisted")).toHaveText(
      "Login form opened",
      {
        timeout: 15_000,
      },
    );
    await expect(page.getByTestId("qep-manual-step-1-outcome")).toContainText("Pass");
    await page.getByTestId("qep-manual-step-2").click();
    await page.getByTestId("qep-manual-step-1").click();
    await expect(page.getByTestId("qep-step-actual-persisted")).toHaveText(
      "Login form opened",
    );
    await expect(page.getByTestId("qep-manual-current-step")).toHaveText("1");

    const saveNextWait = waitStepWrite(page, executionId!, 1);
    await page.getByTestId("qep-step-save-next").click();
    const saveNextRes = await saveNextWait;
    expect(saveNextRes.ok(), await saveNextRes.text()).toBeTruthy();
    await expect(page.getByTestId("qep-manual-current-step")).toHaveText("2", {
      timeout: 15_000,
    });
    await expect(page.getByTestId("qep-manual-step-1-outcome")).toContainText("Pass");

    await page.getByTestId("qep-step-actual").fill("Home shown");
    await page.getByTestId("qep-step-outcome").selectOption("failed");
    const saveTwoWait = waitStepWrite(page, executionId!, 2);
    await page.getByTestId("qep-step-save").click();
    expect((await saveTwoWait).ok()).toBeTruthy();
    await expect(page.getByTestId("qep-step-actual-persisted")).toHaveText(
      "Home shown",
      {
        timeout: 15_000,
      },
    );

    await page.getByTestId("qep-evidence-uri").fill("evidence://login-form.png");
    await shot(page, "05-manual-evidence.png");
    await page.getByTestId("qep-evidence-attach").click();
    await expect(page.getByTestId("qep-step-error")).toContainText(/not accessible/i, {
      timeout: 20_000,
    });

    const bytes = Buffer.from("login form screenshot", "utf8");
    const captureRes = await apiPost(
      page,
      "/api/v1/qep/evidence",
      {
        projectId: applicationId,
        mediaType: "text/plain",
        contentBase64: bytes.toString("base64"),
        contentHash: createHash("sha256").update(bytes).digest("hex"),
        title: "Login form",
      },
      60_000,
    );
    const captured = await readJson<{ data?: { id?: string } }>(captureRes);
    const evidenceId = captured.data?.id;
    expect(evidenceId).toBeTruthy();
    const evidenceUri = `apz-evidence:${evidenceId}`;
    await page.getByTestId("qep-evidence-uri").fill(evidenceUri);
    const attachWait = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response
          .url()
          .includes(
            `/api/v1/qep/executions/${encodeURIComponent(executionId!)}/evidence-references`,
          ),
      { timeout: 45_000 },
    );
    await page.getByTestId("qep-evidence-attach").click();
    expect((await attachWait).ok()).toBeTruthy();
    await expect(page.getByTestId("qep-step-evidence-list")).toContainText(
      evidenceUri,
      {
        timeout: 15_000,
      },
    );
    await page.getByTestId("qep-manual-step-1").click();
    await page.getByTestId("qep-manual-step-2").click();
    await expect(page.getByTestId("qep-step-evidence-list")).toContainText(evidenceUri);

    await page.getByTestId("qep-defect-title").fill("Login failed in QA");
    await page.getByTestId("qep-defect-confirm").check();
    await shot(page, "06-manual-defect.png");
    const defectWait = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/v1/qep/defects") &&
        !response.url().includes("/lifecycle"),
      { timeout: 45_000 },
    );
    await page.getByTestId("qep-defect-create").click();
    expect((await defectWait).ok()).toBeTruthy();

    await page.setViewportSize({ width: 390, height: 844 });
    await shot(page, "07-manual-mobile.png");
    await page.setViewportSize({ width: 1440, height: 900 });

    await expect(page.getByTestId("qep-execution-complete")).toBeVisible({
      timeout: 20_000,
    });
    const completeWait = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response
          .url()
          .includes(
            `/api/v1/qep/executions/${encodeURIComponent(executionId!)}/actions/complete`,
          ),
      { timeout: 45_000 },
    );
    await page.getByTestId("qep-execution-complete").click();
    expect((await completeWait).ok()).toBeTruthy();
    await expect(page.getByTestId("qep-execution-result")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("qep-manual-execution")).toHaveCount(0);

    await page.getByTestId("qep-result-tab-summary").click();
    await shot(page, "08-result-summary.png");
    await page.getByTestId("qep-result-tab-steps").click();
    await expect(page.getByTestId("qep-result-steps")).toContainText("Open /login");
    await expect(page.getByTestId("qep-result-steps")).not.toContainText(
      "Changed after execution",
    );
    await expect(page.getByTestId("qep-result-steps")).toContainText(
      "Login form opened",
    );
    await shot(page, "09-result-steps.png");
    await page.getByTestId("qep-result-tab-evidence").click();
    await expect(page.getByTestId("qep-result-evidence")).toContainText(evidenceUri);
    await shot(page, "10-result-evidence.png");
    await page.getByTestId("qep-result-tab-defect").click();
    await shot(page, "11-result-defect.png");
    await page.getByTestId("qep-result-tab-history").click();
    await expect(page.getByTestId("qep-result-history")).toContainText(
      "recordStepResult",
    );
    await expect(page.getByTestId("qep-result-history")).toContainText("complete");
    await shot(page, "12-result-history.png");
    await page.setViewportSize({ width: 390, height: 844 });
    await shot(page, "14-result-mobile.png");
    await page.setViewportSize({ width: 1440, height: 900 });

    const rerunStarted = Date.now();
    const rerunRes = await apiPost(
      page,
      `/api/v1/qep/executions/${encodeURIComponent(executionId!)}/rerun`,
      {},
      45_000,
    );
    const rerunBody = await readJson<{ data?: { execution?: { id?: string } } }>(
      rerunRes,
    );
    const rerunId = rerunBody.data?.execution?.id;
    expect(rerunId).toBeTruthy();
    expect(rerunId).not.toBe(executionId);
    fs.writeFileSync(
      path.resolve(EVIDENCE, "rerun-timing.txt"),
      `rerun_ms=${Date.now() - rerunStarted}\n`,
    );

    const investigation = await apiGet(
      page,
      `/api/v1/qep/executions/${encodeURIComponent(executionId!)}/investigation`,
    );
    const invBody = await readJson<{
      data?: {
        presented?: { result?: string; status?: string };
        defects?: readonly { defect?: { defectId?: string; status?: string } }[];
        testExecution?: { outcome?: string | null };
      };
    }>(investigation);
    expect(invBody.data?.presented?.result).toBe("fail");
    const defectId = invBody.data?.defects?.[0]?.defect?.defectId;
    expect(defectId).toBeTruthy();

    const life = async (status: string) => {
      const res = await apiPost(
        page,
        `/api/v1/qep/defects/${encodeURIComponent(defectId!)}/lifecycle`,
        { status },
      );
      expect(res.ok(), `${status}: ${await res.text()}`).toBeTruthy();
    };
    await life("triaged");
    const assignRes = await apiPost(
      page,
      `/api/v1/qep/defects/${encodeURIComponent(defectId!)}/assign`,
      {
        assigneeId: userId,
      },
    );
    expect(assignRes.ok(), await assignRes.text()).toBeTruthy();
    await life("in_progress");
    await life("fixed");
    await life("ready_for_retest");

    await page.getByTestId("qep-result-tab-defect").click();
    const retestStarted = Date.now();
    const retestWait = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response
          .url()
          .includes(
            `/api/v1/qep/executions/${encodeURIComponent(executionId!)}/retest`,
          ),
      { timeout: 45_000 },
    );
    await page.getByTestId("qep-retest-create").click();
    const retestRes = await retestWait;
    const retestMs = Date.now() - retestStarted;
    const retestRaw = await retestRes.text();
    fs.writeFileSync(
      path.resolve(EVIDENCE, "retest-timing.txt"),
      `classification=${retestMs > 20_000 ? "HTTP/ROUTE_OR_APPLICATION" : "NOT_HANG"}\nretest_ms=${retestMs}\n`,
    );
    expect(retestRes.ok(), retestRaw).toBeTruthy();
    const retestBody = JSON.parse(retestRaw) as {
      data?: { execution?: { id?: string }; originalOutcome?: string | null };
    };
    const retestId = retestBody.data?.execution?.id;
    expect(retestId).toBeTruthy();
    expect(retestId).not.toBe(executionId);
    expect(retestBody.data?.originalOutcome).toBe("failed");

    const retestInv = await apiGet(
      page,
      `/api/v1/qep/executions/${encodeURIComponent(retestId!)}/investigation`,
    );
    const retestInvBody = await readJson<{
      data?: {
        relation?: {
          relationKind?: string;
          previousExecutionId?: string;
          triggeringDefectId?: string;
        };
        presented?: { applicationId?: string; specificationId?: string };
        testExecution?: { outcome?: string | null; status?: string };
      };
    }>(retestInv);
    expect(retestInvBody.data?.relation?.relationKind).toBe("retest");
    expect(retestInvBody.data?.relation?.previousExecutionId).toBe(executionId);
    expect(retestInvBody.data?.relation?.triggeringDefectId).toBe(defectId);
    expect(retestInvBody.data?.presented?.applicationId).toBe(applicationId);
    expect(retestInvBody.data?.presented?.specificationId).toBe(testCaseId);
    expect(retestInvBody.data?.testExecution?.outcome).not.toBe("failed");

    const originalAfter = await apiGet(
      page,
      `/api/v1/qep/executions/${encodeURIComponent(executionId!)}/investigation`,
    );
    const originalAfterBody = await readJson<{
      data?: {
        presented?: { result?: string };
        testExecution?: { outcome?: string | null };
        linkedRecords?: { retest?: string[]; rerun?: string[] };
        defects?: readonly { defect?: { status?: string } }[];
      };
    }>(originalAfter);
    expect(originalAfterBody.data?.testExecution?.outcome).toBe("failed");
    expect(originalAfterBody.data?.linkedRecords?.retest).toContain(retestId);
    expect(originalAfterBody.data?.linkedRecords?.rerun).toContain(rerunId);
    expect(originalAfterBody.data?.defects?.[0]?.defect?.status).toBe(
      "ready_for_retest",
    );

    await expect(page.getByTestId("qep-execution-result")).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId("qep-result-tab-linked").click();
    await expect(page.getByTestId("qep-result-linked")).toContainText(retestId!);
    await expect(page.getByTestId("qep-result-linked")).toContainText(testCaseId);
    await shot(page, "19-result-linked.png");

    await page.getByTestId("qep-execution-back").click();
    await expect(page.getByTestId("qep-executions")).toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator(`[data-testid="qep-execution-row-${retestId}"]`),
    ).toBeVisible({
      timeout: 20_000,
    });
    await shot(page, "20-retest-list.png");
    await shot(page, "20-retest-list.png");

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("qep-execution-mobile-list")).toBeVisible({
      timeout: 45_000,
    });
    await shot(page, "13-executions-mobile.png");
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("automated provider ingest appears on Screen 3", async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");

    const key = `AU${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const appRes = await apiPost(page, "/api/v1/qep/applications", {
      name: "Automation App",
      key,
      status: "active",
    });
    const applicationId = await createdId(
      appRes,
      (data) => (data.application as { id?: string } | undefined)?.id,
    );
    const envRes = await apiPost(
      page,
      `/api/v1/qep/applications/${encodeURIComponent(applicationId)}/environments`,
      { name: "CI", category: "test" },
    );
    const environmentId = await createdId(
      envRes,
      (data) => (data.item as { id?: string } | undefined)?.id,
    );
    const targetRes = await apiPost(
      page,
      `/api/v1/qep/applications/${encodeURIComponent(applicationId)}/execution-targets`,
      { name: "CI runner", targetType: "ci_pipeline" },
    );
    const targetId = await createdId(
      targetRes,
      (data) => (data.item as { id?: string } | undefined)?.id,
    );
    const caseRes = await apiPost(page, "/api/v1/qep/test-cases", {
      applicationId,
      title: "Automated login check",
      steps: [
        {
          order: 1,
          action: "Provider login assertion",
          expectedResult: "Home is reachable",
        },
      ],
    });
    const testCaseId = await createdId(
      caseRes,
      (data) => (data.testCase as { id?: string } | undefined)?.id,
    );
    const planRes = await apiPost(page, "/api/v1/qep/test-plans", {
      applicationId,
      title: "CI login",
      objective: "Provider ingest",
    });
    const planId = await createdId(
      planRes,
      (data) => (data.plan as { id?: string } | undefined)?.id,
    );
    expect(
      (
        await apiPost(
          page,
          `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/members`,
          {
            specificationId: testCaseId,
          },
        )
      ).ok(),
    ).toBeTruthy();
    expect(
      (
        await apiPost(
          page,
          `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/strategy`,
          {
            name: "CI browsers",
            verificationCapability: "browser_automation",
            executionSurface: "web",
            environmentId,
            infrastructureTargetId: targetId,
            infrastructureTargetType: "ci_pipeline",
          },
        )
      ).ok(),
    ).toBeTruthy();

    const report = {
      success: false,
      tests: [
        {
          title: "login",
          status: "failed",
          failureMessage: "timeout waiting for home",
        },
      ],
    };
    const reportJson = JSON.stringify(report);
    await apiGet(page, "/api/v1/qep/automation/executions");
    await apiGet(page, "/api/v1/qep/executions/ingestions");
    const autoRes = await apiPost(
      page,
      "/api/v1/qep/automation/executions",
      {
        providerId: "vitest",
        correlationId: `vitest-${key}`,
        runImmediately: true,
        target: {
          kind: "custom",
          name: "ci-login",
          entry: reportJson,
        },
      },
      60_000,
    );
    const autoBody = await readJson<{
      data?: {
        execution?: { executionId?: string; state?: string; providerId?: string };
      };
    }>(autoRes);
    const automationExecutionId = autoBody.data?.execution?.executionId;
    expect(automationExecutionId).toBeTruthy();
    expect(autoBody.data?.execution?.providerId).toBe("vitest");

    const ingestRes = await apiPost(
      page,
      "/api/v1/qep/executions/ingestions",
      {
        sourceSystemId: "vitest",
        agentIdentity: "vitest-agent",
        idempotencyKey: randomUUID(),
        payloadHash: createHash("sha256").update(reportJson).digest("hex"),
        isComplete: false,
        automationExecutionId,
        stepResults: [
          {
            order: 1,
            outcome: "failed",
            actualResult: "timeout waiting for home",
          },
        ],
        create: {
          projectId: applicationId,
          workspaceId: `qep:${applicationId}`,
          sourceRefs: {
            specRef: {
              capability: "test_specification",
              id: testCaseId,
              versionLabel: "1",
            },
            planRef: { capability: "test_plan", id: planId, versionLabel: "1" },
          },
        },
      },
      60_000,
    );
    const ingestBody = await readJson<{
      data?: { id?: string; mode?: string; outcome?: string | null; status?: string };
    }>(ingestRes);
    const executionId = ingestBody.data?.id;
    expect(executionId).toBeTruthy();
    expect(ingestBody.data?.mode).toBe("imported");
    expect(ingestBody.data?.status).not.toBe("completed");

    const listed = await apiGet(
      page,
      `/api/v1/qep/presented-executions?applicationId=${encodeURIComponent(applicationId)}`,
    );
    const listedBody = await readJson<{
      data?: readonly { id?: string; type?: string; result?: string }[];
    }>(listed);
    const row = listedBody.data?.find((item) => item.id === executionId);
    expect(row?.type).toBe("automated");

    await openQep(page, "/workspace/qep/test-execution");
    await expect(page.getByTestId("qep-application-selector")).toBeVisible({
      timeout: 90_000,
    });
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-executions")).toBeVisible({ timeout: 45_000 });
    await openExecutionDetail(page, executionId!);
    await expect(page.getByTestId("qep-automated-execution")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("qep-provider-secondary")).toContainText("vitest");
    await expect(page.getByTestId("qep-automated-capability")).toContainText(
      "Browser Automation",
    );
    await expect(page.getByTestId("qep-automated-environment")).toContainText("CI");
    await shot(page, "15-automated-overview.png");
    await page.getByTestId("qep-automated-tab-results").click();
    await expect(page.getByTestId("qep-automated-results")).toContainText("Failed");
    await shot(page, "16-automated-results.png");
    await page.getByTestId("qep-automated-tab-logs").click();
    await shot(page, "17-automated-logs.png");
    await page.getByTestId("qep-automated-tab-artifacts").click();
    await shot(page, "18-automated-artifacts.png");
    await page.getByTestId("qep-automated-tab-defects").click();
    await page.getByTestId("qep-auto-defect-title").fill("Automated login failed");
    await page.getByTestId("qep-auto-defect-confirm").check();
    const defectWait = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/v1/qep/defects") &&
        !response.url().includes("/lifecycle"),
      { timeout: 45_000 },
    );
    await page.getByTestId("qep-auto-defect-create").click();
    expect((await defectWait).ok()).toBeTruthy();
    await expect(page.getByTestId("qep-result-defects")).toContainText(
      "Automated login failed",
      {
        timeout: 20_000,
      },
    );
    await shot(page, "21-automated-defects.png");

    const inv = await apiGet(
      page,
      `/api/v1/qep/executions/${encodeURIComponent(executionId!)}/investigation`,
    );
    const invBody = await readJson<{
      data?: {
        testExecution?: { mode?: string; steps?: readonly { outcome?: string }[] };
        strategy?: { verificationCapability?: string; environmentName?: string };
        providerExecutions?: readonly { providerId?: string }[];
        defects?: readonly { defect?: { title?: string } }[];
      };
    }>(inv);
    expect(invBody.data?.testExecution?.mode).toBe("imported");
    expect(invBody.data?.testExecution?.steps?.[0]?.outcome).toBe("failed");
    expect(invBody.data?.strategy?.verificationCapability).toBe("browser_automation");
    expect(invBody.data?.strategy?.environmentName).toBe("CI");
    expect(invBody.data?.providerExecutions?.[0]?.providerId).toBe("vitest");
    expect(invBody.data?.defects?.[0]?.defect?.title).toMatch(
      /Automated login failed/i,
    );
  });
});
