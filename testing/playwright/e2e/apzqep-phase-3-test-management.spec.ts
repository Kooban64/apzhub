import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/apzqep-redesign/evidence/phase-3";

async function loginAs(page: Page, persona: string): Promise<void> {
  let credRes = await page.request.post("/api/v1/demo/quick-login", {
    data: { id: persona },
    timeout: 60_000,
  });
  for (let attempt = 0; attempt < 8 && !credRes.ok(); attempt += 1) {
    await page.waitForTimeout(1_500);
    credRes = await page.request.post("/api/v1/demo/quick-login", {
      data: { id: persona },
      timeout: 60_000,
    });
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

async function openQep(page: Page, path: string): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto(path, { waitUntil: "domcontentloaded", timeout: 90_000 });
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

async function selectApplication(page: Page, applicationId: string): Promise<void> {
  const appSelect = page.getByTestId("qep-application-selector").locator("select");
  await expect(appSelect).toBeAttached({ timeout: 90_000 });
  await appSelect.selectOption(applicationId, { force: true });
}

async function waitForQepSurface(page: Page, testId: string): Promise<void> {
  await expect(page.getByText("Checking product access…")).toBeHidden({
    timeout: 30_000,
  });
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
}

test.describe("APZQEP redesign Phase 3 — Test management", () => {
  test("test cases, suites, plans, strategy, and geometry evidence", async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");
    await page.waitForTimeout(1000);

    const key = `TM${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const appRes = await page.request.post("/api/v1/qep/applications", {
      data: { name: "Test Management App", key, status: "active" },
      timeout: 30_000,
    });
    expect(appRes.ok(), await appRes.text()).toBeTruthy();
    const appBody = (await appRes.json()) as {
      data?: { application?: { id?: string } };
    };
    const applicationId = appBody.data?.application?.id;
    expect(applicationId).toBeTruthy();

    const reqRes = await page.request.post("/api/v1/qep/requirements", {
      data: {
        projectId: applicationId,
        key: `REQ-${key}`,
        title: "Authenticated login",
        description: "Users can sign in with valid credentials.",
        type: "functional",
        priority: "high",
        acceptanceCriteriaItems: ["Valid credentials authenticate the user"],
      },
      timeout: 30_000,
    });
    expect(reqRes.ok(), await reqRes.text()).toBeTruthy();
    const reqBody = (await reqRes.json()) as { data?: { id?: string } };
    const requirementId = reqBody.data?.id;
    expect(requirementId).toBeTruthy();

    await page.request.post("/api/v1/qep/definition/promote-legacy-criteria", {
      data: { requirementId },
      timeout: 30_000,
    });
    const definition = await page.request.get(
      `/api/v1/qep/requirements/${encodeURIComponent(requirementId!)}/definition`,
    );
    expect(definition.ok(), await definition.text()).toBeTruthy();
    const defBody = (await definition.json()) as {
      data?: { criteria?: readonly { id?: string; criterionKey?: string }[] };
    };
    const criterionId = defBody.data?.criteria?.[0]?.id;
    expect(criterionId).toBeTruthy();

    const envRes = await page.request.post(
      `/api/v1/qep/applications/${encodeURIComponent(applicationId!)}/environments`,
      {
        data: { name: "QA", category: "test" },
        timeout: 30_000,
      },
    );
    expect(envRes.ok(), await envRes.text()).toBeTruthy();
    const envBody = (await envRes.json()) as { data?: { item?: { id?: string } } };
    const environmentId = envBody.data?.item?.id;
    expect(environmentId).toBeTruthy();
    const envListRes = await page.request.get(
      `/api/v1/qep/applications/${encodeURIComponent(applicationId!)}/environments`,
    );
    expect(envListRes.ok(), await envListRes.text()).toBeTruthy();
    const envListBody = (await envListRes.json()) as {
      data?: { items?: readonly { id?: string; name?: string }[] };
    };
    expect(envListBody.data?.items?.some((item) => item.name === "QA")).toBeTruthy();

    const targetRes = await page.request.post(
      `/api/v1/qep/applications/${encodeURIComponent(applicationId!)}/execution-targets`,
      {
        data: { name: "Managed runner", targetType: "managed_runner" },
        timeout: 30_000,
      },
    );
    expect(targetRes.ok(), await targetRes.text()).toBeTruthy();
    const targetBody = (await targetRes.json()) as {
      data?: { item?: { id?: string } };
    };
    const targetId = targetBody.data?.item?.id;
    expect(targetId).toBeTruthy();

    const webTarget = await page.request.post(
      `/api/v1/qep/applications/${encodeURIComponent(applicationId!)}/execution-targets`,
      {
        data: { name: "Web surface", targetType: "web" },
        timeout: 30_000,
      },
    );
    expect(webTarget.ok()).toBeFalsy();

    const historicalSpecs = await page.request.get(
      "/api/v1/qep/specifications?limit=20",
    );
    expect(historicalSpecs.ok(), await historicalSpecs.text()).toBeTruthy();
    const historicalBody = (await historicalSpecs.json()) as {
      data?: readonly { number?: string; id?: string }[];
    };
    const historicalNumbers = (historicalBody.data ?? [])
      .map((row) => row.number)
      .filter((value): value is string => Boolean(value));

    const aliasRejected = await page.request.post("/api/v1/qep/test-cases", {
      data: {
        applicationId,
        title: "Alias must be rejected",
        number: "TC-101",
      },
      timeout: 30_000,
    });
    expect(aliasRejected.ok()).toBeFalsy();

    const caseRes = await page.request.post("/api/v1/qep/test-cases", {
      data: {
        applicationId,
        title: "Login with valid credentials",
        description: "Prove authenticated entry.",
        type: "functional",
        priority: "high",
        preconditions: ["User account exists"],
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
      },
      timeout: 30_000,
    });
    expect(caseRes.ok(), await caseRes.text()).toBeTruthy();
    const caseBody = (await caseRes.json()) as {
      data?: {
        testCase?: {
          id?: string;
          number?: string;
          applicationId?: string;
          steps?: readonly { action?: string; actualResult?: string }[];
        };
      };
    };
    const testCaseId = caseBody.data?.testCase?.id;
    const testCaseNumber = caseBody.data?.testCase?.number;
    expect(testCaseId).toBeTruthy();
    expect(testCaseNumber).toMatch(/^TS-\d+$/);
    expect(caseBody.data?.testCase?.applicationId).toBe(applicationId);
    expect(caseBody.data?.testCase?.steps).toHaveLength(2);
    expect(caseBody.data?.testCase?.steps?.[0]?.actualResult).toBeUndefined();

    const extraCase = await page.request.post("/api/v1/qep/test-cases", {
      data: {
        applicationId,
        title: "Logout",
        steps: [{ order: 1, action: "Sign out", expectedResult: "Login form returns" }],
      },
      timeout: 30_000,
    });
    expect(extraCase.ok(), await extraCase.text()).toBeTruthy();
    const extraBody = (await extraCase.json()) as {
      data?: { testCase?: { id?: string } };
    };
    const extraCaseId = extraBody.data?.testCase?.id;

    const linkRes = await page.request.post(
      `/api/v1/qep/test-cases/${encodeURIComponent(testCaseId!)}/criteria`,
      { data: { criterionId }, timeout: 30_000 },
    );
    expect(linkRes.ok(), await linkRes.text()).toBeTruthy();

    const suiteRes = await page.request.post("/api/v1/qep/test-suites", {
      data: { applicationId, name: "Authentication", description: "Login and session" },
      timeout: 30_000,
    });
    expect(suiteRes.ok(), await suiteRes.text()).toBeTruthy();
    const suiteBody = (await suiteRes.json()) as {
      data?: { suite?: { id?: string; suiteKey?: string } };
    };
    const suiteId = suiteBody.data?.suite?.id;
    expect(suiteBody.data?.suite?.suiteKey).toMatch(/^SUITE-\d+$/);
    const memberRes = await page.request.post(
      `/api/v1/qep/test-suites/${encodeURIComponent(suiteId!)}/members`,
      { data: { specificationId: testCaseId }, timeout: 30_000 },
    );
    expect(memberRes.ok(), await memberRes.text()).toBeTruthy();

    const otherApp = await page.request.post("/api/v1/qep/applications", {
      data: { name: "Other App", key: `${key}X`, status: "active" },
      timeout: 30_000,
    });
    expect(otherApp.ok(), await otherApp.text()).toBeTruthy();
    const otherAppId = (
      (await otherApp.json()) as { data?: { application?: { id?: string } } }
    ).data?.application?.id;
    const otherSuite = await page.request.post("/api/v1/qep/test-suites", {
      data: { applicationId: otherAppId, name: "Other" },
      timeout: 30_000,
    });
    expect(otherSuite.ok(), await otherSuite.text()).toBeTruthy();
    const otherSuiteId = (
      (await otherSuite.json()) as { data?: { suite?: { id?: string } } }
    ).data?.suite?.id;
    const crossMember = await page.request.post(
      `/api/v1/qep/test-suites/${encodeURIComponent(otherSuiteId!)}/members`,
      { data: { specificationId: testCaseId }, timeout: 30_000 },
    );
    expect(crossMember.ok()).toBeFalsy();

    const planRes = await page.request.post("/api/v1/qep/test-plans", {
      data: {
        applicationId,
        title: "Sprint regression",
        objective: "Cover authentication",
      },
      timeout: 30_000,
    });
    expect(planRes.ok(), await planRes.text()).toBeTruthy();
    const planBody = (await planRes.json()) as { data?: { plan?: { id?: string } } };
    const planId = planBody.data?.plan?.id;
    expect(planId).toBeTruthy();

    const addSuite = await page.request.post(
      `/api/v1/qep/test-plans/${encodeURIComponent(planId!)}/members`,
      { data: { suiteId }, timeout: 30_000 },
    );
    expect(addSuite.ok(), await addSuite.text()).toBeTruthy();
    const addCase = await page.request.post(
      `/api/v1/qep/test-plans/${encodeURIComponent(planId!)}/members`,
      { data: { specificationId: extraCaseId }, timeout: 30_000 },
    );
    expect(addCase.ok(), await addCase.text()).toBeTruthy();

    const fakeSurface = await page.request.post(
      `/api/v1/qep/test-plans/${encodeURIComponent(planId!)}/strategy`,
      {
        data: {
          name: "Invalid",
          verificationCapability: "sast",
          executionSurface: "repository",
          infrastructureTargetType: "web",
        },
        timeout: 30_000,
      },
    );
    expect(fakeSurface.ok()).toBeFalsy();

    const strategyRes = await page.request.post(
      `/api/v1/qep/test-plans/${encodeURIComponent(planId!)}/strategy`,
      {
        data: {
          name: "QA browsers",
          verificationCapability: "browser_automation",
          executionSurface: "web",
          environmentId,
          infrastructureTargetType: "managed_runner",
          infrastructureTargetId: targetId,
        },
        timeout: 30_000,
      },
    );
    expect(strategyRes.ok(), await strategyRes.text()).toBeTruthy();
    const strategyBody = (await strategyRes.json()) as {
      data?: {
        plan?: {
          strategy?: readonly {
            verificationCapability?: string;
            executionSurface?: string;
            infrastructureTargetType?: string;
            environmentId?: string;
            environmentName?: string;
          }[];
          internalExecutionPlanIds?: readonly string[];
          suiteIds?: readonly string[];
          specificationIds?: readonly string[];
          progress?: { planned?: number };
        };
      };
    };
    expect(strategyBody.data?.plan?.strategy?.[0]?.verificationCapability).toBe(
      "browser_automation",
    );
    expect(strategyBody.data?.plan?.strategy?.[0]?.executionSurface).toBe("web");
    expect(strategyBody.data?.plan?.strategy?.[0]?.infrastructureTargetType).toBe(
      "managed_runner",
    );
    expect(strategyBody.data?.plan?.strategy?.[0]?.environmentId).toBe(environmentId);
    expect(strategyBody.data?.plan?.strategy?.[0]?.environmentName).toBe("QA");
    expect(strategyBody.data?.plan?.internalExecutionPlanIds?.length).toBeGreaterThan(
      0,
    );
    expect(strategyBody.data?.plan?.suiteIds).toEqual([suiteId]);
    expect(strategyBody.data?.plan?.specificationIds).toEqual([extraCaseId]);
    expect(strategyBody.data?.plan?.progress?.planned).toBe(2);

    await page.waitForTimeout(1_000);
    await openQep(page, "/workspace/qep/test-specifications");
    await selectApplication(page, applicationId!);
    await expect(page.getByTestId("qep-test-case-library")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("qep-test-case-create")).toBeVisible();
    await expect(page.getByTestId("qep-test-case-table")).toContainText(
      testCaseNumber!,
    );
    await setColorScheme(page, "light");
    await shot(page, "01-test-case-library-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "02-test-case-library-desktop-dark.png");
    await setColorScheme(page, "light");
    await page.locator(`[data-testid="qep-test-case-row-${testCaseId}"]`).click();
    await expect(page.getByTestId("qep-test-case-inspector")).toBeVisible({
      timeout: 15_000,
    });
    await shot(page, "03-test-case-library-inspector.png");

    await page.setViewportSize({ width: 390, height: 844 });
    await waitForQepSurface(page, "qep-test-case-library");
    await shot(page, "04-test-case-library-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "05-test-case-library-mobile-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByTestId(`qep-test-case-open-${testCaseId}`).click();
    await expect(page.getByTestId("qep-test-case-designer")).toBeVisible({
      timeout: 45_000,
    });
    await shot(page, "06-test-case-designer-desktop-light.png");
    await page.getByRole("tab", { name: /Preconditions/ }).click();
    await expect(page.locator("textarea")).toHaveValue("User account exists");
    await page.getByRole("tab", { name: /Steps/ }).click();
    await expect(page.getByTestId("qep-test-case-steps")).toBeVisible();
    const stepInputs = page.getByTestId("qep-test-case-steps").locator("table input");
    await expect(stepInputs.nth(0)).toHaveValue("Open /login");
    await expect(stepInputs.nth(1)).toHaveValue("sku:DEMO");
    await expect(stepInputs.nth(2)).toHaveValue("Login form is visible");
    await shot(page, "07-test-case-designer-steps.png");
    await page.getByRole("tab", { name: /Links/ }).click();
    await expect(page.getByTestId("qep-test-case-ac-links")).toBeVisible();
    await shot(page, "08-test-case-designer-ac-links.png");
    await setColorScheme(page, "dark");
    await page.getByRole("tab", { name: /Details/ }).click();
    await shot(page, "09-test-case-designer-desktop-dark.png");
    await setColorScheme(page, "light");

    const patched = await page.request.patch(
      `/api/v1/qep/test-cases/${encodeURIComponent(testCaseId!)}`,
      {
        data: {
          steps: [{ order: 1, action: "Open /signin", expectedResult: "New form" }],
        },
        timeout: 30_000,
      },
    );
    expect(patched.ok(), await patched.text()).toBeTruthy();
    const afterSpecs = await page.request.get("/api/v1/qep/specifications?limit=50");
    expect(afterSpecs.ok(), await afterSpecs.text()).toBeTruthy();
    const afterBody = (await afterSpecs.json()) as {
      data?: readonly { number?: string }[];
    };
    const afterNumbers = (afterBody.data ?? [])
      .map((row) => row.number)
      .filter((value): value is string => Boolean(value));
    for (const number of historicalNumbers) {
      expect(afterNumbers).toContain(number);
    }
    expect(afterNumbers).toContain(testCaseNumber);

    await page.setViewportSize({ width: 390, height: 844 });
    await waitForQepSurface(page, "qep-test-case-designer");
    await shot(page, "10-test-case-designer-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "11-test-case-designer-mobile-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByTestId("workbench-sidebar-qep-test-suites").click();
    await expect(page.getByTestId("qep-test-suites")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("qep-suite-table")).toContainText("SUITE-");
    await shot(page, "12-test-suites-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "13-test-suites-desktop-dark.png");
    await setColorScheme(page, "light");
    await page.locator(`[data-testid="qep-suite-row-${suiteId}"]`).click();
    await expect(page.getByTestId("qep-suite-inspector")).toBeVisible({
      timeout: 15_000,
    });
    await shot(page, "14-test-suites-inspector.png");
    await page.getByTestId(`qep-suite-open-${suiteId}`).click();
    await expect(page.getByTestId("qep-test-suite-detail")).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId("qep-suite-membership")).toBeVisible();
    await shot(page, "15-test-suites-membership.png");

    await page.getByTestId("qep-suite-back").click();
    await expect(page.getByTestId("qep-test-suites")).toBeVisible({ timeout: 45_000 });
    await page.setViewportSize({ width: 390, height: 844 });
    await waitForQepSurface(page, "qep-test-suites");
    await shot(page, "16-test-suites-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "17-test-suites-mobile-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByTestId("workbench-sidebar-qep-test-plans").click();
    await expect(page.getByTestId("qep-test-plans")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("qep-test-plan-table")).toContainText(
      "Sprint regression",
      {
        timeout: 60_000,
      },
    );
    await shot(page, "18-test-plans-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "19-test-plans-desktop-dark.png");
    await setColorScheme(page, "light");

    await page.getByTestId(`qep-test-plan-open-${planId}`).click();
    await expect(page.getByTestId("qep-test-plan-detail")).toBeVisible({
      timeout: 45_000,
    });
    await shot(page, "20-test-plan-overview.png");
    await page.getByRole("tab", { name: "Execution Strategy" }).click();
    await expect(page.getByTestId("qep-test-plan-strategy")).toBeVisible();
    await expect(page.getByTestId("qep-test-plan-strategy")).toContainText(
      "Browser Automation → Web",
    );
    await expect(page.getByTestId("qep-test-plan-strategy")).toContainText(
      "Managed Runner",
    );
    await expect(page.getByTestId("qep-test-plan-strategy")).toContainText("→ QA", {
      timeout: 15_000,
    });
    await shot(page, "21-test-plan-strategy.png");
    await page.getByRole("tab", { name: "Executions" }).click();
    await expect(page.getByTestId("qep-test-plan-executions")).toBeVisible();
    await shot(page, "22-test-plan-executions.png");
    await setColorScheme(page, "dark");
    await page.getByRole("tab", { name: "Overview" }).click();
    await shot(page, "23-test-plan-desktop-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 390, height: 844 });
    await waitForQepSurface(page, "qep-test-plan-detail");
    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Execution Strategy" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Executions" })).toBeVisible();
    await shot(page, "24-test-plan-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "25-test-plan-mobile-dark.png");
  });
});
