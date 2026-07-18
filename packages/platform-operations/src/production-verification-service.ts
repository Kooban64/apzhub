import type { ConsolidatedOperationalDiagnostics } from "@apzhub/platform-security";

import type {
  CapabilityHealthReport,
  ProductionVerificationFinding,
  ProductionVerificationReport,
} from "./types";

function finding(
  id: string,
  category: string,
  severity: ProductionVerificationFinding["severity"],
  message: string,
  capabilityId?: string,
  recommendation?: string,
): ProductionVerificationFinding {
  return { id, category, severity, message, capabilityId, recommendation };
}

export function evaluateProductionVerification(input: {
  readonly consolidated: ConsolidatedOperationalDiagnostics;
  readonly bootstrapReady: boolean;
  readonly capabilities: readonly CapabilityHealthReport[];
}): ProductionVerificationReport {
  const findings: ProductionVerificationFinding[] = [];
  const { consolidated, bootstrapReady, capabilities } = input;

  if (!bootstrapReady) {
    findings.push(
      finding(
        "bootstrap.ready",
        "bootstrap",
        "fail",
        "Platform bootstrap is not ready.",
        "platform.bootstrap",
        "Resolve runtime bootstrap failures before production traffic.",
      ),
    );
  } else {
    findings.push(
      finding(
        "bootstrap.ready",
        "bootstrap",
        "pass",
        "Platform bootstrap is ready.",
        "platform.bootstrap",
      ),
    );
  }

  if (!consolidated.security.environment.valid) {
    findings.push(
      finding(
        "configuration.valid",
        "configuration",
        "fail",
        "Environment configuration validation failed.",
        "platform.configuration",
        "Review configuration diagnostics and resolve failing variables.",
      ),
    );
  } else {
    findings.push(
      finding(
        "configuration.valid",
        "configuration",
        "pass",
        "Environment configuration is valid.",
        "platform.configuration",
      ),
    );
  }

  const envWarns = consolidated.security.environment.checks.filter(
    (check) => check.status === "warn",
  );
  for (const warn of envWarns) {
    findings.push(
      finding(
        `configuration.warn.${warn.key}`,
        "configuration",
        "warn",
        warn.message,
        "platform.configuration",
        "Review deprecated or permissive configuration before production.",
      ),
    );
  }

  if (consolidated.resilience.readiness.status !== "healthy") {
    findings.push(
      finding(
        "readiness.probe",
        "health",
        "fail",
        consolidated.resilience.readiness.message ?? "Readiness probe failed.",
        "platform.security",
        "Restore dependency health and runtime readiness.",
      ),
    );
  } else {
    findings.push(
      finding(
        "readiness.probe",
        "health",
        "pass",
        "Readiness probe passed.",
        "platform.security",
      ),
    );
  }

  for (const dependency of consolidated.resilience.health.dependencies) {
    if (dependency.status === "healthy") {
      findings.push(
        finding(
          `dependency.${dependency.name}`,
          "health",
          "pass",
          `${dependency.name} is healthy.`,
          "platform.persistence",
        ),
      );
      continue;
    }

    findings.push(
      finding(
        `dependency.${dependency.name}`,
        "health",
        dependency.status === "degraded" ? "warn" : "fail",
        dependency.message ?? `${dependency.name} is ${dependency.status}.`,
        "platform.persistence",
        `Investigate ${dependency.name} connectivity and credentials.`,
      ),
    );
  }

  if (!consolidated.security.session.sessionDiagnostics.healthy) {
    findings.push(
      finding(
        "session.posture",
        "session",
        "warn",
        "Session security posture has recommendations.",
        "platform.session-security",
        "Apply session policy recommendations from security diagnostics.",
      ),
    );
  } else {
    findings.push(
      finding(
        "session.posture",
        "session",
        "pass",
        "Session security posture is healthy.",
        "platform.session-security",
      ),
    );
  }

  if (!consolidated.security.trafficGovernance.status.enabled) {
    findings.push(
      finding(
        "traffic.enabled",
        "traffic",
        "warn",
        "Traffic governance is disabled.",
        "platform.traffic-governance",
        "Enable traffic governance before production exposure.",
      ),
    );
  } else {
    findings.push(
      finding(
        "traffic.enabled",
        "traffic",
        "pass",
        "Traffic governance is enabled.",
        "platform.traffic-governance",
      ),
    );
  }

  if (!consolidated.security.apiGuard.permissionEnforcement) {
    findings.push(
      finding(
        "tenant.api-guard",
        "tenant-isolation",
        "warn",
        "API permission enforcement requires platform guard audit completion.",
        "platform.tenant-isolation",
        "Complete PRH-009 platform API guard audit.",
      ),
    );
  } else {
    findings.push(
      finding(
        "tenant.api-guard",
        "tenant-isolation",
        "pass",
        "API guard enforcement posture is active.",
        "platform.tenant-isolation",
      ),
    );
  }

  for (const capability of capabilities) {
    if (capability.health === "unhealthy" || capability.readiness === "unhealthy") {
      findings.push(
        finding(
          `capability.${capability.capabilityId}.health`,
          "capabilities",
          "fail",
          `${capability.name} is unhealthy.`,
          capability.capabilityId,
          capability.recommendations[0] ?? "Review capability diagnostics.",
        ),
      );
      continue;
    }

    const expectedFoundationGap =
      capability.maturityLevel === "foundation" ||
      capability.maturityLevel === "experimental";
    if (
      !expectedFoundationGap &&
      (capability.health === "degraded" || capability.readiness === "degraded")
    ) {
      findings.push(
        finding(
          `capability.${capability.capabilityId}.health`,
          "capabilities",
          "warn",
          `${capability.name} is degraded.`,
          capability.capabilityId,
          capability.recommendations[0],
        ),
      );
    }
  }

  const passCount = findings.filter((item) => item.severity === "pass").length;
  const warnCount = findings.filter((item) => item.severity === "warn").length;
  const failCount = findings.filter((item) => item.severity === "fail").length;

  let verdict: ProductionVerificationReport["verdict"] = "READY";
  if (failCount > 0) {
    verdict = "NOT_READY";
  } else if (warnCount > 0) {
    verdict = "READY_WITH_OBSERVATIONS";
  }

  const totalChecks = passCount + warnCount + failCount;
  const score =
    totalChecks === 0
      ? 0
      : Math.round(((passCount + warnCount * 0.5) / totalChecks) * 100);

  return {
    verdict,
    score,
    evaluatedAt: consolidated.generatedAt,
    findings,
    summary: { passCount, warnCount, failCount },
  };
}
