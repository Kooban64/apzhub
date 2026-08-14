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
import { CONSOLE_NAV } from "@/lib/operator/shell-landing";
import type { SuiteId } from "@/lib/commercial/catalogue";

async function fetchConsole() {
  const res = await fetch("/api/v1/console/platform");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load console");
  return body.data as {
    customers: readonly {
      customerId: string;
      organisationId: string;
      name: string;
      status: string;
      suiteIds: readonly SuiteId[];
    }[];
    payments: readonly {
      providerId: string;
      name: string;
      enabled: boolean;
      merchantIdRef: string;
      webhookUrl: string;
    }[];
    apiCredentials: readonly {
      credentialId: string;
      name: string;
      prefix: string;
      status: string;
    }[];
    limits: readonly {
      limitId: string;
      key: string;
      label: string;
      value: number;
      unit: string;
    }[];
    secrets: readonly {
      secretId: string;
      name: string;
      ref: string;
      status: string;
    }[];
    suites: readonly {
      suiteId: SuiteId;
      name: string;
      status: string;
      productKeys: readonly string[];
    }[];
    catalogue: {
      plans: readonly { planId: string; name: string; amountCents: number }[];
    };
  };
}

async function postConsole(action: string, payload: Record<string, unknown>) {
  const res = await fetch("/api/v1/console/platform", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Action failed");
  return body.data;
}

function ConsoleFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <OperatorGate shell="console">
      <OperatorPage title={title} subtitle={subtitle}>
        {children}
      </OperatorPage>
    </OperatorGate>
  );
}

export function ConsoleOverviewPage() {
  const q = useQuery({ queryKey: ["console", "platform"], queryFn: fetchConsole });
  return (
    <ConsoleFrame
      title="Platform Console"
      subtitle="Superadmin controls — customers, suites, payments, credentials."
    >
      <OperatorMetricStrip
        metrics={[
          { label: "Customers", value: String(q.data?.customers.length ?? "—") },
          { label: "API keys", value: String(q.data?.apiCredentials.length ?? "—") },
          { label: "Suites", value: String(q.data?.suites.length ?? "—") },
          {
            label: "Secrets OK",
            value: String(
              q.data?.secrets.filter((s) => s.status === "configured").length ?? "—",
            ),
          },
        ]}
      />
      <OperatorPanel title="Sections">
        <DenseLinkList
          items={CONSOLE_NAV.filter((n) => n.id !== "overview").map((n) => ({
            href: n.href,
            label: n.label,
          }))}
        />
      </OperatorPanel>
    </ConsoleFrame>
  );
}

export function ConsoleCustomersPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["console", "platform"], queryFn: fetchConsole });
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [suites, setSuites] = useState<SuiteId[]>(["qa"]);
  const mut = useMutation({
    mutationFn: () =>
      postConsole("customer.upsert", {
        organisationId: orgId,
        name,
        suiteIds: suites,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["console", "platform"] });
      setName("");
      setOrgId("");
    },
  });
  const remove = useMutation({
    mutationFn: (customerId: string) => postConsole("customer.remove", { customerId }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["console", "platform"] }),
  });

  return (
    <ConsoleFrame
      title="Customers"
      subtitle="Add or remove organisations and suite entitlements."
    >
      <OperatorPanel title="Add customer">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <input
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            placeholder="Organisation id"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
          />
          <input
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {(["qa", "pentest", "productivity"] as const).map((s) => (
            <label key={s} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={suites.includes(s)}
                onChange={(e) =>
                  setSuites((prev) =>
                    e.target.checked ? [...prev, s] : prev.filter((x) => x !== s),
                  )
                }
              />
              {s}
            </label>
          ))}
          <button
            type="button"
            className="h-8 rounded bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)]"
            disabled={!orgId || !name || mut.isPending}
            onClick={() => mut.mutate()}
          >
            Save
          </button>
        </div>
        {mut.error ? (
          <p className="mt-2 text-xs text-[var(--color-destructive)]">
            {(mut.error as Error).message}
          </p>
        ) : null}
      </OperatorPanel>
      <DataTable
        columns={["Name", "Org id", "Suites", "Status", ""]}
        rows={(q.data?.customers ?? []).map((c) => [
          c.name,
          <span key="id" className="font-mono text-[11px]">
            {c.organisationId}
          </span>,
          c.suiteIds.join(", "),
          c.status,
          <button
            key="rm"
            type="button"
            className="text-[11px] text-[var(--color-destructive)]"
            onClick={() => remove.mutate(c.customerId)}
          >
            Remove
          </button>,
        ])}
        empty="No customers yet."
      />
    </ConsoleFrame>
  );
}

