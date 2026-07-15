/**
 * OSS-110-12 — Support Vertical certification assertion suite.
 *
 * Documents and executes the certification checklist as executable tests.
 * Each test corresponds to a certification criterion.
 *
 * NOTE: This is certification only — no new Support features, APIs, UI,
 * Event Bus, webhooks, or notifications are added or tested here.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createZammadAdapter,
  disposeZammadAdapter,
  ZAMMAD_ADAPTER_VERSION,
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_TENANT_ID,
} from "@apzhub/integration-zammad";
import {
  createPlatformServicesWithZammad,
  InMemoryEntityMappingStore,
  PLATFORM_SERVICES_VERSION,
  OPERATION_AUTHORIZATION_MAPPINGS,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
} from "@apzhub/platform-services";

const ROOT = process.cwd();
const TENANT = TEST_TENANT_ID;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function walkTs(dir: string, out: string[] = []): string[] {
  try {
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walkTs(full, out);
      else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) out.push(full);
    }
  } catch {
    // Directory may not exist — ok for optional checks.
  }
  return out;
}

function readSource(rel: string): string {
  try {
    return readFileSync(join(ROOT, rel), "utf8");
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// A. Package version sanity
// ---------------------------------------------------------------------------

describe("OSS-110-12 Cert A — Package versions", () => {
  it("ZAMMAD_ADAPTER_VERSION is 0.6.0", () => {
    expect(ZAMMAD_ADAPTER_VERSION).toBe("0.6.0");
  });

  it("PLATFORM_SERVICES_VERSION is 0.7.0", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.7.0");
  });
});

// ---------------------------------------------------------------------------
// B. Architecture boundary: no integration-zammad in HTTP layer
// ---------------------------------------------------------------------------

describe("OSS-110-12 Cert B — Architecture boundary (HTTP layer)", () => {
  const NEEDLE = "@apzhub/integration-zammad";
  const NEEDLE_PATH = "integrations/zammad";

  it("handlers/support.ts has no direct @apzhub/integration-zammad import", () => {
    const source = readSource("apps/web/lib/api/v1/handlers/support.ts");
    expect(source.length).toBeGreaterThan(0);
    expect(source).not.toContain(NEEDLE);
    expect(source).not.toContain(NEEDLE_PATH);
  });

  it("schemas/support.ts has no direct @apzhub/integration-zammad import", () => {
    const source = readSource("apps/web/lib/api/v1/schemas/support.ts");
    expect(source.length).toBeGreaterThan(0);
    expect(source).not.toContain(NEEDLE);
  });

  it("all support-* route files have no @apzhub/integration-zammad import", () => {
    const supportRouteRoots = [
      "apps/web/app/api/v1/support-requests",
      "apps/web/app/api/v1/support-organizations",
      "apps/web/app/api/v1/support-groups",
      "apps/web/app/api/v1/support-users",
      "apps/web/app/api/v1/support-search",
      "apps/web/app/api/v1/support-analytics",
    ];

    const offenders: string[] = [];
    for (const root of supportRouteRoots) {
      const files = walkTs(join(ROOT, root));
      for (const f of files) {
        if (f.includes(".test.")) continue;
        const source = readFileSync(f, "utf8");
        if (source.includes(NEEDLE) || source.includes(NEEDLE_PATH)) {
          offenders.push(relative(ROOT, f));
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("support-service-impls.ts has no direct @apzhub/integration-zammad import", () => {
    const source = readSource(
      "packages/platform-services/src/services/support-service-impls.ts",
    );
    expect(source.length).toBeGreaterThan(0);
    expect(source).not.toContain(NEEDLE);
    expect(source).not.toContain(NEEDLE_PATH);
  });

  it("support-mapping-helpers.ts has no direct @apzhub/integration-zammad import", () => {
    const source = readSource(
      "packages/platform-services/src/services/support-mapping-helpers.ts",
    );
    expect(source.length).toBeGreaterThan(0);
    expect(source).not.toContain(NEEDLE);
  });
});

// ---------------------------------------------------------------------------
// C. OpenAPI specification
// ---------------------------------------------------------------------------

describe("OSS-110-12 Cert C — OpenAPI specification completeness", () => {
  let openApiContent = "";

  it("APZHUB Platform OpenAPI spec loads and contains support paths", () => {
    openApiContent = readSource("docs/specs/APZHUB-Platform-OpenAPI-v1.yaml");
    expect(openApiContent.length).toBeGreaterThan(0);

    // Core support paths
    const requiredPaths = [
      "/support-requests",
      "/support-organizations",
      "/support-groups",
      "/support-users",
      "/support-search",
      "/support-analytics",
    ];
    for (const path of requiredPaths) {
      expect(openApiContent).toContain(path);
    }
  });

  it("OpenAPI does NOT contain support-sync paths", () => {
    if (!openApiContent) {
      openApiContent = readSource("docs/specs/APZHUB-Platform-OpenAPI-v1.yaml");
    }
    expect(openApiContent).not.toContain("/support-sync");
    expect(openApiContent).not.toContain("support-sync");
  });

  it("OpenAPI does NOT contain support-webhooks paths", () => {
    if (!openApiContent) {
      openApiContent = readSource("docs/specs/APZHUB-Platform-OpenAPI-v1.yaml");
    }
    expect(openApiContent).not.toContain("/support-webhooks");
    expect(openApiContent).not.toContain("support-webhooks");
  });

  it("OpenAPI contains article sub-paths (notes, replies, history)", () => {
    if (!openApiContent) {
      openApiContent = readSource("docs/specs/APZHUB-Platform-OpenAPI-v1.yaml");
    }
    expect(openApiContent).toContain("articles");
    // History endpoint
    expect(openApiContent).toContain("history");
  });
});

// ---------------------------------------------------------------------------
// D. Permission catalogue
// ---------------------------------------------------------------------------

describe("OSS-110-12 Cert D — Permission catalogue contains support permissions", () => {
  const requiredPermissions = [
    "support.requests.list",
    "support.requests.read",
    "support.requests.create",
    "support.requests.update",
    "support.requests.assign",
    "support.requests.transition",
    "support.requests.manage",
    "support.articles.list",
    "support.articles.read",
    "support.articles.create",
    "support.organizations.list",
    "support.organizations.read",
    "support.organizations.create",
    "support.organizations.update",
    "support.organizations.archive",
    "support.groups.list",
    "support.groups.read",
    "support.groups.create",
    "support.groups.update",
    "support.users.list",
    "support.users.read",
    "support.search.execute",
    "support.analytics.read",
  ];

  for (const perm of requiredPermissions) {
    it(`permission catalogue contains "${perm}"`, () => {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(perm);
    });
  }
});

// ---------------------------------------------------------------------------
// E. Operation authorization mappings
// ---------------------------------------------------------------------------

describe("OSS-110-12 Cert E — Operation authorization mappings", () => {
  function findMapping(operation: string) {
    return OPERATION_AUTHORIZATION_MAPPINGS.find((m) => m.operation === operation);
  }

  it("closeSupportRequest → support.requests.transition", () => {
    const mapping = findMapping("closeSupportRequest");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.requests.transition");
    expect(mapping?.action).toBe("transition");
  });

  it("reopenSupportRequest → support.requests.transition", () => {
    const mapping = findMapping("reopenSupportRequest");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.requests.transition");
  });

  it("createSupportRequest → support.requests.create", () => {
    const mapping = findMapping("createSupportRequest");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.requests.create");
  });

  it("listSupportRequests → support.requests.list", () => {
    const mapping = findMapping("listSupportRequests");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.requests.list");
  });

  it("updateSupportRequest → support.requests.update", () => {
    const mapping = findMapping("updateSupportRequest");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.requests.update");
  });

  it("changeSupportRequestPriority → support.requests.update", () => {
    const mapping = findMapping("changeSupportRequestPriority");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.requests.update");
  });

  it("changeSupportRequestState → support.requests.transition", () => {
    const mapping = findMapping("changeSupportRequestState");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.requests.transition");
  });

  it("listOrganizations → support.organizations.list", () => {
    const mapping = findMapping("listOrganizations");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.organizations.list");
  });

  it("archiveOrganization → support.organizations.archive", () => {
    const mapping = findMapping("archiveOrganization");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.organizations.archive");
  });

  it("getSupportIntelligence → support.analytics.read", () => {
    const mapping = findMapping("getSupportIntelligence");
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.analytics.read");
  });

  it("supportArticle.createNote → support.articles.create", () => {
    const mapping = OPERATION_AUTHORIZATION_MAPPINGS.find(
      (m) => m.service === "supportArticle" && m.operation === "createNote",
    );
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.articles.create");
  });

  it("supportArticle.createReply → support.articles.create", () => {
    const mapping = OPERATION_AUTHORIZATION_MAPPINGS.find(
      (m) => m.service === "supportArticle" && m.operation === "createReply",
    );
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.articles.create");
  });

  it("supportSearch.search → support.search.execute", () => {
    const mapping = OPERATION_AUTHORIZATION_MAPPINGS.find(
      (m) => m.service === "supportSearch",
    );
    expect(mapping).toBeDefined();
    expect(mapping?.requiredPermission).toBe("support.search.execute");
  });
});

// ---------------------------------------------------------------------------
// F. createPlatformServicesWithZammad registers support capabilities
// ---------------------------------------------------------------------------

describe("OSS-110-12 Cert F — Support capability registration", () => {
  it("createPlatformServicesWithZammad exposes all support gateway services", async () => {
    const created = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TENANT,
      apiToken: "cert-f-token",
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });

    const bundle = createPlatformServicesWithZammad(
      created.adapter.core,
      new InMemoryEntityMappingStore(),
    );

    // All support gateway services must be callable functions (providers registered)
    expect(typeof bundle.gateway.support.listSupportRequests).toBe("function");
    expect(typeof bundle.gateway.support.getSupportRequest).toBe("function");
    expect(typeof bundle.gateway.support.createSupportRequest).toBe("function");
    expect(typeof bundle.gateway.support.updateSupportRequest).toBe("function");
    expect(typeof bundle.gateway.support.closeSupportRequest).toBe("function");
    expect(typeof bundle.gateway.support.reopenSupportRequest).toBe("function");
    expect(typeof bundle.gateway.supportOrganizations.listOrganizations).toBe("function");
    expect(typeof bundle.gateway.supportOrganizations.createOrganization).toBe("function");
    expect(typeof bundle.gateway.supportGroups.listGroups).toBe("function");
    expect(typeof bundle.gateway.supportGroups.createGroup).toBe("function");
    expect(typeof bundle.gateway.supportUsers.listUsers).toBe("function");
    expect(typeof bundle.gateway.supportArticles.list).toBe("function");
    expect(typeof bundle.gateway.supportArticles.createNote).toBe("function");
    expect(typeof bundle.gateway.supportArticles.createReply).toBe("function");
    expect(typeof bundle.gateway.supportSearch.search).toBe("function");
    expect(typeof bundle.gateway.supportHistory.getTimeline).toBe("function");
    expect(typeof bundle.gateway.supportAnalytics.getSupportIntelligence).toBe("function");

    await disposeZammadAdapter(created.adapter, created.factory);
  });

  it("support_request capability resolves to zammad provider", async () => {
    const created = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TENANT,
      apiToken: "cert-f2-token",
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });

    const bundle = createPlatformServicesWithZammad(
      created.adapter.core,
      new InMemoryEntityMappingStore(),
    );

    const serviceCtx = {
      tenantId: TENANT,
      userId: "user-cert",
      correlationId: "corr-cert",
      permissions: ["support.requests.list"],
      requestId: "req-cert",
    };

    // If support_request capability is not registered, this throws PROVIDER_CAPABILITY_UNSUPPORTED.
    // The test verifies it does NOT throw.
    const listed = await bundle.gateway.support.listSupportRequests(serviceCtx, {});
    expect(listed.items.length).toBeGreaterThanOrEqual(0);

    await disposeZammadAdapter(created.adapter, created.factory);
  });
});

// ---------------------------------------------------------------------------
// G. No sync/webhook/Event Bus features in scope
// ---------------------------------------------------------------------------

describe("OSS-110-12 Cert G — Out-of-scope features absent from HTTP layer", () => {
  const HTTP_ROOTS = [
    "apps/web/app/api/v1/support-requests",
    "apps/web/app/api/v1/support-organizations",
    "apps/web/app/api/v1/support-groups",
    "apps/web/app/api/v1/support-users",
    "apps/web/app/api/v1/support-search",
    "apps/web/app/api/v1/support-analytics",
    "apps/web/lib/api/v1/handlers/support.ts",
  ];

  const FORBIDDEN_HTTP_NEEDLES = [
    "webhook",
    "EventBus",
    "event-bus",
    "support-sync",
    "binary",
    "attachment.upload",
  ];

  for (const needle of FORBIDDEN_HTTP_NEEDLES) {
    it(`HTTP support layer does not reference "${needle}"`, () => {
      const offenders: string[] = [];
      for (const root of HTTP_ROOTS) {
        const absPath = join(ROOT, root);
        try {
          const st = statSync(absPath);
          const files = st.isDirectory() ? walkTs(absPath) : [absPath];
          for (const f of files) {
            if (f.includes(".test.")) continue;
            const src = readFileSync(f, "utf8").toLowerCase();
            if (src.includes(needle.toLowerCase())) {
              offenders.push(relative(ROOT, f));
            }
          }
        } catch {
          // Ignore missing files/dirs.
        }
      }
      expect(offenders).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// H. Known limitations documentation
// ---------------------------------------------------------------------------

describe("OSS-110-12 Cert H — Known limitations documented", () => {
  it("SUPPORT-VERTICAL-CERTIFICATION.md exists in docs/architecture/", () => {
    const source = readSource("docs/architecture/SUPPORT-VERTICAL-CERTIFICATION.md");
    expect(source.length).toBeGreaterThan(0);
    expect(source).toContain("CERTIFIED_WITH_LIMITATIONS");
  });

  it("certification document lists UI certification limitation", () => {
    const source = readSource("docs/architecture/SUPPORT-VERTICAL-CERTIFICATION.md");
    expect(source.toLowerCase()).toMatch(
      /ui.?certified|ui certification|not yet ui-certified|oss-110-14/i,
    );
  });

  it("certification document lists no-Event-Bus limitation", () => {
    const source = readSource("docs/architecture/SUPPORT-VERTICAL-CERTIFICATION.md");
    expect(source.toLowerCase()).toMatch(/event.bus|no.*event/i);
  });

  it("certification document lists no-webhook-ingress limitation", () => {
    const source = readSource("docs/architecture/SUPPORT-VERTICAL-CERTIFICATION.md");
    expect(source.toLowerCase()).toMatch(/webhook/i);
  });
});
