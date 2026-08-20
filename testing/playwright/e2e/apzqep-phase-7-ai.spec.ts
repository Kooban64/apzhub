import { expect, test, type APIResponse, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/apzqep-redesign/evidence/phase-7";

async function apiPost(
  page: Page,
  url: string,
  data: Record<string, unknown>,
  timeout = 60_000,
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

async function apiGet(page: Page, url: string, timeout = 60_000): Promise<APIResponse> {
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
    try {
      await page.goto(pathName, { waitUntil: "commit", timeout: 120_000 });
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
      await page.waitForTimeout(2_000);
    }
  }
}

async function jsonData(res: APIResponse): Promise<Record<string, unknown>> {
  const raw = await res.text();
  const parsed = JSON.parse(raw) as {
    data?: Record<string, unknown>;
    error?: { message?: string };
  };
  return { status: res.status(), raw, ...(parsed.data ?? {}), error: parsed.error };
}

test.describe("APZQEP redesign Phase 7 — AI Quality Companion", () => {
  test("security gates, proposal flow, four screens, light/dark/mobile", async ({
    page,
    browser,
  }) => {
    test.setTimeout(600_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");
    await page.waitForTimeout(1000);

    fs.mkdirSync(path.resolve(EVIDENCE), { recursive: true });
    const key = `P7${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const appRes = await apiPost(page, "/api/v1/qep/applications", {
      name: "Phase 7 AI App",
      key,
      status: "active",
    });
    const appBody = await jsonData(appRes);
    const applicationId = String(
      (appBody.application as { id?: string } | undefined)?.id ?? appBody.id ?? "",
    );
    expect(applicationId, appBody.raw as string).toBeTruthy();

    const probeNoSource = await jsonData(
      await apiPost(page, "/api/v1/qep/ai/source-probe", { applicationId }),
    );
    fs.writeFileSync(
      path.resolve(EVIDENCE, "01-source-probe.json"),
      JSON.stringify(probeNoSource, null, 2),
    );

    const created = await apiPost(page, "/api/v1/qep/ai/proposals", {
      applicationId,
      proposalType: "test_case",
      content: { title: "Cover login AC", description: "Proposal only" },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const createdBody = await jsonData(created);
    const proposal = createdBody.proposal as {
      id: string;
      originalContent: Record<string, unknown>;
      reviewedContent: Record<string, unknown>;
    };
    expect(proposal.id).toBeTruthy();

    const casesBefore = await jsonData(
      await apiGet(page, `/api/v1/qep/test-cases?applicationId=${applicationId}`),
    );
    const beforeCount = Array.isArray(casesBefore.items)
      ? casesBefore.items.length
      : Array.isArray(casesBefore.data)
        ? (casesBefore.data as unknown[]).length
        : 0;

    const modified = await apiPost(
      page,
      `/api/v1/qep/ai/proposals/${proposal.id}/modify`,
      {
        content: { title: "Cover login AC (reviewed)", description: "Human edited" },
      },
    );
    expect(modified.ok()).toBeTruthy();
    const modifiedBody = await jsonData(modified);
    const modifiedProposal = modifiedBody.proposal as {
      originalContent: { title?: string };
      reviewedContent: { title?: string };
    };
    expect(modifiedProposal.originalContent.title).toBe("Cover login AC");
    expect(modifiedProposal.reviewedContent.title).toContain("reviewed");

    const riskDraft = await apiPost(page, "/api/v1/qep/ai/proposals", {
      applicationId,
      proposalType: "quality_risk",
      content: { title: "Draft risk", severity: "high" },
    });
    expect(riskDraft.ok()).toBeTruthy();
    const riskBody = await jsonData(riskDraft);
    const riskId = (riskBody.proposal as { id: string }).id;
    const risksBefore = await jsonData(
      await apiGet(page, `/api/v1/qep/risk?applicationId=${applicationId}`),
    );
    const acceptRisk = await apiPost(
      page,
      `/api/v1/qep/ai/proposals/${riskId}/accept`,
      {},
    );
    expect(acceptRisk.ok()).toBeFalsy();
    const risksAfter = await jsonData(
      await apiGet(page, `/api/v1/qep/risk?applicationId=${applicationId}`),
    );
    const riskCount = (items: Record<string, unknown>) =>
      Array.isArray(items.items) ? items.items.length : 0;
    expect(riskCount(risksAfter)).toBe(riskCount(risksBefore));

    const gateDraft = await apiPost(page, "/api/v1/qep/ai/proposals", {
      applicationId,
      proposalType: "gate_evaluation",
      content: { title: "Illegal gate write" },
    });
    const gateId = ((await jsonData(gateDraft)).proposal as { id: string }).id;
    const acceptGate = await apiPost(
      page,
      `/api/v1/qep/ai/proposals/${gateId}/accept`,
      {},
    );
    expect(acceptGate.status()).toBe(403);

    const certDraft = await apiPost(page, "/api/v1/qep/ai/proposals", {
      applicationId,
      proposalType: "certification",
      content: { title: "Illegal certification write" },
    });
    const certId = ((await jsonData(certDraft)).proposal as { id: string }).id;
    const acceptCert = await apiPost(
      page,
      `/api/v1/qep/ai/proposals/${certId}/accept`,
      {},
    );
    expect(acceptCert.status()).toBe(403);

    const rejected = await apiPost(page, "/api/v1/qep/ai/proposals", {
      applicationId,
      proposalType: "test_case",
      content: { title: "Reject me" },
    });
    const rejectId = ((await jsonData(rejected)).proposal as { id: string }).id;
    const rejectRes = await apiPost(
      page,
      `/api/v1/qep/ai/proposals/${rejectId}/reject`,
      {},
    );
    expect(rejectRes.ok()).toBeTruthy();

    const acceptRes = await apiPost(
      page,
      `/api/v1/qep/ai/proposals/${proposal.id}/accept`,
      {},
    );
    const acceptBody = await jsonData(acceptRes);
    fs.writeFileSync(
      path.resolve(EVIDENCE, "10-accept-test-case.json"),
      JSON.stringify(acceptBody, null, 2),
    );
    expect(acceptRes.ok(), acceptBody.raw as string).toBeTruthy();

    const analysis = await jsonData(
      await apiGet(page, `/api/v1/qep/ai/analysis?applicationId=${applicationId}`),
    );
    expect((analysis.analysis as { source?: string }).source ?? analysis.source).toBe(
      "qep_facts",
    );
    fs.writeFileSync(
      path.resolve(EVIDENCE, "13-deterministic-analysis.json"),
      JSON.stringify(analysis, null, 2),
    );

    await openQep(page, "/workspace/qep/ai-companion");
    await persistApplication(page, applicationId);
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-phase7-screen-1")).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByTestId("qep-phase7-source-access")).toContainText(
      "Source Access",
    );
    await setColorScheme(page, "light");
    await shot(page, "01-companion-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "01-companion-dark.png");

    await openQep(page, "/workspace/qep/ai-generate");
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-phase7-screen-2")).toBeVisible({
      timeout: 90_000,
    });
    await setColorScheme(page, "light");
    await shot(page, "02-generate-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "02-generate-dark.png");

    await openQep(page, "/workspace/qep/ai-review");
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-phase7-screen-3")).toBeVisible({
      timeout: 90_000,
    });
    await setColorScheme(page, "light");
    await shot(page, "03-review-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "03-review-dark.png");

    await openQep(page, "/workspace/qep/ai-analysis");
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-phase7-screen-4")).toBeVisible({
      timeout: 90_000,
    });
    await setColorScheme(page, "light");
    await shot(page, "04-analysis-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "04-analysis-dark.png");

    await openQep(page, "/workspace/qep/ai-workspace");
    await expect(page.getByTestId("qep-phase7-chrome")).toBeVisible({
      timeout: 90_000,
    });

    const mobile = await browser.newPage();
    await mobile.setViewportSize({ width: 390, height: 844 });
    await loginAs(mobile, "org_member");
    await openQep(mobile, "/workspace/qep/ai-companion");
    await persistApplication(mobile, applicationId);
    await selectApplication(mobile, applicationId);
    await expect(mobile.getByTestId("qep-phase7-screen-1")).toBeVisible({
      timeout: 90_000,
    });
    await shot(mobile, "01-companion-mobile.png");
    await mobile.close();

    void beforeCount;
  });
});
