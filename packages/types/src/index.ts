export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface DependencyHealth {
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
}

/** Outbound SMTP dependency probe (platform-email). */
export interface EmailDependencyHealth {
  status: HealthStatus | "unconfigured" | "misconfigured";
  configured: boolean;
  host?: string;
  port?: number;
  from?: string;
  message?: string;
  checkedAt?: string;
}

export interface PlatformRuntimeHealthSummary {
  status: HealthStatus;
  platformReady: boolean;
  registryCount: number;
  capabilityCount: number;
  startupDurationMs: number;
  healthSummary: string;
}

/** Action Framework hydration summary for platform health (AF-020). */
export interface ActionFrameworkHealthSummary {
  status: HealthStatus;
  registeredCount: number;
  filteredCount: number;
  platformActionCount: number;
  capabilityActionCount: number;
  toolbarRegionCount: number;
  toolbarItemCount: number;
  registeredShortcutCount: number;
}

/** Knowledge & Discovery hydration summary for platform health (DF-015). */
export interface KnowledgeDiscoveryHealthSummary {
  status: HealthStatus;
  frameworkStatus: string;
  registeredCount: number;
  filteredCount: number;
  activeSourceCount: number;
  registeredProviderCount: number;
  serviceStatus: "ready" | "unavailable";
  queryAvailable: boolean;
}

/** Event Framework hydration summary for platform health (EN-015). */
export interface EventFrameworkHealthSummary {
  status: HealthStatus;
  frameworkStatus: string;
  layerStatus: string;
  registeredCount: number;
  filteredCount: number;
  platformEventCount: number;
  capabilityEventCount: number;
  publishCount: number;
  lastPublishStatus: string;
  subscriberCount: number;
}

/** Notification Framework hydration summary for platform health (EN-015). */
export interface NotificationFrameworkHealthSummary {
  status: HealthStatus;
  frameworkStatus: string;
  layerStatus: string;
  registeredRouteCount: number;
  filteredRouteCount: number;
  platformRouteCount: number;
  capabilityRouteCount: number;
  serviceStatus: string;
  storedCount: number;
  unreadCount: number;
  mapperStatus: string;
  mappedCount: number;
}

/** Activity Framework hydration summary for platform health (AT-013). */
export interface ActivityFrameworkHealthSummary {
  status: HealthStatus;
  frameworkStatus: string;
  layerStatus: string;
  registeredTypeCount: number;
  filteredTypeCount: number;
  platformTypeCount: number;
  capabilityTypeCount: number;
  serviceStatus: string;
  storedCount: number;
  viewedCount: number;
  unviewedCount: number;
  mapperStatus: string;
  mappedCount: number;
  lastBootstrapStatus: "ok" | "failed";
  subscriberRegistered: boolean;
}

/** Timeline Framework hydration summary for platform health (AT-013). */
export interface TimelineFrameworkHealthSummary {
  status: HealthStatus;
  frameworkStatus: string;
  layerStatus: string;
  registeredTimelineCount: number;
  filteredTimelineCount: number;
  platformTimelineCount: number;
  capabilityTimelineCount: number;
  activeScopeCount: number;
  scopeCounts: Readonly<Record<string, number>>;
  lastBootstrapStatus: "ok" | "failed";
  hydrationStatus: "empty" | "hydrated" | "invalid";
}

/** Law persistence diagnostics surfaced on health checks (LAW-012-03). */
export interface LawPersistenceDiagnosticsSummary {
  repositoryMode: "memory" | "postgres";
  tenantId: string;
  tenantSource:
    | "explicit"
    | "session-claim"
    | "env-override"
    | "default-firm"
    | "session-single-firm-fallback";
  actorId?: string;
  postgresReady: boolean;
  postgresLatencyMs?: number;
  migrationsOk: boolean;
  migrationMissingTags: readonly string[];
  outboxEnabled: boolean;
}

/** Law Platform application health summary (LAW-001-01). */
export interface LawPlatformHealthSummary {
  status: HealthStatus;
  applicationVersion: string;
  applicationName: string;
  moduleCount: number;
  placeholderModuleCount: number;
  registeredCommandCount: number;
  registeredKnowledgeSourceCount: number;
  registeredNotificationRouteCount: number;
  registeredActivityTypeCount: number;
  workspaceId: string;
  persistence?: LawPersistenceDiagnosticsSummary;
}

export interface PlatformHealthResponse {
  status: HealthStatus;
  platformVersion: string;
  buildNumber: string;
  environment: string;
  timestamp: string;
  dependencies: {
    database: DependencyHealth;
    redis: DependencyHealth;
    email?: EmailDependencyHealth;
  };
  runtime?: PlatformRuntimeHealthSummary;
  commands?: ActionFrameworkHealthSummary;
  knowledge?: KnowledgeDiscoveryHealthSummary;
  events?: EventFrameworkHealthSummary;
  notifications?: NotificationFrameworkHealthSummary;
  activities?: ActivityFrameworkHealthSummary;
  timelines?: TimelineFrameworkHealthSummary;
  lawPlatform?: LawPlatformHealthSummary;
  security?: {
    environmentValid: boolean;
    rateLimit: { backend: string; enabled: boolean };
  };
}

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string | null;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
}
