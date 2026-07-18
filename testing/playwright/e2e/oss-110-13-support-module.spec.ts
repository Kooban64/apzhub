import { expect, test, type Page, type Route } from "@playwright/test";

const DEV_EMAIL = "dev@apzhub.local";
const DEV_PASSWORD = "DevPassword123!";

const REQUEST_ID = "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const ARTICLE_ID = "sart_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const NOTE_ID = "sart_cccccccccccccccccccccccccccccccc";
const REPLY_ID = "sart_dddddddddddddddddddddddddddddddd";
const GROUP_ID = "sgrp_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const USER_ID = "suser_ffffffffffffffffffffffffffffffff";

function meta() {
  return { requestId: "req_e2e", correlationId: "corr_e2e" };
}

function pageEnvelope() {
  return { cursor: null, nextCursor: null, limit: 20, hasMore: false };
}

function supportRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: REQUEST_ID,
    tenantId: "tenant_e2e",
    displayId: "10042",
    title: "VPN cannot connect",
    groupId: GROUP_ID,
    requesterId: USER_ID,
    assigneeId: USER_ID,
    status: "open",
    priority: "high",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

async function ensureWorkspace(page: Page) {
  if (!/\/workspace\//.test(page.url())) {
    await page.goto("/workspace/home", { waitUntil: "domcontentloaded" });
  }
  await expect(page).toHaveURL(/\/workspace\//, { timeout: 20_000 });
}

async function signIn(page: Page) {
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

  const uniqueEmail = `support-e2e-${Date.now()}@apzhub.local`;
  await page.goto("/register", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Name").fill("Support E2E User");
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

async function mockSupportApi(page: Page) {
  let current = supportRequest();
  const articles: Record<string, unknown>[] = [
    {
      id: ARTICLE_ID,
      tenantId: "tenant_e2e",
      supportTicketId: REQUEST_ID,
      body: "Initial customer message",
      bodyFormat: "text/plain",
      channel: "email",
      visibility: "public",
      senderType: "customer",
      author: { senderType: "customer", displayName: "Pat" },
      deliveryStatus: "sent",
      attachments: [],
      createdAt: "2026-01-01T01:00:00.000Z",
      updatedAt: "2026-01-01T01:00:00.000Z",
    },
  ];

  await page.route("**/api/v1/support-**", async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === "/api/v1/support-requests" && method === "GET") {
      const status = url.searchParams.get("status");
      const items = !status || status === current.status ? [current] : [];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: items, page: pageEnvelope(), meta: meta() }),
      });
      return;
    }

    if (path === `/api/v1/support-requests/${REQUEST_ID}` && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current, meta: meta() }),
      });
      return;
    }

    if (
      path === `/api/v1/support-requests/${REQUEST_ID}/articles` &&
      method === "GET"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: articles, page: pageEnvelope(), meta: meta() }),
      });
      return;
    }

    if (path === `/api/v1/support-requests/${REQUEST_ID}/history` && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "shist_11111111111111111111111111111111",
              supportTicketId: REQUEST_ID,
              action: "created",
              summary: "Request created",
              actor: { kind: "system" },
              occurredAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
      return;
    }

    if (
      path === `/api/v1/support-requests/${REQUEST_ID}/articles/notes` &&
      method === "POST"
    ) {
      const body = request.postDataJSON() as { body: string };
      const note = {
        id: NOTE_ID,
        tenantId: "tenant_e2e",
        supportTicketId: REQUEST_ID,
        body: body.body,
        bodyFormat: "text/plain",
        channel: "note",
        visibility: "internal",
        senderType: "agent",
        author: { senderType: "agent", displayName: "Agent" },
        deliveryStatus: "none",
        attachments: [],
        createdAt: "2026-01-02T03:00:00.000Z",
        updatedAt: "2026-01-02T03:00:00.000Z",
      };
      articles.push(note);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: note, meta: meta() }),
      });
      return;
    }

    if (
      path === `/api/v1/support-requests/${REQUEST_ID}/articles/replies` &&
      method === "POST"
    ) {
      const body = request.postDataJSON() as { body: string; channel?: string };
      const reply = {
        id: REPLY_ID,
        tenantId: "tenant_e2e",
        supportTicketId: REQUEST_ID,
        body: body.body,
        bodyFormat: "text/plain",
        channel: body.channel ?? "email",
        visibility: "public",
        senderType: "agent",
        author: { senderType: "agent", displayName: "Agent" },
        deliveryStatus: "pending",
        attachments: [],
        createdAt: "2026-01-02T04:00:00.000Z",
        updatedAt: "2026-01-02T04:00:00.000Z",
      };
      articles.push(reply);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: reply, meta: meta() }),
      });
      return;
    }

    if (path === `/api/v1/support-requests/${REQUEST_ID}/state` && method === "POST") {
      const body = request.postDataJSON() as { status: string };
      current = supportRequest({ ...current, status: body.status });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current, meta: meta() }),
      });
      return;
    }

    if (
      path === `/api/v1/support-requests/${REQUEST_ID}/priority` &&
      method === "POST"
    ) {
      const body = request.postDataJSON() as { priority: string };
      current = supportRequest({ ...current, priority: body.priority });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current, meta: meta() }),
      });
      return;
    }

    if (path === `/api/v1/support-requests/${REQUEST_ID}/owner` && method === "POST") {
      const body = request.postDataJSON() as { assigneeId: string };
      current = supportRequest({ ...current, assigneeId: body.assigneeId });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current, meta: meta() }),
      });
      return;
    }

    if (path === `/api/v1/support-requests/${REQUEST_ID}/close` && method === "POST") {
      current = supportRequest({ ...current, status: "closed" });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current, meta: meta() }),
      });
      return;
    }

    if (path === `/api/v1/support-requests/${REQUEST_ID}/reopen` && method === "POST") {
      current = supportRequest({ ...current, status: "open" });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current, meta: meta() }),
      });
      return;
    }

    if (path === "/api/v1/support-search" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            query: url.searchParams.get("q") ?? "",
            hits: [
              {
                id: REQUEST_ID,
                kind: "support_request",
                title: current.title,
                snippet: "VPN",
              },
            ],
            totalCount: 1,
            page: 1,
            perPage: 30,
            hasNextPage: false,
          },
          meta: meta(),
        }),
      });
      return;
    }

    if (path === "/api/v1/support-analytics" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            capturedAt: "2026-01-02T00:00:00.000Z",
            totalTickets: 12,
            openTickets: 4,
            closedTickets: 6,
            pendingTickets: 2,
            newTickets: 1,
            overdueTickets: 3,
            unassignedTickets: 1,
            byPriority: [{ key: "high", label: "High", count: 4 }],
            byState: [{ key: "open", label: "Open", count: 4 }],
            byOrganization: [],
            byGroup: [],
            byOwner: [],
          },
          meta: meta(),
        }),
      });
      return;
    }

    if (path.startsWith("/api/v1/support-users") && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: USER_ID,
              tenantId: "tenant_e2e",
              displayName: "Pat Customer",
              email: "pat@example.com",
              active: true,
              role: "customer",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
      return;
    }

    if (path.startsWith("/api/v1/support-groups") && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: GROUP_ID,
              tenantId: "tenant_e2e",
              name: "Support Desk",
              active: true,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
      return;
    }

    if (path.startsWith("/api/v1/support-organizations") && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], page: pageEnvelope(), meta: meta() }),
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "NOT_FOUND", message: `Unhandled mock ${method} ${path}` },
        meta: meta(),
      }),
    });
  });
}

