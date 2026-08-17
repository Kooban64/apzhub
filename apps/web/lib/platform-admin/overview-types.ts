/**
 * Platform Admin Overview DTO — honest availability on every field.
 * Spec: docs/frontend/platform-admin/screens/01-overview.md
 */

export type OverviewWindow = "24h" | "7d" | "30d";

export type FieldAvailability =
  "ok" | "empty" | "unavailable" | "not_configured" | "error";

export type CapabilityHealthStatus =
  "healthy" | "degraded" | "unhealthy" | "unavailable";

export type MetricField<T = number> = {
  readonly availability: FieldAvailability;
  readonly value?: T;
  readonly message?: string;
};

export type PlatformAdminOverview = {
  readonly generatedAt: string;
  readonly window: OverviewWindow;
  readonly environment: string;
  readonly platformVersion: string;
  readonly platformStatus: {
    readonly overall: MetricField<"operational" | "degraded" | "unhealthy" | "unknown">;
    readonly tenants: MetricField;
    readonly users: MetricField;
    readonly providers: MetricField;
    readonly warnings: MetricField;
  };
  readonly tenants: {
    readonly availability: FieldAvailability;
    readonly active: MetricField;
    readonly trial: MetricField;
    readonly suspended: MetricField;
    readonly provisioningIssues: MetricField;
    readonly href: string;
  };
  readonly platformHealth: {
    readonly availability: FieldAvailability;
    readonly capabilities: readonly {
      readonly id: string;
      readonly label: string;
      readonly status: CapabilityHealthStatus;
      readonly message?: string;
    }[];
  };
  readonly provisioning: {
    readonly availability: FieldAvailability;
    readonly pending: MetricField;
    readonly processing: MetricField;
    readonly failed: MetricField;
    readonly completedToday: MetricField;
    readonly href: string;
    readonly message?: string;
  };
  readonly billing: {
    readonly availability: FieldAvailability;
    readonly monthlyRevenue: MetricField<string>;
    readonly outstanding: MetricField<string>;
    readonly failedPayments: MetricField;
    readonly renewals30d: MetricField;
    readonly href: string;
    readonly message?: string;
  };
  readonly attention: {
    readonly availability: FieldAvailability;
    readonly items: readonly {
      readonly id: string;
      readonly severity: "warning" | "info" | "critical";
      readonly area: string;
      readonly tenant: string;
      readonly issue: string;
      readonly age: string;
    }[];
    readonly href: string;
    readonly message?: string;
  };
  readonly activity: {
    readonly availability: FieldAvailability;
    readonly items: readonly {
      readonly id: string;
      readonly at: string;
      readonly subject: string;
      readonly summary: string;
      readonly actor: string;
    }[];
    readonly href: string;
    readonly message?: string;
  };
};
