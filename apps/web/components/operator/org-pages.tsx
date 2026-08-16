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

type ProfessionalToolsPayload = {
  readonly catalogue: readonly {
    readonly id: string;
    readonly label: string;
    readonly description: string;
  }[];
  readonly grants: readonly {
    readonly id: string;
    readonly userId: string;
    readonly toolId: string;
    readonly reason: string;
    readonly expiresAt: string;
    readonly grantedBy: string;
    readonly createdAt: string;
    readonly revokedAt?: string;
  }[];
  readonly boundaryWarning: string;
};

export function OrgProfessionalToolsPage() {
  const qc = useQueryClient();
  const [userId, setUserId] = useState("");
  const [toolId, setToolId] = useState("workflow-designer");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["org", "professional-tools"],
    queryFn: async () => {
      const res = await fetch("/api/v1/org/professional-tools");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Unable to load tools");
      return body.data as ProfessionalToolsPayload;
    },
  });

  const grantMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/org/professional-tools?action=grant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId,
          toolId,
          reason,
          expiresAt: new Date(expiresAt).toISOString(),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Grant failed");
      return body.data;
    },
    onSuccess: async () => {
      setError(null);
      setReason("");
      await qc.invalidateQueries({ queryKey: ["org", "professional-tools"] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Grant failed");
    },
  });

  const revokeMut = useMutation({
    mutationFn: async (grantId: string) => {
      const res = await fetch("/api/v1/org/professional-tools?action=revoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ grantId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Revoke failed");
      return body.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["org", "professional-tools"] });
    },
  });

  return (
    <OrgFrame
      title="Professional Tools"
      subtitle="Specialist entitlements with reason and expiry — not provider launch pads."
    >
      <OperatorPanel title="Boundary">
        <p className="text-sm text-[var(--color-muted-foreground)]" role="note">
          {q.data?.boundaryWarning ??
            "Professional Tools leave the normal APZ product chrome. Grant only to specialists."}
        </p>
      </OperatorPanel>

      <OperatorPanel title="Catalogue">
        <ul
          className="space-y-2 text-sm"
          data-testid="org-professional-tools-catalogue"
        >
          {(q.data?.catalogue ?? []).map((tool) => (
            <li
              key={tool.id}
              className="rounded border border-[var(--color-border)] p-3"
            >
              <p className="font-medium">{tool.label}</p>
              <p className="text-[var(--color-muted-foreground)]">{tool.description}</p>
            </li>
          ))}
        </ul>
      </OperatorPanel>

      <OperatorPanel title="Grant access">
        <form
          className="grid gap-3 md:grid-cols-2"
          data-testid="org-professional-tools-grant-form"
          onSubmit={(event) => {
            event.preventDefault();
            grantMut.mutate();
          }}
        >
          <label className="flex flex-col gap-1 text-xs">
            User ID
            <input
              className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Tool
            <select
              className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              value={toolId}
              onChange={(e) => setToolId(e.target.value)}
            >
              {(q.data?.catalogue ?? []).map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs md:col-span-2">
            Reason
            <input
              className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Expires
            <input
              type="date"
              className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              required
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)]"
              disabled={grantMut.isPending}
            >
              {grantMut.isPending ? "Granting…" : "Grant"}
            </button>
          </div>
          {error ? (
            <p
              className="md:col-span-2 text-sm text-[var(--color-destructive)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </form>
      </OperatorPanel>

      <OperatorPanel title="Active & historical grants">
        {(q.data?.grants.length ?? 0) === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">No grants yet.</p>
        ) : (
          <DataTable
            columns={["User", "Tool", "Expires", "Reason", "Status", ""]}
            rows={(q.data?.grants ?? []).map((grant) => [
              grant.userId,
              grant.toolId,
              grant.expiresAt.slice(0, 10),
              grant.reason,
              grant.revokedAt ? "Revoked" : "Active",
              grant.revokedAt ? (
                "—"
              ) : (
                <button
                  key={`revoke-${grant.id}`}
                  type="button"
                  className="text-xs underline"
                  onClick={() => revokeMut.mutate(grant.id)}
                  data-testid={`org-professional-tools-revoke-${grant.id}`}
                >
                  Revoke
                </button>
              ),
            ])}
          />
        )}
      </OperatorPanel>
    </OrgFrame>
  );
}
