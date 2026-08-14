"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { OperatorGate } from "@/components/operator/operator-gate";
import {
  OperatorMetricStrip,
  OperatorPage,
  OperatorPanel,
} from "@/components/operator/operator-shell";
import { DenseLinkList } from "@/components/operator/operator-ui";
import { FINANCE_NAV } from "@/lib/operator/shell-landing";

async function fetchJson(endpoint: string, init?: RequestInit) {
  const res = await fetch(endpoint, init);
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

function FinanceFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <OperatorGate shell="finance">
      <OperatorPage title={title} subtitle={subtitle}>
        {children}
      </OperatorPage>
    </OperatorGate>
  );
}

function JsonPanel({
  endpoint,
  method = "GET",
  body,
}: {
  endpoint: string;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
}) {
  const q = useQuery({
    queryKey: ["finance", endpoint, method],
    queryFn: () =>
      fetchJson(endpoint, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }),
  });
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] text-[var(--color-muted-foreground)]">
        {method} {endpoint} → {q.data?.status ?? "…"}
      </p>
      <pre className="max-h-96 overflow-auto rounded border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-[11px]">
        {JSON.stringify(q.data?.json ?? q.error ?? "Loading…", null, 2)}
      </pre>
    </div>
  );
}

export function FinanceOverviewPage() {
  return (
    <FinanceFrame
      title="Finance"
      subtitle="Billing, invoices, dunning, credits, refunds."
    >
      <OperatorMetricStrip
        metrics={[
          { label: "APIs", value: "wired" },
          { label: "Currency", value: "ZAR" },
          { label: "Provider", value: "PayFast" },
          { label: "Ledger", value: "live" },
        ]}
      />
      <OperatorPanel title="Sections">
        <DenseLinkList
          items={FINANCE_NAV.filter((n) => n.id !== "overview").map((n) => ({
            href: n.href,
            label: n.label,
          }))}
        />
      </OperatorPanel>
    </FinanceFrame>
  );
}

export function FinanceAccountsPage() {
  return (
    <FinanceFrame title="Accounts" subtitle="/api/v1/billing/overview">
      <JsonPanel endpoint="/api/v1/billing/overview" />
    </FinanceFrame>
  );
}

export function FinanceInvoicesPage() {
  return (
    <FinanceFrame title="Invoices" subtitle="Entitlements + billing workspace">
      <DenseLinkList
        items={[
          {
            href: "/workspace/billing",
            label: "Billing workspace",
            hint: "invoices UI",
          },
        ]}
      />
      <div className="mt-4">
        <JsonPanel endpoint="/api/v1/billing/entitlements" />
      </div>
    </FinanceFrame>
  );
}

export function FinanceDunningPage() {
  return (
    <FinanceFrame title="Dunning" subtitle="Advance dunning cycles">
      <JsonPanel endpoint="/api/v1/billing/dunning/advance" method="POST" body={{}} />
    </FinanceFrame>
  );
}

export function FinanceCreditsPage() {
  return (
    <FinanceFrame title="Credits" subtitle="/api/v1/billing/credits">
      <JsonPanel endpoint="/api/v1/billing/credits" />
    </FinanceFrame>
  );
}

export function FinanceRefundsPage() {
  return (
    <FinanceFrame title="Refunds" subtitle="/api/v1/billing/refunds">
      <JsonPanel endpoint="/api/v1/billing/refunds" />
    </FinanceFrame>
  );
}

export function FinanceStatementsPage() {
  return (
    <FinanceFrame title="Statements" subtitle="/api/v1/billing/statement">
      <JsonPanel endpoint="/api/v1/billing/statement" />
    </FinanceFrame>
  );
}
