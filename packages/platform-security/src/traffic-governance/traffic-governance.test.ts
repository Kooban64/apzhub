import { afterEach, describe, expect, it } from "vitest";

import {
  CANONICAL_TRAFFIC_POLICIES,
  LAW_API_ENDPOINT_SAMPLES,
  PLATFORM_API_ENDPOINT_SAMPLES,
  resolveTrafficPolicy,
} from "./policies";
import { resetSharedTrafficGovernanceService, TrafficGovernanceService } from "./traffic-governance-service";

describe("TrafficGovernanceService", () => {
  afterEach(() => {
    resetSharedTrafficGovernanceService();
  });

  it("resolves canonical policies for platform and law endpoints", () => {
    expect(resolveTrafficPolicy("/api/platform/v1/tenants").id).toBe("platform-privileged");
    expect(resolveTrafficPolicy("/api/law/v1/clients").id).toBe("law-api");
    expect(resolveTrafficPolicy("/api/auth/sign-in/email").id).toBe("auth-sensitive");
    expect(resolveTrafficPolicy("/api/health").id).toBe("public-health");
  });

  it("applies environment profile multipliers in development", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const service = new TrafficGovernanceService(120);

    const decision = await service.evaluate({
      pathname: "/api/platform/v1/tenants",
      method: "GET",
      ip: "127.0.0.1",
      userId: "user-1",
      tenantId: "tenant-1",
      service: "platform",
    });

    expect(decision.allowed).toBe(true);
    expect(decision.headers["X-Traffic-Policy"]).toBe("platform-privileged");
    expect(Number(decision.headers["X-RateLimit-Limit"])).toBeGreaterThanOrEqual(120);

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("returns 429 headers when limits are exceeded", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const service = new TrafficGovernanceService();
    const context = {
      pathname: "/api/platform/v1/security/csp-report",
      method: "POST",
      ip: "10.0.0.99",
      service: "public" as const,
    };

    let decision = await service.evaluate(context);
    for (let index = 0; index < 65; index += 1) {
      decision = await service.evaluate(context);
    }

    expect(decision.allowed).toBe(false);
    expect(decision.headers["X-RateLimit-Remaining"]).toBe("0");

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("exposes traffic diagnostics with recommendations", () => {
    const service = new TrafficGovernanceService();
    const diagnostics = service.getDiagnostics({
      pathname: "/api/law/v1/clients",
      method: "GET",
      ip: "127.0.0.1",
      service: "law",
    });

    expect(diagnostics.activePolicy?.id).toBe("law-api");
    expect(diagnostics.recommendations.length).toBeGreaterThan(0);
    expect(diagnostics.throttle.active).toBe(true);
  });
});

describe("canonical traffic policy registry", () => {
  it("covers all platform and law endpoint samples", () => {
    for (const endpoint of PLATFORM_API_ENDPOINT_SAMPLES) {
      const policy = resolveTrafficPolicy(endpoint);
      expect(CANONICAL_TRAFFIC_POLICIES.some((entry) => entry.id === policy.id)).toBe(true);
    }

    for (const endpoint of LAW_API_ENDPOINT_SAMPLES) {
      const policy = resolveTrafficPolicy(endpoint);
      expect(CANONICAL_TRAFFIC_POLICIES.some((entry) => entry.id === policy.id)).toBe(true);
    }
  });
});
