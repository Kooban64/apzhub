"use client";

import Link from "next/link";
import { useSession } from "@apzhub/auth";
import { useQuery } from "@tanstack/react-query";

import { fetchMyWorkComposition } from "@/lib/my-work/my-work-api";
import { myWorkQueryKeys } from "@/lib/my-work/query-keys";
import type { DemoPersonaKind } from "@/lib/demo/demo-personas";

type DashLink = { href: string; label: string; hint: string };

const DASHBOARDS: Record<
  DemoPersonaKind,
  {
    title: string;
    subtitle: string;
    metrics: readonly { label: string; value: string }[];
    links: readonly DashLink[];
  }
> = {
  superadmin: {
    title: "Super Admin",
    subtitle: "Platform-critical controls across every surface.",
    metrics: [
      { label: "Health", value: "OK" },
      { label: "Tenants", value: "—" },
      { label: "Jobs", value: "—" },
      { label: "Alerts", value: "0" },
    ],
    links: [
      { href: "/console", label: "Platform Console", hint: "Superadmin" },
      { href: "/console/customers", label: "Customers", hint: "Orgs" },
      { href: "/console/catalogue", label: "Suites & pricing", hint: "Commercial" },
      { href: "/ops", label: "Platform Ops", hint: "Day-2" },
    ],
  },
  platform_admin: {
    title: "Platform Admin",
    subtitle: "Operational authority — keep the platform running.",
    metrics: [
      { label: "Incidents", value: "0" },
      { label: "Queues", value: "—" },
      { label: "Connectors", value: "—" },
      { label: "Members", value: "—" },
    ],
    links: [
      { href: "/platform-admin", label: "Platform Admin", hint: "Control plane" },
      { href: "/platform-admin/operations", label: "Operations", hint: "Health" },
      { href: "/ops", label: "Legacy Ops", hint: "Day-2" },
      { href: "/workspace/observability", label: "Observability", hint: "Deep" },
    ],
  },
  finance: {
    title: "Finance",
    subtitle: "Subscriptions, invoices, credits, and dunning.",
    metrics: [
      { label: "Open invoices", value: "—" },
      { label: "Dunning", value: "—" },
      { label: "Credits", value: "—" },
      { label: "MRR", value: "—" },
    ],
    links: [
      { href: "/finance", label: "Finance console", hint: "Ledger" },
      { href: "/finance/dunning", label: "Dunning", hint: "Advance" },
      { href: "/pricing", label: "Public catalogue", hint: "Plans" },
    ],
  },
  support: {
    title: "Support",
    subtitle: "Customer care queues and request handling.",
    metrics: [
      { label: "Open", value: "—" },
      { label: "SLA risk", value: "—" },
      { label: "Unassigned", value: "—" },
      { label: "Resolved 24h", value: "—" },
    ],
    links: [
      { href: "/ops", label: "Platform Ops", hint: "Ops" },
      { href: "/workspace/support", label: "Support workspace", hint: "Tickets" },
      { href: "/workspace/notifications/inbox", label: "Inbox", hint: "Attention" },
    ],
  },
  tenant_support: {
    title: "Support work",
    subtitle: "Your Customer Support queue, time, and knowledge — nothing else.",
    metrics: [
      { label: "Open", value: "—" },
      { label: "Attention", value: "—" },
      { label: "Due today", value: "—" },
      { label: "Waiting", value: "—" },
    ],
    links: [
      { href: "/workspace/support", label: "Support queue", hint: "Tickets" },
      { href: "/workspace/time", label: "Time", hint: "Record" },
      { href: "/workspace/knowledge", label: "Knowledge", hint: "Contribute" },
      {
        href: "/workspace/notifications/inbox",
        label: "Notifications",
        hint: "Inbox",
      },
    ],
  },
  tenant_developer: {
    title: "Engineering work",
    subtitle: "Projects, quality, and security assurance — not Support queues.",
    metrics: [
      { label: "Attention", value: "—" },
      { label: "Due today", value: "—" },
      { label: "Waiting", value: "—" },
      { label: "Done", value: "—" },
    ],
    links: [
      { href: "/workspace/projects", label: "Projects", hint: "Delivery" },
      { href: "/workspace/qep", label: "Quality", hint: "QEP" },
      { href: "/apzpen", label: "Security assurance", hint: "PEN" },
      { href: "/workspace/time", label: "Time", hint: "Record" },
    ],
  },
  tenant_finance: {
    title: "Finance work",
    subtitle:
      "Time, workflow, analytics, and documents — no engineering or support queues.",
    metrics: [
      { label: "Attention", value: "—" },
      { label: "Due today", value: "—" },
      { label: "Waiting", value: "—" },
      { label: "Done", value: "—" },
    ],
    links: [
      { href: "/workspace/time", label: "Time", hint: "Record" },
      { href: "/workspace/workflows", label: "Workflow", hint: "Operate" },
      { href: "/workspace/analytics", label: "Analytics", hint: "KPIs" },
      { href: "/workspace/documents", label: "Documents", hint: "Records" },
    ],
  },
  tenant_compliance: {
    title: "Compliance work",
    subtitle:
      "Document audit, retention posture, analytics, and policy knowledge — not Support or QEP queues.",
    metrics: [
      { label: "Audits", value: "—" },
      { label: "Retention", value: "—" },
      { label: "Policies", value: "—" },
      { label: "Findings", value: "—" },
    ],
    links: [
      { href: "/workspace/documents", label: "Documents", hint: "Audit" },
      { href: "/workspace/analytics", label: "Analytics", hint: "Posture" },
      { href: "/workspace/knowledge", label: "Knowledge", hint: "Policies" },
    ],
  },
  tenant_executive: {
    title: "Executive work",
    subtitle: "Analytics, documents, and knowledge overview — no operational queues.",
    metrics: [
      { label: "KPIs", value: "—" },
      { label: "Attention", value: "—" },
      { label: "Risk", value: "—" },
      { label: "Done", value: "—" },
    ],
    links: [
      { href: "/workspace/analytics", label: "Analytics", hint: "KPIs" },
      { href: "/workspace/documents", label: "Documents", hint: "Review" },
      { href: "/workspace/knowledge", label: "Knowledge", hint: "Browse" },
    ],
  },
  tenant_qa: {
    title: "QA work",
    subtitle: "Quality plans, projects, and time — not Support queues or PEN tools.",
    metrics: [
      { label: "Attention", value: "—" },
      { label: "Due today", value: "—" },
      { label: "Waiting", value: "—" },
      { label: "Done", value: "—" },
    ],
    links: [
      { href: "/workspace/qep", label: "Quality", hint: "QEP" },
      { href: "/workspace/projects", label: "Projects", hint: "Delivery" },
      { href: "/workspace/time", label: "Time", hint: "Record" },
    ],
  },
  tenant_security: {
    title: "Security work",
    subtitle:
      "PEN engagements, evidence documents, and time — not Support or QEP queues.",
    metrics: [
      { label: "Attention", value: "—" },
      { label: "Findings", value: "—" },
      { label: "Waiting", value: "—" },
      { label: "Done", value: "—" },
    ],
    links: [
      { href: "/apzpen", label: "Security assurance", hint: "PEN" },
      { href: "/workspace/documents", label: "Documents", hint: "Evidence" },
      { href: "/workspace/time", label: "Time", hint: "Record" },
    ],
  },
  compliance: {
    title: "Compliance",
    subtitle: "Audit trails, retention, entitlement posture.",
    metrics: [
      { label: "Audits", value: "—" },
      { label: "Retention", value: "—" },
      { label: "Entitlements", value: "—" },
      { label: "Findings", value: "—" },
    ],
    links: [
      { href: "/compliance", label: "Compliance console", hint: "Review" },
      { href: "/compliance/signups", label: "Signup review", hint: "Orgs" },
      { href: "/compliance/entitlements", label: "Entitlements", hint: "Posture" },
    ],
  },
  org_admin: {
    title: "Organisation Admin",
    subtitle: "Members, product grants, and org subscription.",
    metrics: [
      { label: "Members", value: "—" },
      { label: "Products", value: "QEP" },
      { label: "Trial/Plan", value: "—" },
      { label: "Invites", value: "—" },
    ],
    links: [
      { href: "/org", label: "Org console", hint: "Admin" },
      { href: "/org/members", label: "Members & RBAC", hint: "IAM" },
      { href: "/org/services", label: "Service roles", hint: "Provision" },
      { href: "/org/subscriptions", label: "Subscriptions", hint: "Suites" },
    ],
  },
  org_member: {
    title: "My work",
    subtitle: "Your queues across entitled products.",
    metrics: [
      { label: "Attention", value: "—" },
      { label: "Due today", value: "—" },
      { label: "Waiting", value: "—" },
      { label: "Done", value: "—" },
    ],
    links: [
      { href: "/workspace/qep/quality-flows", label: "Quality", hint: "Operate" },
      { href: "/workspace/notifications/inbox", label: "Notifications", hint: "Inbox" },
      { href: "/workspace/personalisation", label: "Preferences", hint: "You" },
    ],
  },
  individual: {
    title: "Individual",
    subtitle: "You control your account, plan, and products.",
    metrics: [
      { label: "Plan", value: "Individual" },
      { label: "Products", value: "QEP" },
      { label: "Billing", value: "Self" },
      { label: "Grants", value: "Owner" },
    ],
    links: [
      { href: "/workspace/billing", label: "My billing", hint: "Subscription" },
      { href: "/workspace/qep/quality-flows", label: "Quality", hint: "QEP" },
      { href: "/pricing", label: "Plans", hint: "Upgrade" },
      { href: "/workspace/personalisation", label: "Preferences", hint: "Self" },
    ],
  },
};

