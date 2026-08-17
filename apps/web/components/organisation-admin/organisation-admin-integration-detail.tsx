"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminFieldRow,
  OrgAdminFieldValue,
  OrgAdminPageHeader,
  OrgAdminSecondaryTabs,
  OrgAdminSectionTitle,
  OrgAdminStatusDot,
} from "@/components/organisation-admin/org-admin-ui";
import type { TenantBusinessIntegration } from "@/lib/organisation-admin/build-integrations";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";

type DetailPayload = {
  readonly generatedAt: string;
  readonly tenantId: string;
  readonly name: string;
  readonly status: string;
  readonly integration: TenantBusinessIntegration;
  readonly note: string;
};

async function fetchDetail(integrationId: string): Promise<DetailPayload> {
  const res = await fetch(
    `/api/v1/organisation-admin/integrations/${encodeURIComponent(integrationId)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: DetailPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Integration detail failed (${res.status})`);
  }
  return body.data;
}

type TabId = "overview" | "resources" | "access" | "activity";

export function OrganisationAdminIntegrationDetailView({
  integrationId,
}: {
  readonly integrationId: string;
}) {
  const q = useQuery({
    queryKey: ["organisation-admin", "integrations", integrationId],
    queryFn: () => fetchDetail(integrationId),
  });
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-integration-detail"
    >
      <div>
        <Link
          href={`${ORGANISATION_ADMIN_BASE}/integrations`}
          className="text-xs text-[var(--color-muted-foreground)] hover:underline"
        >
          ← Integrations
        </Link>
      </div>

      <OrgAdminPageHeader
        title={q.data?.integration.name ?? "Integration"}
        subtitle={q.data?.integration.description}
        actions={<OrgAdminStatusDot label="Not configured" tone="neutral" />}
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-integration-tab"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "resources", label: "Resources" },
          { id: "access", label: "Access" },
          { id: "activity", label: "Activity" },
        ]}
      />

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data && tab === "overview" ? (
        <dl data-testid="org-admin-integration-overview">
          <OrgAdminSectionTitle>Connection</OrgAdminSectionTitle>
          <OrgAdminFieldRow label="Organisation">{q.data.name}</OrgAdminFieldRow>
          <OrgAdminFieldRow label="Status">
            <OrgAdminFieldValue
              availability="not_configured"
              message={q.data.integration.message}
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Last synchronised">
            <OrgAdminFieldValue
              availability="unavailable"
              message="No synchronisation state for this integration"
            />
          </OrgAdminFieldRow>
        </dl>
      ) : null}

      {q.data && tab === "resources" ? (
        <div className="py-4 text-xs" data-testid="org-admin-integration-resources">
          <p className="font-medium">Not configured</p>
          <p className="mt-1 text-[var(--color-muted-foreground)]">
            Resources appear after this business integration is connected. No secrets or
            tokens are shown here.
          </p>
        </div>
      ) : null}

      {q.data && (tab === "access" || tab === "activity") ? (
        <div className="py-4 text-xs">
          <p className="font-medium">Not configured</p>
          <p className="mt-1 text-[var(--color-muted-foreground)]">
            {tab === "access"
              ? "Access grants for this integration are not configured."
              : "Activity for this integration is not available."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
