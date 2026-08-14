"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { QEP_AUTOMATION_ROUTES, QEP_SCM_ROUTES } from "@/lib/qep/routes";
import {
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

const linkOutline =
  "inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "content-type": "application/json" },
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

type ProviderRow = {
  providerId: string;
  name: string;
  status: string;
  capabilities: readonly string[];
};

export function QepIntegrationsRouterView() {
  const automationQuery = useQuery({
    queryKey: ["qep-integrations", "automation"],
    queryFn: () =>
      fetchJson<{
        providers: ProviderRow[];
        liveModeEnabled: boolean;
        playwrightRunner?: {
          liveFlag: boolean;
          healthy: boolean;
          detail: string;
          containerName?: string;
        };
      }>("/api/v1/qep/automation/providers"),
  });
  const scmQuery = useQuery({
    queryKey: ["qep-integrations", "scm"],
    queryFn: () =>
      fetchJson<{
        providers: Array<{ providerId: string; name?: string; status?: string }>;
      }>("/api/v1/qep/scm/providers"),
  });

  if (automationQuery.isLoading) {
    return <QepLoadingState label="Loading Integration Centre…" />;
  }
  if (automationQuery.isError) {
    return <QepErrorState message={(automationQuery.error as Error).message} />;
  }

  const providers = automationQuery.data!.providers;
  const runner = automationQuery.data!.playwrightRunner;

  return (
    <QepPageShell
      title="Integration Centre"
      description="Configure quality providers — automation ingest, Playwright runner, and SCM. Presentation over live provider catalogues (SPR-APZQEP-202)."
      breadcrumbs={["QEP", "Integrations"]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link className={linkOutline} href={QEP_AUTOMATION_ROUTES.home}>
            Automation
          </Link>
          <Link className={linkOutline} href={QEP_SCM_ROUTES.home}>
            Source Control
          </Link>
        </div>
      }
    >
      <QepPanel title="Playwright runner">
        <div data-testid="qep-integrations-playwright">
          {runner ? (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <QepStatusBadge status={runner.healthy ? "ready" : "blocked"} />
                <span>{runner.containerName ?? "playwright-runner"}</span>
              </div>
              <p className="text-[var(--color-muted-foreground)]">{runner.detail}</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Live mode: {automationQuery.data!.liveModeEnabled ? "on" : "off"} ·
                dry-run remains default until runner healthy.
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Runner health unavailable.
            </p>
          )}
        </div>
      </QepPanel>

      <QepPanel title="Automation providers">
        <QepTable
          caption="Automation providers"
          columns={["Provider", "Status", "Capabilities"]}
          rows={providers.map((p) => ({
            id: p.providerId,
            cells: [
              p.name || p.providerId,
              <QepStatusBadge key={p.providerId} status={p.status} />,
              p.capabilities.slice(0, 4).join(", "),
            ],
          }))}
        />
      </QepPanel>

      <QepPanel title="SCM providers">
        {scmQuery.isLoading ? (
          <QepLoadingState label="Loading SCM providers…" />
        ) : scmQuery.isError ? (
          <QepErrorState message={(scmQuery.error as Error).message} />
        ) : (
          <QepTable
            caption="SCM providers"
            columns={["Provider", "Status"]}
            rows={(scmQuery.data?.providers ?? []).map((p) => ({
              id: p.providerId,
              cells: [
                p.name ?? p.providerId,
                <QepStatusBadge key={p.providerId} status={p.status ?? "active"} />,
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}
