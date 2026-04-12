"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAdminInspector } from "@/features/admin/admin-inspector-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { RealizationPill } from "@/features/admin/access/realization-pill";
import { SourcePill } from "@/features/admin/access/source-pill";
import { LaunchReadinessPill } from "@/features/workspace/launch-readiness-pill";
import { readMatrixPostureFromModel } from "@/lib/launch/workspace-launch-bridge";
import { resolveLaunchDecision } from "@/lib/launch/resolve-launch-decision";
import { effectiveLauncherVisibleForSubject } from "@/lib/workspace/launcher-semantics";
import {
  defaultWorkspaceConfig,
  isServiceAllowed,
  workspaceServiceIdSchema,
} from "@/lib/workspace/workspace-config";
import {
  isSelectionEmpty,
  parseMatrixCellId,
  selectProvisioningJob,
  type AdminInspectorAction,
} from "@/lib/admin/admin-inspector-selection";
import { cn } from "@/lib/utils";
import type { AdminHomeData } from "@/lib/admin/mock-admin-home-data";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";
import type { ProvisioningAttemptSummary } from "@/lib/provisioning/repository/jobs-repository";
import {
  InspectorDirectoryBundleEditor,
  InspectorMatrixServiceOverride,
} from "@/features/admin/admin-inspector-access-forms";

