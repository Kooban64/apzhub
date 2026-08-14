"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "@/components/qep/qep-ui";
import { CommercialNoticeBanner } from "@/components/commercial/commercial-notice-banner";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

type Sku = {
  skuId: string;
  name: string;
  kind: string;
  description: string;
  amountCents: number;
  currency: string;
  interval: string;
};

type Overview = {
  account: {
    billingAccountId: string;
    dunningState: string;
    currency: string;
  };
  invoices: Array<{
    invoiceId: string;
    skuId: string;
    amountCents: number;
    status: string;
  }>;
  balanceCents: number;
  health: { configured: boolean; sandbox: boolean; detail: string };
  catalogue: Sku[];
};

export function BillingWorkspaceView() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<{
    processUrl: string;
    fields: Record<string, string>;
  } | null>(null);

  const overviewQuery = useQuery({
    queryKey: ["billing", "overview"],
    queryFn: () => fetchJson<Overview>("/api/v1/billing/overview"),
  });

  const entitlementsQuery = useQuery({
    queryKey: ["billing", "entitlements"],
    queryFn: () =>
      fetchJson<{
        capabilities: string[];
        dunningState: string;
      }>("/api/v1/billing/entitlements"),
  });

  const purchaseMutation = useMutation({
    mutationFn: (skuId: string) =>
      fetchJson<{
        checkout: { processUrl: string; fields: Record<string, string> };
        invoice: { invoiceId: string };
        note?: string;
      }>("/api/v1/billing/overview", {
        method: "POST",
        body: JSON.stringify({ skuId, kind: "organisation" }),
      }),
    onSuccess: (data) => {
      setCheckout(data.checkout);
      setMessage(
        `Invoice ${data.invoice.invoiceId} issued. Submit the PayFast form to pay.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: (error) => setMessage((error as Error).message),
  });

  if (overviewQuery.isLoading) {
    return <QepLoadingState label="Loading billing…" />;
  }
  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <QepErrorState message={(overviewQuery.error as Error)?.message ?? "Error"} />
    );
  }

  const overview = overviewQuery.data;
  const entitlements = entitlementsQuery.data;

  return (
    <QepPageShell
      title="Billing"
      description="Plans, invoices, statements, and PayFast checkout. Overdue accounts get notices — never an immediate cut-off."
    >
      <CommercialNoticeBanner dunningState={overview.account.dunningState} />

      <QepPanel title="Account">
        <div className="flex flex-wrap gap-3 text-sm">
          <QepStatusBadge status={overview.account.dunningState} />
          <span className="font-mono text-xs">{overview.account.billingAccountId}</span>
          <span>
            Balance: {(overview.balanceCents / 100).toFixed(2)}{" "}
            {overview.account.currency}
          </span>
          <span className="text-[var(--color-muted-foreground)]">
            PayFast: {overview.health.detail}
          </span>
        </div>
      </QepPanel>

      {message ? (
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{message}</p>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <QepPanel title="Catalogue">
          <ul className="space-y-2">
            {overview.catalogue.map((sku) => (
              <li
                key={sku.skuId}
                className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] py-2 text-sm last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{sku.name}</div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">
                    {sku.description}
                  </div>
                </div>
                <span className="font-mono text-xs">
                  {(sku.amountCents / 100).toFixed(2)} {sku.currency}/{sku.interval}
                </span>
                <button
                  type="button"
                  data-testid={`billing-buy-${sku.skuId}`}
                  className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
                  disabled={purchaseMutation.isPending}
                  onClick={() => purchaseMutation.mutate(sku.skuId)}
                >
                  Buy
                </button>
              </li>
            ))}
          </ul>
        </QepPanel>

        <QepPanel title="Entitlements">
          {entitlements?.capabilities?.length ? (
            <ul className="space-y-1 text-sm">
              {entitlements.capabilities.map((cap) => (
                <li key={cap} className="font-mono text-xs">
                  {cap}
                </li>
              ))}
            </ul>
          ) : (
            <QepEmptyState title="No entitlements yet — purchase a SKU and complete payment." />
          )}
        </QepPanel>
      </div>

      {checkout ? (
        <QepPanel title="PayFast checkout">
          <form method="POST" action={checkout.processUrl} className="space-y-2">
            {Object.entries(checkout.fields).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
            <button
              type="submit"
              data-testid="billing-payfast-submit"
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
            >
              Continue to PayFast
            </button>
          </form>
        </QepPanel>
      ) : null}

      <div className="mt-4">
        <QepPanel title="Invoices">
          {overview.invoices.length === 0 ? (
            <QepEmptyState title="No invoices yet." />
          ) : (
            <ul className="space-y-1 text-sm">
              {overview.invoices.map((invoice) => (
                <li key={invoice.invoiceId} className="flex gap-2 font-mono text-xs">
                  <QepStatusBadge status={invoice.status} />
                  <span>{invoice.invoiceId}</span>
                  <span>{invoice.skuId}</span>
                  <span>{(invoice.amountCents / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </QepPanel>
      </div>
    </QepPageShell>
  );
}