export function ConsoleCataloguePage() {
  const q = useQuery({ queryKey: ["console", "platform"], queryFn: fetchConsole });
  return (
    <ConsoleFrame
      title="Suites & pricing"
      subtitle="Commercial categories QA, PenTest, Productivity."
    >
      <DataTable
        columns={["Suite", "Status", "Products"]}
        rows={(q.data?.suites ?? []).map((s) => [
          s.name,
          s.status,
          s.productKeys.join(", "),
        ])}
      />
      <OperatorPanel title="Plans">
        <DataTable
          columns={["Plan", "Amount (cents)"]}
          rows={(q.data?.catalogue.plans ?? []).map((p) => [
            p.name,
            String(p.amountCents),
          ])}
        />
      </OperatorPanel>
      <button
        type="button"
        className="h-8 rounded border border-[var(--color-border)] px-3 text-xs"
        onClick={() => void postConsole("apzor.ensure_suites", {})}
      >
        Ensure APZOR all suites free
      </button>
    </ConsoleFrame>
  );
}

export function ConsoleLimitsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["console", "platform"], queryFn: fetchConsole });
  return (
    <ConsoleFrame title="Limits" subtitle="Platform capacity and rate ceilings.">
      <DataTable
        columns={["Limit", "Value", "Unit", ""]}
        rows={(q.data?.limits ?? []).map((l) => [
          l.label,
          String(l.value),
          l.unit,
          <button
            key="u"
            type="button"
            className="text-[11px] text-[var(--color-primary)]"
            onClick={() => {
              const next = Number(
                window.prompt(`New value for ${l.label}`, String(l.value)),
              );
              if (!Number.isFinite(next)) return;
              void postConsole("limit.update", {
                limitId: l.limitId,
                value: next,
              }).then(() =>
                qc.invalidateQueries({ queryKey: ["console", "platform"] }),
              );
            }}
          >
            Edit
          </button>,
        ])}
      />
    </ConsoleFrame>
  );
}

export function ConsolePaymentsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["console", "platform"], queryFn: fetchConsole });
  return (
    <ConsoleFrame
      title="Payment providers"
      subtitle="Merchant refs only — no raw secrets."
    >
      <DataTable
        columns={["Provider", "Enabled", "Merchant ref", "Webhook", ""]}
        rows={(q.data?.payments ?? []).map((p) => [
          p.name,
          p.enabled ? "yes" : "no",
          <span key="r" className="font-mono text-[11px]">
            {p.merchantIdRef}
          </span>,
          p.webhookUrl,
          <button
            key="t"
            type="button"
            className="text-[11px]"
            onClick={() =>
              void postConsole("payment.update", {
                providerId: p.providerId,
                enabled: !p.enabled,
              }).then(() => qc.invalidateQueries({ queryKey: ["console", "platform"] }))
            }
          >
            Toggle
          </button>,
        ])}
      />
    </ConsoleFrame>
  );
}

export function ConsoleApiKeysPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["console", "platform"], queryFn: fetchConsole });
  const [once, setOnce] = useState<string | null>(null);
  return (
    <ConsoleFrame
      title="API credentials"
      subtitle="Create / rotate / revoke. Plaintext shown once."
    >
      <button
        type="button"
        className="mb-3 h-8 rounded bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)]"
        onClick={() =>
          void postConsole("api_key.create", { name: `key-${Date.now()}` }).then(
            (data) => {
              setOnce((data as { plaintextOnce?: string }).plaintextOnce ?? null);
              void qc.invalidateQueries({ queryKey: ["console", "platform"] });
            },
          )
        }
      >
        Create key
      </button>
      {once ? (
        <p className="mb-3 rounded border border-[var(--color-border)] bg-[var(--color-muted)]/40 p-2 font-mono text-xs">
          Copy now: {once}
        </p>
      ) : null}
      <DataTable
        columns={["Name", "Prefix", "Status", ""]}
        rows={(q.data?.apiCredentials ?? []).map((c) => [
          c.name,
          c.prefix,
          c.status,
          c.status === "active" ? (
            <button
              key="r"
              type="button"
              className="text-[11px] text-[var(--color-destructive)]"
              onClick={() =>
                void postConsole("api_key.revoke", {
                  credentialId: c.credentialId,
                }).then(() =>
                  qc.invalidateQueries({ queryKey: ["console", "platform"] }),
                )
              }
            >
              Revoke
            </button>
          ) : (
            "—"
          ),
        ])}
      />
    </ConsoleFrame>
  );
}

export function ConsoleSecretsPage() {
  const q = useQuery({ queryKey: ["console", "platform"], queryFn: fetchConsole });
  return (
    <ConsoleFrame title="Secrets" subtitle="Status and refs only — values never shown.">
      <DataTable
        columns={["Name", "Ref", "Status"]}
        rows={(q.data?.secrets ?? []).map((s) => [s.name, s.ref, s.status])}
      />
    </ConsoleFrame>
  );
}

export function ConsoleAuditPage() {
  return (
    <ConsoleFrame title="Audit" subtitle="Platform-critical change trail.">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Console mutations are correlated via platform API request IDs. Full immutable
        audit stream remains in Administration → Audit for cross-cutting events.
      </p>
      <DenseLinkList
        items={[
          {
            href: "/workspace/administration/audit",
            label: "Open platform audit (workbench)",
            hint: "admin.audit",
          },
        ]}
      />
    </ConsoleFrame>
  );
}
