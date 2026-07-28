import {
  METABASE_CORE_SERVICE_CAPABILITIES,
  METABASE_UNSUPPORTED_OPERATIONS,
} from "../capabilities/service-capabilities";
import { METABASE_ADAPTER_VERSION } from "../version";

export type MetabaseOperationalHealthLevel = "healthy" | "degraded" | "unhealthy";

export interface MetabaseCompatibilityMatrix {
  readonly compatibilityStatus: "compatible" | "partial" | "incompatible";
  readonly supportedApi: "v1";
  readonly adapterVersion: string;
  readonly engineMin: string;
  readonly engineMax: string;
  readonly unsupportedOperations: readonly string[];
  readonly notes: readonly string[];
}

export interface MetabaseRuntimeDiagnosticsSnapshot {
  readonly adapterVersion: string;
  readonly healthLevel: MetabaseOperationalHealthLevel;
  readonly reasons: readonly string[];
  readonly compatibility: MetabaseCompatibilityMatrix;
  readonly apiStatus: string;
  readonly authenticationStatus: string;
  readonly authMode: string;
  readonly lastLatencyMs?: number;
  readonly versionTag?: string;
  readonly embeddingEnabled?: boolean;
  readonly coreServiceCount: number;
}

export type MetabaseReadinessClassification =
  "ready" | "ready_with_limitations" | "not_ready";

export function mapOperationalHealthToSdkStatus(
  level: MetabaseOperationalHealthLevel,
): "healthy" | "degraded" | "unavailable" {
  if (level === "unhealthy") return "unavailable";
  return level;
}

export function buildMetabaseCompatibilityMatrix(): MetabaseCompatibilityMatrix {
  return {
    compatibilityStatus: "compatible",
    supportedApi: "v1",
    adapterVersion: METABASE_ADAPTER_VERSION,
    engineMin: "Metabase 0.49.0",
    engineMax: "Metabase 0.5x",
    unsupportedOperations: [...METABASE_UNSUPPORTED_OPERATIONS],
    notes: [
      "Foundation adapter — health, auth, diagnostics, version/capability detection",
      "Collection metadata is read-only",
      "Dashboard embed token issuance is planned (not implemented)",
      "Engine branding must remain hidden from standard users",
    ],
  };
}

export function classifyMetabaseOperationalHealth(input: {
  readonly apiStatus: string;
  readonly authenticationStatus: string;
}): {
  readonly level: MetabaseOperationalHealthLevel;
  readonly reasons: readonly string[];
} {
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

export function classifyMetabaseReadiness(input: {
  readonly healthLevel: MetabaseOperationalHealthLevel;
  readonly embeddingEnabled?: boolean;
}): MetabaseReadinessClassification {
  if (input.healthLevel === "unhealthy") return "not_ready";
  if (input.healthLevel === "degraded" || input.embeddingEnabled !== true) {
    return "ready_with_limitations";
  }
  return "ready";
}

export interface MetabaseOperationsService {
  classifyHealth(): {
    readonly level: MetabaseOperationalHealthLevel;
    readonly reasons: readonly string[];
  };
  getCompatibilityMatrix(): MetabaseCompatibilityMatrix;
  classifyReadiness(): MetabaseReadinessClassification;
  buildRuntimeDiagnostics(): MetabaseRuntimeDiagnosticsSnapshot;
}

export function createMetabaseOperationsService(deps: {
  readonly getApiStatus: () => string;
  readonly getAuthenticationStatus: () => string;
  readonly getAuthMode: () => string;
  readonly getLastLatencyMs: () => number | undefined;
  readonly getVersionTag: () => string | undefined;
  readonly getEmbeddingEnabled: () => boolean | undefined;
}): MetabaseOperationsService {
  return {
    classifyHealth() {
      return classifyMetabaseOperationalHealth({
        apiStatus: deps.getApiStatus(),
        authenticationStatus: deps.getAuthenticationStatus(),
      });
    },
    getCompatibilityMatrix() {
      return buildMetabaseCompatibilityMatrix();
    },
    classifyReadiness() {
      const health = classifyMetabaseOperationalHealth({
        apiStatus: deps.getApiStatus(),
        authenticationStatus: deps.getAuthenticationStatus(),
      });
      return classifyMetabaseReadiness({
        healthLevel: health.level,
        embeddingEnabled: deps.getEmbeddingEnabled(),
      });
    },
    buildRuntimeDiagnostics() {
      const health = classifyMetabaseOperationalHealth({
        apiStatus: deps.getApiStatus(),
        authenticationStatus: deps.getAuthenticationStatus(),
      });
      return {
        adapterVersion: METABASE_ADAPTER_VERSION,
        healthLevel: health.level,
        reasons: health.reasons,
        compatibility: buildMetabaseCompatibilityMatrix(),
        apiStatus: deps.getApiStatus(),
        authenticationStatus: deps.getAuthenticationStatus(),
        authMode: deps.getAuthMode(),
        lastLatencyMs: deps.getLastLatencyMs(),
        versionTag: deps.getVersionTag(),
        embeddingEnabled: deps.getEmbeddingEnabled(),
        coreServiceCount: METABASE_CORE_SERVICE_CAPABILITIES.length,
      };
    },
  };
}
