"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminFieldRow,
  OrgAdminFieldValue,
  OrgAdminPageHeader,
  OrgAdminSecondaryTabs,
  OrgAdminSectionTitle,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminWorkspaceSettingsPayload } from "@/lib/organisation-admin/build-workspace-settings";

async function fetchWorkspaceSettings(): Promise<OrganisationAdminWorkspaceSettingsPayload> {
  const res = await fetch("/api/v1/organisation-admin/workspace-settings", {
    cache: "no-store",
  });
  const body = (await res.json()) as {
    data?: OrganisationAdminWorkspaceSettingsPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Workspace settings failed (${res.status})`);
  }
  return body.data;
}

type TabId = "general" | "experience" | "defaults" | "features";

export function OrganisationAdminWorkspaceSettingsView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "workspace-settings"],
    queryFn: fetchWorkspaceSettings,
  });
  const [tab, setTab] = useState<TabId>("general");

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-workspace-settings"
    >
      <OrgAdminPageHeader
        title="Workspace Settings"
        subtitle={`Configure how APZ works for ${q.data?.tenant.name ?? "your organisation"}`}
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-workspace-tab"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "general", label: "General" },
          { id: "experience", label: "Experience" },
          { id: "defaults", label: "Defaults" },
          { id: "features", label: "Features" },
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

      {q.data && tab === "general" ? (
        <dl data-testid="org-admin-workspace-general">
          <OrgAdminSectionTitle>General</OrgAdminSectionTitle>
          <OrgAdminFieldRow label="Workspace name">
            <OrgAdminFieldValue
              availability={q.data.general.workspaceName.availability}
              value={q.data.general.workspaceName.value}
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Default landing experience">
            <OrgAdminFieldValue
              availability={q.data.general.defaultLanding.availability}
              value={q.data.general.defaultLanding.value}
              message={q.data.general.defaultLanding.message}
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Timezone">
            <OrgAdminFieldValue
              availability={q.data.general.timezone.availability}
              value={q.data.general.timezone.value}
              message={q.data.general.timezone.message}
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Date format">
            <OrgAdminFieldValue
              availability={q.data.general.dateFormat.availability}
              value={q.data.general.dateFormat.value}
              message={q.data.general.dateFormat.message}
            />
          </OrgAdminFieldRow>
        </dl>
      ) : null}

      {q.data && tab === "experience" ? (
        <dl data-testid="org-admin-workspace-experience">
          <OrgAdminSectionTitle>Experience</OrgAdminSectionTitle>
          <OrgAdminFieldRow label="Default theme">
            <OrgAdminFieldValue
              availability={q.data.experience.defaultTheme.availability}
              value={q.data.experience.defaultTheme.value}
              message={q.data.experience.defaultTheme.message}
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Organisation branding">
            <OrgAdminFieldValue
              availability={q.data.experience.branding.availability}
              value={q.data.experience.branding.value}
              message={q.data.experience.branding.message}
            />
          </OrgAdminFieldRow>
          <p className="mt-3 max-w-2xl text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </dl>
      ) : null}

      {q.data && tab === "defaults" ? (
        <dl data-testid="org-admin-workspace-defaults">
          <OrgAdminSectionTitle>Defaults</OrgAdminSectionTitle>
          <OrgAdminFieldRow label="Default product">
            <OrgAdminFieldValue
              availability={q.data.defaults.defaultProduct.availability}
              value={q.data.defaults.defaultProduct.value}
              message={q.data.defaults.defaultProduct.message}
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Default team">
            <OrgAdminFieldValue
              availability={q.data.defaults.defaultTeam.availability}
              value={q.data.defaults.defaultTeam.value}
              message={q.data.defaults.defaultTeam.message}
            />
          </OrgAdminFieldRow>
          <p className="mt-3 max-w-2xl text-[11px] text-[var(--color-muted-foreground)]">
            Tenant default → User Personalisation overrides where allowed. This surface
            does not duplicate Personalisation.
          </p>
        </dl>
      ) : null}

      {q.data && tab === "features" ? (
        <div className="py-4 text-xs" data-testid="org-admin-workspace-features">
          <p className="font-medium">Not configured</p>
          <p className="mt-1 text-[var(--color-muted-foreground)]">
            Organisation feature flags are not configured for tenant administration.
          </p>
        </div>
      ) : null}
    </div>
  );
}
