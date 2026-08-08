"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  QEP_DASHBOARDS_ROUTES,
  parseQepDashboardAudience,
  parseQepDashboardId,
} from "@/lib/qep/routes";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

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

const LANDINGS = [
  { id: "executive", label: "Executive" },
  { id: "engineering", label: "Engineering" },
  { id: "qa", label: "QA" },
  { id: "project", label: "Project" },
  { id: "portfolio", label: "Portfolio" },
  { id: "operations", label: "Operations" },
  { id: "release", label: "Release" },
  { id: "compliance", label: "Compliance" },
  { id: "automation", label: "Automation" },
  { id: "repository", label: "Repository" },
  { id: "evidence", label: "Evidence" },
  { id: "quality-intelligence", label: "Quality Intelligence" },
] as const;

export function QepDashboardsRouterView() {
  const pathname = usePathname() ?? "";
  const dashboardId = parseQepDashboardId(pathname);
  const audience = parseQepDashboardAudience(pathname);

  if (dashboardId) {
    return <DashboardDetailView dashboardId={dashboardId} />;
  }
  if (audience === "pinned") {
    return <PinnedViewsView />;
  }
  if (audience === "visualizations") {
    return <VisualizationsView />;
  }
  if (audience) {
    return <LandingView audience={audience} />;
  }
  return <DashboardsHomeView />;
}

function NavLinks() {
  return (
    <div className="mb-4 flex flex-wrap gap-3 text-sm">
      <Link href={QEP_DASHBOARDS_ROUTES.home}>All</Link>
      {LANDINGS.map((landing) => (
        <Link key={landing.id} href={QEP_DASHBOARDS_ROUTES.landing(landing.id)}>
          {landing.label}
        </Link>
      ))}
      <Link href={QEP_DASHBOARDS_ROUTES.pinned}>Pinned</Link>
      <Link href={QEP_DASHBOARDS_ROUTES.visualizations}>Visualizations</Link>
    </div>
  );
}

