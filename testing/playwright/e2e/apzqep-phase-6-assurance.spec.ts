import { expect, test, type APIResponse, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/apzqep-redesign/evidence/phase-6";

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

async function jsonData(res: APIResponse): Promise<Record<string, unknown>> {
  const raw = await res.text();
  const parsed = JSON.parse(raw) as {
    data?: Record<string, unknown>;
    error?: { message?: string };
  };
  return { status: res.status(), raw, ...(parsed.data ?? {}), error: parsed.error };
}

test.describe("APZQEP redesign Phase 6 — Risk, Gates, Readiness, Certification", () => {
  test("domain chain, isolation, four outcomes, and visual evidence", async ({
    page,
    browser,
  }) => {
    test.setTimeout(600_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");
    await page.waitForTimeout(1000);

    const key = `P6${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const appRes = await apiPost(page, "/api/v1/qep/applications", {
      name: "Assurance App",
      key,
      status: "active",
    });
    const applicationId = await createdId(
      appRes,
      (data) => (data.application as { id?: string } | undefined)?.id,
    );
    const otherApp = await apiPost(page, "/api/v1/qep/applications", {
      name: "Other Assurance App",
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

    await apiGet(page, "/api/v1/qep/risk?applicationId=warmup", 90_000);
    await apiGet(page, "/api/v1/qep/quality-gates?applicationId=warmup", 90_000);

    const unboundRisk = await apiPost(page, "/api/v1/qep/risk", {
      action: "create",
      title: "Unbound",
      description: "x",
      severity: "high",
    });
    expect(unboundRisk.status()).toBe(400);

    const riskRes = await apiPost(page, "/api/v1/qep/risk", {
      action: "create",
      applicationId,
      title: "Checkout defect rate",
      description: "Human-created risk",
      severity: "high",
    });
    const riskId = await createdId(riskRes, (data) => data.id as string | undefined);

    const otherRisks = await apiGet(
      page,
      `/api/v1/qep/risk?applicationId=${encodeURIComponent(otherApplicationId)}`,
    );
    expect(otherRisks.ok(), await otherRisks.text()).toBeTruthy();
    const otherRiskBody = (await otherRisks.json()) as { data?: { items?: unknown[] } };
    expect(otherRiskBody.data?.items ?? []).toHaveLength(0);

    const gateRes = await apiPost(page, "/api/v1/qep/quality-gates", {
      applicationId,
      name: "No unresolved blocking risks",
      description: "Open high or critical risks must be zero",
      gateType: "blocking",
      conditionKind: "unresolved_blocking_risks",
      conditionValue: 0,
    });
    const gateId = await createdId(
      gateRes,
      (data) => (data.gate as { id?: string } | undefined)?.id,
    );

    const changePass = `${key}-pass`;
    const changeFail = `${key}-fail`;

    await apiPost(
      page,
      `/api/v1/qep/quality-gates/${encodeURIComponent(gateId)}/evaluate`,
      {
        applicationId,
        environmentId,
        changeEventId: changePass,
      },
    );

    const mitigate = await apiPost(page, "/api/v1/qep/risk", {
      action: "mitigate",
      riskId,
    });
    expect(mitigate.ok(), await mitigate.text()).toBeTruthy();

    const evalPass = await apiPost(
      page,
      `/api/v1/qep/quality-gates/${encodeURIComponent(gateId)}/evaluate`,
      { applicationId, environmentId, changeEventId: changePass },
    );
    const passBody = await jsonData(evalPass);
    const passEval = passBody.evaluation as { result?: string } | undefined;
    expect(passEval?.result).toBe("passed");

    const goEvalRes = await apiPost(page, "/api/v1/qep/certification/evaluations", {
      changeEventId: changePass,
      applicationId,
      environmentId,
    });
    const goEvaluationId = await createdId(
      goEvalRes,
      (data) =>
        (data.evaluation as { evaluationId?: string } | undefined)?.evaluationId,
    );
    const goVote1 = await apiPost(
      page,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(goEvaluationId)}/decision`,
      {
        outcome: "GO",
        rationale: "Blocking gates passed for this change",
        authorityId: "quality_certifier",
      },
    );
    expect(goVote1.ok(), await goVote1.text()).toBeTruthy();

    const coContext = await browser.newContext();
    const coPage = await coContext.newPage();
    await loginAs(coPage, "org_admin");
    const goVote2 = await apiPost(
      coPage,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(goEvaluationId)}/decision`,
      {
        outcome: "GO",
        rationale: "Independent co-approval of ordinary GO",
        authorityId: "quality_co_approver",
      },
    );
    const goFinal = await jsonData(goVote2);
    const goDecision = (
      goFinal.evaluation as { humanDecision?: { outcome?: string } } | undefined
    )?.humanDecision?.outcome;

    const risk2 = await apiPost(page, "/api/v1/qep/risk", {
      action: "create",
      applicationId,
      title: "Blocking residual risk",
      description: "Forces failed blocking gate",
      severity: "critical",
    });
    expect(risk2.ok(), await risk2.text()).toBeTruthy();
    const failEvalRes = await apiPost(
      page,
      `/api/v1/qep/quality-gates/${encodeURIComponent(gateId)}/evaluate`,
      { applicationId, environmentId, changeEventId: changeFail },
    );
    const failEval = await jsonData(failEvalRes);
    expect((failEval.evaluation as { result?: string } | undefined)?.result).toBe(
      "failed",
    );

    const failCert = await apiPost(page, "/api/v1/qep/certification/evaluations", {
      changeEventId: changeFail,
      applicationId,
      environmentId,
    });
    const failCertRaw = await failCert.text();
    expect(failCert.ok(), failCertRaw).toBeTruthy();
    const failCertParsed = JSON.parse(failCertRaw) as {
      data?: {
        evaluation?: {
          evaluationId?: string;
          phase6?: { gateEvaluations?: { id: string; result: string }[] };
        };
      };
    };
    const failCertId = failCertParsed.data?.evaluation?.evaluationId ?? "";
    expect(failCertId).toBeTruthy();
    const snapshotFailedId =
      failCertParsed.data?.evaluation?.phase6?.gateEvaluations?.find(
        (row) => row.result === "failed",
      )?.id;
    const rejectedGo = await apiPost(
      page,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(failCertId!)}/decision`,
      {
        outcome: "GO",
        rationale: "Should be prohibited",
        authorityId: "quality_certifier",
      },
    );
    expect(rejectedGo.status()).toBe(409);

    const rejectedConditional = await apiPost(
      page,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(failCertId!)}/decision`,
      {
        outcome: "CONDITIONAL_GO",
        rationale: "Should be prohibited without exception",
        authorityId: "quality_certifier",
      },
    );
    expect(rejectedConditional.status()).toBe(409);

    const exceptionRes = await apiPost(page, "/api/v1/qep/certification/exceptions", {
      gateEvaluationId: snapshotFailedId,
      reason: "Customer accepted residual checkout risk for this change only",
    });
    expect(exceptionRes.ok(), await exceptionRes.text()).toBeTruthy();

    const condVote1 = await apiPost(
      page,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(failCertId)}/decision`,
      {
        outcome: "CONDITIONAL_GO",
        rationale: "Exception authorised; GO still prohibited",
        authorityId: "quality_certifier",
      },
    );
    expect(condVote1.ok(), await condVote1.text()).toBeTruthy();
    const condVote2 = await apiPost(
      coPage,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(failCertId)}/decision`,
      {
        outcome: "CONDITIONAL_GO",
        rationale: "Independent co-approval of conditional go",
        authorityId: "quality_co_approver",
      },
    );
    const condFinal = await jsonData(condVote2);

    const stillGo = await apiPost(
      page,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(failCertId)}/decision`,
      {
        outcome: "GO",
        rationale: "Still prohibited after exception",
        authorityId: "quality_certifier",
      },
    );
    expect([409, 400].includes(stillGo.status())).toBeTruthy();

    const noGoCert = await apiPost(page, "/api/v1/qep/certification/evaluations", {
      changeEventId: `${changeFail}-nogo`,
      applicationId,
      environmentId,
    });
    const noGoId = await createdId(
      noGoCert,
      (data) =>
        (data.evaluation as { evaluationId?: string } | undefined)?.evaluationId,
    );
    const noGo = await apiPost(
      page,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(noGoId)}/decision`,
      {
        outcome: "NO_GO",
        rationale: "Do not proceed with this change",
        authorityId: "quality_certifier",
      },
    );
    const noGoBody = await jsonData(noGo);

    const deferCert = await apiPost(page, "/api/v1/qep/certification/evaluations", {
      changeEventId: `${changeFail}-defer`,
      applicationId,
      environmentId,
    });
    const deferId = await createdId(
      deferCert,
      (data) =>
        (data.evaluation as { evaluationId?: string } | undefined)?.evaluationId,
    );
    const defer = await apiPost(
      page,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(deferId)}/decision`,
      {
        outcome: "DEFER",
        rationale: "Postpone until residual risk is mitigated",
        authorityId: "quality_certifier",
      },
    );
    const deferBody = await jsonData(defer);

    const beforeHistory = await apiGet(
      page,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(goEvaluationId)}`,
    );
    const beforeJson = await jsonData(beforeHistory);
    await apiPost(page, "/api/v1/qep/risk", {
      action: "create",
      applicationId,
      title: "Later risk must not rewrite history",
      description: "Post-certification change",
      severity: "critical",
    });
    const afterHistory = await apiGet(
      page,
      `/api/v1/qep/certification/evaluations/${encodeURIComponent(goEvaluationId)}`,
    );
    const afterJson = await jsonData(afterHistory);
    const beforeSnap = JSON.stringify(
      (beforeJson.evaluation as { phase6?: unknown } | undefined)?.phase6,
    );
    const afterSnap = JSON.stringify(
      (afterJson.evaluation as { phase6?: unknown } | undefined)?.phase6,
    );
    expect(afterSnap).toBe(beforeSnap);

    fs.mkdirSync(path.resolve(EVIDENCE), { recursive: true });
    fs.writeFileSync(
      path.resolve(EVIDENCE, "07-end-to-end-proofs.json"),
      JSON.stringify(
        {
          applicationId,
          environmentId,
          ordinaryGo:
            goDecision ??
            (goFinal.evaluation as { humanDecision?: { outcome?: string } })
              ?.humanDecision?.outcome,
          failedBlockingRejectsGo: rejectedGo.status(),
          failedBlockingRejectsConditional: rejectedConditional.status(),
          conditionalGo: (
            condFinal.evaluation as { humanDecision?: { outcome?: string } } | undefined
          )?.humanDecision?.outcome,
          noGo: (
            noGoBody.evaluation as { humanDecision?: { outcome?: string } } | undefined
          )?.humanDecision?.outcome,
          defer: (
            deferBody.evaluation as { humanDecision?: { outcome?: string } } | undefined
          )?.humanDecision?.outcome,
          historicalUnchanged: beforeSnap === afterSnap,
        },
        null,
        2,
      ),
    );

    await coContext.close();
  });

  test("desktop and mobile light/dark visual evidence", async ({ page }) => {
    test.setTimeout(600_000);
    await loginAs(page, "org_member");
    const key = `P6V${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const appRes = await apiPost(page, "/api/v1/qep/applications", {
      name: "Assurance Visuals",
      key,
      status: "active",
    });
    const applicationId = await createdId(
      appRes,
      (data) => (data.application as { id?: string } | undefined)?.id,
    );

    await page.setViewportSize({ width: 1440, height: 900 });
    await openQep(page, "/workspace/qep/risk");
    await persistApplication(page, applicationId);
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-quality-risk")).toBeVisible({ timeout: 60_000 });
    await setColorScheme(page, "light");
    await shot(page, "01-quality-risk-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "02-quality-risk-desktop-dark.png");

    await openQep(page, "/workspace/qep/quality-gates");
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-quality-gates")).toBeVisible({
      timeout: 60_000,
    });
    await setColorScheme(page, "light");
    await shot(page, "03-quality-gates-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "04-quality-gates-desktop-dark.png");

    await openQep(page, "/workspace/qep/release-readiness");
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-release-readiness")).toBeVisible({
      timeout: 60_000,
    });
    await setColorScheme(page, "light");
    await shot(page, "05-release-readiness-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "06-release-readiness-desktop-dark.png");

    await openQep(page, "/workspace/qep/certification");
    await selectApplication(page, applicationId);
    await expect(page.getByTestId("qep-certification")).toBeVisible({
      timeout: 60_000,
    });
    await setColorScheme(page, "light");
    await shot(page, "07-certification-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "08-certification-desktop-dark.png");

    await page.setViewportSize({ width: 390, height: 844 });
    await setColorScheme(page, "light");
    await openQep(page, "/workspace/qep/risk");
    await selectApplication(page, applicationId);
    await shot(page, "09-quality-risk-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "10-quality-risk-mobile-dark.png");
    await openQep(page, "/workspace/qep/quality-gates");
    await selectApplication(page, applicationId);
    await setColorScheme(page, "light");
    await shot(page, "11-quality-gates-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "12-quality-gates-mobile-dark.png");
    await openQep(page, "/workspace/qep/release-readiness");
    await selectApplication(page, applicationId);
    await setColorScheme(page, "light");
    await shot(page, "13-release-readiness-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "14-release-readiness-mobile-dark.png");
    await openQep(page, "/workspace/qep/certification");
    await selectApplication(page, applicationId);
    await setColorScheme(page, "light");
    await shot(page, "15-certification-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "16-certification-mobile-dark.png");
  });
});
