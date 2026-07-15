import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { AdapterClock } from "@apzhub/integration-sdk/adapter";
import type { IntegrationLogger } from "@apzhub/integration-sdk/observability";
import type { ErrorSummaryTracker } from "@apzhub/integration-sdk/observability";
import type { IntegrationMetrics } from "@apzhub/integration-sdk/observability";
import type { CircuitBreaker } from "@apzhub/integration-sdk/resilience";
import { isIntegrationError } from "@apzhub/integration-sdk/errors";

import {
  mapGitHubActionsUnknownError,
  GITHUB_ACTIONS_INTEGRATION_ID,
} from "../github-actions-error-mapper";
import type { GitHubActionsRestClient } from "../internal/github-actions-rest-client";

export interface GitHubActionsOperationRunnerDeps {
  readonly adapterId: string;
  readonly circuitBreaker: CircuitBreaker;
  readonly metrics: IntegrationMetrics;
  readonly logger: IntegrationLogger;
  readonly errorSummary: ErrorSummaryTracker;
  readonly clock: AdapterClock;
}

export class GitHubActionsOperationRunner {
  constructor(private readonly deps: GitHubActionsOperationRunnerDeps) {}

  async run<T>(
    context: IntegrationRequestContext,
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!this.deps.circuitBreaker.allowRequest()) {
      throw new Error("Circuit breaker open — GitHub Actions operation rejected");
    }

    const startedAt = this.deps.clock.nowMs();

    try {
      const result = await fn();
      const durationMs = this.deps.clock.nowMs() - startedAt;

      this.deps.metrics.recordRequest({ durationMs, success: true, operation });
      this.deps.circuitBreaker.recordSuccess();
      this.deps.logger.info("GitHub Actions operation succeeded", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation,
        durationMs,
        result: "success",
      });

      return result;
    } catch (error) {
      const durationMs = this.deps.clock.nowMs() - startedAt;

      const translated = isIntegrationError(error)
        ? { error }
        : mapGitHubActionsUnknownError(error, {
            correlationId: context.correlationId,
            integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
            adapterId: this.deps.adapterId,
            operation,
            tenantId: context.tenantId,
          });

      this.deps.errorSummary.record(translated.error);
      this.deps.circuitBreaker.recordFailure(translated.error);
      this.deps.metrics.recordRequest({ durationMs, success: false, operation });
      this.deps.logger.error("GitHub Actions operation failed", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation,
        durationMs,
        result: "failure",
        errorCode: translated.error.code,
        errorCategory: translated.error.category,
      });

      throw translated.error;
    }
  }
}

export interface GitHubActionsServiceDeps {
  readonly runner: GitHubActionsOperationRunner;
  readonly client: GitHubActionsRestClient;
  readonly tenantId: string;
  readonly defaultOwner?: string;
  readonly defaultRepo?: string;
}
