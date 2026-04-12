"use client";

import { LaunchReadinessPill } from "@/features/workspace/launch-readiness-pill";
import { useWorkspaceServiceLaunchDecision } from "@/features/workspace/use-workspace-service-launch-decision";
import { EmptyState } from "@/components/shared/empty-state";
import { defaultWorkspaceConfig } from "@/lib/workspace/workspace-config";

function MiniAppRow({ serviceId }: { serviceId: "mail" | "calendar" }) {
  const decision = useWorkspaceServiceLaunchDecision(serviceId, defaultWorkspaceConfig);
  const label = serviceId === "mail" ? "Mail" : "Calendar";
  return (
    <div
      className="flex items-center justify-between rounded-md border border-border/80 px-2 py-1.5 text-xs"
      data-testid={`my-apps-row-${serviceId}`}
    >
      <span className="font-medium text-foreground">{label}</span>
      <LaunchReadinessPill readiness={decision.readiness} />
    </div>
  );
}

export function MyAppsGrid() {
  return (
    <section className="rounded-lg border border-border bg-surface p-[var(--shell-pad)]">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">My apps</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Pinned shortcuts mirror launch readiness (Phase 7 mock). Full launcher lives above when enabled.
      </p>
      <div className="mt-3 space-y-2">
        <MiniAppRow serviceId="mail" />
        <MiniAppRow serviceId="calendar" />
      </div>
      <div className="mt-3">
        <EmptyState
          title="More shortcuts"
          description="Tenant-approved apps appear here as you pin them. Entries still respect the workspace service allowlist."
        />
      </div>
    </section>
  );
}
