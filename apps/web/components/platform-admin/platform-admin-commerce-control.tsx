"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";

type ControlPlane = {
  regions: readonly {
    regionId: string;
    name: string;
    currency: string;
    strategy: string;
    adjustmentBps: number | null;
    status: string;
    countryCodes: readonly string[];
    parentRegionId: string | null;
  }[];
  items: readonly {
    packageId: string;
    name: string;
    description: string;
    suiteId: string;
    catalogueStatus: string;
    overlayStatus?: string;
    pricingUnit: string;
    selfServe: boolean;
    item: {
      draft: Record<
        string,
        {
          amountCents: number | null;
          currency: string;
          annualDiscountBps: number | null;
          annualAmountCents: number | null;
        }
      >;
      published: Record<
        string,
        {
          amountCents: number | null;
          currency: string;
          annualDiscountBps: number | null;
          annualAmountCents: number | null;
        }
      >;
      status?: string;
      pricingUnit: string;
    };
  }[];
  plans: readonly {
    planId: string;
    name: string;
    amountCents: number;
    currency: string;
    trialDays: number;
    selfServe: boolean;
    overlayStatus?: string;
    draft?: {
      amountCents: number | null;
      trialDays: number | null;
      annualDiscountBps: number | null;
    };
    published?: { amountCents: number | null };
  }[];
  taxRules: readonly {
    taxRuleId: string;
    countryCode: string;
    name: string;
    rateBps: number;
    pricesExclusive: boolean;
    status: string;
  }[];
  discounts: readonly {
    discountId: string;
    kind: string;
    name: string;
    code?: string;
    status: string;
    adjustmentBps?: number | null;
  }[];
  history: readonly {
    id: string;
    occurredAt: string;
    actorUserId: string;
    action: string;
    itemId: string;
    regionId?: string;
    reason: string;
    from: unknown;
    to: unknown;
  }[];
  repricePolicy: string;
  readiness: {
    catalogue: { status: string };
    southAfricaPricing: { status: string; priced: number; sellable: number };
    globalPricing: { status: string; priced: number };
    tax: { status: string };
    payfast: { status: string; sandbox: boolean };
    selfServiceRegistration: { status: string };
  };
  canManage: {
    pricing: boolean;
    catalogue: boolean;
    discounts: boolean;
    tax: boolean;
  };
};

