"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { OperatorGate } from "@/components/operator/operator-gate";
import {
  OperatorMetricStrip,
  OperatorPage,
  OperatorPanel,
} from "@/components/operator/operator-shell";
import { DataTable, DenseLinkList } from "@/components/operator/operator-ui";
import { OrgAdminMembersView } from "@/components/iam/org-admin-members-view";
import { ORG_NAV } from "@/lib/operator/shell-landing";
import type { PackageId, ProductKey, SuiteId } from "@/lib/commercial/catalogue";

async function fetchOrgConsole() {
  const res = await fetch("/api/v1/org/console");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Org console failed");
  return body.data as {
    organisationId: string;
    subscriptions: readonly { productKey: ProductKey; status: string }[];
    suiteIds: readonly SuiteId[];
    suites: readonly {
      suiteId: SuiteId;
      name: string;
      productKeys: readonly ProductKey[];
      status: string;
    }[];
    packages: readonly {
      packageId: PackageId;
      name: string;
      description: string;
      productKeys: readonly ProductKey[];
      status: string;
      selfServe: boolean;
      includesKnowledgeLite: boolean;
    }[];
    effectiveForSelf: readonly ProductKey[];
    entitlements?: {
      productKeys: readonly ProductKey[];
      moduleIds: readonly string[];
    };
  };
}

function OrgFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <OperatorGate shell="org">
      <OperatorPage title={title} subtitle={subtitle}>
        {children}
      </OperatorPage>
    </OperatorGate>
  );
}

export function OrgOverviewPage() {
  const q = useQuery({ queryKey: ["org", "console"], queryFn: fetchOrgConsole });
  return (
    <OrgFrame
      title="Organisation"
      subtitle="Members, RBAC, and provisioning for subscribed services."
    >
      <OperatorMetricStrip
        metrics={[
          { label: "Org", value: q.data?.organisationId?.slice(0, 8) ?? "—" },
          { label: "Suites", value: String(q.data?.suiteIds.length ?? "—") },
          {
            label: "Products",
            value: String(q.data?.subscriptions.length ?? "—"),
          },
          {
            label: "My access",
            value: String(q.data?.effectiveForSelf.length ?? "—"),
          },
        ]}
      />
      <OperatorPanel title="Sections">
        <DenseLinkList
          items={ORG_NAV.filter((n) => n.id !== "overview").map((n) => ({
            href: n.href,
            label: n.label,
          }))}
        />
      </OperatorPanel>
    </OrgFrame>
  );
}

export function OrgMembersPage() {
  return (
    <OrgFrame title="Members & RBAC" subtitle="Invite, personas, and product grants.">
      <div className="-mx-1">
        <OrgAdminMembersView />
      </div>
    </OrgFrame>
  );
}

export function OrgServicesPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["org", "console"], queryFn: fetchOrgConsole });
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("role-qep-operator");
  const [productKey, setProductKey] = useState<ProductKey>("qep");
  const mut = useMutation({
    mutationFn: () =>
      fetch("/api/v1/org/console", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "service_role.assign",
          userId,
          roleId,
          productKey,
        }),
      }).then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message ?? "Assign failed");
        return body.data;
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["org", "console"] }),
  });

  const subscribedProducts = q.data?.subscriptions.map((s) => s.productKey) ?? [];

  return (
    <OrgFrame
      title="Service roles"
      subtitle="Assign per-service roles only for subscribed products."
    >
      <OperatorPanel title="Assign role">
        <div className="flex flex-wrap gap-2">
          <input
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            placeholder="User id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            value={productKey}
            onChange={(e) => setProductKey(e.target.value as ProductKey)}
          >
            {subscribedProducts.length === 0 ? (
              <option value="qep">qep (none subscribed)</option>
            ) : (
              subscribedProducts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))
            )}
          </select>
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="role-qep-operator">QEP Operator</option>
            <option value="role-qep-reader">QEP Reader</option>
            <option value="role-employee">Employee</option>
            <option value="role-manager">Manager</option>
          </select>
          <button
            type="button"
            className="h-8 rounded bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)]"
            disabled={!userId || mut.isPending}
            onClick={() => mut.mutate()}
          >
            Assign
          </button>
        </div>
        {mut.error ? (
          <p className="mt-2 text-xs text-[var(--color-destructive)]">
            {(mut.error as Error).message}
          </p>
        ) : null}
        {mut.isSuccess ? (
          <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">Assigned.</p>
        ) : null}
      </OperatorPanel>
      <DataTable
        columns={["Subscribed product", "Status"]}
        rows={(q.data?.subscriptions ?? []).map((s) => [s.productKey, s.status])}
        empty="No subscribed products — purchase a suite first."
      />
    </OrgFrame>
  );
}

