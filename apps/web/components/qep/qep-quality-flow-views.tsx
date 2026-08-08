"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  QEP_QUALITY_FLOWS_ROUTES,
  parseQepQualityFlowInstanceId,
} from "@/lib/qep/quality-flow-routes";
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

type CommandCentre = {
  summary: {
    activeCount: number;
    waitingCount: number;
    exceptionCount: number;
    blockedReleaseCount: number;
    decisionCount: number;
    definitionCount: number;
  };
  active: Array<{
    instanceId: string;
    qualityFlowId: string;
    currentState: string;
    paused: boolean;
    nextAction: string;
    blockedRelease: boolean;
    outstandingApprovalCount: number;
    outstandingEvidenceCount: number;
    createdAt: string;
  }>;
  waiting: Array<{
    instanceId: string;
    qualityFlowId: string;
    currentState: string;
    paused: boolean;
    nextAction: string;
  }>;
  exceptions: Array<{
    instanceId: string;
    qualityFlowId: string;
    currentState: string;
    nextAction: string;
  }>;
  recentChanges: Array<{
    instanceId: string;
    qualityFlowId: string;
    fromState: string;
    toState: string;
    timestamp: string;
    actor: string;
    reason: string;
  }>;
  decisions: Array<{
    decisionPackageId: string;
    platformConclusion: string;
    qualityFlowRef: string;
    createdAt: string;
  }>;
};

type FlowDetail = {
  instance: {
    instanceId: string;
    qualityFlowId: string;
    flowDefinitionId: string;
    definitionVersion: string;
    currentState: string;
    previousState?: string;
    paused: boolean;
    correlationId: string;
    tenantId: string;
    projectId?: string;
    createdAt: string;
    completedAt?: string;
    recoveryPoint?: string;
  };
  timeline: Array<{
    transitionId: string;
    fromState: string;
    toState: string;
    timestamp: string;
    actor: string;
    reason: string;
  }>;
  allowedTransitions: readonly string[];
  nextAction: string;
  decisions: Array<{
    decisionPackageId: string;
    platformConclusion: string;
    residualRisk: { residualRiskLevel: string };
    outstandingItems: readonly string[];
  }>;
  approvals: Array<{
    bundleId: string;
    finalStatus: string;
    requiredAuthorities: readonly string[];
  }>;
  outstandingApprovals: Array<{
    bundleId: string;
    authorityId: string;
    finalStatus: string;
  }>;
  evidencePackages: Array<{
    evidenceIntegrationPackageId: string;
    integrationStatus: string;
    evidenceRefs: readonly string[];
  }>;
  outstandingEvidence: readonly string[];
  blockedRelease: boolean;
  waiting: boolean;
  exception: boolean;
  definition?: { name: string; version: string; description: string };
};

export function QepQualityFlowRouterView() {
  const pathname = usePathname() ?? "";
  const instanceId = parseQepQualityFlowInstanceId(pathname);

  if (pathname.includes("/waiting")) {
    return <WaitingView />;
  }
  if (pathname.includes("/exceptions")) {
    return <ExceptionsView />;
  }
  if (pathname.includes("/decisions")) {
    return <DecisionsView />;
  }
  if (instanceId) {
    return <FlowDetailView instanceId={instanceId} />;
  }
  return <CommandCentreView />;
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "default" | "warn" | "danger";
}) {
  const color =
    tone === "danger"
      ? "text-[var(--color-destructive)]"
      : tone === "warn"
        ? "text-amber-600"
        : "text-[var(--color-foreground)]";
  return (
    <div className="rounded-lg border border-[var(--color-border)] px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function NavLinks() {
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <Link href={QEP_QUALITY_FLOWS_ROUTES.home}>Command centre</Link>
      <Link href={QEP_QUALITY_FLOWS_ROUTES.waiting}>Waiting</Link>
      <Link href={QEP_QUALITY_FLOWS_ROUTES.exceptions}>Exceptions</Link>
      <Link href={QEP_QUALITY_FLOWS_ROUTES.decisions}>Decisions</Link>
    </div>
  );
}

