import { expect, type Page, type Route } from "@playwright/test";

export const DEV_EMAIL = "dev@apzhub.local";
export const DEV_PASSWORD = "DevPassword123!";

export const TIMESHEET_ID = "tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export const CREATED_TIMESHEET_ID = "tts_cccccccccccccccccccccccccccccccc";
export const ACTIVITY_ID = "tact_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
export const CUSTOMER_ID = "tcust_dddddddddddddddddddddddddddddddd";
export const TAG_ID = "ttag_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const TIME_PROJECT_ID = "tproj_ffffffffffffffffffffffffffffffff";

export function meta() {
  return { requestId: "req_time_e2e", correlationId: "corr_time_e2e" };
}

export function pageEnvelope() {
  return { cursor: null, nextCursor: null, limit: 20, hasMore: false };
}

export function timesheet(overrides: Record<string, unknown> = {}) {
  return {
    id: TIMESHEET_ID,
    tenantId: "tenant_e2e",
    userId: "user_e2e",
    description: "Client delivery block",
    status: "running",
    durationMinutes: 45,
    startedAt: "2026-07-19T08:00:00.000Z",
    activityId: ACTIVITY_ID,
    customerId: CUSTOMER_ID,
    projectId: TIME_PROJECT_ID,
    tagIds: [TAG_ID],
    billable: true,
    createdAt: "2026-07-19T08:00:00.000Z",
    updatedAt: "2026-07-19T08:45:00.000Z",
    ...overrides,
  };
}

