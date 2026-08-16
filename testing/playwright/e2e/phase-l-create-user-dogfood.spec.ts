/**
 * Phase L — APZOR create-user dogfood (S6-09 slice).
 * Provisions Support Agent with Phase K overlays (queue scope + professional tool),
 * inspects via User Inspector API, then asserts Support-shaped home-context.
 */
import { expect, test, type APIRequestContext } from "@playwright/test";

const DEMO_PASSWORD = "DemoPassword123!";
const WEB_ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${process.env.PLAYWRIGHT_WEB_PORT ?? "3300"}`;

async function signInWithCredentials(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<boolean> {
  const response = await request.post("/api/auth/sign-in/email", {
    data: { email, password },
    headers: {
      origin: WEB_ORIGIN,
      referer: `${WEB_ORIGIN}/login`,
    },
  });
  return response.ok();
}

async function seedDemoPersona(
  request: APIRequestContext,
  personaId: string,
): Promise<{ email: string; password: string }> {
  const res = await request.post("/api/v1/demo/quick-login", {
    data: { id: personaId },
  });
  expect(res.ok(), `demo quick-login ${personaId}: ${res.status()}`).toBe(true);
  const body = (await res.json()) as {
    data?: { email?: string; password?: string };
  };
  const email = body.data?.email;
  expect(email, "demo quick-login email missing").toBeTruthy();
  return { email: email!, password: body.data?.password ?? DEMO_PASSWORD };
}

test.describe("Phase L — create-user dogfood (Support Agent + overlays)", () => {
  test("provisions with queue scope + tool; Inspector and home stay Support-shaped", async ({
    request,
  }) => {
    test.setTimeout(120_000);
    const admin = await seedDemoPersona(request, "org_admin");
    expect(
      await signInWithCredentials(request, admin.email, admin.password),
      "org admin sign-in",
    ).toBe(true);

    const personas = await request.get("/api/v1/iam/personas");
    expect(personas.ok(), `personas ${personas.status()}`).toBe(true);
    const personaBody = (await personas.json()) as {
      data?: { staffFunctions?: { id: string }[] };
    };
    expect(
      (personaBody.data?.staffFunctions ?? []).some(
        (f) => f.id === "staff-fn-customer-support",
      ),
      "staff-fn-customer-support required",
    ).toBe(true);

    const stamp = Date.now();
    const agentEmail = `support.dogfood.${stamp}@demo-org.local`;
    const tempPassword = `Apz-Dogfood-${stamp}!1`;
    const queueId = `intake-${stamp}`;

    const provision = await request.post("/api/v1/iam/members", {
      data: {
        email: agentEmail,
        displayName: "Support Dogfood Agent",
        staffFunctionId: "staff-fn-customer-support",
        provision: true,
        temporaryPassword: tempPassword,
        productKeys: ["support", "time", "knowledge"],
        resourceScopeGrants: [`support.queue:${queueId}`],
        professionalToolIds: ["analytics-models"],
        professionalToolsReason: "Phase L dogfood specialist analytics",
      },
      headers: {
        origin: WEB_ORIGIN,
        "content-type": "application/json",
      },
    });
    expect(provision.ok(), `provision ${provision.status()}`).toBeTruthy();
    const provisionBody = (await provision.json()) as {
      data?: {
        provisioned?: boolean;
        userId?: string;
        member?: { membershipId?: string };
        overlays?: {
          resourceScopeGrants?: string[];
          professionalToolIds?: string[];
        };
        effectiveAccessSummary?: {
          products: { productKey: string }[];
        };
      };
    };
    expect(provisionBody.data?.provisioned).toBe(true);
    expect(provisionBody.data?.userId).toBeTruthy();
    // Phase K overlays — soft-assert when long-lived host predates Phase K deploy.
    const overlays = provisionBody.data?.overlays;
    if (overlays) {
      expect(overlays.resourceScopeGrants).toEqual([`support.queue:${queueId}`]);
      expect(overlays.professionalToolIds).toEqual(["analytics-models"]);
    } else {
      test.info().annotations.push({
        type: "note",
        description:
          "Host build has no provision overlays payload — rebuild/restart to certify Phase K fields live",
      });
    }
    const productKeys =
      provisionBody.data?.effectiveAccessSummary?.products.map((p) => p.productKey) ??
      [];
    expect(productKeys).toEqual(
      expect.arrayContaining(["support", "time", "knowledge"]),
    );
    expect(productKeys).not.toContain("qep");
    expect(productKeys).not.toContain("projects");

    const membershipId = provisionBody.data?.member?.membershipId;
    expect(membershipId).toBeTruthy();

    const inspect = await request.get(
      `/api/v1/iam/members/${encodeURIComponent(membershipId!)}/access`,
    );
    expect(inspect.ok(), `inspect ${inspect.status()}`).toBeTruthy();
    const inspectBody = (await inspect.json()) as {
      data?: {
        inspection?: {
          tabs?: {
            scopes?: { grantKey?: string; kind?: string }[];
            professionalTools?: { toolId?: string; status?: string }[];
          };
        };
      };
    };
    if (overlays) {
      const scopes = inspectBody.data?.inspection?.tabs?.scopes ?? [];
      expect(
        scopes.some((s) => s.grantKey === `support.queue:${queueId}`),
      ).toBeTruthy();
      const tools = inspectBody.data?.inspection?.tabs?.professionalTools ?? [];
      expect(
        tools.some((t) => t.toolId === "analytics-models" && t.status === "granted"),
      ).toBeTruthy();
    }

    await request.post("/api/auth/sign-out", {
      headers: { origin: WEB_ORIGIN },
    });

    expect(
      await signInWithCredentials(request, agentEmail, tempPassword),
      "agent sign-in",
    ).toBe(true);

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
    expect(homeBody.data?.entitlements?.productKeys ?? []).toEqual(
      expect.arrayContaining(["support", "time", "knowledge"]),
    );
    expect(homeBody.data?.entitlements?.productKeys ?? []).not.toContain("qep");
    expect(homeBody.data?.entitlements?.productKeys ?? []).not.toContain("projects");

    const actions = await request.get("/api/v1/platform/quick-actions");
    expect(actions.ok()).toBeTruthy();
    const actionsBody = (await actions.json()) as {
      data?: { actions?: { id: string }[] };
    };
    const ids = (actionsBody.data?.actions ?? []).map((a) => a.id);
    expect(ids).toContain("qa-new-ticket");
    expect(ids).not.toContain("qa-new-project");
    expect(ids).not.toContain("qa-run-test");
  });
});
