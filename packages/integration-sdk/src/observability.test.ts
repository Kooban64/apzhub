import { describe, expect, it } from "vitest";

import { createIntegrationError } from "./errors/factory";
import {
  DefaultCircuitBreaker,
  buildCircuitBreakerHealthMessage,
} from "./resilience/circuit-breaker";
import {
  DefaultIntegrationMetrics,
  InMemoryErrorSummaryTracker,
  InMemoryMetricsProvider,
} from "./observability/metrics/integration-metrics";
import {
  DefaultIntegrationLogger,
  buildErrorLogFields,
} from "./observability/logging/integration-logger";
import { createDefaultDiagnosticsProvider } from "./diagnostics/unified-diagnostics";
import { createDefaultHealthProvider } from "./health/default-health-provider";
import { InMemoryConnectionRegistry } from "./connection/registry";
import { createDefaultVersionProvider } from "./version/types";
import { createIntegrationOperationsStack } from "./operations-stack";

const correlationId = "corr-obs-001";
const tenantId = "tenant-alpha";
const integrationId = "mock-integration";

const fixedClock = {
  now: () => "2026-07-10T08:00:00.000Z",
  nowMs: () => 1_720_000_000_000,
};

function createUnavailableError() {
  return createIntegrationError({
    category: "vendor_unavailable",
    code: "integration.test.unavailable",
    message: "Vendor unavailable",
    correlationId,
    retryable: true,
  });
}

describe("circuit breaker diagnostics", () => {
  it("opens after consecutive trip-worthy failures and reports diagnostics", () => {
    let currentMs = 1_720_000_000_000;
    const breaker = new DefaultCircuitBreaker({
      failureThreshold: 2,
      openDurationMs: 1_000,
      clock: {
        now: () => new Date(currentMs).toISOString(),
        nowMs: () => currentMs,
      },
    });

    expect(breaker.getDiagnostics().state).toBe("closed");
    expect(breaker.allowRequest()).toBe(true);

    breaker.recordFailure(createUnavailableError());
    breaker.recordFailure(createUnavailableError());

    expect(breaker.getDiagnostics().state).toBe("open");
    expect(breaker.getDiagnostics().failureCount).toBe(2);
    expect(breaker.allowRequest()).toBe(false);

    const health = buildCircuitBreakerHealthMessage(breaker.getDiagnostics());
    expect(health.status).toBe("fail");

    currentMs += 1_500;
    expect(breaker.allowRequest()).toBe(true);
    expect(breaker.getDiagnostics().state).toBe("half_open");

    breaker.recordSuccess();
    breaker.recordSuccess();
    expect(breaker.getDiagnostics().state).toBe("closed");
    expect(breaker.getDiagnostics().lastRecoveryAt).toBeDefined();
  });
});

describe("metrics contracts", () => {
  it("records counters, histograms, and summary values", () => {
    const provider = new InMemoryMetricsProvider();
    const metrics = new DefaultIntegrationMetrics({
      provider,
      integrationId,
      clock: fixedClock,
    });

    metrics.recordRequest({ durationMs: 120, success: true, operation: "list" });
    metrics.recordRequest({ durationMs: 480, success: false, operation: "list" });
    metrics.recordError(
      createIntegrationError({
        category: "validation",
        code: "integration.test.validation",
        message: "Validation failed",
        correlationId,
      }),
    );

    const summary = metrics.getSummary();
    expect(summary.requestsTotal).toBe(2);
    expect(summary.errorsTotal).toBeGreaterThanOrEqual(1);
    expect(summary.latencyP95Ms).toBeGreaterThan(0);
    expect(summary.lastRequestAt).toBe(fixedClock.now());
  });
});

