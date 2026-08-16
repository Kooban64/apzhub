/**
 * Phase A — full Support Agent vertical: provision → login → filtered shell.
 * Uses demo org admin; creates a unique agent; asserts home-context + quick actions.
 */
import { expect, test } from "@playwright/test";

const WEB_ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${process.env.PLAYWRIGHT_WEB_PORT ?? "3300"}`;

const ORG_ADMIN_EMAIL = "admin@demo-org.local";
const ORG_ADMIN_PASSWORD = "DemoPassword123!";

async function apiSignIn(
  request: import("@playwright/test").APIRequestContext,
  email: string,
  password: string,
): Promise<boolean> {
  const res = await request.post("/api/auth/sign-in/email", {
    data: { email, password },
    headers: { origin: WEB_ORIGIN, referer: `${WEB_ORIGIN}/login` },
  });
  return res.ok();
}

test.describe("Phase A Support Agent provision → login", () => {
  test("provisions Customer Support agent and lands on tenant_support home", async ({
    page,
    request,
  }) => {
    const adminOk = await apiSignIn(request, ORG_ADMIN_EMAIL, ORG_ADMIN_PASSWORD);
    test.skip(!adminOk, "Demo org admin unavailable");

    const personas = await request.get("/api/v1/iam/personas");
    test.skip(!personas.ok(), "IAM personas API unavailable");
    const personaBody = (await personas.json()) as {
      data?: { staffFunctions?: { id: string }[] };
    };
    const hasStaffFn = (personaBody.data?.staffFunctions ?? []).some(
      (f) => f.id === "staff-fn-customer-support",
    );
    test.skip(
      !hasStaffFn,
      "Phase A staff functions not deployed on this server — rebuild required",
    );

    const stamp = Date.now();
    const agentEmail = `support.agent.${stamp}@demo-org.local`;
    const tempPassword = `Apz-Vertical-${stamp}!1`;

    const provision = await request.post("/api/v1/iam/members", {
      data: {
        email: agentEmail,
        displayName: "Support Agent Vertical",
        staffFunctionId: "staff-fn-customer-support",
        provision: true,
        temporaryPassword: tempPassword,
        productKeys: ["support", "time", "knowledge"],
      },
      headers: {
        origin: WEB_ORIGIN,
        "content-type": "application/json",
      },
    });
    expect(provision.ok()).toBeTruthy();
    const provisionBody = (await provision.json()) as {
      data?: {
        provisioned?: boolean;
        temporaryPassword?: string;
        userId?: string;
        effectiveAccessSummary?: {
          products: { productKey: string }[];
        };
      };
    };
    expect(provisionBody.data?.provisioned).toBe(true);
    expect(provisionBody.data?.userId).toBeTruthy();
    const productKeys =
      provisionBody.data?.effectiveAccessSummary?.products.map((p) => p.productKey) ??
      [];
    expect(productKeys).toEqual(
      expect.arrayContaining(["support", "time", "knowledge"]),
    );
    expect(productKeys).not.toContain("qep");
    expect(productKeys).not.toContain("projects");

    await request.post("/api/auth/sign-out", {
      headers: { origin: WEB_ORIGIN },
    });

    const agentOk = await apiSignIn(request, agentEmail, tempPassword);
    expect(agentOk).toBeTruthy();

    const home = await request.get("/api/v1/me/home-context");
    expect(home.ok()).toBeTruthy();
    const homeBody = (await home.json()) as {
      data?: {
        kind?: string;
        landing?: { shell?: string; path?: string };
        entitlements?: { productKeys?: string[] };
      };
    };
    expect(homeBody.data?.kind).toBe("tenant_support");
    expect(homeBody.data?.landing?.shell).toBe("workspace");
    expect(homeBody.data?.landing?.path).toBe("/workspace/home");
    expect(homeBody.data?.entitlements?.productKeys ?? []).toEqual(
      expect.arrayContaining(["support", "time", "knowledge"]),
    );
    expect(homeBody.data?.entitlements?.productKeys ?? []).not.toContain("qep");

    const actions = await request.get("/api/v1/platform/quick-actions");
    expect(actions.ok()).toBeTruthy();
    const actionsBody = (await actions.json()) as {
      data?: { actions?: { id: string; productId: string }[] };
    };
    const ids = (actionsBody.data?.actions ?? []).map((a) => a.id);
    expect(ids).toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-new-project");
    expect(ids).not.toContain("qa-run-test");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Support work/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("workbench-header-chrome")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("product-switcher")).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("Phase A Developer provision → login", () => {
  test("provisions Engineering developer and lands on tenant_developer home", async ({
    page,
    request,
  }) => {
    const adminOk = await apiSignIn(request, ORG_ADMIN_EMAIL, ORG_ADMIN_PASSWORD);
    test.skip(!adminOk, "Demo org admin unavailable");

    const personas = await request.get("/api/v1/iam/personas");
    test.skip(!personas.ok(), "IAM personas API unavailable");
    const personaBody = (await personas.json()) as {
      data?: { staffFunctions?: { id: string }[] };
    };
    const hasStaffFn = (personaBody.data?.staffFunctions ?? []).some(
      (f) => f.id === "staff-fn-engineering",
    );
    test.skip(
      !hasStaffFn,
      "Engineering staff function not deployed — rebuild required",
    );

    const stamp = Date.now();
    const agentEmail = `developer.${stamp}@demo-org.local`;
    const tempPassword = `Apz-Dev-${stamp}!1`;

    const provision = await request.post("/api/v1/iam/members", {
      data: {
        email: agentEmail,
        displayName: "Developer Vertical",
        staffFunctionId: "staff-fn-engineering",
        provision: true,
        temporaryPassword: tempPassword,
        productKeys: ["projects", "time", "qep", "pentest"],
      },
      headers: {
        origin: WEB_ORIGIN,
        "content-type": "application/json",
      },
    });
    expect(provision.ok()).toBeTruthy();
    const provisionBody = (await provision.json()) as {
      data?: {
        provisioned?: boolean;
        effectiveAccessSummary?: { products: { productKey: string }[] };
      };
    };
    expect(provisionBody.data?.provisioned).toBe(true);
    const productKeys =
      provisionBody.data?.effectiveAccessSummary?.products.map((p) => p.productKey) ??
      [];
    expect(productKeys).toEqual(
      expect.arrayContaining(["projects", "time", "qep", "pentest"]),
    );
    expect(productKeys).not.toContain("support");

    await request.post("/api/auth/sign-out", {
      headers: { origin: WEB_ORIGIN },
    });

    const agentOk = await apiSignIn(request, agentEmail, tempPassword);
    expect(agentOk).toBeTruthy();

    const home = await request.get("/api/v1/me/home-context");
    expect(home.ok()).toBeTruthy();
    const homeBody = (await home.json()) as {
      data?: {
        kind?: string;
        entitlements?: { productKeys?: string[] };
        roles?: string[];
      };
    };
    expect(homeBody.data?.kind).toBe("tenant_developer");
    expect(homeBody.data?.entitlements?.productKeys ?? []).not.toContain("support");
    expect(homeBody.data?.roles ?? []).toEqual(
      expect.arrayContaining([
        "developer",
        "product-projects-member",
        "product-qep-engineer",
      ]),
    );

    const actions = await request.get("/api/v1/platform/quick-actions");
    const actionsBody = (await actions.json()) as {
      data?: { actions?: { id: string }[] };
    };
    const ids = (actionsBody.data?.actions ?? []).map((a) => a.id);
    expect(ids).toContain("qa-new-project");
    expect(ids).not.toContain("qa-new-ticket");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Engineering work/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("Phase A Finance provision → login", () => {
  test("provisions Finance staff and lands on tenant_finance home", async ({
    page,
    request,
  }) => {
    const adminOk = await apiSignIn(request, ORG_ADMIN_EMAIL, ORG_ADMIN_PASSWORD);
    test.skip(!adminOk, "Demo org admin unavailable");

    const personas = await request.get("/api/v1/iam/personas");
    test.skip(!personas.ok(), "IAM personas API unavailable");
    const personaBody = (await personas.json()) as {
      data?: { staffFunctions?: { id: string }[] };
    };
    const hasStaffFn = (personaBody.data?.staffFunctions ?? []).some(
      (f) => f.id === "staff-fn-finance",
    );
    test.skip(!hasStaffFn, "Finance staff function not deployed — rebuild required");

    const stamp = Date.now();
    const agentEmail = `finance.${stamp}@demo-org.local`;
    const tempPassword = `Apz-Fin-${stamp}!1`;

    const provision = await request.post("/api/v1/iam/members", {
      data: {
        email: agentEmail,
        displayName: "Finance Vertical",
        staffFunctionId: "staff-fn-finance",
        provision: true,
        temporaryPassword: tempPassword,
        productKeys: ["time", "workflow", "analytics", "documents"],
      },
      headers: {
        origin: WEB_ORIGIN,
        "content-type": "application/json",
      },
    });
    expect(provision.ok()).toBeTruthy();
    const provisionBody = (await provision.json()) as {
      data?: {
        provisioned?: boolean;
        effectiveAccessSummary?: { products: { productKey: string }[] };
      };
    };
    expect(provisionBody.data?.provisioned).toBe(true);
    const productKeys =
      provisionBody.data?.effectiveAccessSummary?.products.map((p) => p.productKey) ??
      [];
    expect(productKeys).toEqual(
      expect.arrayContaining(["time", "workflow", "analytics", "documents"]),
    );
    expect(productKeys).not.toContain("support");
    expect(productKeys).not.toContain("qep");

    await request.post("/api/auth/sign-out", {
      headers: { origin: WEB_ORIGIN },
    });

    const agentOk = await apiSignIn(request, agentEmail, tempPassword);
    expect(agentOk).toBeTruthy();

    const home = await request.get("/api/v1/me/home-context");
    expect(home.ok()).toBeTruthy();
    const homeBody = (await home.json()) as {
      data?: {
        kind?: string;
        entitlements?: { productKeys?: string[] };
        roles?: string[];
      };
    };
    expect(homeBody.data?.kind).toBe("tenant_finance");
    expect(homeBody.data?.roles ?? []).toEqual(
      expect.arrayContaining([
        "finance-staff",
        "product-workflow-operator",
        "product-analytics-viewer",
      ]),
    );

    const actions = await request.get("/api/v1/platform/quick-actions");
    const actionsBody = (await actions.json()) as {
      data?: { actions?: { id: string }[] };
    };
    const ids = (actionsBody.data?.actions ?? []).map((a) => a.id);
    expect(ids).toContain("qa-log-time");
    expect(ids).toContain("qa-start-workflow");
    expect(ids).not.toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-run-test");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Finance work/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("Phase A Compliance provision → login", () => {
  test("provisions Compliance staff and lands on tenant_compliance home", async ({
    page,
    request,
  }) => {
    const adminOk = await apiSignIn(request, ORG_ADMIN_EMAIL, ORG_ADMIN_PASSWORD);
    test.skip(!adminOk, "Demo org admin unavailable");

    const personas = await request.get("/api/v1/iam/personas");
    test.skip(!personas.ok(), "IAM personas API unavailable");
    const personaBody = (await personas.json()) as {
      data?: { staffFunctions?: { id: string }[] };
    };
    const hasStaffFn = (personaBody.data?.staffFunctions ?? []).some(
      (f) => f.id === "staff-fn-compliance",
    );
    test.skip(!hasStaffFn, "Compliance staff function not deployed — rebuild required");

    const stamp = Date.now();
    const agentEmail = `compliance.${stamp}@demo-org.local`;
    const tempPassword = `Apz-Cmp-${stamp}!1`;

    const provision = await request.post("/api/v1/iam/members", {
      data: {
        email: agentEmail,
        displayName: "Compliance Vertical",
        staffFunctionId: "staff-fn-compliance",
        provision: true,
        temporaryPassword: tempPassword,
        productKeys: ["documents", "analytics", "knowledge"],
      },
      headers: {
        origin: WEB_ORIGIN,
        "content-type": "application/json",
      },
    });
    expect(provision.ok()).toBeTruthy();
    const provisionBody = (await provision.json()) as {
      data?: {
        provisioned?: boolean;
        effectiveAccessSummary?: { products: { productKey: string }[] };
      };
    };
    expect(provisionBody.data?.provisioned).toBe(true);
    const productKeys =
      provisionBody.data?.effectiveAccessSummary?.products.map((p) => p.productKey) ??
      [];
    expect(productKeys).toEqual(
      expect.arrayContaining(["documents", "analytics", "knowledge"]),
    );
    expect(productKeys).not.toContain("support");
    expect(productKeys).not.toContain("qep");

    await request.post("/api/auth/sign-out", {
      headers: { origin: WEB_ORIGIN },
    });

    const agentOk = await apiSignIn(request, agentEmail, tempPassword);
    expect(agentOk).toBeTruthy();

    const home = await request.get("/api/v1/me/home-context");
    expect(home.ok()).toBeTruthy();
    const homeBody = (await home.json()) as {
      data?: {
        kind?: string;
        entitlements?: { productKeys?: string[] };
        roles?: string[];
      };
    };
    expect(homeBody.data?.kind).toBe("tenant_compliance");
    expect(homeBody.data?.roles ?? []).toEqual(
      expect.arrayContaining([
        "compliance-officer",
        "product-documents-auditor",
        "product-analytics-viewer",
        "product-knowledge-contributor",
      ]),
    );

    const actions = await request.get("/api/v1/platform/quick-actions");
    const actionsBody = (await actions.json()) as {
      data?: { actions?: { id: string }[] };
    };
    const ids = (actionsBody.data?.actions ?? []).map((a) => a.id);
    expect(ids).toContain("qa-create-knowledge");
    expect(ids).not.toContain("qa-upload-document");
    expect(ids).not.toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-run-test");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Compliance work/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("Phase A Executive provision → login", () => {
  test("provisions Executive staff and lands on tenant_executive home", async ({
    page,
    request,
  }) => {
    const adminOk = await apiSignIn(request, ORG_ADMIN_EMAIL, ORG_ADMIN_PASSWORD);
    test.skip(!adminOk, "Demo org admin unavailable");

    const personas = await request.get("/api/v1/iam/personas");
    test.skip(!personas.ok(), "IAM personas API unavailable");
    const personaBody = (await personas.json()) as {
      data?: { staffFunctions?: { id: string }[] };
    };
    const hasStaffFn = (personaBody.data?.staffFunctions ?? []).some(
      (f) => f.id === "staff-fn-executive",
    );
    test.skip(!hasStaffFn, "Executive staff function not deployed — rebuild required");

    const stamp = Date.now();
    const agentEmail = `executive.${stamp}@demo-org.local`;
    const tempPassword = `Apz-Exec-${stamp}!1`;

    const provision = await request.post("/api/v1/iam/members", {
      data: {
        email: agentEmail,
        displayName: "Executive Vertical",
        staffFunctionId: "staff-fn-executive",
        provision: true,
        temporaryPassword: tempPassword,
        productKeys: ["analytics", "documents", "knowledge"],
      },
      headers: {
        origin: WEB_ORIGIN,
        "content-type": "application/json",
      },
    });
    expect(provision.ok()).toBeTruthy();
    const provisionBody = (await provision.json()) as {
      data?: {
        provisioned?: boolean;
        effectiveAccessSummary?: { products: { productKey: string }[] };
      };
    };
    expect(provisionBody.data?.provisioned).toBe(true);
    const productKeys =
      provisionBody.data?.effectiveAccessSummary?.products.map((p) => p.productKey) ??
      [];
    expect(productKeys).toEqual(
      expect.arrayContaining(["analytics", "documents", "knowledge"]),
    );
    expect(productKeys).not.toContain("support");
    expect(productKeys).not.toContain("qep");

    await request.post("/api/auth/sign-out", {
      headers: { origin: WEB_ORIGIN },
    });

    const agentOk = await apiSignIn(request, agentEmail, tempPassword);
    expect(agentOk).toBeTruthy();

    const home = await request.get("/api/v1/me/home-context");
    expect(home.ok()).toBeTruthy();
    const homeBody = (await home.json()) as {
      data?: {
        kind?: string;
        entitlements?: { productKeys?: string[] };
        roles?: string[];
      };
    };
    expect(homeBody.data?.kind).toBe("tenant_executive");
    expect(homeBody.data?.roles ?? []).toEqual(
      expect.arrayContaining([
        "executive",
        "product-analytics-viewer",
        "product-documents-auditor",
        "product-knowledge-viewer",
      ]),
    );

    const actions = await request.get("/api/v1/platform/quick-actions");
    const actionsBody = (await actions.json()) as {
      data?: { actions?: { id: string }[] };
    };
    const ids = (actionsBody.data?.actions ?? []).map((a) => a.id);
    expect(ids).not.toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-run-test");
    expect(ids).not.toContain("qa-upload-document");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Executive work/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("Phase A QA provision → login", () => {
  test("provisions QA staff and lands on tenant_qa home", async ({ page, request }) => {
    const adminOk = await apiSignIn(request, ORG_ADMIN_EMAIL, ORG_ADMIN_PASSWORD);
    test.skip(!adminOk, "Demo org admin unavailable");

    const personas = await request.get("/api/v1/iam/personas");
    test.skip(!personas.ok(), "IAM personas API unavailable");
    const personaBody = (await personas.json()) as {
      data?: { staffFunctions?: { id: string }[] };
    };
    const hasStaffFn = (personaBody.data?.staffFunctions ?? []).some(
      (f) => f.id === "staff-fn-qa",
    );
    test.skip(!hasStaffFn, "QA staff function not deployed — rebuild required");

    const stamp = Date.now();
    const agentEmail = `qa.${stamp}@demo-org.local`;
    const tempPassword = `Apz-Qa-${stamp}!1`;

    const provision = await request.post("/api/v1/iam/members", {
      data: {
        email: agentEmail,
        displayName: "QA Vertical",
        staffFunctionId: "staff-fn-qa",
        provision: true,
        temporaryPassword: tempPassword,
        productKeys: ["qep", "projects", "time"],
      },
      headers: {
        origin: WEB_ORIGIN,
        "content-type": "application/json",
      },
    });
    expect(provision.ok()).toBeTruthy();
    const provisionBody = (await provision.json()) as {
      data?: {
        provisioned?: boolean;
        effectiveAccessSummary?: { products: { productKey: string }[] };
      };
    };
    expect(provisionBody.data?.provisioned).toBe(true);
    const productKeys =
      provisionBody.data?.effectiveAccessSummary?.products.map((p) => p.productKey) ??
      [];
    expect(productKeys).toEqual(expect.arrayContaining(["qep", "projects", "time"]));
    expect(productKeys).not.toContain("support");
    expect(productKeys).not.toContain("pentest");

    await request.post("/api/auth/sign-out", {
      headers: { origin: WEB_ORIGIN },
    });

    const agentOk = await apiSignIn(request, agentEmail, tempPassword);
    expect(agentOk).toBeTruthy();

    const home = await request.get("/api/v1/me/home-context");
    expect(home.ok()).toBeTruthy();
    const homeBody = (await home.json()) as {
      data?: {
        kind?: string;
        entitlements?: { productKeys?: string[] };
        roles?: string[];
      };
    };
    expect(homeBody.data?.kind).toBe("tenant_qa");
    expect(homeBody.data?.roles ?? []).toEqual(
      expect.arrayContaining([
        "qa-staff",
        "product-qep-engineer",
        "product-projects-member",
        "product-time-employee",
      ]),
    );

    const actions = await request.get("/api/v1/platform/quick-actions");
    const actionsBody = (await actions.json()) as {
      data?: { actions?: { id: string }[] };
    };
    const ids = (actionsBody.data?.actions ?? []).map((a) => a.id);
    expect(ids).toContain("qa-run-test");
    expect(ids).toContain("qa-new-project");
    expect(ids).not.toContain("qa-new-ticket");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/QA work/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("Phase A Security provision → login", () => {
  test("provisions Security staff and lands on tenant_security home", async ({
    page,
    request,
  }) => {
    const adminOk = await apiSignIn(request, ORG_ADMIN_EMAIL, ORG_ADMIN_PASSWORD);
    test.skip(!adminOk, "Demo org admin unavailable");

    const personas = await request.get("/api/v1/iam/personas");
    test.skip(!personas.ok(), "IAM personas API unavailable");
    const personaBody = (await personas.json()) as {
      data?: { staffFunctions?: { id: string }[] };
    };
    const hasStaffFn = (personaBody.data?.staffFunctions ?? []).some(
      (f) => f.id === "staff-fn-security",
    );
    test.skip(!hasStaffFn, "Security staff function not deployed — rebuild required");

    const stamp = Date.now();
    const agentEmail = `security.${stamp}@demo-org.local`;
    const tempPassword = `Apz-Sec-${stamp}!1`;

    const provision = await request.post("/api/v1/iam/members", {
      data: {
        email: agentEmail,
        displayName: "Security Vertical",
        staffFunctionId: "staff-fn-security",
        provision: true,
        temporaryPassword: tempPassword,
        productKeys: ["pentest", "documents", "time"],
      },
      headers: {
        origin: WEB_ORIGIN,
        "content-type": "application/json",
      },
    });
    expect(provision.ok()).toBeTruthy();
    const provisionBody = (await provision.json()) as {
      data?: {
        provisioned?: boolean;
        effectiveAccessSummary?: { products: { productKey: string }[] };
      };
    };
    expect(provisionBody.data?.provisioned).toBe(true);
    const productKeys =
      provisionBody.data?.effectiveAccessSummary?.products.map((p) => p.productKey) ??
      [];
    expect(productKeys).toEqual(
      expect.arrayContaining(["pentest", "documents", "time"]),
    );
    expect(productKeys).not.toContain("support");
    expect(productKeys).not.toContain("qep");

    await request.post("/api/auth/sign-out", {
      headers: { origin: WEB_ORIGIN },
    });

    const agentOk = await apiSignIn(request, agentEmail, tempPassword);
    expect(agentOk).toBeTruthy();

    const home = await request.get("/api/v1/me/home-context");
    expect(home.ok()).toBeTruthy();
    const homeBody = (await home.json()) as {
      data?: {
        kind?: string;
        entitlements?: { productKeys?: string[] };
        roles?: string[];
      };
    };
    expect(homeBody.data?.kind).toBe("tenant_security");
    expect(homeBody.data?.roles ?? []).toEqual(
      expect.arrayContaining([
        "security-staff",
        "product-pentest-analyst",
        "product-documents-auditor",
        "product-time-employee",
      ]),
    );

    const actions = await request.get("/api/v1/platform/quick-actions");
    const actionsBody = (await actions.json()) as {
      data?: { actions?: { id: string }[] };
    };
    const ids = (actionsBody.data?.actions ?? []).map((a) => a.id);
    expect(ids).toContain("qa-log-time");
    expect(ids).not.toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-run-test");

    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Security work/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
