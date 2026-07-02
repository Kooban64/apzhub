export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface DependencyHealth {
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
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

export interface PlatformHealthResponse {
  status: HealthStatus;
  platformVersion: string;
  buildNumber: string;
  environment: string;
  timestamp: string;
  dependencies: {
    database: DependencyHealth;
    redis: DependencyHealth;
  };
  runtime?: PlatformRuntimeHealthSummary;
  commands?: ActionFrameworkHealthSummary;
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
