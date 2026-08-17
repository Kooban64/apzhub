/**
 * Human-ready application audit — Playwright UI crawl of public + persona paths.
 * Usage:
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:3300 pnpm exec tsx scripts/human-ready-browser-audit.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

type Finding = {
  readonly severity: "blocker" | "major" | "minor" | "info";
  readonly area: string;
  readonly path: string;
  readonly message: string;
};

const findings: Finding[] = [];
const checked = new Set<string>();

function note(
  severity: Finding["severity"],
  area: string,
  path: string,
  message: string,
) {
  findings.push({ severity, area, path, message });
  console.log(`[${severity.toUpperCase()}] ${area} ${path}: ${message}`);
}

const PUBLIC_ROUTES = [
  "/",
  "/solutions",
  "/solutions/quality",
  "/solutions/security",
  "/solutions/productivity",
  "/products",
  "/marketplace",
  "/pricing",
  "/pricing/checkout",
  "/resources",
  "/contact",
  "/about",
  "/productivity",
  "/qa",
  "/qa/services",
  "/pentest",
  "/pentest/services",
  "/industries",
  "/case-studies",
  "/methodology",
  "/services",
  "/services/security-assessments",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/disclaimer",
  "/login",
  "/register",
  "/forgot-password",
  "/onboarding/welcome",
];

const PERSONAS: readonly {
  id: string;
  expectedPathPrefix: string;
  shellNav?: readonly string[];
  workspace?: boolean;
}[] = [
  {
    id: "superadmin",
    expectedPathPrefix: "/console",
    shellNav: [
      "/console",
      "/console/customers",
      "/console/catalogue",
      "/console/limits",
      "/console/payments",
      "/console/api-keys",
      "/console/secrets",
      "/console/audit",
      "/ops",
      "/finance",
      "/compliance",
      "/org",
      "/apzpen",
    ],
  },
  {
    id: "platform_admin",
    expectedPathPrefix: "/platform-admin",
    shellNav: [
      "/platform-admin",
      "/platform-admin/tenants",
      "/platform-admin/billing",
      "/platform-admin/operations",
      "/apzpen",
    ],
  },
  {
    id: "finance",
    expectedPathPrefix: "/finance",
    shellNav: [
      "/finance",
      "/finance/accounts",
      "/finance/invoices",
      "/finance/dunning",
      "/finance/credits",
      "/finance/refunds",
      "/finance/statements",
    ],
  },
  {
    id: "support",
    expectedPathPrefix: "/ops",
    shellNav: ["/ops", "/ops/health", "/ops/sessions", "/apzpen"],
  },
  {
    id: "compliance",
    expectedPathPrefix: "/compliance",
    shellNav: [
      "/compliance",
      "/compliance/signups",
      "/compliance/statutory",
      "/compliance/entitlements",
      "/compliance/audit",
      "/compliance/findings",
    ],
  },
  {
    id: "org_admin",
    expectedPathPrefix: "/org",
    shellNav: [
      "/org",
      "/org/members",
      "/org/services",
      "/org/professional-tools",
      "/org/subscriptions",
      "/org/billing",
      "/apzpen",
    ],
  },
  {
    id: "org_member",
    expectedPathPrefix: "/workspace",
    workspace: true,
  },
  {
    id: "individual",
    expectedPathPrefix: "/workspace",
    workspace: true,
  },
];

const WORKSPACE_ROUTES = [
  "/workspace/home",
  "/workspace/projects",
  "/workspace/support",
  "/workspace/time",
  "/workspace/documents",
  "/workspace/knowledge",
  "/workspace/qep",
  "/workspace/administration/members",
  "/workspace/billing",
  "/workspace/personalisation",
  "/workspace/settings",
];

async function assertCssOk(page: Page, path: string): Promise<void> {
  const hrefs = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((nodes) =>
      nodes
        .map((n) => (n as HTMLLinkElement).href)
        .filter((h) => h.includes("/_next/static/")),
    );
  if (hrefs.length === 0) {
    note("major", "css", path, "No Next stylesheet link found");
    return;
  }
  for (const href of hrefs.slice(0, 2)) {
    const res = await page.request.get(href);
    if (!res.ok()) {
      note("blocker", "css", path, `Stylesheet → HTTP ${res.status()}`);
    }
  }
}

async function visit(page: Page, path: string, area: string): Promise<number> {
  const key = `${area}:${path}`;
  if (checked.has(key)) return 200;
  checked.add(key);

  const response = await page.goto(`${ORIGIN}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  const status = response?.status() ?? 0;

  if (status >= 500) {
    note("blocker", area, path, `HTTP ${status}`);
    return status;
  }
  if (status >= 400) {
    // Intentional closed surfaces (e.g. register when self-serve is off) should
    // render 200 with an explanation — treat remaining 404s as majors.
    note("major", area, path, `HTTP ${status}`);
    return status;
  }

  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "");
  const lower = bodyText.toLowerCase();
  const landedPath = new URL(page.url()).pathname;
  if (
    landedPath.includes("/login") &&
    !path.includes("/login") &&
    !area.startsWith("public")
  ) {
    note(
      "major",
      area,
      path,
      `Unexpected redirect to login (${page.url()}) — session lost or auth middleware false-negative`,
    );
  }
  if (
    lower.includes("application error") ||
    lower.includes("internal server error") ||
    lower.includes("this page couldn’t load") ||
    lower.includes("this page couldn't load") ||
    /\bdigest:\s*\w+/i.test(bodyText)
  ) {
    note("blocker", area, path, "Error UI / Next crash text in body");
  }
  if (
    /\bzammad\b/i.test(bodyText) ||
    /\bplane\.so\b/i.test(bodyText) ||
    /\bkimai\b/i.test(bodyText)
  ) {
    note("major", area, path, "Provider brand leakage in visible text");
  }

  await assertCssOk(page, path);
  return status;
}

async function uiQuickLogin(page: Page, personaId: string): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(`${ORIGIN}/login`, { waitUntil: "domcontentloaded" });
    const select = page.getByTestId("demo-quick-login");
    if ((await select.count()) === 0) {
      note(
        "blocker",
        `persona:${personaId}`,
        "/login",
        "Quick login control missing (ALLOW_DEMO_PERSONAS?)",
      );
      return false;
    }
    await select.selectOption(personaId);
    try {
      await page.waitForURL((url) => !url.pathname.includes("/login"), {
        timeout: 60_000,
      });
      return true;
    } catch {
      const alert = await page
        .locator('[role="alert"]')
        .textContent()
        .catch(() => null);
      if (attempt < 2) {
        await page.waitForTimeout(3000 * (attempt + 1));
        continue;
      }
      note(
        "blocker",
        `persona:${personaId}`,
        "/login",
        `UI quick-login did not leave /login${alert ? `: ${alert}` : ""}`,
      );
      return false;
    }
  }
  return false;
}

async function crawlPublic(page: Page): Promise<void> {
  for (const path of PUBLIC_ROUTES) {
    await visit(page, path, "public");
  }

  await page.goto(`${ORIGIN}/`, { waitUntil: "domcontentloaded" });
  const homeCtas: { label: string; href: string }[] = [
    { label: "Explore Products", href: "/marketplace" },
    { label: "View Solutions", href: "/solutions" },
  ];
  for (const cta of homeCtas) {
    const link = page
      .locator(`a[href="${cta.href}"]`)
      .filter({ hasText: cta.label })
      .first();
    if ((await link.count()) === 0) {
      note("major", "public-cta", "/", `Missing CTA: ${cta.label} → ${cta.href}`);
      continue;
    }
    await Promise.all([
      page.waitForURL((url) => url.pathname.startsWith(cta.href), { timeout: 20_000 }),
      link.click(),
    ]);
    note("info", "public-cta", cta.href, `Clicked “${cta.label}” → ${cta.href}`);
    await assertCssOk(page, cta.href);
    await page.goto(`${ORIGIN}/`, { waitUntil: "domcontentloaded" });
  }

  // Header nav destinations
  const headerHrefs = await page
    .locator("header nav a[href]")
    .evaluateAll((anchors) => [
      ...new Set(
        anchors
          .map((a) => (a as HTMLAnchorElement).getAttribute("href") || "")
          .filter((h) => h.startsWith("/")),
      ),
    ]);
  for (const href of headerHrefs) {
    await visit(page, href.split("?")[0]!, "header-nav");
  }
}

async function crawlPersona(
  page: Page,
  persona: (typeof PERSONAS)[number],
): Promise<void> {
  await page.context().clearCookies();
  await page.waitForTimeout(2500);

  if (!(await uiQuickLogin(page, persona.id))) return;

  const landed = new URL(page.url()).pathname;
  if (!landed.startsWith(persona.expectedPathPrefix)) {
    note(
      "major",
      `persona:${persona.id}`,
      landed,
      `Landed on ${landed}, expected prefix ${persona.expectedPathPrefix}`,
    );
  } else {
    note("info", `persona:${persona.id}`, landed, "Landing path OK");
  }
  await assertCssOk(page, landed);

  // Visible nav from current shell
  const navHrefs = await page
    .locator("nav a[href], aside a[href], [role='navigation'] a[href]")
    .evaluateAll((anchors) =>
      [
        ...new Set(
          anchors
            .map((a) => (a as HTMLAnchorElement).getAttribute("href") || "")
            .filter((h) => h.startsWith("/") && !h.startsWith("//")),
        ),
      ].slice(0, 40),
    );
  for (const href of navHrefs) {
    await visit(page, href.split("?")[0]!, `persona-nav:${persona.id}`);
  }

  if (persona.shellNav) {
    for (const path of persona.shellNav) {
      await visit(page, path, `shell:${persona.id}`);
    }
  }

  if (persona.id === "org_admin") {
    // Force navigation — visit() may have already recorded /org/members during shellNav.
    await page.goto(`${ORIGIN}/org/members`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    try {
      await page
        .getByText("Checking access…")
        .waitFor({ state: "hidden", timeout: 30_000 })
        .catch(() => undefined);
      await page.getByTestId("org-admin-members-view").waitFor({
        state: "visible",
        timeout: 30_000,
      });
      await page
        .getByText("Loading templates…")
        .waitFor({ state: "hidden", timeout: 45_000 })
        .catch(() => undefined);
      const wizard = page.getByTestId("iam-create-user-wizard");
      await wizard.waitFor({ state: "visible", timeout: 45_000 });
      await page.getByTestId("iam-invite-email").fill("audit.agent@example.com");
      await page.getByTestId("iam-wizard-next").click();
      await page.getByTestId("iam-wizard-next").click();
      note("info", "shell:org_admin", "/org/members", "Wizard next navigation works");
    } catch {
      note(
        "major",
        "shell:org_admin",
        "/org/members",
        `Create-user wizard missing or slow to load (at ${page.url()})`,
      );
    }
  }

  if (persona.workspace) {
    for (const path of WORKSPACE_ROUTES) {
      await visit(page, path, `workspace:${persona.id}`);
    }
    // Force home — visit() may skip if already recorded during the crawl.
    await page.goto(`${ORIGIN}/workspace/home`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page
      .getByText("Opening your console…")
      .waitFor({ state: "hidden", timeout: 30_000 })
      .catch(() => undefined);
    try {
      await page.getByTestId("workbench-header-chrome").waitFor({
        state: "visible",
        timeout: 30_000,
      });
      note(
        "info",
        `workspace:${persona.id}`,
        "/workspace/home",
        "workbench-header-chrome present",
      );
    } catch {
      note(
        "major",
        `workspace:${persona.id}`,
        "/workspace/home",
        `Missing workbench-header-chrome (at ${page.url()})`,
      );
    }
    try {
      await page.getByTestId("product-switcher").waitFor({
        state: "visible",
        timeout: 15_000,
      });
      note(
        "info",
        `workspace:${persona.id}`,
        "/workspace/home",
        "product-switcher present",
      );
    } catch {
      note(
        "major",
        `workspace:${persona.id}`,
        "/workspace/home",
        `Missing product-switcher (at ${page.url()})`,
      );
    }
  }
}

async function main(): Promise<void> {
  console.log(`Auditing ${ORIGIN} …`);
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: ORIGIN,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  const health = await page.request.get(`${ORIGIN}/api/health`);
  if (!health.ok()) {
    note("blocker", "health", "/api/health", `HTTP ${health.status()}`);
  } else {
    note("info", "health", "/api/health", "OK");
  }

  await crawlPublic(page);

  for (const persona of PERSONAS) {
    console.log(`\n=== Persona ${persona.id} ===`);
    await crawlPersona(page, persona);
  }

  await browser.close();

  const blockers = findings.filter((f) => f.severity === "blocker");
  const majors = findings.filter((f) => f.severity === "major");
  const report = {
    origin: ORIGIN,
    checked: checked.size,
    generatedAt: new Date().toISOString(),
    summary: {
      blocker: blockers.length,
      major: majors.length,
      minor: findings.filter((f) => f.severity === "minor").length,
      info: findings.filter((f) => f.severity === "info").length,
    },
    findings,
  };

  const out = join(
    process.cwd(),
    "docs/operations/evidence",
    `human-ready-browser-audit-${Date.now()}.json`,
  );
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${out}`);
  console.log(
    `Summary: ${report.summary.blocker} blockers, ${report.summary.major} majors, ${checked.size} checks`,
  );
  if (blockers.length > 0 || majors.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
