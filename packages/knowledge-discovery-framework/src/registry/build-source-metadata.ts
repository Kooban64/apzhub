import type { KnowledgeProvider } from "../provider/knowledge-provider";
import type {
  KnowledgeSourceHealthStatus,
  KnowledgeSourceMetadata,
} from "../types/knowledge-metadata";
import type { KnowledgeHealthSummary } from "../types/knowledge-diagnostics";
import type { KnowledgeSource } from "../types/knowledge-source";

export function resolveKnowledgeSourceHealthStatus(
  source: KnowledgeSource,
  providerRegistered: boolean,
): KnowledgeSourceHealthStatus {
  if (source.status === "disabled") {
    return "disabled";
  }

  if (source.status === "planned") {
    return "planned";
  }

  if (source.status === "active" && providerRegistered) {
    return "healthy";
  }

  if (source.status === "active" && !providerRegistered) {
    return "degraded";
  }

  return "unknown";
}

export function buildKnowledgeSourceMetadata(
  source: KnowledgeSource,
  provider: KnowledgeProvider | undefined,
): KnowledgeSourceMetadata {
  const providerRegistered = provider !== undefined;

  return Object.freeze({
    sourceId: source.id,
    providerRegistered,
    providerId: providerRegistered ? source.id : undefined,
    version: source.version,
    declaredCapabilities: Object.freeze([...source.provides]),
    healthStatus: resolveKnowledgeSourceHealthStatus(source, providerRegistered),
    diagnostics: Object.freeze({
      providerRegistered,
      validationIssueCount: 0,
      message: providerRegistered
        ? undefined
        : "Source registered without provider — projection deferred",
    }),
  });
}

export function summariseHealthStatus(
  metadata: readonly KnowledgeSourceMetadata[],
): KnowledgeHealthSummary {
  const summary = {
    healthy: 0,
    degraded: 0,
    planned: 0,
    disabled: 0,
    unknown: 0,
  };

  for (const entry of metadata) {
    summary[entry.healthStatus] += 1;
  }

  return Object.freeze(summary);
}
