"use client";

import { Card, CardContent } from "@apzhub/ui";
import { useEffect, useState, type JSX } from "react";

import {
  fetchAuthorizationDiagnostics,
  fetchGovernanceDiagnostics,
  fetchIdentityDiagnostics,
  fetchOperationsControlPlane,
  fetchOperationsSummary,
  fetchPersonalisationDiagnostics,
  fetchPlatformAudit,
  fetchPlatformConfiguration,
  fetchPlatformModules,
  fetchPlatformPermissions,
  fetchPlatformProducts,
  fetchPlatformRoles,
  fetchPlatformServices,
  fetchPlatformTenants,
  fetchPlatformUsers,
} from "@/lib/platform-operations/ops-api";
import type { PlatformOperationsSection } from "@/lib/platform-operations/routes";

import { CapabilitiesSection } from "./capabilities-section";
import { ControlPlaneOverviewSection } from "./control-plane-overview-section";
import { FeatureFlagsSection } from "./feature-flags-section";
import { GovernanceSection } from "./governance-section";
import {
  OpsErrorState,
  OpsJsonPanel,
  OpsLoadingState,
  OpsPageShell,
  OpsStatusBadge,
  OpsTable,
} from "./ops-ui";
import { PersonalisationSection } from "./personalisation-section";
import { ProvisioningSection } from "./provisioning-section";
import { ResilienceSection } from "./resilience-section";
import { SecuritySection } from "./security-section";