function MetricStrip({
  metrics,
}: {
  readonly metrics: readonly { label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="bg-[var(--color-surface)] px-3 py-2.5">
          <p className="text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
            {m.label}
          </p>
          <p className="mt-1 font-mono text-sm font-medium tabular-nums">{m.value}</p>
        </div>
      ))}
    </div>
  );
}

async function fetchHomeContext(): Promise<{
  kind: DemoPersonaKind;
  name?: string;
  email?: string;
}> {
  const res = await fetch("/api/v1/me/home-context");
  const body = (await res.json()) as {
    data?: { kind?: DemoPersonaKind; name?: string; email?: string };
  };
  if (!res.ok) {
    return { kind: "org_member" };
  }
  return {
    kind: body.data?.kind ?? "org_member",
    name: body.data?.name,
    email: body.data?.email,
  };
}

export function RoleHomeDashboard() {
  const { data: session } = useSession();
  const contextQuery = useQuery({
    queryKey: ["me", "home-context"],
    queryFn: fetchHomeContext,
  });
  const myWork = useQuery({
    queryKey: myWorkQueryKeys.composition(),
    queryFn: ({ signal }) => fetchMyWorkComposition({ signal }),
  });

  const kind = contextQuery.data?.kind ?? "org_member";
  const dash = DASHBOARDS[kind];
  const name =
    contextQuery.data?.name?.trim() ||
    session?.user?.name?.trim() ||
    session?.user?.email?.trim() ||
    myWork.data?.displayName ||
    "Operator";

  const attention = myWork.data?.queues.needsMyAttention.length;
  const due = myWork.data?.queues.dueToday.length;

  const metrics = dash.metrics.map((m) => {
    if (m.label === "Attention" && attention !== undefined) {
      return { ...m, value: String(attention) };
    }
    if (m.label === "Due today" && due !== undefined) {
      return { ...m, value: String(due) };
    }
    return m;
  });

  return (
    <div
      className="mx-auto flex w-full max-w-[var(--shell-content-max)] flex-col gap-5 p-4 sm:p-5"
      data-testid="role-home-dashboard"
      data-dashboard-kind={kind}
    >
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--color-muted-foreground)] uppercase">
            {dash.title}
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
            {name}
          </h1>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)] sm:text-sm">
            {dash.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/workspace/my-work"
            className="rounded border border-[var(--color-border)] px-2.5 py-1.5 hover:bg-[var(--color-muted)]"
            data-testid="role-home-open-my-work"
          >
            My Work
          </Link>
          <Link
            href="/workspace/notifications/inbox"
            className="rounded border border-[var(--color-border)] px-2.5 py-1.5 hover:bg-[var(--color-muted)]"
          >
            Inbox
          </Link>
          <Link
            href="/workspace/personalisation"
            className="rounded border border-[var(--color-border)] px-2.5 py-1.5 hover:bg-[var(--color-muted)]"
          >
            Preferences
          </Link>
        </div>
      </header>

      <MetricStrip metrics={metrics} />

      <section>
        <h2 className="mb-2 text-[11px] font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase">
          Jump to
        </h2>
        <ul className="divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]">
          {dash.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-[var(--color-muted)]/60"
              >
                <span className="font-medium">{link.label}</span>
                <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                  {link.hint}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {(kind === "org_member" || kind === "individual" || kind === "org_admin") &&
      myWork.data ? (
        <section>
          <h2 className="mb-2 text-[11px] font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase">
            Needs attention
          </h2>
          {myWork.data.queues.needsMyAttention.length === 0 ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">Queue clear.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]">
              {myWork.data.queues.needsMyAttention.slice(0, 6).map((card) => (
                <li key={card.id}>
                  <Link
                    href={card.href}
                    className="flex justify-between gap-2 px-3 py-2 text-sm hover:bg-[var(--color-muted)]/60"
                  >
                    <span className="truncate">{card.title}</span>
                    <span className="shrink-0 text-[11px] text-[var(--color-muted-foreground)]">
                      {card.productLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
