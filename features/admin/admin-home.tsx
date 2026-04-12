"use client";

import { buildAdminModuleDescriptors } from "@/lib/admin/admin-module-contract";
import type { AdminModuleDescriptor } from "@/lib/admin/admin-module-contract";
import {
  defaultAdminHomeConfig,
  type AdminHomeConfig,
} from "@/lib/admin/admin-home-config";
import type { AdminHomeData } from "@/lib/admin/mock-admin-home-data";
import { useAdminControlPlaneQuery } from "@/lib/hooks/use-admin-control-plane-query";
import { AdminAlertsModule } from "@/features/admin/modules/admin-alerts-module";
import { AdminAuditModule } from "@/features/admin/modules/admin-audit-module";
import { AdminHealthModule } from "@/features/admin/modules/admin-health-module";
import { AdminProvisioningModule } from "@/features/admin/modules/admin-provisioning-module";
import { AdminQuickActionsModule } from "@/features/admin/modules/admin-quick-actions-module";
function ModuleRegion({
  descriptor,
  children,
}: {
  descriptor: AdminModuleDescriptor;
  children: React.ReactNode;
}) {
  return (
    <div
      role="region"
      data-testid={`admin-module-${descriptor.id}`}
      data-module-kind={descriptor.kind}
      data-module-state={descriptor.dataState}
      aria-label={descriptor.title}
    >
      {children}
    </div>
  );
}

function renderModule(descriptor: AdminModuleDescriptor, data: AdminHomeData) {
  switch (descriptor.id) {
    case "platform_health":
      return <AdminHealthModule health={data.health} />;
    case "action_required":
      return <AdminAlertsModule items={data.alerts} />;
    case "provisioning_queue":
      return <AdminProvisioningModule rows={data.provisioning.rows} />;
    case "quick_actions":
      return <AdminQuickActionsModule actions={data.quickActions.actions} />;
    case "audit_recent":
      return <AdminAuditModule events={data.audit.events} />;
    default:
      return null;
  }
}

function AdminHomeInner({ data, config }: { data: AdminHomeData; config: AdminHomeConfig }) {
  const descriptors = buildAdminModuleDescriptors(config)
    .filter((d) => d.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="flex flex-col gap-3 text-sm"
      data-testid="admin-home-root"
    >
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Admin</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Operational view — health, queue pressure, and required actions. Not a user workspace.
        </p>
      </header>
      {descriptors.map((d) => (
        <section key={d.id} className="flex flex-col gap-1.5">
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">{d.title}</h2>
          <ModuleRegion descriptor={d}>{renderModule(d, data)}</ModuleRegion>
        </section>
      ))}
    </div>
  );
}

export function AdminHome({
  data: dataProp,
  config = defaultAdminHomeConfig,
}: {
  data?: AdminHomeData;
  config?: AdminHomeConfig;
}) {
  const fetched = useAdminControlPlaneQuery({ enabled: dataProp === undefined });
  const data = dataProp ?? fetched.data;
  if (!data) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-home-loading">
        Loading admin snapshot…
      </div>
    );
  }
  return <AdminHomeInner data={data} config={config} />;
}
