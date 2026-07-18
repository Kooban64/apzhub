import { describe, expect, it } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  AllowAllAuthorizationProvider,
  type AuthorizationProvider,
} from "./authorization/authorization-provider";
import { InMemoryPipelineLogger } from "./execution/logging";
import { InMemoryPipelineMetrics } from "./execution/metrics";
import { RequestPipeline } from "./execution/request-pipeline";
import { wrapServiceWithPipeline } from "./execution/wrap-service";
import type { ServiceMiddleware } from "./middleware/service-middleware";
import type { Policy } from "./policy/policy-pipeline";
import { PolicyPipeline } from "./policy/policy-pipeline";
import { createPlatformServices } from "./services/create-platform-services";
import {
  createMockWorkspaceProvider,
  TEST_SERVICE_CONTEXT,
} from "./testing/mock-providers";
import { ProviderRegistry } from "./providers/registry/provider-registry";

describe("RequestPipeline", () => {
  it("validates context, enriches requestId, and records timing hooks", async () => {
    const logger = new InMemoryPipelineLogger();
    const metrics = new InMemoryPipelineMetrics();
    const pipeline = new RequestPipeline({ logger, metrics });

    const result = await pipeline.execute({
      service: "workspace",
      operation: "listWorkspaces",
      context: TEST_SERVICE_CONTEXT,
      args: [TEST_SERVICE_CONTEXT],
      invoke: async (ctx) => {
        expect(ctx.requestId).toBeDefined();
        expect(ctx.execution?.startedAt).toBeDefined();
        return { ok: true };
      },
    });

    expect(result).toEqual({ ok: true });
    expect(metrics.events.map((e) => e.kind)).toEqual([
      "operation_started",
      "operation_succeeded",
    ]);
    expect(logger.events.some((e) => e.message.includes("succeeded"))).toBe(true);
    expect(metrics.events[1]?.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("propagates correlation and request identifiers into logs", async () => {
    const logger = new InMemoryPipelineLogger();
    const pipeline = new RequestPipeline({ logger });

    await pipeline.execute({
      service: "project",
      operation: "getProject",
      context: { ...TEST_SERVICE_CONTEXT, requestId: "req_custom" },
      args: [],
      invoke: async () => "done",
    });

    expect(logger.events[0]?.correlationId).toBe(TEST_SERVICE_CONTEXT.correlationId);
    expect(logger.events[0]?.requestId).toBe("req_custom");
  });

  it("maps unknown errors to PlatformServiceError", async () => {
    const pipeline = new RequestPipeline();

    await expect(
      pipeline.execute({
        service: "workspace",
        operation: "getWorkspace",
        context: TEST_SERVICE_CONTEXT,
        args: [],
        invoke: async () => {
          throw new Error("boom");
        },
      }),
    ).rejects.toMatchObject({ code: "INTERNAL_ERROR" });
  });

  it("rejects invalid request context", async () => {
    const pipeline = new RequestPipeline();

    await expect(
      pipeline.execute({
        service: "workspace",
        operation: "listWorkspaces",
        context: {
          tenantId: "",
          userId: "",
          correlationId: "",
          permissions: [],
        },
        args: [],
        invoke: async () => null,
      }),
    ).rejects.toMatchObject({ code: "INVALID_REQUEST_CONTEXT" });
  });
});

describe("middleware ordering", () => {
  it("runs before middleware in priority order and after in reverse", async () => {
    const order: string[] = [];

    const first: ServiceMiddleware = {
      id: "first",
      priority: 10,
      async before(input) {
        order.push("before:first");
        return {
          context: { ...input.context, featureFlags: ["from-first"] },
          args: input.args,
        };
      },
      async after() {
        order.push("after:first");
      },
    };

    const second: ServiceMiddleware = {
      id: "second",
      priority: 20,
      async before() {
        order.push("before:second");
      },
      async after() {
        order.push("after:second");
      },
    };

    const pipeline = new RequestPipeline({ middlewares: [second, first] });

    await pipeline.execute({
      service: "workspace",
      operation: "listWorkspaces",
      context: TEST_SERVICE_CONTEXT,
      args: [TEST_SERVICE_CONTEXT],
      invoke: async (ctx) => {
        expect(ctx.featureFlags).toEqual(["from-first"]);
        order.push("invoke");
        return true;
      },
    });

    expect(order).toEqual([
      "before:first",
      "before:second",
      "invoke",
      "after:second",
      "after:first",
    ]);
  });
});

describe("authorization abstraction", () => {
  it("allow-all provider permits requests", async () => {
    const provider = new AllowAllAuthorizationProvider();
    const decision = await provider.authorize({
      context: TEST_SERVICE_CONTEXT,
      action: { name: "workspace.listWorkspaces" },
    });
    expect(decision.effect).toBe("allow");
  });

  it("denying authorization provider blocks pipeline execution", async () => {
    const denyAll: AuthorizationProvider = {
      async authorize() {
        return { effect: "deny", reason: "denied-for-test" };
      },
    };

    const pipeline = new RequestPipeline({ authorization: denyAll });

    await expect(
      pipeline.execute({
        service: "workspace",
        operation: "listWorkspaces",
        context: TEST_SERVICE_CONTEXT,
        args: [],
        invoke: async () => true,
      }),
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED", message: "denied-for-test" });
  });
});

describe("policy execution", () => {
  it("evaluates policies by priority and stops on deny", async () => {
    const decisions: string[] = [];

    const skipPolicy: Policy = {
      id: "skip",
      kind: "feature_flags",
      priority: 10,
      async evaluate() {
        decisions.push("skip");
        return { effect: "skip", policyId: "skip", kind: "feature_flags" };
      },
    };

    const denyPolicy: Policy = {
      id: "deny",
      kind: "maintenance_mode",
      priority: 20,
      async evaluate() {
        decisions.push("deny");
        return {
          effect: "deny",
          policyId: "deny",
          kind: "maintenance_mode",
          reason: "maintenance",
        };
      },
    };

    const later: Policy = {
      id: "later",
      kind: "custom",
      priority: 30,
      async evaluate() {
        decisions.push("later");
        return { effect: "allow", policyId: "later", kind: "custom" };
      },
    };

    const pipeline = new PolicyPipeline({ policies: [later, denyPolicy, skipPolicy] });
    const result = await pipeline.evaluate({
      context: TEST_SERVICE_CONTEXT,
      service: "workspace",
      operation: "list",
      args: [],
    });

    expect(decisions).toEqual(["skip", "deny"]);
    expect(result.map((d) => d.effect)).toEqual(["skip", "deny"]);
  });

  it("assertAllowed throws POLICY_DENIED on deny", async () => {
    const pipeline = new PolicyPipeline({
      policies: [
        {
          id: "block",
          kind: "licensing",
          async evaluate() {
            return {
              effect: "deny",
              policyId: "block",
              kind: "licensing",
              reason: "unlicensed",
            };
          },
        },
      ],
    });

    await expect(
      pipeline.assertAllowed({
        context: TEST_SERVICE_CONTEXT,
        service: "project",
        operation: "create",
        args: [],
      }),
    ).rejects.toMatchObject({ code: "POLICY_DENIED" });
  });
});

describe("gateway pipeline integration", () => {
  it("executes gateway service calls through the request pipeline", async () => {
    const logger = new InMemoryPipelineLogger();
    const metrics = new InMemoryPipelineMetrics();
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "mock-workspace",
      integrationId: "mock",
      capability: "workspace",
      priority: 10,
      provider: createMockWorkspaceProvider(),
    });

    const services = createPlatformServices({ registry, logger, metrics });
    const listed =
      await services.gateway.workspaces.listWorkspaces(TEST_SERVICE_CONTEXT);

    expect(listed.items).toHaveLength(1);
    expect(metrics.events.some((e) => e.kind === "operation_succeeded")).toBe(true);
    expect(logger.events.some((e) => e.operation === "listWorkspaces")).toBe(true);
  });

  it("preserves public gateway accessors", () => {
    const services = createPlatformServices();
    expect(services.gateway.workspaces).toBeDefined();
    expect(services.gateway.projects).toBeDefined();
    expect(services.gateway.teams).toBeDefined();
    expect(services.gateway.users).toBeDefined();
    expect(services.gateway.search).toBeDefined();
    expect(services.gateway.pipeline).toBeDefined();
    expect(() => services.gateway.tasks).toThrow(PlatformServiceError);
  });
});

describe("wrapServiceWithPipeline", () => {
  it("wraps service methods without changing the call signature", async () => {
    const metrics = new InMemoryPipelineMetrics();
    const pipeline = new RequestPipeline({ metrics });

    const service = {
      async echo(ctx: typeof TEST_SERVICE_CONTEXT, value: string) {
        return `${ctx.tenantId}:${value}`;
      },
    };

    const wrapped = wrapServiceWithPipeline(service, pipeline, "demo");
    const result = await wrapped.echo(TEST_SERVICE_CONTEXT, "hello");

    expect(result).toBe(`${TEST_SERVICE_CONTEXT.tenantId}:hello`);
    expect(metrics.events.some((e) => e.operation === "echo")).toBe(true);
  });
});

describe("request context enhancements", () => {
  it("propagates organisation, locale, impersonation, and feature flags", async () => {
    const pipeline = new RequestPipeline();

    const enriched = pipeline.enrichContext({
      ...TEST_SERVICE_CONTEXT,
      organisationId: "org_1",
      locale: "en-ZA",
      featureFlags: ["projects.beta"],
      impersonation: { actorUserId: "admin_1", reason: "support" },
    });

    expect(enriched.organisationId).toBe("org_1");
    expect(enriched.locale).toBe("en-ZA");
    expect(enriched.featureFlags).toEqual(["projects.beta"]);
    expect(enriched.impersonation?.actorUserId).toBe("admin_1");
    expect(enriched.requestId).toBeDefined();
    expect(enriched.execution?.requestId).toBe(enriched.requestId);
  });
});