test.describe("OSS-110-13 Support Module UI", () => {
  test("open module, list, filter, detail, note, reply, commands, search, analytics", async ({
    page,
  }) => {
    await signIn(page);
    await mockSupportApi(page);

    await page.goto("/workspace/support/requests");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expect(page.getByText("VPN cannot connect")).toBeVisible();

    await page.getByTestId("support-filter-status").selectOption("pending");
    await expect(page.getByTestId("support-empty")).toBeVisible();
    await page.getByTestId("support-filter-status").selectOption("open");
    await expect(page.getByText("VPN cannot connect")).toBeVisible();

    await page.getByText("VPN cannot connect").click();
    await expect(page).toHaveURL(
      new RegExp(`/workspace/support/requests/${REQUEST_ID}`),
    );
    await expect(page.getByTestId("support-request-detail")).toBeVisible();

    await page.getByTestId("support-internal-note-body").fill("Checking logs");
    await page.getByTestId("support-internal-note-submit").click();
    await expect(page.getByText("Checking logs")).toBeVisible();

    await page.getByTestId("support-customer-reply-body").fill("Please reboot");
    await page.getByTestId("support-customer-reply-channel").selectOption("email");
    await page.getByTestId("support-customer-reply-submit").click();
    await expect(page.getByText("Please reboot")).toBeVisible();

    await page.getByTestId("support-command-state").selectOption("pending");
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/support-requests/${REQUEST_ID}/state`) &&
          response.request().method() === "POST",
      ),
      page.getByTestId("support-command-state-apply").click(),
    ]);
    await expect(page.getByLabel("Status: Pending")).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("support-command-priority").selectOption("urgent");
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/support-requests/${REQUEST_ID}/priority`) &&
          response.request().method() === "POST",
      ),
      page.getByTestId("support-command-priority-apply").click(),
    ]);
    await expect(page.getByLabel("Priority: Urgent")).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("support-command-owner").fill(USER_ID);
    await page.getByTestId("support-command-owner-assign").click();

    await page.getByTestId("support-command-close").click();
    await page.getByTestId("support-confirm-dialog-confirm").click();
    await expect(page.getByTestId("support-command-reopen")).toBeVisible();
    await page.getByTestId("support-command-reopen").click();
    await expect(page.getByTestId("support-command-close")).toBeVisible();

    await page.goto("/workspace/support/search");
    await page.getByTestId("support-search-q").fill("VPN");
    await page.getByTestId("support-search-submit").click();
    await expect(page.getByTestId("support-search-results")).toBeVisible();
    await expect(
      page.getByTestId("support-search-results").getByText("Request", { exact: true }),
    ).toBeVisible();

    await page.goto("/workspace/support/analytics");
    await expect(page.getByTestId("support-analytics")).toBeVisible();
    await expect(page.getByText(/not an SLA/i)).toBeVisible();
  });

  test("maps 403 and 503 safely", async ({ page }) => {
    await signIn(page);

    await page.route(/\/api\/v1\/support-requests(\?|$)/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "FORBIDDEN", message: "zammad denied" },
          meta: meta(),
        }),
      });
    });

    await page.goto("/workspace/support/requests");
    await expect(page.getByTestId("support-page")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("support-error")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("support-error")).not.toContainText(/zammad/i);

    await page.unroute(/\/api\/v1\/support-requests(\?|$)/);
    await page.route(/\/api\/v1\/support-analytics(\?|$)/, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "UNAVAILABLE", message: "provider down" },
          meta: meta(),
        }),
      });
    });
    await page.goto("/workspace/support/analytics");
    await expect(page.getByTestId("support-page")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("support-error")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("support-error")).not.toContainText(/provider/i);
  });
});
