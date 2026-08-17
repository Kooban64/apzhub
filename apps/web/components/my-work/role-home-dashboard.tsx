"use client";

import Link from "next/link";
import { useSession } from "@apzhub/auth";
import { useQuery } from "@tanstack/react-query";

import { fetchMyWorkComposition } from "@/lib/my-work/my-work-api";
import { myWorkQueryKeys } from "@/lib/my-work/query-keys";
import type { WorkCard } from "@apzhub/platform-service-contracts";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatLongDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatRelative(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const mins = Math.round((Date.now() - t) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return new Date(t).toLocaleDateString();
}

function dueLabel(iso?: string): string {
  if (!iso) return "—";
  const due = new Date(iso);
  const today = new Date();
  if (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  ) {
    return "Today";
  }
  return due.toLocaleDateString();
}

function kindLabel(card: WorkCard): string {
  switch (card.kind) {
    case "task":
      return "Task";
    case "support_request":
      return "Ticket";
    case "timesheet":
      return "Approval";
    case "quality_execution":
      return "Test";
    case "workflow_task":
      return "Workflow";
    default:
      return card.kind;
  }
}

async function fetchHomeContext(): Promise<{
  name?: string;
  email?: string;
  organisationName?: string;
}> {
  const res = await fetch("/api/v1/me/home-context", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: {
      name?: string;
      email?: string;
      organisationName?: string;
      tenantName?: string;
    };
  };
  if (!res.ok) return {};
  return {
    name: body.data?.name,
    email: body.data?.email,
    organisationName: body.data?.organisationName ?? body.data?.tenantName,
  };
}

/**
 * User Workbench Home / My Work — attention-first, not admin metrics dashboard.
 */
export function RoleHomeDashboard() {
  const { data: session } = useSession();
  const now = new Date();
  const contextQuery = useQuery({
    queryKey: ["me", "home-context"],
    queryFn: fetchHomeContext,
  });
  const myWork = useQuery({
    queryKey: myWorkQueryKeys.composition(),
    queryFn: ({ signal }) => fetchMyWorkComposition({ signal }),
  });

  const name =
    contextQuery.data?.name?.trim() ||
    session?.user?.name?.trim() ||
    myWork.data?.displayName?.trim() ||
    session?.user?.email?.trim() ||
    "there";

  const firstName = name.split(/\s+/)[0] ?? name;
  const attention = myWork.data?.queues.needsMyAttention ?? [];
  const dueToday = myWork.data?.queues.dueToday ?? [];
  const assigned = [...attention, ...dueToday]
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
    .slice(0, 8);
  const recent = myWork.data?.queues.recentlyCompleted.slice(0, 6) ?? [];
  const attentionCount = attention.length;
  const missingProviders =
    myWork.data?.providers.filter((p) => p.error).map((p) => p.providerId) ?? [];
  const partial = myWork.data?.partial === true;

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 py-4"
      data-testid="role-home-dashboard"
      data-workbench-home="true"
    >
      <header className="border-b border-[var(--color-border)] pb-3">
        <h1 className="text-base font-semibold tracking-tight">My Work</h1>
        <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
          {formatLongDate(now)}
        </p>
      </header>

      <section data-testid="workbench-home-greeting">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--color-muted-foreground)] uppercase">
          {greetingForHour(now.getHours())}, {firstName}
        </p>
        <p className="mt-2 text-sm">
          {myWork.isLoading
            ? "Loading your work…"
            : attentionCount === 0
              ? "Nothing needs your attention right now."
              : `${attentionCount} thing${attentionCount === 1 ? "" : "s"} need your attention`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/workspace/my-work"
            className="border border-[var(--color-foreground)] bg-[var(--color-foreground)] px-3 py-1.5 text-xs font-medium text-[var(--color-background)]"
            data-testid="workbench-start-work"
          >
            Start work
          </Link>
          <button
            type="button"
            className="border border-[var(--color-border)] px-3 py-1.5 text-xs"
            data-testid="workbench-create-menu"
            title="Open Quick Actions (Ctrl+Shift+A)"
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "A",
                  ctrlKey: true,
                  shiftKey: true,
                  bubbles: true,
                }),
              );
            }}
          >
            Create ▾
          </button>
        </div>
      </section>

      <div className="grid gap-6 border-y border-[var(--color-border)] py-4 lg:grid-cols-2">
        <section data-testid="workbench-home-priority">
          <h2 className="text-[11px] font-semibold tracking-wide uppercase">
            Priority
          </h2>
          {attention.length === 0 ? (
            <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
              No priority items from accessible products.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {attention.slice(0, 5).map((card) => (
                <li key={card.id}>
                  <Link
                    href={card.href}
                    className="group block text-xs hover:underline"
                  >
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-foreground)]" />
                    <span className="font-medium">{card.productLabel}</span>
                    <span className="mt-0.5 block pl-3.5 text-[var(--color-foreground)]">
                      {card.title}
                    </span>
                    <span className="block pl-3.5 text-[11px] text-[var(--color-muted-foreground)]">
                      {card.productLabel}
                      {card.dueAt ? ` · Due ${dueLabel(card.dueAt)}` : ""}
                      {card.priority ? ` · ${card.priority}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/workspace/my-work"
            className="mt-3 inline-block text-xs text-[var(--color-muted-foreground)] hover:underline"
          >
            View all →
          </Link>
        </section>

        <section data-testid="workbench-home-today">
          <h2 className="text-[11px] font-semibold tracking-wide uppercase">Today</h2>
          {dueToday.length === 0 ? (
            <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
              No due-today items from accessible product sources.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-xs">
              {dueToday.slice(0, 6).map((card) => (
                <li key={card.id} className="flex gap-3">
                  <span className="w-16 shrink-0 text-[var(--color-muted-foreground)]">
                    {card.dueAt
                      ? new Date(card.dueAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                  <Link href={card.href} className="hover:underline">
                    {card.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs">
            <p className="text-[var(--color-muted-foreground)]">Time recorded</p>
            <p className="mt-1" data-availability="partial">
              {myWork.data?.providers.some((p) => p.providerId.includes("time"))
                ? "See Time workspace for recorded hours"
                : "Not configured — Time source not in composition"}
            </p>
            <Link
              href="/workspace/time"
              className="mt-2 inline-block text-[var(--color-muted-foreground)] hover:underline"
            >
              Open Time →
            </Link>
          </div>
        </section>
      </div>

      <section data-testid="workbench-home-assigned">
        <h2 className="text-[11px] font-semibold tracking-wide uppercase">
          Assigned to Me
        </h2>
        {assigned.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
            No assigned work from accessible products.
            {partial || missingProviders.length > 0
              ? " Some product sources are unavailable or incomplete."
              : ""}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[11px] text-[var(--color-muted-foreground)]">
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Item</th>
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="py-2 pr-3 font-medium">Due</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {assigned.map((card) => (
                  <tr
                    key={card.id}
                    className="border-b border-[var(--color-border)]/70"
                  >
                    <td className="py-2 pr-3">{kindLabel(card)}</td>
                    <td className="py-2 pr-3">
                      <Link href={card.href} className="hover:underline">
                        {card.title}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{card.productLabel}</td>
                    <td className="py-2 pr-3">{dueLabel(card.dueAt)}</td>
                    <td className="py-2 capitalize">
                      {card.nativeStatus ?? card.lifecycle.replace(/_/g, " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(partial || missingProviders.length > 0) && (
          <p
            className="mt-2 text-[11px] text-[var(--color-muted-foreground)]"
            data-testid="workbench-home-composition-gaps"
          >
            Partial composition
            {missingProviders.length > 0
              ? ` — unavailable sources: ${missingProviders.join(", ")}`
              : " — not all product providers returned items"}
            . Cross-product aggregation is honest about gaps; no fabricated feed.
          </p>
        )}
        <div className="mt-2 text-right">
          <Link
            href="/workspace/my-work"
            className="text-xs text-[var(--color-muted-foreground)] hover:underline"
          >
            View all →
          </Link>
        </div>
      </section>

      <section data-testid="workbench-home-recent">
        <h2 className="text-[11px] font-semibold tracking-wide uppercase">Recent</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
            No recent completed items yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {recent.map((card) => (
              <li key={card.id} className="flex items-center gap-3 py-2 text-xs">
                <Link
                  href={card.href}
                  className="min-w-0 flex-1 truncate font-medium hover:underline"
                >
                  {card.title}
                </Link>
                <span className="shrink-0 text-[var(--color-muted-foreground)]">
                  {card.productLabel}
                </span>
                <span className="w-20 shrink-0 text-right text-[var(--color-muted-foreground)]">
                  {formatRelative(card.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
