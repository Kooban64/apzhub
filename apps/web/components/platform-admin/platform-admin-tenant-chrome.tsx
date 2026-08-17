"use client";

import Link from "next/link";

import {
  TENANT_DETAIL_TABS,
  TENANT_TAB_AVAILABILITY_LIVE,
  type TenantDetailTabId,
} from "@/lib/platform-admin/tenant-tabs";

export function PlatformAdminTenantChrome({
  tenantId,
  tenantName,
  tenantStatus,
  activeTab,
  children,
}: {
  readonly tenantId: string;
  readonly tenantName: string;
  readonly tenantStatus: string;
  readonly activeTab: TenantDetailTabId;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-tenant-detail">
      <Link
        href="/platform-admin/tenants"
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        ← Tenants
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{tenantName}</h1>
          <p className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
            Tenant ID: {tenantId}
          </p>
        </div>
        <span className="text-xs capitalize text-[var(--color-muted-foreground)]">
          ● {tenantStatus}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Tenant sections"
        className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
        data-testid="tenant-detail-tabs"
      >
        {TENANT_DETAIL_TABS.map((tab) => {
          const available = TENANT_TAB_AVAILABILITY_LIVE[tab.id];
          const active = tab.id === activeTab;
          const enabled = Boolean(tab.href);
          if (enabled && tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href(tenantId)}
                role="tab"
                aria-selected={active}
                className={`rounded px-2.5 py-1.5 text-xs ${
                  active
                    ? "bg-[var(--color-muted)] font-medium"
                    : "hover:bg-[var(--color-muted)]/60"
                }`}
                data-testid={`tenant-tab-${tab.id}`}
                data-availability={available}
              >
                {tab.label}
              </Link>
            );
          }
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={false}
              disabled
              title="Not configured — awaits Owner unlock of this tab"
              className="cursor-not-allowed rounded px-2.5 py-1.5 text-xs opacity-50"
              data-testid={`tenant-tab-${tab.id}`}
              data-availability={available}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export function fieldDisplay(field: {
  readonly availability: string;
  readonly value?: string | number;
  readonly message?: string;
}): string {
  if (field.availability === "ok" && field.value !== undefined) {
    return String(field.value);
  }
  if (field.availability === "empty" && field.value !== undefined) {
    return String(field.value);
  }
  if (field.availability === "not_configured") return "Not configured";
  if (field.availability === "unavailable") return "Unavailable";
  return "—";
}
