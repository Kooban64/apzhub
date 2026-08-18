"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type PriceRow = {
  readonly packageId?: string;
  readonly productKey?: string;
  readonly name: string;
  readonly status: string;
  readonly selfServe?: boolean;
  readonly amountCents: number | null;
  readonly currency: string;
  readonly source: "catalogue" | "admin" | "unset";
};

type PricesPayload = {
  readonly packages: readonly PriceRow[];
  readonly products: readonly PriceRow[];
  readonly unsetPriceFields: readonly string[];
};

async function fetchPrices(): Promise<PricesPayload> {
  const res = await fetch("/api/v1/platform-admin/catalogue/prices", {
    cache: "no-store",
  });
  const body = (await res.json()) as {
    data?: PricesPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Prices failed (${res.status})`);
  }
  return body.data;
}

async function savePackagePrice(packageId: string, amountCents: number | null) {
  const res = await fetch("/api/v1/platform-admin/catalogue/prices", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ packageId, amountCents, reason: "Admin catalogue overlay" }),
  });
  const body = (await res.json()) as { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(body.error?.message ?? `Save failed (${res.status})`);
  }
}

function formatAmount(cents: number | null, currency: string): string {
  if (cents == null) return "Unset";
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function PlatformAdminCataloguePrices() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["platform-admin", "catalogue-prices"],
    queryFn: fetchPrices,
  });
  const save = useMutation({
    mutationFn: ({
      packageId,
      amountCents,
    }: {
      packageId: string;
      amountCents: number | null;
    }) => savePackagePrice(packageId, amountCents),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["platform-admin", "catalogue-prices"] });
    },
  });

  return (
    <section data-testid="platform-admin-catalogue-prices">
      <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
        Catalogue prices
      </h2>
      <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
        Set list prices for self-serve packages. Checkout refuses unset prices — no
        invented amounts.
      </p>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data ? (
        <>
          {q.data.unsetPriceFields.length > 0 ? (
            <p className="mb-3 font-mono text-[11px] text-[var(--color-muted-foreground)]">
              Unset: {q.data.unsetPriceFields.join(", ")}
            </p>
          ) : null}
          <div className="overflow-x-auto rounded border border-[var(--color-border)]">
            <table className="w-full min-w-[40rem] border-collapse text-left text-xs">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="px-2 py-1.5 font-medium">Package</th>
                  <th className="px-2 py-1.5 font-medium">Status</th>
                  <th className="px-2 py-1.5 font-medium">Price</th>
                  <th className="px-2 py-1.5 font-medium">Source</th>
                  <th className="px-2 py-1.5 font-medium">Set (ZAR cents)</th>
                </tr>
              </thead>
              <tbody>
                {q.data.packages
                  .filter((row) => row.selfServe)
                  .map((row) => (
                    <tr
                      key={row.packageId}
                      className="border-b border-[var(--color-border)]/60"
                      data-testid={`catalogue-price-${row.packageId}`}
                    >
                      <td className="px-2 py-1.5">{row.name}</td>
                      <td className="px-2 py-1.5 capitalize">{row.status}</td>
                      <td className="px-2 py-1.5">
                        {formatAmount(row.amountCents, row.currency)}
                      </td>
                      <td className="px-2 py-1.5 capitalize">{row.source}</td>
                      <td className="px-2 py-1.5">
                        <form
                          className="flex items-center gap-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const form = event.currentTarget;
                            const raw = (
                              form.elements.namedItem("amount") as HTMLInputElement
                            ).value.trim();
                            const amountCents = raw === "" ? null : Number(raw);
                            if (amountCents != null && !Number.isFinite(amountCents)) {
                              return;
                            }
                            void save.mutateAsync({
                              packageId: row.packageId!,
                              amountCents,
                            });
                          }}
                        >
                          <input
                            name="amount"
                            type="number"
                            min={0}
                            step={1}
                            placeholder={
                              row.amountCents != null ? String(row.amountCents) : ""
                            }
                            className="w-24 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1"
                          />
                          <button
                            type="submit"
                            className="rounded bg-[var(--color-primary)] px-2 py-1 text-[var(--color-primary-foreground)]"
                            disabled={save.isPending}
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
