"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CreditCard,
  KeyRound,
  Lock,
  Package,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { OperatorGate } from "@/components/operator/operator-gate";
import {
  ConsoleBanner,
  ConsoleBtn,
  ConsoleCanvas,
  ConsoleChip,
  ConsoleEmpty,
  ConsoleField,
  ConsoleInput,
  ConsoleInspector,
  ConsoleListButton,
  ConsoleListHeader,
  ConsolePostureZone,
  ConsoleSection,
  ConsoleSplit,
  ConsoleStatusPill,
} from "@/components/operator/console-pane";
import type { SuiteId } from "@/lib/commercial/catalogue";

type ConsoleCustomer = {
  customerId: string;
  organisationId: string;
  name: string;
  status: string;
  suiteIds: readonly SuiteId[];
};

type ConsolePayload = {
  customers: readonly ConsoleCustomer[];
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

async function fetchConsole(): Promise<ConsolePayload> {
  const res = await fetch("/api/v1/console/platform");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load console");
  return body.data as ConsolePayload;
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

function useConsoleData() {
  return useQuery({ queryKey: ["console", "platform"], queryFn: fetchConsole });
}

function ConsoleFrame({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <OperatorGate shell="console">
      <ConsoleCanvas title={title} subtitle={subtitle} actions={actions}>
        {children}
      </ConsoleCanvas>
    </OperatorGate>
  );
}

function RefreshAction({
  onClick,
  pending,
}: {
  onClick: () => void;
  pending?: boolean;
}) {
  return (
    <ConsoleBtn variant="ghost" disabled={pending} onClick={onClick}>
      <span className="inline-flex items-center gap-1.5">
        <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
        Refresh
      </span>
    </ConsoleBtn>
  );
}

function LoadingState() {
  return (
    <div className="flex h-40 items-center justify-center text-xs text-[var(--color-muted-foreground)]">
      Loading platform console…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-4">
      <ConsoleBanner tone="warn">{message}</ConsoleBanner>
    </div>
  );
}

export function ConsoleOverviewPage() {
  const q = useConsoleData();
  const secretsOk =
    q.data?.secrets.filter((s) => s.status === "configured").length ?? 0;
  const secretsTotal = q.data?.secrets.length ?? 0;
  const paymentsOn = q.data?.payments.filter((p) => p.enabled).length ?? 0;
  const activeKeys =
    q.data?.apiCredentials.filter((c) => c.status === "active").length ?? 0;

  return (
    <ConsoleFrame
      title="Platform Console"
      subtitle="Superadmin — tenancy, commercial posture, credentials."
      actions={
        <RefreshAction pending={q.isFetching} onClick={() => void q.refetch()} />
      }
    >
      {q.isLoading ? <LoadingState /> : null}
      {q.error ? <ErrorState message={(q.error as Error).message} /> : null}
      {q.data ? (
        <>
          <ConsoleSection
            title="Platform posture"
            description="Signals that matter before you change production configuration."
          >
            <div className="grid gap-px overflow-hidden border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
              <ConsolePostureZone
                icon={Building2}
                label="Customers"
                value={String(q.data.customers.length)}
                detail={
                  q.data.customers.length === 0
                    ? "No organisations onboarded yet. Start with Customers."
                    : `${q.data.customers.length} organisation(s) with suite entitlements.`
                }
                href="/console/customers"
                tone={q.data.customers.length ? "ok" : "warn"}
              />
              <ConsolePostureZone
                icon={Package}
                label="Suites"
                value={String(q.data.suites.length)}
                detail="QA, PenTest, and Productivity commercial categories."
                href="/console/catalogue"
                tone="info"
              />
              <ConsolePostureZone
                icon={KeyRound}
                label="API credentials"
                value={String(activeKeys)}
                detail={
                  activeKeys
                    ? `${activeKeys} active key(s). Rotate when exposure is suspected.`
                    : "No active platform API credentials."
                }
                href="/console/api-keys"
                tone={activeKeys ? "ok" : "neutral"}
              />
              <ConsolePostureZone
                icon={Lock}
                label="Secrets"
                value={`${secretsOk}/${secretsTotal}`}
                detail={
                  secretsOk === secretsTotal && secretsTotal > 0
                    ? "All registered secret refs report configured."
                    : "One or more secret refs are missing or incomplete."
                }
                href="/console/secrets"
                tone={
                  secretsTotal === 0
                    ? "neutral"
                    : secretsOk === secretsTotal
                      ? "ok"
                      : "warn"
                }
              />
            </div>
          </ConsoleSection>

          <div className="grid min-h-[280px] lg:grid-cols-[1fr_320px]">
            <ConsoleSection
              title="Commercial & payments"
              description="Payment rails and catalogue readiness."
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ConsoleStatusPill tone={paymentsOn ? "ok" : "warn"}>
                    {paymentsOn} provider(s) enabled
                  </ConsoleStatusPill>
                  <Link
                    href="/console/payments"
                    className="inline-flex h-8 items-center rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-xs font-medium hover:bg-[var(--color-muted)]/60"
                  >
                    Payment providers
                  </Link>
                  <Link
                    href="/console/catalogue"
                    className="inline-flex h-8 items-center rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-xs font-medium hover:bg-[var(--color-muted)]/60"
                  >
                    Suites & pricing
                  </Link>
                </div>
                <p className="text-[12px] text-[var(--color-muted-foreground)]">
                  Merchant identifiers are refs only — plaintext secrets never appear in
                  this console. Limits and audit live in their own panes.
                </p>
              </div>
            </ConsoleSection>

            <ConsoleSection title="Recent customers">
              {q.data.customers.length === 0 ? (
                <ConsoleEmpty>
                  No customers yet.{" "}
                  <Link
                    className="text-[var(--color-primary)] underline-offset-2 hover:underline"
                    href="/console/customers"
                  >
                    Onboard an organisation
                  </Link>
                  .
                </ConsoleEmpty>
              ) : (
                <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
                  {q.data.customers.slice(0, 5).map((c) => (
                    <li key={c.customerId}>
                      <Link
                        href="/console/customers"
                        className="flex items-center justify-between gap-2 px-3 py-2 text-[13px] hover:bg-[var(--color-muted)]/50"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="flex gap-1">
                          {c.suiteIds.map((s) => (
                            <ConsoleChip key={s}>{s}</ConsoleChip>
                          ))}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </ConsoleSection>
          </div>

          <ConsoleSection title="Governance">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/console/limits"
                className="inline-flex h-8 items-center rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-xs font-medium hover:bg-[var(--color-muted)]/60"
              >
                Platform limits
              </Link>
              <Link
                href="/console/audit"
                className="inline-flex h-8 items-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-xs font-medium hover:bg-[var(--color-muted)]/60"
              >
                <ScrollText className="h-3.5 w-3.5" />
                Audit trail
              </Link>
              <Link
                href="/console/secrets"
                className="inline-flex h-8 items-center rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-xs font-medium hover:bg-[var(--color-muted)]/60"
              >
                Secret refs
              </Link>
            </div>
          </ConsoleSection>
        </>
      ) : null}
    </ConsoleFrame>
  );
}

export function ConsoleCustomersPage() {
  const qc = useQueryClient();
  const q = useConsoleData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [suites, setSuites] = useState<SuiteId[]>(["qa"]);

  const customers = q.data?.customers ?? [];
  const selected = useMemo(
    () => customers.find((c) => c.customerId === selectedId) ?? null,
    [customers, selectedId],
  );

  useEffect(() => {
    if (!selectedId && customers[0] && !creating) {
      setSelectedId(customers[0].customerId);
    }
  }, [customers, selectedId, creating]);

  const upsert = useMutation({
    mutationFn: () =>
      postConsole("customer.upsert", {
        organisationId: orgId,
        name,
        suiteIds: suites,
      }),
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: ["console", "platform"] });
      setName("");
      setOrgId("");
      setCreating(false);
      const id = (data as { customerId?: string } | undefined)?.customerId;
      if (id) setSelectedId(id);
    },
  });

  const remove = useMutation({
    mutationFn: (customerId: string) => postConsole("customer.remove", { customerId }),
    onSuccess: async () => {
      setSelectedId(null);
      await qc.invalidateQueries({ queryKey: ["console", "platform"] });
    },
  });

  return (
    <ConsoleFrame
      title="Customers"
      subtitle="Organisations and suite entitlements."
      actions={
        <>
          <RefreshAction pending={q.isFetching} onClick={() => void q.refetch()} />
          <ConsoleBtn
            variant="primary"
            onClick={() => {
              setCreating(true);
              setSelectedId(null);
            }}
          >
            Add customer
          </ConsoleBtn>
        </>
      }
    >
      {q.isLoading ? <LoadingState /> : null}
      {q.error ? <ErrorState message={(q.error as Error).message} /> : null}
      {q.data ? (
        <ConsoleSplit
          list={
            <div className="flex h-full flex-col">
              <ConsoleListHeader title="Organisations" count={customers.length} />
              <div className="min-h-0 flex-1 overflow-auto">
                {customers.length === 0 ? (
                  <p className="px-3 py-6 text-center text-[11px] text-[var(--color-muted-foreground)]">
                    No customers yet.
                  </p>
                ) : (
                  customers.map((c) => (
                    <ConsoleListButton
                      key={c.customerId}
                      active={!creating && selectedId === c.customerId}
                      title={c.name}
                      meta={`${c.organisationId} · ${c.suiteIds.join(", ") || "no suites"}`}
                      onClick={() => {
                        setCreating(false);
                        setSelectedId(c.customerId);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          }
          detail={
            creating ? (
              <ConsoleInspector
                title="New customer"
                subtitle="Creates organisation entitlement and suite grants."
                actions={
                  <ConsoleBtn variant="ghost" onClick={() => setCreating(false)}>
                    Cancel
                  </ConsoleBtn>
                }
              >
                <div className="max-w-md space-y-3">
                  <label className="block space-y-1">
                    <span className="text-[11px] text-[var(--color-muted-foreground)] uppercase">
                      Organisation id
                    </span>
                    <ConsoleInput
                      mono
                      value={orgId}
                      onChange={setOrgId}
                      placeholder="org_…"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] text-[var(--color-muted-foreground)] uppercase">
                      Display name
                    </span>
                    <ConsoleInput
                      value={name}
                      onChange={setName}
                      placeholder="Organisation name"
                    />
                  </label>
                  <fieldset className="space-y-2">
                    <legend className="text-[11px] text-[var(--color-muted-foreground)] uppercase">
                      Suites
                    </legend>
                    <div className="flex flex-wrap gap-3">
                      {(["qa", "pentest", "productivity"] as const).map((s) => (
                        <label key={s} className="flex items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={suites.includes(s)}
                            onChange={(e) =>
                              setSuites((prev) =>
                                e.target.checked
                                  ? [...prev, s]
                                  : prev.filter((x) => x !== s),
                              )
                            }
                          />
                          {s}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {upsert.error ? (
                    <ConsoleBanner tone="warn">
                      {(upsert.error as Error).message}
                    </ConsoleBanner>
                  ) : null}
                  <ConsoleBtn
                    variant="primary"
                    disabled={!orgId || !name || upsert.isPending}
                    onClick={() => upsert.mutate()}
                  >
                    Save customer
                  </ConsoleBtn>
                </div>
              </ConsoleInspector>
            ) : selected ? (
              <ConsoleInspector
                title={selected.name}
                subtitle={selected.organisationId}
                actions={
                  <ConsoleBtn
                    variant="danger"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(selected.customerId)}
                  >
                    Remove
                  </ConsoleBtn>
                }
              >
                <dl className="space-y-3">
                  <ConsoleField label="Status">
                    <ConsoleStatusPill
                      tone={selected.status === "active" ? "ok" : "warn"}
                    >
                      {selected.status}
                    </ConsoleStatusPill>
                  </ConsoleField>
                  <ConsoleField label="Customer id">
                    <span className="font-mono text-[12px]">{selected.customerId}</span>
                  </ConsoleField>
                  <ConsoleField label="Suites">
                    <span className="flex flex-wrap gap-1">
                      {selected.suiteIds.length === 0 ? (
                        <span className="text-[var(--color-muted-foreground)]">
                          None
                        </span>
                      ) : (
                        selected.suiteIds.map((s) => (
                          <ConsoleChip key={s}>{s}</ConsoleChip>
                        ))
                      )}
                    </span>
                  </ConsoleField>
                </dl>
                <ConsoleBanner>
                  Suite grants drive workbench product access after provisioning. Adjust
                  catalogue entitlements from Suites & pricing when needed.
                </ConsoleBanner>
              </ConsoleInspector>
            ) : (
              <ConsoleInspector empty="Select a customer or add a new organisation." />
            )
          }
        />
      ) : null}
    </ConsoleFrame>
  );
}

export function ConsoleCataloguePage() {
  const qc = useQueryClient();
  const q = useConsoleData();
  const [selectedSuite, setSelectedSuite] = useState<SuiteId | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const suites = q.data?.suites ?? [];
  const active = suites.find((s) => s.suiteId === selectedSuite) ?? suites[0] ?? null;

  useEffect(() => {
    if (!selectedSuite && suites[0]) setSelectedSuite(suites[0].suiteId);
  }, [suites, selectedSuite]);

  return (
    <ConsoleFrame
      title="Suites & pricing"
      subtitle="Commercial categories and plan catalogue."
      actions={
        <>
          <RefreshAction pending={q.isFetching} onClick={() => void q.refetch()} />
          <ConsoleBtn
            variant="secondary"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setMsg(null);
              void postConsole("apzor.ensure_suites", {})
                .then(async () => {
                  setMsg("APZOR suites ensured (all free).");
                  await qc.invalidateQueries({
                    queryKey: ["console", "platform"],
                  });
                })
                .catch((e: Error) => setMsg(e.message))
                .finally(() => setBusy(false));
            }}
          >
            Ensure APZOR free suites
          </ConsoleBtn>
        </>
      }
    >
      {q.isLoading ? <LoadingState /> : null}
      {q.error ? <ErrorState message={(q.error as Error).message} /> : null}
      {msg ? (
        <div className="border-b border-[var(--color-border)] px-4 py-2">
          <ConsoleBanner tone={msg.includes("ensured") ? "ok" : "warn"}>
            {msg}
          </ConsoleBanner>
        </div>
      ) : null}
      {q.data ? (
        <ConsoleSplit
          listWidthClass="w-[min(100%,240px)]"
          list={
            <div className="flex h-full flex-col">
              <ConsoleListHeader title="Suites" count={suites.length} />
              {suites.map((s) => (
                <ConsoleListButton
                  key={s.suiteId}
                  active={active?.suiteId === s.suiteId}
                  title={s.name}
                  meta={`${s.suiteId} · ${s.status}`}
                  onClick={() => setSelectedSuite(s.suiteId)}
                />
              ))}
            </div>
          }
          detail={
            active ? (
              <ConsoleInspector
                title={active.name}
                subtitle={active.suiteId}
                actions={
                  <ConsoleStatusPill
                    tone={active.status === "active" ? "ok" : "neutral"}
                  >
                    {active.status}
                  </ConsoleStatusPill>
                }
              >
                <ConsoleField label="Products">
                  <span className="flex flex-wrap gap-1">
                    {active.productKeys.map((k) => (
                      <ConsoleChip key={k}>{k}</ConsoleChip>
                    ))}
                  </span>
                </ConsoleField>
                <div className="space-y-2 pt-2">
                  <h3 className="text-[11px] font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase">
                    Plans
                  </h3>
                  {q.data.catalogue.plans.length === 0 ? (
                    <ConsoleEmpty>No plans in catalogue.</ConsoleEmpty>
                  ) : (
                    <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
                      {q.data.catalogue.plans.map((p) => (
                        <li
                          key={p.planId}
                          className="flex items-center justify-between gap-3 px-3 py-2 text-[13px]"
                        >
                          <span>{p.name}</span>
                          <span className="font-mono text-[11px] tabular-nums text-[var(--color-muted-foreground)]">
                            {(p.amountCents / 100).toLocaleString(undefined, {
                              style: "currency",
                              currency: "ZAR",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </ConsoleInspector>
            ) : (
              <ConsoleInspector empty="No suites registered." />
            )
          }
        />
      ) : null}
    </ConsoleFrame>
  );
}

export function ConsoleLimitsPage() {
  const qc = useQueryClient();
  const q = useConsoleData();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q.data) return;
    const next: Record<string, string> = {};
    for (const l of q.data.limits) next[l.limitId] = String(l.value);
    setDrafts(next);
  }, [q.data]);

  return (
    <ConsoleFrame
      title="Limits"
      subtitle="Platform capacity and rate ceilings."
      actions={
        <RefreshAction pending={q.isFetching} onClick={() => void q.refetch()} />
      }
    >
      {q.isLoading ? <LoadingState /> : null}
      {q.error ? <ErrorState message={(q.error as Error).message} /> : null}
      {error ? (
        <div className="border-b border-[var(--color-border)] px-4 py-2">
          <ConsoleBanner tone="warn">{error}</ConsoleBanner>
        </div>
      ) : null}
      {q.data ? (
        <ConsoleSection
          title="Capacity"
          description="Edit values inline — no browser prompts."
        >
          {q.data.limits.length === 0 ? (
            <ConsoleEmpty>No limits configured.</ConsoleEmpty>
          ) : (
            <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
              {q.data.limits.map((l) => (
                <li
                  key={l.limitId}
                  className="flex flex-wrap items-center gap-3 px-3 py-3"
                >
                  <div className="min-w-[160px] flex-1">
                    <p className="text-[13px] font-medium">{l.label}</p>
                    <p className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                      {l.key}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ConsoleInput
                      mono
                      value={drafts[l.limitId] ?? String(l.value)}
                      onChange={(v) =>
                        setDrafts((prev) => ({ ...prev, [l.limitId]: v }))
                      }
                    />
                    <span className="w-12 text-[11px] text-[var(--color-muted-foreground)]">
                      {l.unit}
                    </span>
                    <ConsoleBtn
                      variant="secondary"
                      disabled={savingId === l.limitId}
                      onClick={() => {
                        const next = Number(drafts[l.limitId]);
                        if (!Number.isFinite(next)) {
                          setError("Value must be a number.");
                          return;
                        }
                        setError(null);
                        setSavingId(l.limitId);
                        void postConsole("limit.update", {
                          limitId: l.limitId,
                          value: next,
                        })
                          .then(() =>
                            qc.invalidateQueries({
                              queryKey: ["console", "platform"],
                            }),
                          )
                          .catch((e: Error) => setError(e.message))
                          .finally(() => setSavingId(null));
                      }}
                    >
                      Save
                    </ConsoleBtn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ConsoleSection>
      ) : null}
    </ConsoleFrame>
  );
}

export function ConsolePaymentsPage() {
  const qc = useQueryClient();
  const q = useConsoleData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const payments = q.data?.payments ?? [];
  const selected =
    payments.find((p) => p.providerId === selectedId) ?? payments[0] ?? null;

  useEffect(() => {
    if (!selectedId && payments[0]) setSelectedId(payments[0].providerId);
  }, [payments, selectedId]);

  return (
    <ConsoleFrame
      title="Payment providers"
      subtitle="Merchant refs only — raw secrets never shown."
      actions={
        <RefreshAction pending={q.isFetching} onClick={() => void q.refetch()} />
      }
    >
      {q.isLoading ? <LoadingState /> : null}
      {q.error ? <ErrorState message={(q.error as Error).message} /> : null}
      {q.data ? (
        <ConsoleSplit
          listWidthClass="w-[min(100%,240px)]"
          list={
            <div className="flex h-full flex-col">
              <ConsoleListHeader title="Providers" count={payments.length} />
              {payments.map((p) => (
                <ConsoleListButton
                  key={p.providerId}
                  active={selected?.providerId === p.providerId}
                  title={p.name}
                  meta={p.enabled ? "enabled" : "disabled"}
                  onClick={() => setSelectedId(p.providerId)}
                />
              ))}
            </div>
          }
          detail={
            selected ? (
              <ConsoleInspector
                title={selected.name}
                subtitle={selected.providerId}
                actions={
                  <ConsoleBtn
                    variant={selected.enabled ? "danger" : "primary"}
                    disabled={busy}
                    onClick={() => {
                      setBusy(true);
                      void postConsole("payment.update", {
                        providerId: selected.providerId,
                        enabled: !selected.enabled,
                      })
                        .then(() =>
                          qc.invalidateQueries({
                            queryKey: ["console", "platform"],
                          }),
                        )
                        .finally(() => setBusy(false));
                    }}
                  >
                    {selected.enabled ? "Disable" : "Enable"}
                  </ConsoleBtn>
                }
              >
                <dl className="space-y-3">
                  <ConsoleField label="Status">
                    <ConsoleStatusPill tone={selected.enabled ? "ok" : "neutral"}>
                      {selected.enabled ? "enabled" : "disabled"}
                    </ConsoleStatusPill>
                  </ConsoleField>
                  <ConsoleField label="Merchant ref">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[12px]">
                      <CreditCard className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
                      {selected.merchantIdRef}
                    </span>
                  </ConsoleField>
                  <ConsoleField label="Webhook">
                    <span className="break-all font-mono text-[11px]">
                      {selected.webhookUrl || "—"}
                    </span>
                  </ConsoleField>
                </dl>
                <ConsoleBanner>
                  Toggle enables routing for new payments. Credential values stay in the
                  secret store behind the merchant ref.
                </ConsoleBanner>
              </ConsoleInspector>
            ) : (
              <ConsoleInspector empty="No payment providers configured." />
            )
          }
        />
      ) : null}
    </ConsoleFrame>
  );
}

export function ConsoleApiKeysPage() {
  const qc = useQueryClient();
  const q = useConsoleData();
  const [once, setOnce] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const keys = q.data?.apiCredentials ?? [];
  const selected = keys.find((c) => c.credentialId === selectedId) ?? keys[0] ?? null;

  useEffect(() => {
    if (!selectedId && keys[0]) setSelectedId(keys[0].credentialId);
  }, [keys, selectedId]);

  return (
    <ConsoleFrame
      title="API credentials"
      subtitle="Create, inspect, revoke. Plaintext shown once."
      actions={
        <>
          <RefreshAction pending={q.isFetching} onClick={() => void q.refetch()} />
          <ConsoleBtn
            variant="primary"
            disabled={creating}
            onClick={() => {
              setCreating(true);
              void postConsole("api_key.create", {
                name: `key-${Date.now()}`,
              })
                .then(async (data) => {
                  setOnce((data as { plaintextOnce?: string }).plaintextOnce ?? null);
                  await qc.invalidateQueries({
                    queryKey: ["console", "platform"],
                  });
                })
                .finally(() => setCreating(false));
            }}
          >
            Create key
          </ConsoleBtn>
        </>
      }
    >
      {once ? (
        <div className="border-b border-[var(--color-border)] px-4 py-2">
          <ConsoleBanner tone="warn">
            <p className="font-medium">Copy now — will not be shown again</p>
            <p className="mt-1 break-all font-mono text-[12px]">{once}</p>
            <div className="mt-2">
              <ConsoleBtn variant="ghost" onClick={() => setOnce(null)}>
                Dismiss
              </ConsoleBtn>
            </div>
          </ConsoleBanner>
        </div>
      ) : null}
      {q.isLoading ? <LoadingState /> : null}
      {q.error ? <ErrorState message={(q.error as Error).message} /> : null}
      {q.data ? (
        <ConsoleSplit
          list={
            <div className="flex h-full flex-col">
              <ConsoleListHeader title="Credentials" count={keys.length} />
              {keys.length === 0 ? (
                <p className="px-3 py-6 text-center text-[11px] text-[var(--color-muted-foreground)]">
                  No credentials yet.
                </p>
              ) : (
                keys.map((c) => (
                  <ConsoleListButton
                    key={c.credentialId}
                    active={selected?.credentialId === c.credentialId}
                    title={c.name}
                    meta={`${c.prefix}… · ${c.status}`}
                    onClick={() => setSelectedId(c.credentialId)}
                  />
                ))
              )}
            </div>
          }
          detail={
            selected ? (
              <ConsoleInspector
                title={selected.name}
                subtitle={selected.credentialId}
                actions={
                  selected.status === "active" ? (
                    <ConsoleBtn
                      variant="danger"
                      onClick={() =>
                        void postConsole("api_key.revoke", {
                          credentialId: selected.credentialId,
                        }).then(() =>
                          qc.invalidateQueries({
                            queryKey: ["console", "platform"],
                          }),
                        )
                      }
                    >
                      Revoke
                    </ConsoleBtn>
                  ) : null
                }
              >
                <dl className="space-y-3">
                  <ConsoleField label="Prefix">
                    <span className="font-mono text-[12px]">{selected.prefix}…</span>
                  </ConsoleField>
                  <ConsoleField label="Status">
                    <ConsoleStatusPill
                      tone={selected.status === "active" ? "ok" : "neutral"}
                    >
                      {selected.status}
                    </ConsoleStatusPill>
                  </ConsoleField>
                </dl>
              </ConsoleInspector>
            ) : (
              <ConsoleInspector empty="Create a credential to get started." />
            )
          }
        />
      ) : null}
    </ConsoleFrame>
  );
}

export function ConsoleSecretsPage() {
  const q = useConsoleData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const secrets = q.data?.secrets ?? [];
  const selected = secrets.find((s) => s.secretId === selectedId) ?? secrets[0] ?? null;

  useEffect(() => {
    if (!selectedId && secrets[0]) setSelectedId(secrets[0].secretId);
  }, [secrets, selectedId]);

  const configured = secrets.filter((s) => s.status === "configured").length;

  return (
    <ConsoleFrame
      title="Secrets"
      subtitle="Status and refs only — values never leave the vault."
      actions={
        <RefreshAction pending={q.isFetching} onClick={() => void q.refetch()} />
      }
    >
      {q.isLoading ? <LoadingState /> : null}
      {q.error ? <ErrorState message={(q.error as Error).message} /> : null}
      {q.data ? (
        <>
          <div className="border-b border-[var(--color-border)] px-4 py-2">
            <ConsoleStatusPill
              tone={
                secrets.length === 0
                  ? "neutral"
                  : configured === secrets.length
                    ? "ok"
                    : "warn"
              }
            >
              {configured}/{secrets.length} configured
            </ConsoleStatusPill>
          </div>
          <ConsoleSplit
            list={
              <div className="flex h-full flex-col">
                <ConsoleListHeader title="Refs" count={secrets.length} />
                {secrets.map((s) => (
                  <ConsoleListButton
                    key={s.secretId}
                    active={selected?.secretId === s.secretId}
                    title={s.name}
                    meta={s.status}
                    onClick={() => setSelectedId(s.secretId)}
                  />
                ))}
              </div>
            }
            detail={
              selected ? (
                <ConsoleInspector title={selected.name} subtitle={selected.ref}>
                  <dl className="space-y-3">
                    <ConsoleField label="Status">
                      <ConsoleStatusPill
                        tone={selected.status === "configured" ? "ok" : "warn"}
                      >
                        {selected.status}
                      </ConsoleStatusPill>
                    </ConsoleField>
                    <ConsoleField label="Ref">
                      <span className="font-mono text-[12px]">{selected.ref}</span>
                    </ConsoleField>
                  </dl>
                  <ConsoleBanner>
                    Secret values are never rendered in Superadmin UI. Configure via
                    server environment / vault tooling.
                  </ConsoleBanner>
                </ConsoleInspector>
              ) : (
                <ConsoleInspector empty="No secret refs registered." />
              )
            }
          />
        </>
      ) : null}
    </ConsoleFrame>
  );
}

export function ConsoleAuditPage() {
  return (
    <ConsoleFrame title="Audit" subtitle="Platform-critical change trail.">
      <ConsoleSection
        title="Console mutations"
        description="Every Superadmin write goes through the platform API with a correlation id."
      >
        <div className="max-w-xl space-y-3">
          <ConsoleBanner>
            Immutable cross-cutting audit remains on the Administration → Audit stream.
            Use that workbench for deep forensic search; this pane is the Superadmin
            entry point.
          </ConsoleBanner>
          <Link
            href="/workspace/administration/audit"
            className="inline-flex h-8 items-center rounded bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
          >
            Open platform audit
          </Link>
        </div>
      </ConsoleSection>
    </ConsoleFrame>
  );
}
