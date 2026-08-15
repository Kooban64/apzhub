"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const actionBtn =
  "inline-flex h-7 items-center rounded-md border border-[var(--color-border)] px-2 text-xs disabled:opacity-50";

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

type ProviderRow = {
  providerId: string;
  name: string;
  status: string;
  capabilities: readonly string[];
};

type ConnectorState = {
  providerId: string;
  source: "automation" | "scm";
  enabled: boolean;
  lastSyncAt?: string;
  updatedAt: string;
  updatedBy: string;
};

type ConnectorRow = {
  providerId: string;
  name: string;
  source: "automation" | "scm";
  catalogueStatus: string;
  enabled: boolean;
  lastSyncAt?: string;
};

function formatSync(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function QepIntegrationsRouterView() {
  const queryClient = useQueryClient();

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
  const connectorsQuery = useQuery({
    queryKey: ["qep-integrations", "connectors"],
    queryFn: () =>
      fetchJson<{
        connectors: ConnectorState[];
        note: string;
      }>("/api/v1/qep/integrations"),
  });

  const mutateConnector = useMutation({
    mutationFn: (payload: {
      action: "enable" | "disable" | "record_sync";
      providerId: string;
      source: "automation" | "scm";
    }) =>
      fetchJson<ConnectorState>("/api/v1/qep/integrations", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["qep-integrations", "connectors"],
      });
    },
  });

  if (automationQuery.isLoading || connectorsQuery.isLoading) {
    return <QepLoadingState label="Loading Integration Centre…" />;
  }
  if (automationQuery.isError) {
    return <QepErrorState message={(automationQuery.error as Error).message} />;
  }
  if (connectorsQuery.isError) {
    return <QepErrorState message={(connectorsQuery.error as Error).message} />;
  }

  const providers = automationQuery.data!.providers;
  const runner = automationQuery.data!.playwrightRunner;
  const states = connectorsQuery.data!.connectors;

  const stateMap = new Map(
    states.map((row) => [`${row.source}:${row.providerId}`, row] as const),
  );

  const connectorRows: ConnectorRow[] = [
    ...providers.map((p) => {
      const state = stateMap.get(`automation:${p.providerId}`);
      return {
        providerId: p.providerId,
        name: p.name || p.providerId,
        source: "automation" as const,
        catalogueStatus: p.status,
        enabled: state?.enabled ?? true,
        lastSyncAt: state?.lastSyncAt,
      };
    }),
    ...(scmQuery.data?.providers ?? []).map((p) => {
      const state = stateMap.get(`scm:${p.providerId}`);
      return {
        providerId: p.providerId,
        name: p.name ?? p.providerId,
        source: "scm" as const,
        catalogueStatus: p.status ?? "active",
        enabled: state?.enabled ?? true,
        lastSyncAt: state?.lastSyncAt,
      };
    }),
  ];

  return (
    <QepPageShell
      title="Integration Centre"
      description="Configure quality providers — automation ingest, Playwright runner, and SCM. Enablement and last-sync are platform metadata (SPR-APZQEP-220-D)."
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

      <QepPanel title="Connectors">
        <div data-testid="qep-integrations-connectors">
          {scmQuery.isLoading ? (
            <QepLoadingState label="Loading SCM providers…" />
          ) : scmQuery.isError ? (
            <QepErrorState message={(scmQuery.error as Error).message} />
          ) : (
            <>
              <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
                {connectorsQuery.data!.note}
              </p>
              <QepTable
                caption="Integration connectors"
                columns={[
                  "Provider",
                  "Source",
                  "Catalogue",
                  "Enabled",
                  "Last sync",
                  "Actions",
                ]}
                rows={connectorRows.map((row) => ({
                  id: `${row.source}:${row.providerId}`,
                  cells: [
                    row.name,
                    row.source,
                    <QepStatusBadge
                      key={`${row.source}:${row.providerId}:status`}
                      status={row.catalogueStatus}
                    />,
                    row.enabled ? "Yes" : "No",
                    formatSync(row.lastSyncAt),
                    <div
                      key={`${row.source}:${row.providerId}:actions`}
                      className="flex flex-wrap gap-1"
                    >
                      <button
                        type="button"
                        className={actionBtn}
                        disabled={mutateConnector.isPending}
                        onClick={() =>
                          mutateConnector.mutate({
                            action: row.enabled ? "disable" : "enable",
                            providerId: row.providerId,
                            source: row.source,
                          })
                        }
                      >
                        {row.enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        className={actionBtn}
                        disabled={mutateConnector.isPending}
                        onClick={() =>
                          mutateConnector.mutate({
                            action: "record_sync",
                            providerId: row.providerId,
                            source: row.source,
                          })
                        }
                      >
                        Record sync
                      </button>
                    </div>,
                  ],
                }))}
              />
              {mutateConnector.error ? (
                <p className="mt-2 text-xs text-[var(--color-destructive)]">
                  {(mutateConnector.error as Error).message}
                </p>
              ) : null}
            </>
          )}
        </div>
      </QepPanel>
    </QepPageShell>
  );
}
