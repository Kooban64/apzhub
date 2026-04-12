"use client";

import Link from "next/link";

import { useAdminControlPlaneQuery } from "@/lib/hooks/use-admin-control-plane-query";
import { cn } from "@/lib/utils";

function severityBorder(sev: "critical" | "warning" | "info") {
  switch (sev) {
    case "critical":
      return "border-l-destructive";
    case "warning":
      return "border-l-amber-500";
    default:
      return "border-l-border";
  }
}

export function AdminAlertsPage() {
  const { data, isLoading } = useAdminControlPlaneQuery();

  if (isLoading || !data) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-alerts-loading">
        Loading alerts…
      </div>
    );
  }

  const { alerts } = data;

  return (
    <div className="flex flex-col gap-3 p-[var(--shell-pad)]" data-testid="admin-alerts-page">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">Alerts</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Actionable items: each row links to a route, job, or user surface where recovery starts. Mock data only.
        </p>
      </header>
      <ul className="flex flex-col gap-2">
        {alerts.map((a) => (
          <li
            key={a.id}
            className={cn("rounded-md border border-border border-l-4 bg-card p-3 shadow-sm", severityBorder(a.severity))}
            data-testid={`admin-alert-card-${a.id}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.summary}</p>
                {a.domain ? (
                  <p className="mt-1 font-mono text-[0.6rem] text-muted-foreground">domain={a.domain}</p>
                ) : null}
                {a.recoveryHint ? <p className="mt-1 text-xs text-muted-foreground">{a.recoveryHint}</p> : null}
                {a.pointerRoute ? (
                  <p className="mt-1 font-mono text-[0.6rem] text-muted-foreground">next: {a.pointerRoute}</p>
                ) : null}
              </div>
              {a.ctaHref && a.ctaLabel ? (
                a.ctaHref.startsWith("/") ? (
                  <Link href={a.ctaHref} className="text-xs font-medium text-primary underline">
                    {a.ctaLabel}
                  </Link>
                ) : (
                  <a href={a.ctaHref} className="text-xs font-medium text-primary underline">
                    {a.ctaLabel}
                  </a>
                )
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