function useAsyncData<T>(
  key: string,
  loader: () => Promise<T>,
): {
  readonly data: T | null;
  readonly error: string | null;
  readonly loading: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loader()
      .then((result) => {
        if (active) {
          setData(result);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Request failed.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [key]);

  return { data, error, loading };
}

function DashboardSection() {
  const summary = useAsyncData("operations-summary", fetchOperationsSummary);
  const controlPlane = useAsyncData(
    "operations-control-plane",
    fetchOperationsControlPlane,
  );

  if (summary.loading || controlPlane.loading) return <OpsLoadingState />;
  if (summary.error || !summary.data) {
    return <OpsErrorState message={summary.error ?? "No summary data."} />;
  }
  if (controlPlane.error || !controlPlane.data) {
    return <OpsErrorState message={controlPlane.error ?? "No control plane data."} />;
  }

  return (
    <ControlPlaneOverviewSection
      controlPlane={controlPlane.data}
      summaryCounts={{
        tenants: summary.data.tenants.count,
        users: summary.data.users.count,
        modules: summary.data.modules.count,
        services: summary.data.services.count,
        products: summary.data.products.count,
      }}
    />
  );
}

function TenantsSection() {
  const { data, error, loading } = useAsyncData("tenants", fetchPlatformTenants);

  if (loading) return <OpsLoadingState />;
  if (error) return <OpsErrorState message={error} />;

  const tenants = (data ?? []) as Array<{
    tenantId: string;
    slug: string;
    name: string;
    status: string;
  }>;

  return (
    <OpsPageShell
      title="Tenants"
      description="Platform tenant registry and lifecycle status."
    >
      <OpsTable
        columns={["Tenant ID", "Slug", "Name", "Status"]}
        rows={tenants.map((tenant) => [
          tenant.tenantId,
          tenant.slug,
          tenant.name,
          tenant.status,
        ])}
      />
    </OpsPageShell>
  );
}

function UsersSection() {
  const { data, error, loading } = useAsyncData("users", fetchPlatformUsers);

  if (loading) return <OpsLoadingState />;
  if (error) return <OpsErrorState message={error} />;

  return (
    <OpsPageShell
      title="Users"
      description="Platform users with tenant binding, roles, and effective permissions."
    >
      <OpsTable
        columns={["Name", "Email", "Tenant", "Roles", "Permissions"]}
        rows={(data ?? []).map((user) => [
          user.name,
          user.email,
          user.activeTenantId ?? "—",
          user.roles.join(", ") || "—",
          String(user.effectivePermissions.length),
        ])}
      />
    </OpsPageShell>
  );
}

function RolesSection() {
  const { data, error, loading } = useAsyncData("roles", fetchPlatformRoles);

  if (loading) return <OpsLoadingState />;
  if (error) return <OpsErrorState message={error} />;

  const roles = (data ?? []) as Array<{
    roleId: string;
    slug: string;
    name: string;
    scope: string;
    status: string;
  }>;

  return (
    <OpsPageShell
      title="Roles"
      description="Canonical RBAC roles from AuthorizationService."
    >
      <OpsTable
        columns={["Slug", "Name", "Scope", "Status"]}
        rows={roles.map((role) => [role.slug, role.name, role.scope, role.status])}
      />
    </OpsPageShell>
  );
}

function PermissionsSection() {
  const { data, error, loading } = useAsyncData(
    "permissions",
    fetchPlatformPermissions,
  );

  if (loading) return <OpsLoadingState />;
  if (error) return <OpsErrorState message={error} />;

  const permissions = (data ?? []) as Array<{
    permissionKey: string;
    namespace: string;
    description?: string;
  }>;

  return (
    <OpsPageShell title="Permissions" description="Manifest-driven permission catalog.">
      <OpsTable
        columns={["Permission", "Namespace", "Description"]}
        rows={permissions.map((permission) => [
          permission.permissionKey,
          permission.namespace,
          permission.description ?? "—",
        ])}
      />
    </OpsPageShell>
  );
}

function ProductsSection() {
  const { data, error, loading } = useAsyncData("products", fetchPlatformProducts);

  if (loading) return <OpsLoadingState />;
  if (error) return <OpsErrorState message={error} />;

  return (
    <OpsPageShell
      title="Products"
      description="Registered products from platform runtime discovery."
    >
      <OpsTable
        columns={["ID", "Name", "Version", "Lifecycle", "Health"]}
        rows={(data ?? []).map((product) => [
          product.id,
          product.name,
          product.version,
          product.lifecycleState,
          product.healthState,
        ])}
      />
    </OpsPageShell>
  );
}

function ServicesSection() {
  const { data, error, loading } = useAsyncData("services", fetchPlatformServices);

  if (loading) return <OpsLoadingState />;
  if (error) return <OpsErrorState message={error} />;

  return (
    <OpsPageShell
      title="Services"
      description="Registered platform services and health."
    >
      <OpsTable
        columns={["ID", "Name", "Version", "Category", "Health"]}
        rows={(data ?? []).map((service) => [
          service.id,
          service.name,
          service.version,
          service.category ?? "—",
          service.healthState,
        ])}
      />
    </OpsPageShell>
  );
}

function ModulesSection() {
  const { data, error, loading } = useAsyncData("modules", fetchPlatformModules);

  if (loading) return <OpsLoadingState />;
  if (error) return <OpsErrorState message={error} />;

  return (
    <OpsPageShell
      title="Modules"
      description="Discovered modules with capabilities, commands, and diagnostics metadata."
    >
      <OpsTable
        columns={["ID", "Name", "Version", "Lifecycle", "Health"]}
        rows={(data ?? []).map((module) => [
          module.id,
          module.name,
          module.version,
          module.lifecycleState,
          module.healthState,
        ])}
      />
      <OpsJsonPanel value={data} />
    </OpsPageShell>
  );
}

function ProvisioningSectionRouter() {
  return <ProvisioningSection />;
}

function DiagnosticsSection() {
  const {
    data: identity,
    error: identityError,
    loading: identityLoading,
  } = useAsyncData("identity-diagnostics", fetchIdentityDiagnostics);
  const {
    data: authorization,
    error: authorizationError,
    loading: authorizationLoading,
  } = useAsyncData("authorization-diagnostics", fetchAuthorizationDiagnostics);
  const {
    data: personalisation,
    error: personalisationError,
    loading: personalisationLoading,
  } = useAsyncData("personalisation-diagnostics", fetchPersonalisationDiagnostics);
  const {
    data: governance,
    error: governanceError,
    loading: governanceLoading,
  } = useAsyncData("governance-diagnostics", fetchGovernanceDiagnostics);
  const {
    data: summary,
    error: summaryError,
    loading: summaryLoading,
  } = useAsyncData("consolidated-diagnostics", fetchOperationsSummary);

  if (
    identityLoading ||
    authorizationLoading ||
    personalisationLoading ||
    governanceLoading ||
    summaryLoading
  ) {
    return <OpsLoadingState />;
  }
  if (
    identityError ||
    authorizationError ||
    personalisationError ||
    governanceError ||
    summaryError
  ) {
    return (
      <OpsErrorState
        message={
          identityError ??
          authorizationError ??
          personalisationError ??
          governanceError ??
          summaryError ??
          "Diagnostics failed."
        }
      />
    );
  }

  return (
    <OpsPageShell
      title="Diagnostics"
      description="Consolidated operational diagnostics across platform capabilities."
    >
      <OpsJsonPanel
        value={{
          identity,
          authorization,
          personalisation,
          governance,
          security: summary?.securitySummary,
          consolidated: summary?.consolidatedDiagnostics,
        }}
      />
    </OpsPageShell>
  );
}

function AuditSection() {
  const { data, error, loading } = useAsyncData("audit", fetchPlatformAudit);

  if (loading) return <OpsLoadingState />;
  if (error) return <OpsErrorState message={error} />;

  return (
    <OpsPageShell
      title="Audit"
      description="Recent authorization and tenant audit signals."
    >
      <OpsTable
        columns={["Event", "Category", "Occurred", "Payload"]}
        rows={(data ?? []).map((entry) => [
          entry.eventId,
          entry.category,
          entry.occurredAt,
          JSON.stringify(entry.payload),
        ])}
      />
    </OpsPageShell>
  );
}

function HealthSection() {
  const { data, error, loading } = useAsyncData(
    "health-summary",
    fetchOperationsSummary,
  );

  if (loading) return <OpsLoadingState />;
  if (error || !data) return <OpsErrorState message={error ?? "Health unavailable."} />;

  const frameworks = [
    ["Runtime", data.health.runtime?.status ?? "unknown"],
    ["Commands", data.health.commands?.status ?? "unknown"],
    ["Knowledge discovery", data.health.knowledge?.status ?? "unknown"],
    ["Events", data.health.events?.status ?? "unknown"],
    ["Notifications", data.health.notifications?.status ?? "unknown"],
    ["Activity", data.health.activities?.status ?? "unknown"],
    ["Timeline", data.health.timelines?.hydrationStatus ?? "unknown"],
    ["Database", data.health.dependencies.database.status],
    ["Redis", data.health.dependencies.redis.status],
    [
      "Security (env)",
      data.health.security?.environmentValid ? "healthy" : "unhealthy",
    ],
    ["Identity", data.identityDiagnostics ? "healthy" : "unknown"],
    ["Authorization", data.authorizationDiagnostics ? "healthy" : "unknown"],
  ] as const;

  return (
    <OpsPageShell
      title="Health"
      description="Aggregated platform and framework health."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {frameworks.map(([label, status]) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between pt-6">
              <span className="text-sm font-medium">{label}</span>
              <OpsStatusBadge status={status} />
            </CardContent>
          </Card>
        ))}
      </div>
      <OpsJsonPanel value={data.health} />
    </OpsPageShell>
  );
}

function ConfigurationSection() {
  const { data, error, loading } = useAsyncData(
    "configuration",
    fetchPlatformConfiguration,
  );

  if (loading) return <OpsLoadingState />;
  if (error || !data)
    return <OpsErrorState message={error ?? "Configuration unavailable."} />;

  return (
    <OpsPageShell
      title="Configuration"
      description="Environment and platform configuration (read-only)."
    >
      <OpsTable
        columns={["Setting", "Value"]}
        rows={Object.entries(data).map(([key, value]) => [key, String(value)])}
      />
    </OpsPageShell>
  );
}

function FeatureFlagsSectionRouter() {
  return <FeatureFlagsSection />;
}

const SECTION_COMPONENTS: Record<PlatformOperationsSection, () => JSX.Element> = {
  dashboard: DashboardSection,
  tenants: TenantsSection,
  users: UsersSection,
  roles: RolesSection,
  permissions: PermissionsSection,
  products: ProductsSection,
  services: ServicesSection,
  modules: ModulesSection,
  provisioning: ProvisioningSectionRouter,
  governance: GovernanceSection,
  capabilities: CapabilitiesSection,
  diagnostics: DiagnosticsSection,
  audit: AuditSection,
  health: HealthSection,
  security: SecuritySection,
  resilience: ResilienceSection,
  configuration: ConfigurationSection,
  personalisation: PersonalisationSection,
  "feature-flags": FeatureFlagsSectionRouter,
};

export function OperationsWorkspaceRouter({
  section,
}: {
  readonly section: PlatformOperationsSection;
}) {
  const Section = SECTION_COMPONENTS[section];
  return <Section />;
}