function CommandCentreView() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["qep-quality-flows", "command-centre"],
    queryFn: () => fetchJson<CommandCentre>("/api/v1/qep/quality-flows"),
    refetchInterval: 15_000,
  });

  const startMutation = useMutation({
    mutationFn: () =>
      fetchJson<FlowDetail>("/api/v1/qep/quality-flows/instances", {
        method: "POST",
        body: JSON.stringify({ ensureBuiltinDefinition: true }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-quality-flows"] });
    },
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading Quality Flow Workspace…" />;
  }
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const data = query.data!;
  const s = data.summary;

  return (
    <QepPageShell
      title="Quality Flow Workspace"
      description="Operational command centre for enterprise quality — active flows, waiting work, gates, approvals, and next actions."
      breadcrumbs={["QEP", "Quality Flows"]}
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => startMutation.mutate()}
          disabled={startMutation.isPending}
        >
          {startMutation.isPending ? "Starting…" : "Start Quality Flow"}
        </Button>
      }
    >
      <NavLinks />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Metric label="Active flows" value={s.activeCount} />
        <Metric label="Waiting" value={s.waitingCount} tone="warn" />
        <Metric label="Blocked releases" value={s.blockedReleaseCount} tone="warn" />
        <Metric label="Exceptions" value={s.exceptionCount} tone="danger" />
        <Metric label="Decisions" value={s.decisionCount} />
        <Metric label="Definitions" value={s.definitionCount} />
      </div>

      {startMutation.isError ? (
        <QepErrorState message={(startMutation.error as Error).message} />
      ) : null}

      <QepPanel title="Active Quality Flows">
        {data.active.length === 0 ? (
          <QepEmptyState title="No active Quality Flows — start a flow to orchestrate gates, approvals, evidence, and release decisions." />
        ) : (
          <QepTable
            caption="Active Quality Flows"
            columns={[
              "Flow",
              "Stage",
              "Next action",
              "Approvals",
              "Evidence",
              "Release",
              "Open",
            ]}
            rows={data.active.map((row) => ({
              id: row.instanceId,
              href: QEP_QUALITY_FLOWS_ROUTES.instance(row.instanceId),
              cells: [
                <div key={`${row.instanceId}-flow`}>
                  <div className="font-medium">{row.qualityFlowId}</div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">
                    {row.instanceId}
                  </div>
                </div>,
                <span
                  key={`${row.instanceId}-state`}
                  className="inline-flex items-center gap-2"
                >
                  <QepStatusBadge status={row.currentState} />
                  {row.paused ? <QepStatusBadge status="paused" /> : null}
                </span>,
                row.nextAction,
                String(row.outstandingApprovalCount),
                String(row.outstandingEvidenceCount),
                row.blockedRelease ? (
                  <QepStatusBadge key={`${row.instanceId}-block`} status="blocked" />
                ) : (
                  <QepStatusBadge key={`${row.instanceId}-ok`} status="clear" />
                ),
                <Link
                  key={`${row.instanceId}-link`}
                  href={QEP_QUALITY_FLOWS_ROUTES.instance(row.instanceId)}
                  className="text-sm font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
                >
                  Open
                </Link>,
              ],
            }))}
          />
        )}
      </QepPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <QepPanel title="Waiting">
          {data.waiting.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Nothing waiting on gates or approvals.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.waiting.map((w) => (
                <li
                  key={w.instanceId}
                  className="flex items-start justify-between gap-3 rounded border border-[var(--color-border)] px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{w.qualityFlowId}</div>
                    <div className="text-[var(--color-muted-foreground)]">
                      {w.nextAction}
                    </div>
                  </div>
                  <Link
                    href={QEP_QUALITY_FLOWS_ROUTES.instance(w.instanceId)}
                    className="shrink-0 text-[var(--color-primary)] underline-offset-2 hover:underline"
                  >
                    Act
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </QepPanel>

        <QepPanel title="Exceptions">
          {data.exceptions.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No failed, rejected, or timed-out flows.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.exceptions.map((e) => (
                <li
                  key={e.instanceId}
                  className="flex items-start justify-between gap-3 rounded border border-[var(--color-border)] px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{e.qualityFlowId}</div>
                    <div className="inline-flex items-center gap-2">
                      <QepStatusBadge status={e.currentState} />
                      <span className="text-[var(--color-muted-foreground)]">
                        {e.nextAction}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={QEP_QUALITY_FLOWS_ROUTES.instance(e.instanceId)}
                    className="shrink-0 text-[var(--color-primary)] underline-offset-2 hover:underline"
                  >
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </QepPanel>
      </div>

      <QepPanel title="What changed recently">
        {data.recentChanges.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No recent flow transitions.
          </p>
        ) : (
          <QepTable
            caption="Recent Quality Flow changes"
            columns={["When", "Flow", "Transition", "Actor", "Reason"]}
            rows={data.recentChanges.slice(0, 12).map((c, idx) => ({
              id: `${c.instanceId}-${c.timestamp}-${idx}`,
              href: QEP_QUALITY_FLOWS_ROUTES.instance(c.instanceId),
              cells: [
                new Date(c.timestamp).toLocaleString(),
                <Link
                  key={`rc-${idx}`}
                  href={QEP_QUALITY_FLOWS_ROUTES.instance(c.instanceId)}
                  className="text-[var(--color-primary)] underline-offset-2 hover:underline"
                >
                  {c.qualityFlowId}
                </Link>,
                `${c.fromState} → ${c.toState}`,
                c.actor,
                c.reason,
              ],
            }))}
          />
        )}
      </QepPanel>

      <QepPanel title="Decision Packages">
        {data.decisions.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No Decision Packages yet.{" "}
            <Link
              href={QEP_QUALITY_FLOWS_ROUTES.decisions}
              className="text-[var(--color-primary)] underline-offset-2 hover:underline"
            >
              View all
            </Link>
          </p>
        ) : (
          <QepTable
            caption="Decision Packages"
            columns={["Decision", "Conclusion", "Flow ref", "Created"]}
            rows={data.decisions.slice(0, 8).map((d) => ({
              id: d.decisionPackageId,
              cells: [
                d.decisionPackageId,
                <QepStatusBadge
                  key={d.decisionPackageId}
                  status={d.platformConclusion}
                />,
                d.qualityFlowRef,
                new Date(d.createdAt).toLocaleString(),
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function WaitingView() {
  const query = useQuery({
    queryKey: ["qep-quality-flows", "waiting"],
    queryFn: () =>
      fetchJson<{ instances: CommandCentre["active"] }>(
        "/api/v1/qep/quality-flows/instances?filter=waiting",
      ),
  });

  if (query.isLoading) return <QepLoadingState label="Loading waiting items…" />;
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const rows = query.data?.instances ?? [];
  return (
    <QepPageShell
      title="Waiting"
      description="Flows paused on gates, approvals, or operator resume."
      breadcrumbs={["QEP", "Quality Flows", "Waiting"]}
    >
      <NavLinks />
      {rows.length === 0 ? (
        <QepEmptyState title="Nothing waiting — all active flows are progressing." />
      ) : (
        <QepTable
          caption="Waiting Quality Flows"
          columns={["Flow", "Stage", "Next action", "Open"]}
          rows={rows.map((row) => ({
            id: row.instanceId,
            href: QEP_QUALITY_FLOWS_ROUTES.instance(row.instanceId),
            cells: [
              row.qualityFlowId,
              <QepStatusBadge key={row.instanceId} status={row.currentState} />,
              row.nextAction,
              <Link
                key={`${row.instanceId}-o`}
                href={QEP_QUALITY_FLOWS_ROUTES.instance(row.instanceId)}
                className="text-[var(--color-primary)] underline-offset-2 hover:underline"
              >
                Open
              </Link>,
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function ExceptionsView() {
  const query = useQuery({
    queryKey: ["qep-quality-flows", "exceptions"],
    queryFn: () =>
      fetchJson<{ instances: CommandCentre["active"] }>(
        "/api/v1/qep/quality-flows/instances?filter=exceptions",
      ),
  });

  if (query.isLoading) return <QepLoadingState label="Loading exceptions…" />;
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const rows = query.data?.instances ?? [];
  return (
    <QepPageShell
      title="Exceptions"
      description="Failed, rejected, timed-out, cancelled, or superseded flows."
      breadcrumbs={["QEP", "Quality Flows", "Exceptions"]}
    >
      <NavLinks />
      {rows.length === 0 ? (
        <QepEmptyState title="No exceptions — no terminal exception states." />
      ) : (
        <QepTable
          caption="Exception Quality Flows"
          columns={["Flow", "State", "Next action", "Open"]}
          rows={rows.map((row) => ({
            id: row.instanceId,
            href: QEP_QUALITY_FLOWS_ROUTES.instance(row.instanceId),
            cells: [
              row.qualityFlowId,
              <QepStatusBadge key={row.instanceId} status={row.currentState} />,
              row.nextAction,
              <Link
                key={`${row.instanceId}-o`}
                href={QEP_QUALITY_FLOWS_ROUTES.instance(row.instanceId)}
                className="text-[var(--color-primary)] underline-offset-2 hover:underline"
              >
                Open
              </Link>,
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function DecisionsView() {
  const query = useQuery({
    queryKey: ["qep-quality-flows", "command-centre"],
    queryFn: () => fetchJson<CommandCentre>("/api/v1/qep/quality-flows"),
  });

  if (query.isLoading) return <QepLoadingState label="Loading decisions…" />;
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const decisions = query.data?.decisions ?? [];
  return (
    <QepPageShell
      title="Decision Packages"
      description="Platform conclusions composed from completed governance outcomes."
      breadcrumbs={["QEP", "Quality Flows", "Decisions"]}
    >
      <NavLinks />
      {decisions.length === 0 ? (
        <QepEmptyState title="No Decision Packages — decisions appear when the orchestration engine composes a package." />
      ) : (
        <QepTable
          caption="All Decision Packages"
          columns={["Decision", "Conclusion", "Flow ref", "Created"]}
          rows={decisions.map((d) => ({
            id: d.decisionPackageId,
            cells: [
              d.decisionPackageId,
              <QepStatusBadge
                key={d.decisionPackageId}
                status={d.platformConclusion}
              />,
              d.qualityFlowRef,
              new Date(d.createdAt).toLocaleString(),
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function FlowDetailView({ instanceId }: { instanceId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["qep-quality-flows", "instance", instanceId],
    queryFn: () =>
      fetchJson<FlowDetail>(`/api/v1/qep/quality-flows/instances/${instanceId}`),
    refetchInterval: 10_000,
  });

  const actionMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetchJson<FlowDetail>(`/api/v1/qep/quality-flows/instances/${instanceId}`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-quality-flows"] });
    },
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading flow detail…" />;
  }
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const data = query.data!;
  const i = data.instance;

  return (
    <QepPageShell
      title={data.definition?.name ?? i.qualityFlowId}
      description={
        data.definition?.description ||
        "Operate this Quality Flow — stage, waiting work, evidence, approvals, and next action."
      }
      breadcrumbs={["QEP", "Quality Flows", i.qualityFlowId]}
      actions={
        <>
          {i.paused ? (
            <Button
              type="button"
              size="sm"
              onClick={() => actionMutation.mutate({ action: "resume" })}
              disabled={actionMutation.isPending}
            >
              Resume
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => actionMutation.mutate({ action: "pause" })}
              disabled={actionMutation.isPending}
            >
              Pause
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => actionMutation.mutate({ action: "cancel" })}
            disabled={actionMutation.isPending}
          >
            Cancel
          </Button>
        </>
      }
    >
      <NavLinks />

      {actionMutation.isError ? (
        <QepErrorState message={(actionMutation.error as Error).message} />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <QepPanel title="Stage">
          <div className="flex flex-wrap items-center gap-2">
            <QepStatusBadge status={i.currentState} />
            {i.paused ? <QepStatusBadge status="paused" /> : null}
            {data.blockedRelease ? <QepStatusBadge status="blocked" /> : null}
          </div>
          {i.previousState ? (
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Previous: {i.previousState}
            </p>
          ) : null}
        </QepPanel>
        <QepPanel title="Next required action">
          <p className="text-sm font-medium">{data.nextAction}</p>
        </QepPanel>
        <QepPanel title="Identity">
          <dl className="space-y-1 text-xs text-[var(--color-muted-foreground)]">
            <div>
              <dt className="inline font-medium text-[var(--color-foreground)]">
                Instance:{" "}
              </dt>
              <dd className="inline">{i.instanceId}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-[var(--color-foreground)]">
                Correlation:{" "}
              </dt>
              <dd className="inline">{i.correlationId}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-[var(--color-foreground)]">
                Definition:{" "}
              </dt>
              <dd className="inline">
                {i.flowDefinitionId}@{i.definitionVersion}
              </dd>
            </div>
          </dl>
        </QepPanel>
        <QepPanel title="Release posture">
          <p className="text-sm">
            {data.blockedRelease
              ? "Blocked — gates, approvals, or exception state prevent release progression."
              : "Clear — no orchestration blockers recorded for this flow."}
          </p>
        </QepPanel>
      </div>

      <QepPanel title="Stage progression">
        {data.allowedTransitions.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No transitions available from the current state.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.allowedTransitions.map((state) => (
              <Button
                key={state}
                type="button"
                size="sm"
                variant="outline"
                disabled={actionMutation.isPending || i.paused}
                onClick={() =>
                  actionMutation.mutate({
                    action: "transition",
                    toState: state,
                    reason: `workspace:advance:${state}`,
                  })
                }
              >
                → {state}
              </Button>
            ))}
          </div>
        )}
      </QepPanel>

      <div className="grid gap-4 lg:grid-cols-3">
        <QepPanel title="Approvals">
          {data.approvals.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No approval bundles linked.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.approvals.map((a) => (
                <li key={a.bundleId}>
                  <QepStatusBadge status={a.finalStatus} />{" "}
                  <span className="text-[var(--color-muted-foreground)]">
                    {a.bundleId}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {data.outstandingApprovals.length > 0 ? (
            <p className="mt-3 text-xs text-amber-700">
              Outstanding:{" "}
              {data.outstandingApprovals.map((o) => o.authorityId).join(", ")}
            </p>
          ) : null}
        </QepPanel>

        <QepPanel title="Evidence">
          {data.evidencePackages.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No evidence integration packages linked.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.evidencePackages.map((e) => (
                <li key={e.evidenceIntegrationPackageId}>
                  <QepStatusBadge status={e.integrationStatus} />{" "}
                  <span className="text-[var(--color-muted-foreground)]">
                    {e.evidenceRefs.length} refs
                  </span>
                </li>
              ))}
            </ul>
          )}
        </QepPanel>

        <QepPanel title="Decision Packages">
          {data.decisions.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No Decision Package for this flow yet.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.decisions.map((d) => (
                <li key={d.decisionPackageId}>
                  <QepStatusBadge status={d.platformConclusion} />{" "}
                  <span className="text-[var(--color-muted-foreground)]">
                    risk {d.residualRisk.residualRiskLevel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </QepPanel>
      </div>

      <QepPanel title="Operational history / timeline">
        {data.timeline.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">No history.</p>
        ) : (
          <ol className="relative space-y-3 border-l border-[var(--color-border)] pl-4">
            {[...data.timeline].reverse().map((t) => (
              <li key={t.transitionId} className="text-sm">
                <div className="font-medium">
                  {t.fromState} → {t.toState}
                </div>
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  {new Date(t.timestamp).toLocaleString()} · {t.actor} · {t.reason}
                </div>
              </li>
            ))}
          </ol>
        )}
      </QepPanel>
    </QepPageShell>
  );
}