async function fetchPlane(): Promise<ControlPlane> {
  const res = await fetch("/api/v1/platform-admin/commerce/control-plane", {
    cache: "no-store",
  });
  const body = (await res.json()) as {
    data?: ControlPlane;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Control plane failed (${res.status})`);
  }
  return body.data;
}

async function mutatePlane(payload: Record<string, unknown>) {
  const res = await fetch("/api/v1/platform-admin/commerce/control-plane", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as { error?: { message?: string }; data?: unknown };
  if (!res.ok) throw new Error(body.error?.message ?? `Save failed (${res.status})`);
  return body.data;
}

function formatMoney(cents: number | null | undefined, currency: string): string {
  if (cents == null || cents <= 0) return "Unset";
  if (currency === "ZAR") return `R${(cents / 100).toFixed(2)}`;
  if (currency === "USD") return `$${(cents / 100).toFixed(2)}`;
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function useControlPlane() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["platform-admin", "commerce-plane"],
    queryFn: fetchPlane,
  });
  const save = useMutation({
    mutationFn: mutatePlane,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["platform-admin", "commerce-plane"] });
    },
  });
  return { q, save };
}

function ReasonField({
  reason,
  setReason,
}: {
  readonly reason: string;
  readonly setReason: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium">Reason for change</span>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1"
        placeholder="Africa launch pricing"
        data-testid="price-change-reason"
      />
    </label>
  );
}

export function BillingReadinessPanel() {
  const { q } = useControlPlane();
  const r = q.data?.readiness;
  if (!r) return q.isLoading ? <p className="text-xs">Loading…</p> : null;
  const rows = [
    ["Catalogue", r.catalogue.status],
    [
      "South Africa pricing",
      `${r.southAfricaPricing.status} (${r.southAfricaPricing.priced}/${r.southAfricaPricing.sellable})`,
    ],
    ["Global pricing", `${r.globalPricing.status} (${r.globalPricing.priced})`],
    ["Tax configuration", r.tax.status],
    ["PayFast", r.payfast.status],
    ["Self-service registration", r.selfServiceRegistration.status],
  ] as const;
  return (
    <section data-testid="commercial-readiness">
      <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
        Commercial readiness
      </h2>
      <ul className="max-w-md space-y-1 text-xs">
        {rows.map(([label, value]) => (
          <li
            key={label}
            className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1"
          >
            <span>{label}</span>
            <span className="capitalize">{value.replaceAll("_", " ")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BillingCataloguePanel() {
  const { q } = useControlPlane();
  const [qtext, setQtext] = useState("");
  const [suite, setSuite] = useState("all");
  const items = useMemo(() => {
    const rows = q.data?.items ?? [];
    return rows.filter((row) => {
      if (suite !== "all" && row.suiteId !== suite) return false;
      if (
        qtext &&
        !`${row.name} ${row.packageId}`.toLowerCase().includes(qtext.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [q.data, qtext, suite]);
  return (
    <div data-testid="platform-admin-catalogue">
      <div className="mb-3 flex flex-wrap gap-2">
        <input
          value={qtext}
          onChange={(e) => setQtext(e.target.value)}
          placeholder="Search products…"
          className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-xs"
        />
        <select
          value={suite}
          onChange={(e) => setSuite(e.target.value)}
          className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-xs"
        >
          <option value="all">All disciplines</option>
          <option value="productivity">APZPRD</option>
          <option value="qa">APZQEP</option>
          <option value="pentest">APZPEN</option>
        </select>
      </div>
      <table className="w-full min-w-[40rem] border-collapse text-left text-xs">
        <thead className="border-b border-[var(--color-border)] text-[11px] text-[var(--color-muted-foreground)]">
          <tr>
            <th className="px-2 py-1.5">Product</th>
            <th className="px-2 py-1.5">Discipline</th>
            <th className="px-2 py-1.5">Model</th>
            <th className="px-2 py-1.5">Status</th>
            <th className="px-2 py-1.5">Published ZA</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const published = row.item.published.SOUTH_AFRICA;
            return (
              <tr
                key={row.packageId}
                className="border-b border-[var(--color-border)]/60"
              >
                <td className="px-2 py-1.5">
                  <Link
                    href={`${PLATFORM_ADMIN_BASE}/billing/catalogue/${encodeURIComponent(row.packageId)}`}
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                    {row.packageId}
                  </p>
                </td>
                <td className="px-2 py-1.5">{row.suiteId}</td>
                <td className="px-2 py-1.5">{row.pricingUnit.replaceAll("_", " ")}</td>
                <td className="px-2 py-1.5 capitalize">
                  {(row.overlayStatus ?? row.catalogueStatus).replaceAll("_", " ")}
                </td>
                <td className="px-2 py-1.5">
                  {formatMoney(published?.amountCents, published?.currency ?? "ZAR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function BillingCatalogueItemPanel({
  packageId,
}: {
  readonly packageId: string;
}) {
  const { q, save } = useControlPlane();
  const [reason, setReason] = useState("");
  const row = q.data?.items.find((item) => item.packageId === packageId);
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState(row?.pricingUnit ?? "per_user");
  const [status, setStatus] = useState(
    row?.overlayStatus ?? row?.catalogueStatus ?? "available",
  );
  if (!row) return <p className="text-xs">Loading…</p>;
  const draft = row.item.draft.SOUTH_AFRICA;
  const published = row.item.published.SOUTH_AFRICA;
  return (
    <div className="max-w-lg space-y-4 text-xs" data-testid="catalogue-item">
      <Link
        href={`${PLATFORM_ADMIN_BASE}/billing/catalogue`}
        className="text-[var(--color-primary)] hover:underline"
      >
        ← Catalogue
      </Link>
      <h2 className="text-base font-semibold">{row.name}</h2>
      <p className="font-mono text-[11px]">{row.packageId}</p>
      <p className="text-[var(--color-muted-foreground)]">{row.description}</p>
      <label className="flex flex-col gap-1">
        Status
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1"
        >
          <option value="available">Available</option>
          <option value="coming_soon">Coming Soon</option>
          <option value="contact_sales">Contact Sales</option>
          <option value="hidden">Hidden</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Pricing unit
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1"
        >
          {[
            "per_user",
            "per_agent",
            "per_engineer",
            "per_practitioner",
            "per_collaborator",
            "per_organisation",
            "contact_sales",
          ].map((u) => (
            <option key={u} value={u}>
              {u.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <p>
        Draft ZA: {formatMoney(draft?.amountCents ?? null, "ZAR")} · Published ZA:{" "}
        {formatMoney(published?.amountCents ?? null, "ZAR")}
      </p>
      <label className="flex flex-col gap-1">
        Monthly amount (cents)
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min={0}
          className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1"
          data-testid="edit-price-cents"
        />
      </label>
      <ReasonField reason={reason} setReason={setReason} />
      {save.error ? (
        <p className="text-[var(--color-destructive)]">
          {(save.error as Error).message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-[var(--color-primary)] px-3 py-1.5 text-[var(--color-primary-foreground)]"
          disabled={!q.data?.canManage.pricing || save.isPending}
          onClick={() =>
            void save.mutateAsync({
              action: "draft-price",
              packageId,
              regionId: "SOUTH_AFRICA",
              amountCents: amount === "" ? null : Number(amount),
              currency: "ZAR",
              pricingUnit: unit,
              reason,
            })
          }
        >
          Save draft
        </button>
        <button
          type="button"
          className="rounded border border-[var(--color-border)] px-3 py-1.5"
          disabled={!q.data?.canManage.pricing || save.isPending}
          onClick={() =>
            void save.mutateAsync({
              action: "publish-price",
              packageId,
              regionId: "SOUTH_AFRICA",
              reason,
            })
          }
        >
          Publish
        </button>
        <button
          type="button"
          className="rounded border border-[var(--color-border)] px-3 py-1.5"
          disabled={!q.data?.canManage.catalogue || save.isPending}
          onClick={() =>
            void save.mutateAsync({
              action: "availability",
              packageId,
              status,
              reason,
            })
          }
        >
          Save availability
        </button>
      </div>
      <HistoryTable itemId={packageId} rows={q.data?.history ?? []} />
    </div>
  );
}

function HistoryTable({
  itemId,
  rows,
}: {
  readonly itemId?: string;
  readonly rows: ControlPlane["history"];
}) {
  const filtered = itemId ? rows.filter((row) => row.itemId === itemId) : rows;
  return (
    <section data-testid="price-history">
      <h3 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
        History
      </h3>
      {filtered.length === 0 ? (
        <p className="text-[var(--color-muted-foreground)]">No changes recorded.</p>
      ) : (
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="text-[var(--color-muted-foreground)]">
              <th className="py-1">Date</th>
              <th>Change</th>
              <th>By</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map((row) => (
              <tr key={row.id} className="border-t border-[var(--color-border)]/60">
                <td className="py-1">
                  {row.occurredAt.slice(0, 16).replace("T", " ")}
                </td>
                <td>
                  {row.action} {row.regionId ?? ""}
                </td>
                <td>{row.actorUserId}</td>
                <td>{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function BillingPricingPanel({
  regionId = "SOUTH_AFRICA",
}: {
  readonly regionId?: string;
}) {
  const { q, save } = useControlPlane();
  const [reason, setReason] = useState("");
  const [region, setRegion] = useState(regionId);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const regionMeta = q.data?.regions.find((row) => row.regionId === region);
  return (
    <div data-testid={`pricing-${region.toLowerCase()}`}>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {["GLOBAL", "AFRICA", "SOUTH_AFRICA"].map((id) => (
          <button
            key={id}
            type="button"
            className={`rounded px-2 py-1 ${region === id ? "bg-[var(--color-muted)] font-medium" : "opacity-70"}`}
            onClick={() => setRegion(id)}
          >
            {id.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
        {regionMeta?.name} · {regionMeta?.currency} ·{" "}
        {regionMeta?.strategy.replaceAll("_", " ")} · Unset is correct until Owner
        enters launch prices.
      </p>
      <table className="w-full min-w-[40rem] border-collapse text-left text-xs">
        <thead className="border-b border-[var(--color-border)] text-[11px] text-[var(--color-muted-foreground)]">
          <tr>
            <th className="px-2 py-1.5">Product</th>
            <th className="px-2 py-1.5">Unit</th>
            <th className="px-2 py-1.5">Draft</th>
            <th className="px-2 py-1.5">Published</th>
            <th className="px-2 py-1.5">Monthly cents</th>
          </tr>
        </thead>
        <tbody>
          {(q.data?.items ?? [])
            .filter((row) => row.selfServe)
            .map((row) => {
              const draft = row.item.draft[region];
              const published = row.item.published[region];
              return (
                <tr
                  key={row.packageId}
                  className="border-b border-[var(--color-border)]/60"
                >
                  <td className="px-2 py-1.5">{row.name}</td>
                  <td className="px-2 py-1.5">
                    {row.pricingUnit.replaceAll("_", " ")}
                  </td>
                  <td className="px-2 py-1.5">
                    {formatMoney(
                      draft?.amountCents ?? null,
                      draft?.currency ?? regionMeta?.currency ?? "ZAR",
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {formatMoney(
                      published?.amountCents ?? null,
                      published?.currency ?? regionMeta?.currency ?? "ZAR",
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      min={0}
                      className="w-24 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1"
                      value={drafts[row.packageId] ?? ""}
                      onChange={(e) =>
                        setDrafts((cur) => ({
                          ...cur,
                          [row.packageId]: e.target.value,
                        }))
                      }
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <div className="mt-4 max-w-md space-y-2">
        <ReasonField reason={reason} setReason={setReason} />
        {save.error ? (
          <p className="text-xs text-[var(--color-destructive)]">
            {(save.error as Error).message}
          </p>
        ) : null}
        <button
          type="button"
          disabled={!q.data?.canManage.pricing || save.isPending}
          className="rounded bg-[var(--color-primary)] px-3 py-1.5 text-xs text-[var(--color-primary-foreground)]"
          onClick={() => {
            void (async () => {
              for (const [packageId, raw] of Object.entries(drafts)) {
                if (raw.trim() === "") continue;
                await save.mutateAsync({
                  action: "draft-price",
                  packageId,
                  regionId: region,
                  amountCents: Number(raw),
                  currency: regionMeta?.currency ?? "ZAR",
                  reason,
                });
              }
            })();
          }}
        >
          Save drafts
        </button>
      </div>
    </div>
  );
}

export function BillingRegionalPanel() {
  const { q, save } = useControlPlane();
  const [reason, setReason] = useState("");
  const [bps, setBps] = useState("");
  const africa = q.data?.regions.find((row) => row.regionId === "AFRICA");
  return (
    <div className="space-y-4 text-xs" data-testid="regional-pricing">
      <table className="w-full min-w-[32rem] text-left">
        <thead className="text-[11px] text-[var(--color-muted-foreground)]">
          <tr>
            <th className="py-1">Region</th>
            <th>Currency</th>
            <th>Strategy</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {(q.data?.regions ?? []).map((row) => (
            <tr key={row.regionId} className="border-t border-[var(--color-border)]/60">
              <td className="py-1">{row.name}</td>
              <td>{row.currency}</td>
              <td>
                {row.strategy.replaceAll("_", " ")}
                {row.adjustmentBps != null ? ` (${row.adjustmentBps / 100}%)` : ""}
              </td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[var(--color-muted-foreground)]">
        Africa adjustment is a capability, not a universal rule. Leave unset until Owner
        decides.
      </p>
      <label className="flex max-w-xs flex-col gap-1">
        Africa adjustment (bps, negative = discount)
        <input
          value={bps}
          onChange={(e) => setBps(e.target.value)}
          type="number"
          className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1"
          placeholder={
            africa?.adjustmentBps != null ? String(africa.adjustmentBps) : ""
          }
        />
      </label>
      <ReasonField reason={reason} setReason={setReason} />
      <button
        type="button"
        disabled={!q.data?.canManage.pricing || !africa || save.isPending}
        className="rounded bg-[var(--color-primary)] px-3 py-1.5 text-[var(--color-primary-foreground)]"
        onClick={() =>
          void save.mutateAsync({
            action: "upsert-region",
            ...africa,
            adjustmentBps: bps === "" ? null : Number(bps),
            reason,
          })
        }
      >
        Save Africa rule
      </button>
      <BillingPricingPanel regionId="SOUTH_AFRICA" />
    </div>
  );
}

export function BillingPlansPanel() {
  const { q, save } = useControlPlane();
  const [reason, setReason] = useState("");
  return (
    <div className="space-y-4 text-xs" data-testid="billing-plans">
      <table className="w-full min-w-[32rem] text-left">
        <thead className="text-[11px] text-[var(--color-muted-foreground)]">
          <tr>
            <th className="py-1">Plan</th>
            <th>Status</th>
            <th>Monthly</th>
            <th>Trial</th>
          </tr>
        </thead>
        <tbody>
          {(q.data?.plans ?? []).map((plan) => (
            <tr key={plan.planId} className="border-t border-[var(--color-border)]/60">
              <td className="py-1">{plan.name}</td>
              <td>
                {plan.overlayStatus ?? (plan.selfServe ? "active" : "contact sales")}
              </td>
              <td>
                {formatMoney(
                  plan.published?.amountCents ?? plan.amountCents,
                  plan.currency,
                )}
              </td>
              <td>{plan.trialDays} days</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[var(--color-muted-foreground)]">
        Existing Individual R99 / Business R249 remain until published overlay changes
        them.
      </p>
      <ReasonField reason={reason} setReason={setReason} />
      {(q.data?.plans ?? [])
        .filter((plan) => plan.selfServe)
        .map((plan) => (
          <form
            key={plan.planId}
            className="flex flex-wrap items-end gap-2 border border-[var(--color-border)] p-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              void save.mutateAsync({
                action: "upsert-plan",
                planId: plan.planId,
                amountCents: Number(
                  (form.elements.namedItem("amount") as HTMLInputElement).value,
                ),
                trialDays: Number(
                  (form.elements.namedItem("trial") as HTMLInputElement).value,
                ),
                annualDiscountBps: (
                  form.elements.namedItem("annual") as HTMLInputElement
                ).value
                  ? Number(
                      (form.elements.namedItem("annual") as HTMLInputElement).value,
                    )
                  : null,
                reason,
              });
            }}
          >
            <span className="font-medium">{plan.name}</span>
            <input
              name="amount"
              type="number"
              placeholder="cents"
              className="w-24 rounded border px-2 py-1"
            />
            <input
              name="trial"
              type="number"
              placeholder="trial days"
              className="w-24 rounded border px-2 py-1"
            />
            <input
              name="annual"
              type="number"
              placeholder="annual bps"
              className="w-24 rounded border px-2 py-1"
            />
            <button
              type="submit"
              disabled={!q.data?.canManage.pricing}
              className="rounded border px-2 py-1"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={!q.data?.canManage.pricing}
              className="rounded border px-2 py-1"
              onClick={() =>
                void save.mutateAsync({
                  action: "publish-plan",
                  planId: plan.planId,
                  reason,
                })
              }
            >
              Publish
            </button>
          </form>
        ))}
    </div>
  );
}

export function BillingDiscountsPanel() {
  const { q, save } = useControlPlane();
  const [reason, setReason] = useState("");
  return (
    <div className="space-y-4 text-xs" data-testid="billing-discounts">
      <ul className="space-y-1">
        {(q.data?.discounts ?? []).length === 0 ? (
          <li className="text-[var(--color-muted-foreground)]">
            No discounts configured.
          </li>
        ) : (
          (q.data?.discounts ?? []).map((row) => (
            <li key={row.discountId}>
              {row.name} · {row.kind} · {row.status} {row.code ? `· ${row.code}` : ""}
            </li>
          ))
        )}
      </ul>
      <form
        className="flex max-w-lg flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          void save.mutateAsync({
            action: "upsert-discount",
            kind: "promotional",
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            code: (form.elements.namedItem("code") as HTMLInputElement).value,
            adjustmentBps: Number(
              (form.elements.namedItem("bps") as HTMLInputElement).value,
            ),
            status: "draft",
            reason,
          });
        }}
      >
        <input
          name="name"
          placeholder="Name"
          className="rounded border px-2 py-1"
          required
        />
        <input name="code" placeholder="Code" className="rounded border px-2 py-1" />
        <input
          name="bps"
          type="number"
          placeholder="bps (e.g. -1000)"
          className="rounded border px-2 py-1"
        />
        <ReasonField reason={reason} setReason={setReason} />
        <button
          type="submit"
          disabled={!q.data?.canManage.discounts}
          className="rounded border px-2 py-1"
        >
          Save draft promotion
        </button>
      </form>
    </div>
  );
}

export function BillingTaxPanel() {
  const { q, save } = useControlPlane();
  const [reason, setReason] = useState("");
  return (
    <div className="space-y-4 text-xs" data-testid="billing-tax">
      <p className="text-[var(--color-muted-foreground)]">
        Tax is not published until Owner confirms. Draft ZA VAT 15% is optional — not
        seeded as live.
      </p>
      <ul>
        {(q.data?.taxRules ?? []).map((row) => (
          <li key={row.taxRuleId}>
            {row.countryCode} {row.name} {row.rateBps / 100}% · {row.status} ·{" "}
            {row.pricesExclusive ? "exclusive" : "inclusive"}
          </li>
        ))}
      </ul>
      <form
        className="flex max-w-sm flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          void save.mutateAsync({
            action: "upsert-tax",
            countryCode: "ZA",
            name: "VAT",
            rateBps: Number((form.elements.namedItem("bps") as HTMLInputElement).value),
            pricesExclusive: true,
            status: (form.elements.namedItem("status") as HTMLSelectElement).value,
            reason,
          });
        }}
      >
        <input
          name="bps"
          type="number"
          placeholder="1500 = 15%"
          className="rounded border px-2 py-1"
        />
        <select name="status" className="rounded border px-2 py-1">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <ReasonField reason={reason} setReason={setReason} />
        <button
          type="submit"
          disabled={!q.data?.canManage.tax}
          className="rounded border px-2 py-1"
        >
          Save tax rule
        </button>
      </form>
    </div>
  );
}

export function BillingConfigurationPanel() {
  const { q, save } = useControlPlane();
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<string>("");
  return (
    <div className="space-y-4 text-xs" data-testid="billing-configuration">
      <p>
        Subscription reprice policy:{" "}
        <strong>{q.data?.repricePolicy.replaceAll("_", " ")}</strong> (default safest:
        new customers only)
      </p>
      <ReasonField reason={reason} setReason={setReason} />
      <button
        type="button"
        disabled={!q.data?.canManage.pricing}
        className="rounded border px-2 py-1"
        onClick={() =>
          void save.mutateAsync({
            action: "reprice-policy",
            policy: "new_customers_only",
            reason,
          })
        }
      >
        Keep new customers only
      </button>
      <section data-testid="price-preview">
        <h3 className="font-semibold">Preview customer pricing</h3>
        <p className="text-[var(--color-muted-foreground)]">
          Uses the real quote engine.
        </p>
        <form
          className="mt-2 flex max-w-md flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const projects = Number(
              (form.elements.namedItem("projects") as HTMLInputElement).value,
            );
            const qep = Number(
              (form.elements.namedItem("qep") as HTMLInputElement).value,
            );
            const pen = Number(
              (form.elements.namedItem("pen") as HTMLInputElement).value,
            );
            const lines = [
              projects > 0
                ? { packageId: "pkg.apzprd.projects", quantity: projects }
                : null,
              qep > 0 ? { packageId: "pkg.apzqep.starter", quantity: qep } : null,
              pen > 0 ? { packageId: "pkg.apzpen.starter", quantity: pen } : null,
            ].filter(Boolean);
            void save
              .mutateAsync({
                action: "preview-quote",
                countryCode: "ZA",
                lines,
              })
              .then((data) => setPreview(JSON.stringify(data, null, 2)));
          }}
        >
          <input
            name="projects"
            type="number"
            min={0}
            defaultValue={0}
            placeholder="Projects seats"
            className="rounded border px-2 py-1"
          />
          <input
            name="qep"
            type="number"
            min={0}
            defaultValue={0}
            placeholder="APZQEP engineers"
            className="rounded border px-2 py-1"
          />
          <input
            name="pen"
            type="number"
            min={0}
            defaultValue={0}
            placeholder="APZPEN practitioners"
            className="rounded border px-2 py-1"
          />
          <button type="submit" className="rounded border px-2 py-1">
            Preview
          </button>
        </form>
        {preview ? (
          <pre className="mt-2 overflow-auto border p-2 text-[10px]">{preview}</pre>
        ) : null}
      </section>
    </div>
  );
}