export function activity(overrides: Record<string, unknown> = {}) {
  return {
    id: ACTIVITY_ID,
    tenantId: "tenant_e2e",
    name: "Implementation",
    description: "Product engineering",
    projectId: TIME_PROJECT_ID,
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

export function customer(overrides: Record<string, unknown> = {}) {
  return {
    id: CUSTOMER_ID,
    tenantId: "tenant_e2e",
    name: "Acme Consulting",
    number: "ACME-01",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

export function tag(overrides: Record<string, unknown> = {}) {
  return {
    id: TAG_ID,
    tenantId: "tenant_e2e",
    name: "billable",
    color: "#2266AA",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

let mutableTimesheet = timesheet();
let mutableActivity = activity();
let mutableCustomer = customer();
let mutableTag = tag();

export function resetTimeApiFixtures() {
  mutableTimesheet = timesheet();
  mutableActivity = activity();
  mutableCustomer = customer();
  mutableTag = tag();
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

async function ensureWorkspace(page: Page) {
  if (!/\/workspace\//.test(page.url())) {
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
  }
  await expect(page).toHaveURL(/\/workspace\//, { timeout: 20_000 });
}

export async function signIn(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  try {
    await expect(page).toHaveURL(/\/workspace\/|\/$/, { timeout: 15_000 });
    await ensureWorkspace(page);
    return;
  } catch {
    // Fall through to register / retry login.
  }

  const uniqueEmail = `time-e2e-${Date.now()}@apzhub.local`;
  await page.goto("/register", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Name").fill("Time E2E User");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Register" }).click();

  try {
    await expect(page).toHaveURL(/\/workspace\/|\/$/, { timeout: 20_000 });
    await ensureWorkspace(page);
    return;
  } catch {
    // Registration may fail if auth backend is busy; retry known-dev login.
  }

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/workspace\/|\/$/, { timeout: 20_000 });
  await ensureWorkspace(page);
}

export async function mockTimeApi(page: Page) {
  resetTimeApiFixtures();

  await page.route("**/api/v1/time/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (method === "GET" && path.endsWith("/time/health")) {
      await json(route, {
        data: { status: "ok", version: "1.0.0", checks: { adapter: "healthy" } },
        meta: meta(),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/time/diagnostics")) {
      await json(route, {
        data: { foundationOnly: false, domainMode: "production", notes: ["e2e"] },
        meta: meta(),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/time/capabilities")) {
      await json(route, {
        data: { timesheets: true, activities: true, customers: true, tags: true },
        meta: meta(),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/time/readiness")) {
      await json(route, {
        data: { ready: true, classification: "ready" },
        meta: meta(),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/time/compatibility")) {
      await json(route, {
        data: { compatible: true, version: "2.x" },
        meta: meta(),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/time/connection/test")) {
      await json(route, {
        data: { ok: true, message: "Connection verified" },
        meta: meta(),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/time/search")) {
      await json(route, {
        data: [
          {
            id: TIMESHEET_ID,
            kind: "timesheet",
            title: "Client delivery block",
            href: `/workspace/time/timesheets/${TIMESHEET_ID}`,
          },
        ],
        meta: meta(),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/time/timesheets")) {
      await json(route, {
        data: [mutableTimesheet],
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/time/timesheets")) {
      const body = (request.postDataJSON() as Record<string, unknown>) ?? {};
      const created = timesheet({
        id: CREATED_TIMESHEET_ID,
        description:
          typeof body.description === "string" ? body.description : "New entry",
        status: "running",
      });
      mutableTimesheet = created;
      await json(route, { data: created, meta: meta() }, 201);
      return;
    }

    if (method === "GET" && path.includes(`/time/timesheets/${TIMESHEET_ID}`)) {
      await json(route, { data: timesheet(), meta: meta() });
      return;
    }

    if (method === "GET" && path.includes(`/time/timesheets/${CREATED_TIMESHEET_ID}`)) {
      await json(route, { data: mutableTimesheet, meta: meta() });
      return;
    }

    if (method === "POST" && path.endsWith(`/time/timesheets/${TIMESHEET_ID}/stop`)) {
      await json(route, {
        data: timesheet({ status: "stopped", endedAt: "2026-07-19T09:00:00.000Z" }),
        meta: meta(),
      });
      return;
    }

    if (method === "GET" && path.endsWith("/time/activities")) {
      await json(route, {
        data: [mutableActivity],
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/time/activities")) {
      const body = (request.postDataJSON() as Record<string, unknown>) ?? {};
      await json(
        route,
        {
          data: activity({
            id: "tact_cccccccccccccccccccccccccccccccc",
            name: typeof body.name === "string" ? body.name : "New activity",
          }),
          meta: meta(),
        },
        201,
      );
      return;
    }

    if (method === "GET" && path.endsWith("/time/customers")) {
      await json(route, {
        data: [mutableCustomer],
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/time/customers")) {
      const body = (request.postDataJSON() as Record<string, unknown>) ?? {};
      await json(
        route,
        {
          data: customer({
            id: "tcust_cccccccccccccccccccccccccccccccc",
            name: typeof body.name === "string" ? body.name : "New customer",
          }),
          meta: meta(),
        },
        201,
      );
      return;
    }

    if (method === "GET" && path.endsWith("/time/tags")) {
      await json(route, {
        data: [mutableTag],
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }

    if (method === "POST" && path.endsWith("/time/tags")) {
      const body = (request.postDataJSON() as Record<string, unknown>) ?? {};
      await json(
        route,
        {
          data: tag({
            id: "ttag_cccccccccccccccccccccccccccccccc",
            name: typeof body.name === "string" ? body.name : "new-tag",
          }),
          meta: meta(),
        },
        201,
      );
      return;
    }

    if (method === "GET" && path.endsWith("/time/projects")) {
      await json(route, {
        data: [
          {
            id: TIME_PROJECT_ID,
            tenantId: "tenant_e2e",
            name: "Delivery",
            customerId: CUSTOMER_ID,
            status: "active",
            createdAt: "2026-07-01T00:00:00.000Z",
            updatedAt: "2026-07-01T00:00:00.000Z",
          },
        ],
        page: pageEnvelope(),
        meta: meta(),
      });
      return;
    }

    await json(route, { data: [], page: pageEnvelope(), meta: meta() });
  });

  await page.route("**/api/v1/search/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/health")) {
      await json(route, { data: { status: "ok" }, meta: meta() });
      return;
    }
    if (path.includes("diagnostics")) {
      await json(route, { data: { status: "ok" }, meta: meta() });
      return;
    }
    if (path.includes("audit")) {
      await json(route, { data: [], meta: meta() });
      return;
    }
    await json(route, { data: [], meta: meta() });
  });
}
