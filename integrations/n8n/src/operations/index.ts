import {
  N8N_CORE_SERVICE_CAPABILITIES,
  N8N_UNSUPPORTED_OPERATIONS,
} from "../capabilities/service-capabilities";
import { N8N_ADAPTER_VERSION } from "../version";

export type N8nOperationalHealthLevel = "healthy" | "degraded" | "unhealthy";

export interface N8nCompatibilityMatrix {
  readonly compatibilityStatus: "compatible" | "partial" | "incompatible";
  readonly supportedApi: "v1";
  readonly adapterVersion: string;
  readonly unsupportedOperations: readonly string[];
  readonly notes: readonly string[];
}

export interface N8nRuntimeDiagnosticsSnapshot {
  readonly adapterVersion: string;
  readonly healthLevel: N8nOperationalHealthLevel;
  readonly reasons: readonly string[];
  readonly compatibility: N8nCompatibilityMatrix;
  readonly apiStatus: string;
  readonly authenticationStatus: string;
  readonly authMode: string;
  readonly lastLatencyMs?: number;
  readonly coreServiceCount: number;
}

export function mapOperationalHealthToSdkStatus(
  level: N8nOperationalHealthLevel,
): "healthy" | "degraded" | "unavailable" {
  if (level === "unhealthy") return "unavailable";
  return level;
}

export function buildN8nCompatibilityMatrix(): N8nCompatibilityMatrix {
  return {
    compatibilityStatus: "compatible",
    supportedApi: "v1",
    adapterVersion: N8N_ADAPTER_VERSION,
    unsupportedOperations: [...N8N_UNSUPPORTED_OPERATIONS],
    notes: [
      "Read-only metadata adapter — no execute/create/update/delete",
      "Credentials and variables expose metadata only",
      "Users/projects/templates may be edition-dependent (partial)",
    ],
  };
}

export function classifyN8nOperationalHealth(input: {
  readonly apiStatus: string;
  readonly authenticationStatus: string;
}): { readonly level: N8nOperationalHealthLevel; readonly reasons: readonly string[] } {
  const reasons: string[] = [];
  if (
    input.authenticationStatus === "missing" ||
    input.authenticationStatus === "invalid"
  ) {
    reasons.push(`authentication:${input.authenticationStatus}`);
  }
  if (input.apiStatus === "unavailable") {
    reasons.push("api:unavailable");
  }
  if (input.apiStatus === "degraded") {
    reasons.push("api:degraded");
  }
  if (reasons.some((r) => r.startsWith("authentication:") || r === "api:unavailable")) {
    return { level: "unhealthy", reasons };
  }
  if (reasons.length > 0 || input.apiStatus === "not_tested") {
    return {
      level: "degraded",
      reasons: reasons.length > 0 ? reasons : ["api:not_tested"],
    };
  }
  return { level: "healthy", reasons: [] };
}

export interface N8nOperationsService {
  classifyHealth(): {
    readonly level: N8nOperationalHealthLevel;
    readonly reasons: readonly string[];
  };
  getCompatibilityMatrix(): N8nCompatibilityMatrix;
  buildRuntimeDiagnostics(): N8nRuntimeDiagnosticsSnapshot;
}

export function createN8nOperationsService(deps: {
  readonly getApiStatus: () => string;
  readonly getAuthenticationStatus: () => string;
  readonly getAuthMode: () => string;
  readonly getLastLatencyMs: () => number | undefined;
}): N8nOperationsService {
  return {
    classifyHealth() {
      return classifyN8nOperationalHealth({
        apiStatus: deps.getApiStatus(),
        authenticationStatus: deps.getAuthenticationStatus(),
      });
    },
    getCompatibilityMatrix() {
      return buildN8nCompatibilityMatrix();
    },
    buildRuntimeDiagnostics() {
      const health = this.classifyHealth();
      return {
        adapterVersion: N8N_ADAPTER_VERSION,
        healthLevel: health.level,
        reasons: health.reasons,
        compatibility: this.getCompatibilityMatrix(),
        apiStatus: deps.getApiStatus(),
        authenticationStatus: deps.getAuthenticationStatus(),
        authMode: deps.getAuthMode(),
        lastLatencyMs: deps.getLastLatencyMs(),
        coreServiceCount: N8N_CORE_SERVICE_CAPABILITIES.length,
      };
    },
  };
}