describe("integration logger", () => {
  it("captures structured fields with correlation and redacts secrets", () => {
    const logger = new DefaultIntegrationLogger({
      integrationId,
      adapterId: "mock-adapter",
      clock: fixedClock,
    });

    const error = createIntegrationError({
      category: "authentication",
      code: "integration.auth.failed",
      message: "Authentication failed",
      correlationId,
    });

    logger.error("Integration request failed", {
      ...buildErrorLogFields(error, {
        correlationId,
        requestId: "req-001",
        operation: "sync",
        durationMs: 42,
      }),
      detail: "Authorization bearer abc.def.ghi",
    });

    const entry = logger.getEntries()[0];
    expect(entry?.fields.correlationId).toBe(correlationId);
    expect(entry?.fields.requestId).toBe("req-001");
    expect(entry?.fields.operation).toBe("sync");
    expect(entry?.fields.durationMs).toBe(42);
    expect(entry?.fields.result).toBe("failure");
    expect(JSON.stringify(entry)).not.toContain("abc.def.ghi");
  });
});

describe("runtime diagnostics API", () => {
  it("exposes health, circuit breaker, metrics, errors, version, and registration", async () => {
    const registry = new InMemoryConnectionRegistry(fixedClock);
    registry.register(
      {
        connectionId: "conn-001",
        tenantId,
        integrationId,
        adapterId: "mock-adapter",
        baseUrl: "https://engine.example.com",
        authenticationMode: "bearer",
        lifecycleState: "connected",
        enabled: true,
        credentialRef: "secret/ref",
        configuredAt: fixedClock.now(),
        connectedAt: fixedClock.now(),
        metadata: {
          engineVersion: "1.2.0",
          engineVersionMin: "1.0.0",
          engineVersionMax: "2.0.0",
        },
      },
      {},
      correlationId,
    );

    const breaker = new DefaultCircuitBreaker({ clock: fixedClock });
    const metricsProvider = new InMemoryMetricsProvider();
    const metrics = new DefaultIntegrationMetrics({
      provider: metricsProvider,
      integrationId,
      clock: fixedClock,
    });
    metrics.recordRequest({ durationMs: 90, success: true, operation: "health" });

    const errorSummary = new InMemoryErrorSummaryTracker(fixedClock);
    errorSummary.record(
      createIntegrationError({
        category: "timeout",
        code: "integration.test.timeout",
        message: "Timeout",
        correlationId,
      }),
    );

    const versionProvider = createDefaultVersionProvider();
    const healthProvider = createDefaultHealthProvider({
      integrationId,
      registry,
      versionProvider,
      circuitBreaker: breaker,
      clock: fixedClock,
    });

    const diagnosticsProvider = createDefaultDiagnosticsProvider({
      integrationId,
      adapterId: "mock-adapter",
      registry,
      healthProvider,
      versionProvider,
      circuitBreaker: breaker,
      metrics,
      errorSummary,
      clock: fixedClock,
    });

    const diagnostics = await diagnosticsProvider.collect({
      integrationId,
      context: { correlationId, tenantId },
    });

    expect(diagnostics.health?.checks.some((check) => check.name === "circuit_breaker")).toBe(true);
    expect(diagnostics.circuitBreaker?.state).toBe("closed");
    expect(diagnostics.metrics?.requestsTotal).toBe(1);
    expect(diagnostics.errors?.totalErrors).toBe(1);
    expect(diagnostics.errors?.lastErrorCategory).toBe("timeout");
    expect(diagnostics.version?.engineVersion).toBe("1.2.0");
    expect(diagnostics.registration?.registered).toBe(true);
    expect(diagnostics.registration?.adapterId).toBe("mock-adapter");
  });

  it("wires observability providers through the operations stack", () => {
    const stack = createIntegrationOperationsStack({
      integrationId,
      capabilityId: "mock-capability",
      registry: new InMemoryConnectionRegistry(fixedClock),
      clock: fixedClock,
    });

    expect(stack.errorTranslator).toBeDefined();
    expect(stack.circuitBreaker).toBeDefined();
    expect(stack.metrics).toBeDefined();
    expect(stack.logger).toBeDefined();
    expect(stack.errorSummary).toBeDefined();
  });
});