export function OrgSubscriptionsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["org", "console"], queryFn: fetchOrgConsole });
  const [selected, setSelected] = useState<SuiteId[]>(["qa"]);
  const [packageId, setPackageId] = useState<PackageId | "">("pkg.apzpen.starter");
  const suiteMut = useMutation({
    mutationFn: () =>
      fetch("/api/v1/org/console", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "suites.subscribe", suiteIds: selected }),
      }).then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message ?? "Subscribe failed");
        return body.data;
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["org", "console"] }),
  });
  const packageMut = useMutation({
    mutationFn: () =>
      fetch("/api/v1/org/console", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "packages.subscribe",
          packageId,
        }),
      }).then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message ?? "Package failed");
        return body.data;
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["org", "console"] }),
  });

  return (
    <OrgFrame
      title="Subscriptions"
      subtitle="Packages and suites unlock modules; grants still control who enters them."
    >
      <OperatorPanel title="Subscribe package (invoice line)">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-8 max-w-md rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value as PackageId)}
          >
            {(q.data?.packages ?? []).map((pkg) => (
              <option key={pkg.packageId} value={pkg.packageId}>
                {pkg.name} — {pkg.productKeys.join(", ")} ({pkg.status})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="h-8 rounded bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)]"
            onClick={() => packageMut.mutate()}
            disabled={!packageId || packageMut.isPending}
          >
            Add package
          </button>
        </div>
        {packageMut.error ? (
          <p className="mt-2 text-xs text-[var(--color-destructive)]">
            {(packageMut.error as Error).message}
          </p>
        ) : null}
      </OperatorPanel>
      <OperatorPanel title="Desired suites (full set replace)">
        <div className="flex flex-wrap gap-3">
          {(q.data?.suites ?? []).map((s) => (
            <label key={s.suiteId} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={selected.includes(s.suiteId)}
                onChange={(e) =>
                  setSelected((prev) =>
                    e.target.checked
                      ? [...prev, s.suiteId]
                      : prev.filter((x) => x !== s.suiteId),
                  )
                }
              />
              {s.name} ({s.status})
            </label>
          ))}
          <button
            type="button"
            className="h-8 rounded bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)]"
            onClick={() => suiteMut.mutate()}
            disabled={suiteMut.isPending}
          >
            Apply suites
          </button>
        </div>
      </OperatorPanel>
      <DataTable
        columns={["Product", "Status"]}
        rows={(q.data?.subscriptions ?? []).map((s) => [s.productKey, s.status])}
      />
      <OperatorPanel title="My entitled modules">
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {(q.data?.entitlements?.moduleIds ?? []).join(", ") || "None yet"}
        </p>
      </OperatorPanel>
    </OrgFrame>
  );
}

export function OrgBillingPage() {
  return (
    <OrgFrame title="Billing" subtitle="Organisation plan and upgrade path.">
      <DenseLinkList
        items={[
          { href: "/settings/billing", label: "Products & Billing", hint: "settings" },
          { href: "/workspace/billing", label: "Billing workspace", hint: "invoices" },
          { href: "/marketplace", label: "Expand products", hint: "no new org" },
          { href: "/pricing", label: "Public catalogue / upgrade", hint: "pricing" },
          { href: "/onboarding/team", label: "Invite team", hint: "licences" },
        ]}
      />
    </OrgFrame>
  );
}
