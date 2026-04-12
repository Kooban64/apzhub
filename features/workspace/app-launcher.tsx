"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { executeWorkspaceLaunch } from "@/features/workspace/execute-workspace-launch";
import { LaunchReadinessPill } from "@/features/workspace/launch-readiness-pill";
import { useWorkspaceServiceLaunchDecision } from "@/features/workspace/use-workspace-service-launch-decision";
import { effectiveLauncherVisibleForSubject, isLauncherFeatured } from "@/lib/workspace/launcher-semantics";
import type { PlatformRole } from "@/lib/auth/session-types";
import {
  defaultWorkspaceConfig,
  type WorkspaceConfig,
  type WorkspaceServiceId,
} from "@/lib/workspace/workspace-config";
import { cn } from "@/lib/utils";

const SERVICE_LABEL: Record<WorkspaceServiceId, string> = {
  calendar: "Calendar",
  mail: "Mail",
  reminders: "Reminders",
  drive: "Drive",
  chat: "Chat",
  plane: "Plane",
  zammad: "Zammad",
  kimai: "Kimai",
  kiwi: "Kiwi",
  paperless: "Paperless",
  n8n: "n8n",
};

function launcherEntries(config: WorkspaceConfig, platformRole: PlatformRole): WorkspaceServiceId[] {
  return effectiveLauncherVisibleForSubject(config, platformRole).slice(0, config.launcherMaxVisible);
}

function LauncherTile({ serviceId, config }: { serviceId: WorkspaceServiceId; config: WorkspaceConfig }) {
  const router = useRouter();
  const decision = useWorkspaceServiceLaunchDecision(serviceId, config);
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const onLaunch = useCallback(() => {
    setLocalMessage(null);
    if (decision.allowed && decision.target) {
      setLoading(true);
      queueMicrotask(() => {
        executeWorkspaceLaunch(decision, {
          push: (href) => router.push(href),
          openExternal: (href) => router.push(href),
        });
        setLoading(false);
      });
      return;
    }
    setLocalMessage(decision.userMessage);
    void fetch("/api/workspace/launch/client-outcome", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allowed: false as const,
        serviceId,
        method: decision.method,
        readiness: decision.readiness,
        reasonCode: decision.reasonCode,
        userMessage: decision.userMessage,
        operatorMessage: decision.operatorMessage,
      }),
    }).catch(() => {});
  }, [decision, router, serviceId]);

  return (
    <li>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn("h-auto min-w-[7.5rem] flex-col items-stretch gap-1 py-2 text-left text-xs")}
        data-testid={`launcher-tile-${serviceId}`}
        aria-busy={loading}
        aria-label={`${SERVICE_LABEL[serviceId]}, launch readiness ${decision.readiness}`}
        onClick={onLaunch}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 font-medium text-foreground">
            {SERVICE_LABEL[serviceId]}
            {isLauncherFeatured(config, serviceId) ? (
              <span
                className="rounded bg-muted px-1 font-mono text-[0.55rem] uppercase tracking-wide text-muted-foreground"
                aria-hidden
              >
                Pin
              </span>
            ) : null}
          </span>
          <LaunchReadinessPill readiness={decision.readiness} />
        </span>
        {localMessage ? (
          <span className="text-[0.6rem] font-normal text-muted-foreground">{localMessage}</span>
        ) : null}
      </Button>
    </li>
  );
}

export function AppLauncher({ config = defaultWorkspaceConfig }: { config?: WorkspaceConfig }) {
  const { snapshot } = useSession();
  const platformRole = snapshot.sessionStatus === "active" ? snapshot.platformRole : "user";
  const entries = launcherEntries(config, platformRole);

  return (
    <section className="rounded-lg border border-border bg-panel p-[var(--shell-pad)]">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Launcher</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Launch is decision-driven: readiness reflects whether you can open the app now (separate from provisioning jobs
        and downstream realization).
      </p>
      <ul className="mt-3 flex flex-wrap gap-2" data-testid="workspace-app-launcher">
        {entries.map((id) => (
          <LauncherTile key={id} serviceId={id} config={config} />
        ))}
      </ul>
    </section>
  );
}