function DashboardsHomeView() {
  const query = useQuery({
    queryKey: ["qep-dashboards", "list"],
    queryFn: () =>
      fetchJson<{
        dashboards: Array<{
          dashboardId: string;
          name: string;
          audience: string;
          description: string;
        }>;
      }>("/api/v1/qep/dashboards"),
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading dashboards…" />;
  }
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const dashboards = query.data?.dashboards ?? [];

  return (
    <QepPageShell
      title="Enterprise Dashboard & Quality Experience"
      description="Reusable dashboard platform. Dashboards consume Automation, SCM, Evidence and Quality Intelligence — no business logic in this layer."
    >
      <NavLinks />
      <QepPanel title="Dashboards">
        {dashboards.length === 0 ? (
          <QepEmptyState title="No dashboards registered." />
        ) : (
          <QepTable
            caption="Dashboards"
            columns={["Name", "Audience", "Description"]}
            rows={dashboards.map((dashboard) => ({
              id: dashboard.dashboardId,
              href: QEP_DASHBOARDS_ROUTES.dashboard(dashboard.dashboardId),
              cells: [dashboard.name, dashboard.audience, dashboard.description],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function LandingView({ audience }: { audience: string }) {
  const normalized =
    audience === "quality-intelligence" ? "quality_intelligence" : audience;
  const query = useQuery({
    queryKey: ["qep-dashboards", "landing", audience],
    queryFn: () =>
      fetchJson<{
        dashboards: Array<{
          dashboardId: string;
          name: string;
          audience: string;
          description: string;
        }>;
      }>("/api/v1/qep/dashboards"),
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading landing…" />;
  }
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const dashboards = (query.data?.dashboards ?? []).filter(
    (d) => d.audience === normalized,
  );

  return (
    <QepPageShell
      title={`${audience.replace(/-/g, " ")} landing`}
      description="Role landing — permission presets are presentation only."
    >
      <NavLinks />
      <QepPanel title="Dashboards">
        {dashboards.length === 0 ? (
          <QepEmptyState title="No dashboards for this landing." />
        ) : (
          <QepTable
            caption="Landing dashboards"
            columns={["Name", "Description"]}
            rows={dashboards.map((dashboard) => ({
              id: dashboard.dashboardId,
              href: QEP_DASHBOARDS_ROUTES.dashboard(dashboard.dashboardId),
              cells: [dashboard.name, dashboard.description],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function DashboardDetailView({ dashboardId }: { dashboardId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["qep-dashboards", "detail", dashboardId],
    queryFn: () =>
      fetchJson<{
        dashboard: {
          dashboard: {
            dashboardId: string;
            name: string;
            description: string;
            audience: string;
          };
          widgets: Array<{
            instance: { instanceId: string; widgetId: string };
            descriptor: {
              title: string;
              kind: string;
              projectionQueryId?: string;
            };
          }>;
          columns: number;
        };
        projections: Record<
          string,
          {
            kind: string;
            attribution?: string;
            descriptor?: {
              title?: string;
              value?: string | number;
              a11ySummary?: string;
              series?: readonly unknown[];
            };
            title?: string;
            status?: string;
            detail?: string;
            items?: Array<{ id: string; label: string; href?: string }>;
          }
        >;
      }>(`/api/v1/qep/dashboards/${dashboardId}`),
  });

  const pinMutation = useMutation({
    mutationFn: () =>
      fetchJson("/api/v1/qep/dashboards/views", {
        method: "POST",
        body: JSON.stringify({
          dashboardId,
          name: `${dashboardId} pinned`,
          pinned: true,
          favourite: true,
        }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-dashboards"] });
    },
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading dashboard…" />;
  }
  if (query.isError || !query.data) {
    return (
      <QepErrorState
        message={(query.error as Error | undefined)?.message ?? "Not found"}
      />
    );
  }

  const { dashboard, projections } = query.data;
  const def = dashboard.dashboard;

  return (
    <QepPageShell
      title={def.name}
      description={def.description}
      actions={
        <Button
          type="button"
          onClick={() => pinMutation.mutate()}
          disabled={pinMutation.isPending}
        >
          {pinMutation.isPending ? "Pinning…" : "Pin dashboard"}
        </Button>
      }
    >
      <NavLinks />
      <p className="mb-4 text-sm">
        Layout columns: {dashboard.columns} · Audience: {def.audience}
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboard.widgets.map(({ instance, descriptor }) => {
          const projection = descriptor.projectionQueryId
            ? projections[descriptor.projectionQueryId]
            : undefined;
          return (
            <QepPanel key={instance.instanceId} title={descriptor.title}>
              <p className="mb-2 text-xs uppercase tracking-wide opacity-70">
                {descriptor.kind}
              </p>
              {projection?.kind === "kpi" && projection.descriptor ? (
                <div>
                  <p className="text-2xl font-semibold">
                    {String(projection.descriptor.value)}
                  </p>
                  {projection.attribution === "empty:no_system_of_record_binding" ? (
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                      Honest empty — not bound to a System of Record.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {projection?.kind === "gauge" && projection.descriptor ? (
                <p className="text-sm">{projection.descriptor.a11ySummary}</p>
              ) : null}
              {projection?.kind === "chart" && projection.descriptor ? (
                (projection.descriptor.series?.length ?? 0) === 0 ? (
                  <QepEmptyState title="No chart data — projection not bound to a System of Record." />
                ) : (
                  <p className="text-sm">{projection.descriptor.a11ySummary}</p>
                )
              ) : null}
              {projection?.kind === "list" ? (
                (projection.items ?? []).length === 0 ? (
                  <QepEmptyState title="No items — projection not bound to a System of Record." />
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {(projection.items ?? []).map((item) => (
                      <li key={item.id}>
                        {item.href ? (
                          <Link href={item.href}>{item.label}</Link>
                        ) : (
                          item.label
                        )}
                      </li>
                    ))}
                  </ul>
                )
              ) : null}
              {projection?.kind === "status" ? (
                <p className="text-sm">
                  <QepStatusBadge status={projection.status ?? "empty"} />{" "}
                  {projection.detail}
                </p>
              ) : null}
              {!projection ? <QepEmptyState title="No projection bound." /> : null}
            </QepPanel>
          );
        })}
      </div>
    </QepPageShell>
  );
}

function PinnedViewsView() {
  const query = useQuery({
    queryKey: ["qep-dashboards", "pinned"],
    queryFn: () =>
      fetchJson<{
        pinned: Array<{
          viewId: string;
          dashboardId: string;
          name: string;
        }>;
      }>("/api/v1/qep/dashboards/views"),
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading pinned views…" />;
  }
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const pinned = query.data?.pinned ?? [];

  return (
    <QepPageShell title="Pinned dashboards" description="Saved personal views">
      <NavLinks />
      <QepPanel title="Pinned">
        {pinned.length === 0 ? (
          <QepEmptyState title="No pinned dashboards yet." />
        ) : (
          <QepTable
            caption="Pinned"
            columns={["Name", "Dashboard"]}
            rows={pinned.map((view) => ({
              id: view.viewId,
              href: QEP_DASHBOARDS_ROUTES.dashboard(view.dashboardId),
              cells: [view.name, view.dashboardId],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function VisualizationsView() {
  const query = useQuery({
    queryKey: ["qep-dashboards", "viz"],
    queryFn: () =>
      fetchJson<{
        kinds: Array<{ kind: string; title: string; category: string }>;
      }>("/api/v1/qep/dashboards/visualizations"),
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading visualization catalogue…" />;
  }
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  return (
    <QepPageShell
      title="Visualization catalogue"
      description="@apzhub/platform-visualization — reusable across APZHUB"
    >
      <NavLinks />
      <QepPanel title="Kinds">
        <QepTable
          caption="Visualization kinds"
          columns={["Kind", "Title", "Category"]}
          rows={(query.data?.kinds ?? []).map((kind) => ({
            id: kind.kind,
            cells: [kind.kind, kind.title, kind.category],
          }))}
        />
      </QepPanel>
    </QepPageShell>
  );
}
