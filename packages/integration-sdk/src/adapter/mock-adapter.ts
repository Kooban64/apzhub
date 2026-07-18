import type { IntegrationHealthCheck } from "../diagnostics/types";
import type { IntegrationRequestContext } from "../types";
import { IntegrationAdapterBase } from "./adapter-base";
import type { AdapterContext } from "./adapter-context";
import type {
  AdapterConfigurationValidationResult,
  AdapterLifecycleResult,
} from "./lifecycle-types";
import type { AdapterBootstrapConfiguration } from "./manifest-types";

/**
 * Canonical reference adapter exercising the full SDK without any external engine.
 * Use as the template for all future vendor adapter implementations.
 */
export class MockAdapter extends IntegrationAdapterBase {
  private operationCount = 0;

  constructor(context: AdapterContext, configuration: AdapterBootstrapConfiguration) {
    super(context, configuration);
  }

  get operationCountSnapshot(): number {
    return this.operationCount;
  }

  /** Simulates a vendor operation — records metrics and validates breaker allowance. */
  async simulateOperation(
    context: IntegrationRequestContext,
    options: {
      readonly operation: string;
      readonly succeed?: boolean;
      readonly durationMs?: number;
    },
  ): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();

    if (!this.circuitBreaker.allowRequest()) {
      return {
        ok: false,
        message: "Circuit breaker is open — request rejected",
      };
    }

    const durationMs = options.durationMs ?? 10;
    const succeed = options.succeed ?? true;
    this.operationCount += 1;

    this.logger.info("Mock adapter operation", {
      correlationId: context.correlationId,
      tenantId: context.tenantId,
      operation: options.operation,
      durationMs,
      result: succeed ? "success" : "failure",
    });

    this.metrics.recordRequest({
      durationMs,
      success: succeed,
      operation: options.operation,
    });

    if (succeed) {
      this.circuitBreaker.recordSuccess();
      return { ok: true, message: `Mock operation "${options.operation}" succeeded` };
    }

    const translated = this.errorTranslator.translate({
      statusCode: 503,
      context: {
        correlationId: context.correlationId,
        integrationId: this.integrationId,
        adapterId: this.context.adapterId,
        operation: options.operation,
        tenantId: context.tenantId,
        requestId: context.correlationId,
      },
    });

    this.errorSummary.record(translated.error);
    this.circuitBreaker.recordFailure(translated.error);

    return {
      ok: false,
      message: translated.error.message,
    };
  }

  protected override async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    if (!this.configuration.manifest.declaredCapabilities.includes("health")) {
      return {
        ok: true,
        message: "Mock adapter recommends declaring health capability",
        warnings: ["Mock adapter works best with health capability declared"],
      };
    }

    return { ok: true, message: "Mock adapter configuration valid" };
  }

  protected override async onPerformHealthChecks(
    _context: IntegrationRequestContext,
  ): Promise<IntegrationHealthCheck[]> {
    return [
      {
        name: "mock_engine",
        status: this.isConnected ? "pass" : "warn",
        message: this.isConnected
          ? "Mock engine connection active"
          : "Mock engine not connected — logical checks only",
      },
    ];
  }
}

export function createMockAdapterManifest(): AdapterBootstrapConfiguration {
  return {
    manifest: {
      integrationId: "mock-engine",
      adapterId: "mock-engine-adapter",
      name: "Mock Integration Engine",
      version: "1.0.0",
      capabilityId: "integration.mock",
      declaredCapabilities: [
        "authentication",
        "health",
        "diagnostics",
        "projects",
        "workflow",
      ],
      owner: "@apzhub/integration-sdk",
      description: "Reference mock adapter for SDK certification",
    },
    connection: {
      connectionId: "mock-conn-001",
      tenantId: "tenant-mock",
      baseUrl: "https://mock.engine.internal.example",
      authenticationMode: "bearer",
      credentialRef: "mock/credential",
      metadata: {
        engineVersion: "1.0.0",
        engineVersionMin: "1.0.0",
        engineVersionMax: "2.0.0",
      },
    },
  };
}
