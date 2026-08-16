/**
 * Phase G — Streams 5∥6 horizontal close smoke (G4).
 * Shell policy + entitlement ledger via home-context API; DesktopShell via DEV UI path.
 * Queue-scope + hard-mode covered by Vitest (`queue-scope` · `soft-product-access`).
 */
import { test, expect, type APIRequestContext } from "@playwright/test";

const DEMO_PASSWORD = "DemoPassword123!";
const WEB_ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${process.env.PLAYWRIGHT_WEB_PORT ?? "3300"}`;

async function signInWithCredentials(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<void> {
  const response = await request.post("/api/auth/sign-in/email", {
    data: { email, password },
    headers: {
      origin: WEB_ORIGIN,
      referer: `${WEB_ORIGIN}/login`,
    },
  });
  expect(response.ok(), `sign-in failed for ${email}: ${response.status()}`).toBe(true);
}

async function seedDemoPersona(
  request: APIRequestContext,
  personaId: string,
): Promise<{ email: string; password: string; kind: string }> {
  const res = await request.post("/api/v1/demo/quick-login", {
    data: { id: personaId },
  });
  expect(res.ok(), `demo quick-login ${personaId}: ${res.status()}`).toBe(true);
  const body = (await res.json()) as {
    data?: { email?: string; password?: string; kind?: string };
  };
  const email = body.data?.email;
  const password = body.data?.password ?? DEMO_PASSWORD;
  const kind = body.data?.kind;
  expect(email).toBeTruthy();
  expect(kind).toBeTruthy();
  return { email: email!, password, kind: kind! };
}

async function readHomeContext(request: APIRequestContext): Promise<{
  kind?: string;
  shellFamily?: string;
  landing?: { path?: string; shell?: string };
  entitlements?: {
    orgProductKeys?: string[];
    productKeys?: string[];
  } | null;
}> {
  const res = await request.get("/api/v1/me/home-context");
  expect(res.ok()).toBe(true);
  const body = (await res.json()) as {
    data?: {
      kind?: string;
      shellFamily?: string;
      landing?: { path?: string; shell?: string };
      entitlements?: {
        orgProductKeys?: string[];
        productKeys?: string[];
      } | null;
    };
  };
  return body.data ?? {};
}

test.describe("Phase G — Streams 5∥6 horizontal smoke", () => {
  test("health endpoint is live for this build", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      status: "healthy",
      dependencies: {
        database: { status: "healthy" },
        redis: { status: "healthy" },
      },
    });
  });

  test("org_member home-context prefers DesktopShell", async ({ request }) => {
    const member = await seedDemoPersona(request, "org_member");
    await signInWithCredentials(request, member.email, member.password);
    const ctx = await readHomeContext(request);
    expect(ctx.kind).toBe("org_member");
    expect(ctx.shellFamily).toBe("desktop");
    expect(ctx.landing?.path).toMatch(/\/workspace\//);
  });

  test("org_admin home-context prefers OperatorShell landing", async ({ request }) => {
    const admin = await seedDemoPersona(request, "org_admin");
    await signInWithCredentials(request, admin.email, admin.password);
    const ctx = await readHomeContext(request);
    expect(ctx.kind).toBe("org_admin");
    expect(ctx.shellFamily).toBe("operator");
    expect(ctx.landing?.path).toMatch(/^\/org/);
  });

  test("demo org entitlements ledger is non-empty (no soft-open empty)", async ({
    request,
  }) => {
    const admin = await seedDemoPersona(request, "org_admin");
    await signInWithCredentials(request, admin.email, admin.password);
    const ctx = await readHomeContext(request);
    const orgKeys = ctx.entitlements?.orgProductKeys ?? [];
    const userKeys = ctx.entitlements?.productKeys ?? [];
    expect(orgKeys.length + userKeys.length).toBeGreaterThan(0);
  });
});
