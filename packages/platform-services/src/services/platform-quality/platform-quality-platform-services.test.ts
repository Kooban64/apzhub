import { describe, expect, it } from "vitest";

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type { ProductQualityContribution } from "@apzhub/testing-contracts";
import { PLATFORM_PRODUCT_KEYS } from "@apzhub/testing-contracts";

import { DenyAllAuthorizationProvider } from "../../authorization/production-authorization-provider";
import { createPlatformServices } from "../create-platform-services";
import { createPlatformQualityPlatformServicesForTest } from "./create-platform-quality-platform-services";
import { isPlatformQualityEnabled } from "./platform-quality-env";

const FIXED_NOW = "2026-07-12T14:00:00.000Z";

const ctx: ServiceRequestContext = {
  tenantId: "tenant_pq_gw",
  userId: "user_pq_gw",
  correlationId: "corr_pq_gw",
  permissions: [
    "*",
    "platform-quality.*",
    "platform-release.*",
    "dependency.*",
    "governance.*",
    "quality.*",
    "release.*",
  ],
  organisationId: "org_pq_gw",
};

function createHarness() {
  let n = 0;
  const platformQuality = createPlatformQualityPlatformServicesForTest({
    now: () => FIXED_NOW,
    id: () => `pq_gw_${++n}`,
  });
  const services = createPlatformServices({
    platformQuality,
    authorizationMode: "allow-all",
  });
  return { services, platformQuality };
}

function stubContribution(
  overrides: Partial<ProductQualityContribution> &
    Pick<ProductQualityContribution, "productId" | "productKey" | "qualityStatus">,
): ProductQualityContribution {
  return {
    certificationRecordIds: [],
    openIssueCount: 0,
    riskLabels: [],
    ...overrides,
  };
}

describe("Platform Quality gateway", () => {
  it("exposes platform quality surfaces when wired and throws when absent", () => {
    const { services } = createHarness();
    expect(services.gateway.platformQuality.products).toBeDefined();
    expect(services.gateway.platformRelease.releases).toBeDefined();
    expect(services.gateway.platformGovernance.approvals).toBeDefined();
    expect(services.platformQuality?.readiness.enabled).toBe(true);
    expect(services.platformQuality?.readiness.httpRoutes).toBe("not-wired");

    const without = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => without.gateway.platformQuality).toThrow(PlatformServiceError);
    expect(() => without.gateway.platformRelease).toThrow(PlatformServiceError);
    expect(() => without.gateway.platformGovernance).toThrow(PlatformServiceError);
  });

  it("documents PLATFORM_QUALITY_ENABLED without requiring it for the test factory", () => {
    expect(isPlatformQualityEnabled({ PLATFORM_QUALITY_ENABLED: "true" })).toBe(true);
    expect(isPlatformQualityEnabled({})).toBe(false);
    const bundle = createPlatformQualityPlatformServicesForTest();
    expect(bundle.readiness.enabled).toBe(true);
  });
});

describe("Platform Quality registry and dependencies", () => {
  it("seeds eight default products via the gateway", async () => {
    const { services } = createHarness();
    const registry = await services.gateway.platformQuality.products.ensureDefaultRegistry(
      ctx,
    );
    expect(registry.productIds).toHaveLength(8);
    expect(PLATFORM_PRODUCT_KEYS).toHaveLength(8);

    const products = await services.gateway.platformQuality.products.listProducts(ctx);
    expect(products).toHaveLength(8);
  });

  it("validates product dependencies through the gateway", async () => {
    const { services } = createHarness();
    await services.gateway.platformQuality.products.ensureDefaultRegistry(ctx);
    const testing = await services.gateway.platformQuality.products.getProductByKey(
      ctx,
      "testing",
    );
    const projects = await services.gateway.platformQuality.products.getProductByKey(
      ctx,
      "projects",
    );

    const dep = await services.gateway.platformQuality.dependencies.addDependency(ctx, {
      fromProductId: testing.id,
      toProductId: projects.id,
      relation: "upstream",
      requirement: "required",
    });
    expect(dep.requirement).toBe("required");

    const validation = await services.gateway.platformQuality.dependencies.validate(ctx, [
      testing.id,
      projects.id,
    ]);
    expect(validation.valid).toBe(true);
    expect(validation.cycleDetected).toBe(false);
  });
});

