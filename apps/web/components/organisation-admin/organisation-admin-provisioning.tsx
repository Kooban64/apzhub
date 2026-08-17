"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminNotConfigured,
  OrgAdminPageHeader,
  OrgAdminSecondaryTabs,
  OrgAdminTable,
  OrgAdminTd,
  OrgAdminTh,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminProvisioningPayload } from "@/lib/organisation-admin/build-provisioning";

async function fetchProvisioning(): Promise<OrganisationAdminProvisioningPayload> {
  const res = await fetch("/api/v1/organisation-admin/provisioning", {
    cache: "no-store",
  });
  const body = (await res.json()) as {
    data?: OrganisationAdminProvisioningPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Provisioning failed (${res.status})`);
  }
  return body.data;
}

type TabId = "overview" | "in-progress" | "issues" | "history";

export function OrganisationAdminProvisioningView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "provisioning"],
    queryFn: fetchProvisioning,
  });
  const [tab, setTab] = useState<TabId>("overview");

  const overallValue =
    q.data?.overall.availability === "ok" ? q.data.overall.value : "—";

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-provisioning"
    >
      <OrgAdminPageHeader
        title="Provisioning"
        subtitle={`Product access delivery for ${q.data?.tenant.name ?? "this organisation"}`}
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-provisioning-tab"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "in-progress", label: "In Progress" },
          { id: "issues", label: "Issues" },
          { id: "history", label: "History" },
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
        <div className="space-y-6 pt-2" data-testid="org-admin-provisioning-overview">
          <section>
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Current state
            </h2>
            <dl className="grid max-w-2xl grid-cols-3 gap-4 text-xs">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Ready</dt>
                <dd className="mt-0.5 font-medium">{overallValue}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">In Progress</dt>
                <dd className="mt-0.5 text-[var(--color-muted-foreground)]">—</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Issues</dt>
                <dd className="mt-0.5 text-[var(--color-muted-foreground)]">—</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Access readiness
            </h2>
            <OrgAdminTable minWidth="40rem">
              <thead>
                <tr>
                  <OrgAdminTh>Strip</OrgAdminTh>
                  <OrgAdminTh>Status</OrgAdminTh>
                </tr>
              </thead>
              <tbody>
                {q.data.strips.map((s) => (
                  <tr key={s.label}>
                    <OrgAdminTd>{s.label}</OrgAdminTd>
                    <OrgAdminTd>
                      {s.status.availability === "ok"
                        ? s.status.value
                        : s.status.availability === "empty"
                          ? (s.status.value ?? "None")
                          : "Not configured"}
                    </OrgAdminTd>
                  </tr>
                ))}
              </tbody>
            </OrgAdminTable>
          </section>

          <section>
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Readiness steps
            </h2>
            <OrgAdminTable>
              <thead>
                <tr>
                  <OrgAdminTh>Step</OrgAdminTh>
                  <OrgAdminTh>Status</OrgAdminTh>
                </tr>
              </thead>
              <tbody>
                {q.data.steps.map((step) => (
                  <tr key={step.id}>
                    <OrgAdminTd>{step.label}</OrgAdminTd>
                    <OrgAdminTd className="capitalize">{step.status}</OrgAdminTd>
                  </tr>
                ))}
              </tbody>
            </OrgAdminTable>
          </section>

          <section>
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Subscribed products
            </h2>
            {q.data.subscribedProducts.length === 0 ? (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                No product subscriptions
              </p>
            ) : (
              <OrgAdminTable>
                <thead>
                  <tr>
                    <OrgAdminTh>Product</OrgAdminTh>
                    <OrgAdminTh>Entitlement</OrgAdminTh>
                  </tr>
                </thead>
                <tbody>
                  {q.data.subscribedProducts.map((p) => (
                    <tr key={p.productKey}>
                      <OrgAdminTd>{p.label}</OrgAdminTd>
                      <OrgAdminTd className="capitalize">
                        {p.status.replace("_", " ")}
                      </OrgAdminTd>
                    </tr>
                  ))}
                </tbody>
              </OrgAdminTable>
            )}
          </section>

          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}{" "}
            <Link
              href={q.data.rolesAccessHref}
              className="text-[var(--color-primary)] hover:underline"
            >
              Roles & Access
            </Link>
          </p>
        </div>
      ) : null}

      {q.data && tab === "in-progress" ? (
        <OrgAdminNotConfigured
          testId="org-admin-provisioning-queue"
          title="In Progress"
          message="Product access delivery jobs are not currently available for this organisation. No in-progress rows are invented."
        />
      ) : null}

      {q.data && tab === "issues" ? (
        <OrgAdminNotConfigured
          testId="org-admin-provisioning-queue"
          title="Issues"
          message="Delivery issue feed is not currently available. When present, issues will describe the APZ product only — never the underlying provider."
        />
      ) : null}

      {q.data && tab === "history" ? (
        <OrgAdminNotConfigured
          testId="org-admin-provisioning-history"
          title="Provisioning history"
          message="Detailed provisioning job history is not currently available for this organisation."
        />
      ) : null}
    </div>
  );
}
