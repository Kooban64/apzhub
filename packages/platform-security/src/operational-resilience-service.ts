import { checkDatabaseHealth } from "@apzhub/config";
import { checkRedisHealth } from "@apzhub/shared";

import { EnvironmentValidationService } from "./environment-validation-service";
import { buildRecoveryGuidance } from "./recovery-guidance";
import type {
  DependencyHealthSignal,
  HealthSignalStatus,
  OperationalResilienceSnapshot,
  SystemProbeResult,
} from "./security-types";

export interface ResilienceProbeInput {
  readonly runtimeReady?: boolean;
}

export class OperationalResilienceService {
  private readonly environmentValidation = new EnvironmentValidationService();

  async getLiveness(): Promise<SystemProbeResult> {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "Process is running.",
    };
  }

  async getReadiness(input: ResilienceProbeInput = {}): Promise<SystemProbeResult> {
    const [database, redis, environment] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
      Promise.resolve(this.environmentValidation.validateEnvironment()),
    ]);

    const runtimeReady = input.runtimeReady ?? true;
    const ready = database.ok && redis.ok && environment.valid && runtimeReady;

    return {
      status: ready ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      message: ready
        ? "Platform is ready to serve traffic."
        : "One or more readiness checks failed.",
    };
  }

  async getDependencyHealth(): Promise<readonly DependencyHealthSignal[]> {
    const [database, redis] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    return [
      mapDependency("database", database.ok, database.latencyMs, database.message),
      mapDependency("redis", redis.ok, redis.latencyMs, redis.message),
    ];
  }

  async getResilienceSnapshot(
    input: ResilienceProbeInput = {},
  ): Promise<OperationalResilienceSnapshot> {
    const [liveness, readiness, dependencies, environment] = await Promise.all([
      this.getLiveness(),
      this.getReadiness(input),
      this.getDependencyHealth(),
      Promise.resolve(this.environmentValidation.validateEnvironment()),
    ]);

    const runtimeReady = input.runtimeReady ?? true;
    const databaseOk =
      dependencies.find((dep) => dep.name === "database")?.status === "healthy";
    const redisOk =
      dependencies.find((dep) => dep.name === "redis")?.status === "healthy";

    const healthStatus: HealthSignalStatus =
      readiness.status === "healthy"
        ? "healthy"
        : readiness.status === "unhealthy"
          ? "unhealthy"
          : "degraded";

    return {
      liveness,
      readiness,
      health: {
        status: healthStatus,
        dependencies,
      },
      recoveryGuidance: buildRecoveryGuidance({
        databaseOk: databaseOk ?? false,
        redisOk: redisOk ?? false,
        runtimeReady,
        environmentValid: environment.valid,
      }),
    };
  }
}

function mapDependency(
  name: string,
  ok: boolean,
  latencyMs: number,
  message?: string,
): DependencyHealthSignal {
  return {
    name,
    status: ok ? "healthy" : "unhealthy",
    latencyMs,
    message,
  };
}
