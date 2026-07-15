import type { RecoveryGuidanceItem } from "./security-types";

export function buildRecoveryGuidance(input: {
  readonly databaseOk: boolean;
  readonly redisOk: boolean;
  readonly runtimeReady: boolean;
  readonly environmentValid: boolean;
}): readonly RecoveryGuidanceItem[] {
  const guidance: RecoveryGuidanceItem[] = [];

  if (!input.databaseOk) {
    guidance.push({
      id: "database-unreachable",
      title: "Database unreachable",
      description:
        "Verify DATABASE_URL, PostgreSQL service, network connectivity, and migration state. Run migrations and check connection pool limits.",
      severity: "critical",
      relatedDependency: "database",
    });
  }

  if (!input.redisOk) {
    guidance.push({
      id: "redis-unreachable",
      title: "Redis unreachable",
      description:
        "Verify REDIS_URL and Redis service health. Rate limiting and session cache may degrade to in-memory fallbacks.",
      severity: "warning",
      relatedDependency: "redis",
    });
  }

  if (!input.runtimeReady) {
    guidance.push({
      id: "runtime-not-ready",
      title: "Platform runtime not ready",
      description:
        "Inspect platform runtime bootstrap logs, manifest discovery errors, and registry health. Restart the application process after resolving manifest issues.",
      severity: "critical",
      relatedDependency: "runtime",
    });
  }

  if (!input.environmentValid) {
    guidance.push({
      id: "environment-invalid",
      title: "Environment validation failed",
      description:
        "Review environment variables against @apzhub/config schema. Ensure BETTER_AUTH_SECRET, DATABASE_URL, and REDIS_URL are set correctly.",
      severity: "critical",
      relatedDependency: "configuration",
    });
  }

  if (guidance.length === 0) {
    guidance.push({
      id: "platform-healthy",
      title: "No recovery action required",
      description: "Core dependencies are healthy. Continue monitoring via Operations Console diagnostics.",
      severity: "info",
    });
  }

  return guidance;
}