describe("Platform Quality aggregation and release readiness", () => {
  it("aggregates quality without deciding", async () => {
    const { services } = createHarness();
    await services.gateway.platformQuality.products.ensureDefaultRegistry(ctx);
    const testing = await services.gateway.platformQuality.products.getProductByKey(
      ctx,
      "testing",
    );
    const projects = await services.gateway.platformQuality.products.getProductByKey(
      ctx,
      "projects",
    );

    const aggregate = await services.gateway.platformQuality.aggregation.aggregate(ctx, {
      contributions: [
        stubContribution({
          productId: testing.id,
          productKey: "testing",
          qualityStatus: "healthy",
        }),
        stubContribution({
          productId: projects.id,
          productKey: "projects",
          qualityStatus: "degraded",
        }),
      ],
    });

    expect(aggregate.overallQualityStatus).toBe("degraded");
    expect(aggregate.isDecision).toBe(false);
  });

  it("creates releases and evaluates readiness without deciding", async () => {
    const { services } = createHarness();
    await services.gateway.platformQuality.products.ensureDefaultRegistry(ctx);
    const testing = await services.gateway.platformQuality.products.getProductByKey(
      ctx,
      "testing",
    );

    const release = await services.gateway.platformRelease.releases.createRelease(ctx, {
      key: "rel_gw_1",
      name: "Gateway Release",
      productIds: [testing.id],
    });
    expect(release.key).toBe("rel_gw_1");

    const deps = await services.gateway.platformRelease.releases.evaluateDependencies(
      ctx,
      release.id,
    );
    const readiness = await services.gateway.platformRelease.releases.evaluateReadiness(
      ctx,
      release.id,
      {
        productReadiness: { [testing.id]: "READY" },
        qualityStatus: "healthy",
        dependencyValidation: deps,
      },
    );
    expect(readiness.isDecision).toBe(false);
    expect(readiness.verdict).toBe("READY");
  });
});

describe("Platform Governance approvals", () => {
  it("requests and decides approvals via platformGovernance", async () => {
    const { services } = createHarness();
    await services.gateway.platformQuality.products.ensureDefaultRegistry(ctx);
    const testing = await services.gateway.platformQuality.products.getProductByKey(
      ctx,
      "testing",
    );
    const release = await services.gateway.platformRelease.releases.createRelease(ctx, {
      key: "rel_gov_1",
      name: "Governance Release",
      productIds: [testing.id],
    });

    const approval = await services.gateway.platformGovernance.approvals.requestApproval(
      ctx,
      release.id,
      "technical",
    );
    expect(approval.status).toBe("pending");

    const decided = await services.gateway.platformGovernance.approvals.decideApproval(
      ctx,
      approval.id,
      {
        status: "approved",
        decidedByUserId: ctx.userId!,
        comments: "ok",
      },
    );
    expect(decided.status).toBe("approved");
  });
});

describe("Platform Quality pipeline authorization", () => {
  it("denies operations when authorization provider denies all", async () => {
    let n = 0;
    const platformQuality = createPlatformQualityPlatformServicesForTest({
      now: () => FIXED_NOW,
      id: () => `pq_deny_${++n}`,
    });
    const services = createPlatformServices({
      platformQuality,
      authorization: new DenyAllAuthorizationProvider(),
    });

    await expect(
      services.gateway.platformQuality.products.ensureDefaultRegistry(ctx),
    ).rejects.toBeInstanceOf(PlatformServiceError);
  });
});