function isPersistedPortalUser(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function isProvisioningJobUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function ProvisioningJobAttemptSummaryBlock({ jobId }: { jobId: string }) {
  const enabled = isProvisioningJobUuid(jobId);
  const q = useQuery({
    queryKey: ["admin-provisioning-job-summary", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/provisioning/jobs/${encodeURIComponent(jobId)}/summary`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`summary ${res.status}`);
      }
      return (await res.json()) as ProvisioningAttemptSummary;
    },
    enabled,
    staleTime: 5_000,
  });

  if (!enabled) {
    return (
      <p className="text-[0.65rem] text-muted-foreground">
        Attempt history is only available for DB-backed jobs (UUID ids).
      </p>
    );
  }
  if (q.isLoading) {
    return <p className="text-[0.65rem] text-muted-foreground">Loading attempts…</p>;
  }
  if (q.isError || !q.data) {
    return null;
  }
  const s = q.data;
  return (
    <div className="space-y-1 border-t border-border pt-2 text-[0.65rem] text-muted-foreground">
      <p className="font-semibold uppercase tracking-wide text-foreground">Attempts</p>
      <p>
        <span className="font-mono text-foreground">{s.attemptCount}</span> recorded
      </p>
      {s.lastOutcome ? (
        <p>
          Last outcome: <span className="font-mono text-foreground">{s.lastOutcome}</span>
          {s.lastAttemptFinishedAt ? (
            <>
              {" "}
              at <span className="font-mono text-foreground">{s.lastAttemptFinishedAt}</span>
            </>
          ) : null}
        </p>
      ) : null}
      {s.lastErrorCode || s.lastErrorMessage ? (
        <p className="text-destructive">
          {s.lastErrorCode ? <span className="font-mono">{s.lastErrorCode}</span> : null}
          {s.lastErrorCode && s.lastErrorMessage ? " — " : null}
          {s.lastErrorMessage ?? ""}
        </p>
      ) : null}
    </div>
  );
}

function NoneSummary({ homeData }: { homeData: AdminHomeData }) {
  return (
    <div className="space-y-2 text-xs text-muted-foreground">
      <p className="font-medium text-foreground">Control plane</p>
      <p>
        Select an alert, queue row, audit event, user, matrix cell, or provisioning job. Overall status:{" "}
        <span className="font-mono uppercase text-foreground">{homeData.health.overall}</span>.
      </p>
    </div>
  );
}

type AdminInspectorPanelProps = {
  homeData: AdminHomeData;
  accessData: AdminAccessData;
  provisioningJobs: AdminProvisioningJob[];
};

export function AdminInspectorPanel({ homeData, accessData, provisioningJobs }: AdminInspectorPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selection, clearSelection, setSelection } = useAdminInspector();

  function runInspectorAction(actionId: string) {
    if (actionId === "open_matrix" && selection.kind === "directory_user" && selection.id) {
      router.push(`/admin/access?user=${encodeURIComponent(selection.id)}`);
      return;
    }
    if (actionId === "open_user" && selection.kind === "matrix_cell" && selection.id) {
      const parsed = parseMatrixCellId(selection.id);
      if (parsed) {
        router.push(`/admin/users?focus=${encodeURIComponent(parsed.userId)}`);
      }
      return;
    }
    if (actionId === "open_job" && selection.kind === "matrix_cell" && selection.id) {
      const parsed = parseMatrixCellId(selection.id);
      if (parsed) {
        const cell = accessData.matrix.cells.find(
          (c) => c.userId === parsed.userId && c.serviceId === parsed.serviceId,
        );
        if (cell?.activeJobId) {
          router.push(`/admin/provisioning?job=${encodeURIComponent(cell.activeJobId)}`);
        }
      }
      return;
    }
    if (actionId === "open_provisioning_queue") {
      router.push("/admin/provisioning");
    }
  }

  async function runProvisioningJobAction(action: AdminInspectorAction) {
    if (action.disabled || selection.kind !== "provisioning_job" || !selection.id) {
      return;
    }
    if (action.id === "retry") {
      const res = await fetch(`/api/admin/provisioning/jobs/${encodeURIComponent(selection.id)}/retry`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const body = (await res.json()) as { job: AdminProvisioningJob };
        setSelection(selectProvisioningJob(body.job));
        await queryClient.invalidateQueries({ queryKey: ["admin-provisioning-jobs"] });
      }
      return;
    }
    if (action.id === "mark_resolved") {
      const res = await fetch(`/api/admin/provisioning/jobs/${encodeURIComponent(selection.id)}/resolve`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        clearSelection();
        await queryClient.invalidateQueries({ queryKey: ["admin-provisioning-jobs"] });
      }
      return;
    }
    if (action.id === "view_detail") {
      router.push("/admin/provisioning");
    }
  }

  if (isSelectionEmpty(selection)) {
    return <NoneSummary homeData={homeData} />;
  }

  if (selection.kind === "home_alert") {
    const item = homeData.alerts.find((a) => a.id === selection.id);
    if (!item) {
      return <EmptyState title="Alert not found" description="Selection may be stale." />;
    }
    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Alert</p>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-muted-foreground">{item.summary}</p>
            <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">
              severity={item.severity} status={selection.status ?? "—"}
            </p>
            {item.domain ? (
              <p className="mt-1 font-mono text-[0.6rem] text-muted-foreground">domain={item.domain}</p>
            ) : null}
            {item.pointerKind && item.pointerKind !== "none" ? (
              <p className="mt-1 font-mono text-[0.6rem] text-muted-foreground">
                pointer={item.pointerKind}
                {item.pointerId ? ` id=${item.pointerId}` : ""}
                {item.pointerRoute ? ` route=${item.pointerRoute}` : ""}
              </p>
            ) : null}
            {item.recoveryHint ? (
              <p className="mt-1 text-[0.65rem] text-muted-foreground" data-testid="admin-alert-recovery-hint">
                {item.recoveryHint}
              </p>
            ) : null}
          </div>
          <Button type="button" size="xs" variant="outline" onClick={clearSelection}>
            Clear
          </Button>
        </div>
        {item.ctaLabel ? (
          item.ctaHref && !item.blocked ? (
            item.ctaHref.startsWith("/") ? (
              <Link
                href={item.ctaHref}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "inline-flex w-full justify-center")}
              >
                {item.ctaLabel}
              </Link>
            ) : (
              <a
                href={item.ctaHref}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "inline-flex w-full justify-center")}
              >
                {item.ctaLabel}
              </a>
            )
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full"
              disabled={item.blocked || !item.ctaHref}
              title={
                item.blocked
                  ? "Complete prerequisites before this action is available."
                  : !item.ctaHref
                    ? "No destination configured."
                    : undefined
              }
            >
              {item.ctaLabel}
            </Button>
          )
        ) : null}
      </div>
    );
  }

  if (selection.kind === "home_queue") {
    const row = homeData.provisioning.rows.find((r) => r.id === selection.id);
    if (!row) {
      return <EmptyState title="Queue item not found" description="Selection may be stale." />;
    }
    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Provisioning</p>
            <p className="text-sm font-semibold text-foreground">{row.tenantLabel}</p>
            <p className="mt-1 text-muted-foreground">{row.requestType}</p>
            <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">
              stage={row.stage} updated={row.updatedAt}
            </p>
          </div>
          <Button type="button" size="xs" variant="outline" onClick={clearSelection}>
            Clear
          </Button>
        </div>
        {selection.actions.map((a) => (
          <Button
            key={a.id}
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            disabled={a.disabled}
            title={a.disabledReason}
            onClick={() => !a.disabled && runInspectorAction(a.id)}
          >
            {a.label}
          </Button>
        ))}
      </div>
    );
  }

  if (selection.kind === "home_audit") {
    const ev = homeData.audit.events.find((e) => e.id === selection.id);
    if (!ev) {
      return <EmptyState title="Event not found" description="Selection may be stale." />;
    }
    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="font-mono text-[0.65rem] leading-relaxed">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Audit</p>
            <p className="text-foreground">{ev.at}</p>
            <p className="text-muted-foreground">
              {ev.actor} · {ev.verb} → {ev.target}
            </p>
            <p className="mt-1 text-[0.6rem] text-muted-foreground">
              domain={ev.domain} outcome={ev.outcome}
            </p>
            {ev.contextSummary ? <p className="mt-1 text-muted-foreground">{ev.contextSummary}</p> : null}
            {ev.metadata ? <p className="mt-1 text-muted-foreground/90">{ev.metadata}</p> : null}
          </div>
          <Button type="button" size="xs" variant="outline" onClick={clearSelection}>
            Clear
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/admin/audit" className="text-[0.65rem] font-medium text-primary underline">
            Open full audit log
          </Link>
          <Link href="/admin/launch" className="text-[0.65rem] font-medium text-primary underline">
            Launch events (persisted)
          </Link>
        </div>
      </div>
    );
  }

  if (selection.kind === "directory_user" && selection.id) {
    const userId = selection.id;
    const detail = accessData.userAccessByUserId[userId];
    if (!detail) {
      return <EmptyState title="User not found" description="Selection may be stale." />;
    }
    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">User access</p>
            <p className="text-sm font-semibold text-foreground">{detail.displayName}</p>
            <p className="text-muted-foreground">{detail.email}</p>
            <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">role={detail.platformRole}</p>
          </div>
          <Button type="button" size="xs" variant="outline" onClick={clearSelection}>
            Clear
          </Button>
        </div>
        <div className="space-y-1 border-t border-border pt-2">
          <p className="font-medium text-foreground">Bundles</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {detail.bundleAssignments.map((b) => (
              <li key={b.bundleId}>
                {b.bundleName} <span className="font-mono text-[0.65rem]">({b.bundleId})</span>
              </li>
            ))}
          </ul>
          {isPersistedPortalUser(userId) ? (
            <InspectorDirectoryBundleEditor
              userId={userId}
              accessData={accessData}
              currentBundleIds={detail.bundleAssignments.map((b) => b.bundleId)}
            />
          ) : (
            <p className="text-[0.65rem] text-muted-foreground">
              Bundle edits apply to portal users (UUID ids) with real access rows.
            </p>
          )}
        </div>
        <div className="space-y-1 border-t border-border pt-2">
          <p className="font-medium text-foreground">Service access</p>
          <ul className="space-y-2">
            {detail.serviceAccess.map((s) => (
              <li key={s.serviceId} className="rounded border border-border/80 p-2">
                <div className="flex flex-wrap items-center gap-1 text-[0.65rem]">
                  <span className="font-medium text-foreground">{s.serviceName}</span>
                  <span className="font-mono text-muted-foreground">effective={s.effectiveRole}</span>
                  <SourcePill source={s.source} />
                  <RealizationPill status={s.realizationStatus} />
                </div>
                {s.activeJobId ? (
                  <p className="mt-1 font-mono text-[0.6rem] text-muted-foreground">job={s.activeJobId}</p>
                ) : null}
                {s.lastJobSummary ? (
                  <p className="mt-0.5 text-[0.6rem] text-muted-foreground">{s.lastJobSummary}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-1 border-t border-border pt-2">
          <p className="font-medium text-foreground">Launch readiness (workspace)</p>
          <p className="text-[0.6rem] text-muted-foreground">
            Mock default tenant launcher — readiness is launch-specific, not the same as realization or job status.
          </p>
          <ul className="space-y-1">
            {workspaceServiceIdSchema.options.map((sid) => {
              const { effectiveRole, realization } = readMatrixPostureFromModel(accessData, userId, sid);
              const launch = resolveLaunchDecision({
                serviceId: sid,
                tenantAllowsService: isServiceAllowed(defaultWorkspaceConfig, sid),
                launcherShowsService: effectiveLauncherVisibleForSubject(
                  defaultWorkspaceConfig,
                  detail.platformRole,
                ).includes(sid),
                effectiveRole,
                realization,
              });
              return (
                <li
                  key={sid}
                  data-testid={`admin-inspector-launch-row-${sid}`}
                  className="flex flex-wrap items-center gap-2 rounded border border-border/60 px-2 py-1 text-[0.65rem]"
                >
                  <span className="font-mono text-muted-foreground">{sid}</span>
                  <LaunchReadinessPill readiness={launch.readiness} />
                  <span className="text-muted-foreground">{launch.userMessage}</span>
                  {launch.operatorMessage && launch.operatorMessage !== launch.userMessage ? (
                    <span className="block text-[0.6rem] text-muted-foreground/90">{launch.operatorMessage}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex flex-col gap-1 border-t border-border pt-2">
          {selection.actions.map((a) => (
            <Button
              key={a.id}
              type="button"
              size="sm"
              variant="secondary"
              disabled={a.disabled}
              title={a.disabledReason}
              onClick={() => !a.disabled && runInspectorAction(a.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (selection.kind === "matrix_cell" && selection.id) {
    const parsed = parseMatrixCellId(selection.id);
    if (!parsed) {
      return <EmptyState title="Invalid selection" description="Matrix cell id is malformed." />;
    }
    const cell = accessData.matrix.cells.find(
      (c) => c.userId === parsed.userId && c.serviceId === parsed.serviceId,
    );
    if (!cell) {
      return <EmptyState title="Cell not found" description="Selection may be stale." />;
    }
    const user = accessData.directory.users.find((u) => u.id === parsed.userId);
    const svc = accessData.matrix.services.find((s) => s.id === parsed.serviceId);
    const workspaceSvc = workspaceServiceIdSchema.safeParse(parsed.serviceId);
    const cellPlatformRole = user?.platformRole ?? "user";
    const matrixLaunch = workspaceSvc.success
      ? resolveLaunchDecision({
          serviceId: workspaceSvc.data,
          tenantAllowsService: isServiceAllowed(defaultWorkspaceConfig, workspaceSvc.data),
          launcherShowsService: effectiveLauncherVisibleForSubject(
            defaultWorkspaceConfig,
            cellPlatformRole,
          ).includes(workspaceSvc.data),
          ...readMatrixPostureFromModel(accessData, parsed.userId, workspaceSvc.data),
        })
      : null;
    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Matrix cell</p>
            <p className="text-sm font-semibold text-foreground">{user?.displayName ?? parsed.userId}</p>
            <p className="text-muted-foreground">{svc?.name ?? parsed.serviceId}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="font-mono text-[0.65rem] text-muted-foreground">effective={cell.effectiveRole}</span>
              <SourcePill source={cell.sourceVisibility} />
              {cell.realizationStatus ? <RealizationPill status={cell.realizationStatus} /> : null}
            </div>
            {cell.activeJobId ? (
              <p className="mt-1 font-mono text-[0.6rem] text-muted-foreground">job={cell.activeJobId}</p>
            ) : null}
          </div>
          <Button type="button" size="xs" variant="outline" onClick={clearSelection}>
            Clear
          </Button>
        </div>
        {matrixLaunch ? (
          <div className="border-t border-border pt-2" data-testid="admin-inspector-matrix-launch">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Launch (tile)</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <LaunchReadinessPill readiness={matrixLaunch.readiness} />
              <span className="text-muted-foreground">{matrixLaunch.userMessage}</span>
              {matrixLaunch.operatorMessage && matrixLaunch.operatorMessage !== matrixLaunch.userMessage ? (
                <span className="block text-[0.6rem] text-muted-foreground/90">{matrixLaunch.operatorMessage}</span>
              ) : null}
            </div>
          </div>
        ) : null}
        {isPersistedPortalUser(parsed.userId) ? (
          <InspectorMatrixServiceOverride
            userId={parsed.userId}
            serviceId={parsed.serviceId}
            cell={cell}
            serviceDetail={accessData.serviceDetailsById[parsed.serviceId]}
          />
        ) : (
          <p className="border-t border-border pt-2 text-[0.65rem] text-muted-foreground">
            Service override controls apply to portal users (UUID ids).
          </p>
        )}
        <div className="flex flex-col gap-1">
          {selection.actions.map((a) => (
            <Button
              key={a.id}
              type="button"
              size="sm"
              variant="secondary"
              disabled={a.disabled}
              title={a.disabledReason}
              onClick={() => !a.disabled && runInspectorAction(a.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (selection.kind === "provisioning_job" && selection.id) {
    const job = provisioningJobs.find((j) => j.id === selection.id);
    if (!job) {
      return <EmptyState title="Job not found" description="It may have been superseded. Open the provisioning queue." />;
    }
    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Provisioning job</p>
            <p className="font-mono text-[0.65rem] text-foreground">{job.id}</p>
            <p className="text-sm font-semibold text-foreground">{job.subjectLabel}</p>
            <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">
              type={job.jobType} status={job.status} retries={job.retryCount}
            </p>
            {job.jobStatusExplanation ? (
              <p className="mt-1 text-[0.65rem] leading-snug text-muted-foreground">{job.jobStatusExplanation}</p>
            ) : null}
            {job.connectorId ? (
              <div className="mt-2 space-y-0.5 rounded border border-border/80 bg-muted/20 px-2 py-1.5 text-[0.65rem] text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Connector</span>{" "}
                  <span className="font-mono">{job.connectorId}</span>
                  {job.connectorProfile ? (
                    <span className="text-muted-foreground"> · profile {job.connectorProfile}</span>
                  ) : null}
                </p>
                {job.connectorCapabilitySummary ? (
                  <p>
                    <span className="font-medium text-foreground">Capabilities</span> {job.connectorCapabilitySummary}
                  </p>
                ) : null}
                {job.lastVerificationSnippet ? (
                  <p className="font-mono text-[0.6rem] break-all text-foreground/90">
                    <span className="font-sans font-medium text-foreground">Last verification</span>{" "}
                    {job.lastVerificationSnippet}
                  </p>
                ) : null}
              </div>
            ) : null}
            {job.failureMessage ? (
              <p className="mt-1 text-[0.65rem] text-destructive">{job.failureMessage}</p>
            ) : null}
          </div>
          <Button type="button" size="xs" variant="outline" onClick={clearSelection}>
            Clear
          </Button>
        </div>
        <ProvisioningJobAttemptSummaryBlock jobId={job.id} />
        <div className="flex flex-col gap-1 border-t border-border pt-2">
          {selection.actions.map((a) => (
            <Button
              key={a.id}
              type="button"
              size="sm"
              variant="secondary"
              disabled={a.disabled}
              title={a.disabledReason}
              onClick={() => void runProvisioningJobAction(a)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return <NoneSummary homeData={homeData} />;
}
