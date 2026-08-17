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
import type { OrganisationAdminSecurityPayload } from "@/lib/organisation-admin/build-security";

async function fetchSecurity(): Promise<OrganisationAdminSecurityPayload> {
  const res = await fetch("/api/v1/organisation-admin/security", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: OrganisationAdminSecurityPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Security failed (${res.status})`);
  }
  return body.data;
}

type TabId = "overview" | "authentication" | "sessions";

export function OrganisationAdminSecurityView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "security"],
    queryFn: fetchSecurity,
  });
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-security"
    >
      <OrgAdminPageHeader
        title="Security"
        subtitle={`Security posture for ${q.data?.tenant.name ?? "this organisation"}`}
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-security-tab"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "authentication", label: "Authentication" },
          { id: "sessions", label: "Sessions" },
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
        <div data-testid="org-admin-security-overview">
          <dl>
            <OrgAdminSectionTitle>Authentication</OrgAdminSectionTitle>
            <OrgAdminFieldRow label="Users">
              <OrgAdminFieldValue
                availability={q.data.authentication.users.availability}
                value={q.data.authentication.users.value}
              />
            </OrgAdminFieldRow>
            <OrgAdminFieldRow label="Active sessions">
              <OrgAdminFieldValue
                availability={q.data.authentication.activeSessions.availability}
                value={q.data.authentication.activeSessions.value}
                message={q.data.authentication.activeSessions.message}
              />
            </OrgAdminFieldRow>
            <OrgAdminFieldRow label="MFA coverage">
              <OrgAdminFieldValue
                availability={q.data.authentication.mfaCoverage.availability}
                value={q.data.authentication.mfaCoverage.value}
                message={q.data.authentication.mfaCoverage.message}
              />
            </OrgAdminFieldRow>
            <OrgAdminFieldRow label="SSO">
              <OrgAdminFieldValue
                availability={q.data.authentication.sso.availability}
                message={q.data.authentication.sso.message}
              />
            </OrgAdminFieldRow>
          </dl>

          <dl>
            <OrgAdminSectionTitle>Access</OrgAdminSectionTitle>
            <OrgAdminFieldRow label="Organisation administrators">
              <OrgAdminFieldValue
                availability={q.data.access.organisationAdministrators.availability}
                value={q.data.access.organisationAdministrators.value}
              />
            </OrgAdminFieldRow>
            <OrgAdminFieldRow label="Professional tool users">
              <OrgAdminFieldValue
                availability={q.data.access.professionalToolUsers.availability}
                value={q.data.access.professionalToolUsers.value}
              />
            </OrgAdminFieldRow>
            <OrgAdminFieldRow label="Suspended users">
              <OrgAdminFieldValue
                availability={q.data.access.suspendedUsers.availability}
                value={q.data.access.suspendedUsers.value}
              />
            </OrgAdminFieldRow>
          </dl>

          <div className="pt-2">
            <OrgAdminSectionTitle>Attention</OrgAdminSectionTitle>
            <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {q.data.attention.map((item) => (
                <li key={item.title} className="py-2.5 text-xs">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-0.5 text-[var(--color-muted-foreground)]">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 max-w-2xl text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </div>
      ) : null}

      {q.data && tab === "authentication" ? (
        <dl data-testid="org-admin-security-authentication">
          <OrgAdminSectionTitle>Authentication</OrgAdminSectionTitle>
          <OrgAdminFieldRow label="Sign-in method">
            <OrgAdminFieldValue
              availability={q.data.authentication.signInMethod.availability}
              value={q.data.authentication.signInMethod.value}
              message={q.data.authentication.signInMethod.message}
              managedBy="platform"
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="SSO">
            <OrgAdminFieldValue
              availability={q.data.authentication.sso.availability}
              message={q.data.authentication.sso.message}
              managedBy="organisation"
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="MFA">
            <OrgAdminFieldValue
              availability={q.data.authentication.mfaCoverage.availability}
              value={q.data.authentication.mfaCoverage.value}
              message={q.data.authentication.mfaCoverage.message}
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Session policy">
            <OrgAdminFieldValue
              availability={q.data.authentication.sessionPolicy.availability}
              value={q.data.authentication.sessionPolicy.value}
              managedBy="platform"
            />
          </OrgAdminFieldRow>
        </dl>
      ) : null}

      {q.data && tab === "sessions" ? (
        <dl data-testid="org-admin-security-sessions">
          <OrgAdminSectionTitle>Sessions</OrgAdminSectionTitle>
          <OrgAdminFieldRow label="Active sessions">
            <OrgAdminFieldValue
              availability={q.data.authentication.activeSessions.availability}
              value={q.data.authentication.activeSessions.value}
              message={q.data.authentication.activeSessions.message}
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Session policy">
            <OrgAdminFieldValue
              availability={q.data.authentication.sessionPolicy.availability}
              value={q.data.authentication.sessionPolicy.value}
              managedBy="platform"
            />
          </OrgAdminFieldRow>
        </dl>
      ) : null}
    </div>
  );
}
