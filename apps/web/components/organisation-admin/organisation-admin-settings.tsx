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
  OrgAdminTable,
  OrgAdminTd,
  OrgAdminTh,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminSettingsPayload } from "@/lib/organisation-admin/build-org-settings";

async function fetchSettings(): Promise<OrganisationAdminSettingsPayload> {
  const res = await fetch("/api/v1/organisation-admin/settings", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: OrganisationAdminSettingsPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Settings failed (${res.status})`);
  }
  return body.data;
}

type TabId = "profile" | "administrators" | "lifecycle";

export function OrganisationAdminSettingsView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "settings"],
    queryFn: fetchSettings,
  });
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-settings"
    >
      <OrgAdminPageHeader
        title="Organisation Settings"
        subtitle={`Manage ${q.data?.profile.displayName ?? "organisation"} information`}
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-settings-tab"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "administrators", label: "Administrators" },
          { id: "lifecycle", label: "Lifecycle" },
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

      {q.data && tab === "profile" ? (
        <div data-testid="org-admin-settings-profile">
          <dl>
            <OrgAdminSectionTitle>Organisation Profile</OrgAdminSectionTitle>
            <OrgAdminFieldRow label="Organisation name">
              {q.data.profile.organisationName}
            </OrgAdminFieldRow>
            <OrgAdminFieldRow label="Display name">
              {q.data.profile.displayName}
            </OrgAdminFieldRow>
            <OrgAdminFieldRow label="Organisation ID">
              {q.data.profile.organisationId}
            </OrgAdminFieldRow>
            <OrgAdminFieldRow label="Status">{q.data.profile.status}</OrgAdminFieldRow>
          </dl>
          <dl>
            <OrgAdminSectionTitle>Contact</OrgAdminSectionTitle>
            <OrgAdminFieldRow label="Primary contact">
              <OrgAdminFieldValue
                availability={q.data.contact.primaryContact.availability}
                message={q.data.contact.primaryContact.message}
              />
            </OrgAdminFieldRow>
            <OrgAdminFieldRow label="Billing contact">
              <OrgAdminFieldValue
                availability={q.data.contact.billingContact.availability}
                message={q.data.contact.billingContact.message}
              />
            </OrgAdminFieldRow>
          </dl>
        </div>
      ) : null}

      {q.data && tab === "administrators" ? (
        <div data-testid="org-admin-settings-administrators">
          <OrgAdminSectionTitle>Administrators</OrgAdminSectionTitle>
          {q.data.administrators.length === 0 ? (
            <p className="py-4 text-xs text-[var(--color-muted-foreground)]">
              No organisation administrators found for this tenant.
            </p>
          ) : (
            <OrgAdminTable testId="org-admin-admins-table" minWidth="32rem">
              <thead>
                <tr>
                  <OrgAdminTh>User</OrgAdminTh>
                  <OrgAdminTh>Administrative Access</OrgAdminTh>
                  <OrgAdminTh>Status</OrgAdminTh>
                </tr>
              </thead>
              <tbody>
                {q.data.administrators.map((a) => (
                  <tr key={a.userId}>
                    <OrgAdminTd>
                      <Link href={a.href} className="hover:underline">
                        {a.displayName}
                      </Link>
                      <span className="mt-0.5 block text-[11px] text-[var(--color-muted-foreground)]">
                        {a.email}
                      </span>
                    </OrgAdminTd>
                    <OrgAdminTd>{a.administrativeAccess}</OrgAdminTd>
                    <OrgAdminTd className="capitalize">{a.status}</OrgAdminTd>
                  </tr>
                ))}
              </tbody>
            </OrgAdminTable>
          )}
        </div>
      ) : null}

      {q.data && tab === "lifecycle" ? (
        <dl data-testid="org-admin-settings-lifecycle">
          <OrgAdminSectionTitle>Organisation Lifecycle</OrgAdminSectionTitle>
          <OrgAdminFieldRow label="Status">{q.data.lifecycle.status}</OrgAdminFieldRow>
          <OrgAdminFieldRow label="Created">
            {new Date(q.data.lifecycle.createdAt).toLocaleString()}
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Suspension">
            <OrgAdminFieldValue
              availability={q.data.lifecycle.suspension.availability}
              value={q.data.lifecycle.suspension.value}
              managedBy="platform"
            />
          </OrgAdminFieldRow>
          <OrgAdminFieldRow label="Termination">
            <OrgAdminFieldValue
              availability={q.data.lifecycle.termination.availability}
              value={q.data.lifecycle.termination.value}
              managedBy="platform"
            />
          </OrgAdminFieldRow>
          <p className="mt-3 max-w-2xl text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </dl>
      ) : null}
    </div>
  );
}
