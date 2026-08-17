/**
 * Platform Admin — Providers (implementation language).
 */

import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";
import {
  capabilityFromTags,
  listIntegrationManifestsFromDisk,
  providerConnectionPosture,
} from "@/lib/platform-admin/integration-manifests";
import {
  opsField,
  type OpsStatus,
  type OpsStatusField,
} from "@/lib/platform-admin/ops-status";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type PlatformProviderRow = {
  readonly providerId: string;
  readonly displayName: string;
  readonly capability: string;
  readonly version: string;
  /** Runtime connection posture: Configured | Not configured */
  readonly statusLabel: string;
  readonly health: OpsStatusField;
  readonly tenants: TenantListField<number>;
  readonly href: string;
};

export type PlatformProvidersPayload = {
  readonly generatedAt: string;
  readonly providers: readonly PlatformProviderRow[];
  readonly note: string;
  readonly tabs: readonly string[];
};

export type PlatformProviderDetailPayload = {
  readonly generatedAt: string;
  readonly providerId: string;
  readonly displayName: string;
  readonly capability: string;
  readonly version: string;
  readonly description: string;
  readonly statusLabel: string;
  readonly health: OpsStatusField;
  readonly connection: OpsStatusField;
  readonly authentication: OpsStatusField;
  readonly lastHealthCheck: TenantListField<string>;
  readonly tenants: TenantListField<number>;
  readonly diagnostics: {
    readonly availability: "not_configured" | "ok";
    readonly message: string;
  };
};

function displayProviderName(id: string, manifestName: string): string {
  const map: Record<string, string> = {
    plane: "Plane",
    zammad: "Zammad",
    kimai: "Kimai",
    n8n: "n8n",
    metabase: "Metabase",
    paperless: "Paperless-ngx",
    meilisearch: "Meilisearch",
    "github-actions": "GitHub Actions",
    "gitlab-ci": "GitLab CI",
    "qep-github": "Git Provider",
    payfast: "PayFast",
    faraday: "Faraday",
    greenbone: "Greenbone",
  };
  return map[id] ?? manifestName.replace(/\s+Engine Integration$/i, "") ?? id;
}

function statusLabelFor(providerId: string): string {
  const posture = providerConnectionPosture(providerId);
  if (posture.connectionConfigured || posture.authConfigured) {
    return "Configured";
  }
  return "Not configured";
}

function healthForProvider(providerId: string): OpsStatusField {
  const posture = providerConnectionPosture(providerId);
  if (!posture.connectionConfigured && !posture.authConfigured) {
    return opsField(
      "not_configured",
      "Connection and authentication env not configured — health not probed",
    );
  }
  return opsField(
    "unknown",
    "Health unavailable — provider configured; live health probe not wired into Platform Admin",
  );
}

export async function buildPlatformAdminProviders(): Promise<PlatformProvidersPayload> {
  const manifests = listIntegrationManifestsFromDisk();
  const providers: PlatformProviderRow[] = manifests.map((m) => {
    const health = healthForProvider(m.id);
    const healthField: OpsStatusField =
      health.status === "unknown"
        ? { status: "unknown", label: "Health unavailable", message: health.message }
        : health;
    return {
      providerId: m.id,
      displayName: displayProviderName(m.id, m.name),
      capability: capabilityFromTags(m.tags),
      version: m.version,
      statusLabel: statusLabelFor(m.id),
      health: healthField,
      tenants: {
        availability: "not_configured",
        message: "Per-provider tenant binding counts are not configured",
      },
      href: `${PLATFORM_ADMIN_BASE}/providers/${encodeURIComponent(m.id)}`,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    providers,
    note: "Providers are loaded from integrations/*/integration.yaml. Health is never marked Healthy without a live probe.",
    tabs: ["overview", "integrations", "health", "mappings"],
  };
}

export async function buildPlatformAdminProviderDetail(
  providerId: string,
): Promise<PlatformProviderDetailPayload | null> {
  const manifests = listIntegrationManifestsFromDisk();
  const m = manifests.find((x) => x.id === providerId);
  if (!m) return null;
  const posture = providerConnectionPosture(m.id);
  const health = healthForProvider(m.id);
  const healthField: OpsStatusField =
    health.status === "unknown"
      ? { status: "unknown", label: "Health unavailable", message: health.message }
      : health;

  return {
    generatedAt: new Date().toISOString(),
    providerId: m.id,
    displayName: displayProviderName(m.id, m.name),
    capability: capabilityFromTags(m.tags),
    version: m.version,
    description: m.description,
    statusLabel: statusLabelFor(m.id),
    health: healthField,
    connection: posture.connectionConfigured
      ? opsField("healthy", "Base URL / host env present")
      : opsField("not_configured", "Connection env not configured"),
    authentication: posture.authConfigured
      ? opsField("healthy", "Auth token/key env present (value not shown)")
      : opsField("not_configured", "Authentication env not configured"),
    lastHealthCheck: {
      availability: "not_configured",
      value: "Not configured",
      message: "Last health check timestamp not stored for Platform Admin",
    },
    tenants: {
      availability: "not_configured",
      message: "Per-provider tenant binding counts are not configured",
    },
    diagnostics: {
      availability: "not_configured",
      message: "Provider diagnostics drawer write/retry paths are not configured here",
    },
  };
}

export type { OpsStatus };
