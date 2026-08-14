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
import { COMPLIANCE_NAV } from "@/lib/operator/shell-landing";

async function fetchCompliance() {
  const res = await fetch("/api/v1/compliance/overview");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Compliance load failed");
  return body.data as {
    signups: readonly {
      signupId: string;
      organisationId: string;
      organisationName: string;
      status: string;
      notes: string;
    }[];
    statutory: readonly { id: string; label: string; status: string }[];
    entitlementsPreview: {
      organisationId: string;
      subscriptions: readonly { productKey: string; status: string }[];
    } | null;
    suites: readonly { suiteId: string; name: string }[];
  };
}

function ComplianceFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <OperatorGate shell="compliance">
      <OperatorPage title={title} subtitle={subtitle}>
        {children}
      </OperatorPage>
    </OperatorGate>
  );
}

export function ComplianceOverviewPage() {
  const q = useQuery({ queryKey: ["compliance"], queryFn: fetchCompliance });
  return (
    <ComplianceFrame
      title="Compliance"
      subtitle="Statutory, tax, partner and organisation signup review."
    >
      <OperatorMetricStrip
        metrics={[
          { label: "Signups", value: String(q.data?.signups.length ?? "—") },
          {
            label: "Pending",
            value: String(
              q.data?.signups.filter((s) => s.status === "pending").length ?? "—",
            ),
          },
          { label: "Checks", value: String(q.data?.statutory.length ?? "—") },
          { label: "Suites", value: String(q.data?.suites.length ?? "—") },
        ]}
      />
      <OperatorPanel title="Sections">
        <DenseLinkList
          items={COMPLIANCE_NAV.filter((n) => n.id !== "overview").map((n) => ({
            href: n.href,
            label: n.label,
          }))}
        />
      </OperatorPanel>
    </ComplianceFrame>
  );
}

export function ComplianceSignupsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["compliance"], queryFn: fetchCompliance });
  const [orgId, setOrgId] = useState("");
  const [orgName, setOrgName] = useState("");
  const mut = useMutation({
    mutationFn: (status: "pending" | "approved" | "rejected") =>
      fetch("/api/v1/compliance/overview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "signup.review",
          organisationId: orgId,
          organisationName: orgName,
          status,
        }),
      }).then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
        return body.data;
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["compliance"] });
      setOrgId("");
      setOrgName("");
    },
  });

  return (
    <ComplianceFrame
      title="Signup review"
      subtitle="Partner and organisation onboarding compliance."
    >
      <OperatorPanel title="Record / review">
        <div className="flex flex-wrap gap-2">
          <input
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            placeholder="Org id"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
          />
          <input
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            placeholder="Org name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <button
            type="button"
            className="h-8 rounded border border-[var(--color-border)] px-2 text-xs"
            disabled={!orgId || !orgName}
            onClick={() => mut.mutate("pending")}
          >
            Pending
          </button>
          <button
            type="button"
            className="h-8 rounded bg-[var(--color-primary)] px-2 text-xs text-[var(--color-primary-foreground)]"
            disabled={!orgId || !orgName}
            onClick={() => mut.mutate("approved")}
          >
            Approve
          </button>
          <button
            type="button"
            className="h-8 rounded border border-[var(--color-border)] px-2 text-xs text-[var(--color-destructive)]"
            disabled={!orgId || !orgName}
            onClick={() => mut.mutate("rejected")}
          >
            Reject
          </button>
        </div>
      </OperatorPanel>
      <DataTable
        columns={["Organisation", "Org id", "Status", "Notes"]}
        rows={(q.data?.signups ?? []).map((s) => [
          s.organisationName,
          s.organisationId,
          s.status,
          s.notes || "—",
        ])}
        empty="No signup reviews yet."
      />
    </ComplianceFrame>
  );
}

export function ComplianceStatutoryPage() {
  const q = useQuery({ queryKey: ["compliance"], queryFn: fetchCompliance });
  return (
    <ComplianceFrame
      title="Statutory & tax"
      subtitle="Checklist for regulated onboarding."
    >
      <DataTable
        columns={["Check", "Status"]}
        rows={(q.data?.statutory ?? []).map((s) => [s.label, s.status])}
      />
    </ComplianceFrame>
  );
}

export function ComplianceEntitlementsPage() {
  const q = useQuery({ queryKey: ["compliance"], queryFn: fetchCompliance });
  const subs = q.data?.entitlementsPreview?.subscriptions ?? [];
  return (
    <ComplianceFrame
      title="Entitlement posture"
      subtitle="Subscribed products for current tenant."
    >
      <DataTable
        columns={["Product", "Status"]}
        rows={subs.map((s) => [s.productKey, s.status])}
        empty="No entitlement snapshot for this tenant."
      />
    </ComplianceFrame>
  );
}

export function ComplianceAuditPage() {
  return (
    <ComplianceFrame title="Audit" subtitle="Retention and audit browsers.">
      <DenseLinkList
        items={[
          {
            href: "/workspace/administration/audit",
            label: "Platform audit",
            hint: "admin.audit",
          },
          {
            href: "/workspace/documents",
            label: "Documents / retention",
            hint: "document.retention",
          },
        ]}
      />
    </ComplianceFrame>
  );
}

export function ComplianceFindingsPage() {
  return (
    <ComplianceFrame title="Findings" subtitle="Compliance findings register.">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Findings are recorded via signup reviews and audit events. No open findings in
        the console store yet.
      </p>
    </ComplianceFrame>
  );
}
