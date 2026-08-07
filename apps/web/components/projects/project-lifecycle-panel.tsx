"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectStatus, formatProjectsDate } from "@/lib/projects/format";
import {
  getClosureReadiness,
  getInitiationReadiness,
  getProjectLifecycle,
  listProjectBaselines,
  rebaselineProject,
  transitionProjectLifecycle,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { projectCreatePath } from "@/lib/projects/routes";
import type { ProjectStatus } from "@/lib/projects/types";

import { ErrorState, LoadingState, StatusBadge } from "./projects-ui";

const CLOSURE_OUTCOMES = [
  { value: "delivered", label: "Delivered" },
  { value: "delivered_with_variance", label: "Delivered with variance" },
  { value: "stopped", label: "Stopped" },
  { value: "superseded", label: "Superseded" },
] as const;

const TRANSITIONS: Record<string, readonly string[]> = {
  draft: ["initiating"],
  initiating: ["active"],
  active: ["on_hold", "closing"],
  on_hold: ["active", "closing"],
  closing: ["closed"],
  closed: ["archived", "active"],
  archived: ["closed"],
};

function fieldClass() {
  return "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2";
}

export function ProjectLifecyclePanel({
  projectId,
  projectStatus,
}: {
  readonly projectId: string;
  readonly projectStatus: ProjectStatus;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [outcome, setOutcome] = useState("");
  const [closureSummary, setClosureSummary] = useState("");
  const [waiverKeys, setWaiverKeys] = useState("");
  const [waiverReason, setWaiverReason] = useState("");
  const [rebaselineReason, setRebaselineReason] = useState("");
  const [rebaselineEnd, setRebaselineEnd] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const lifecycle = useQuery({
    queryKey: projectsQueryKeys.lifecycle(projectId),
    queryFn: ({ signal }) => getProjectLifecycle(projectId, { signal }),
  });

  const stage = String(lifecycle.data?.stage ?? projectStatus);
  const showInitiation = stage === "initiating" || stage === "draft";
  const showClosure = stage === "closing" || stage === "active" || stage === "on_hold";

  const initiation = useQuery({
    queryKey: projectsQueryKeys.initiationReadiness(projectId),
    queryFn: ({ signal }) => getInitiationReadiness(projectId, { signal }),
    enabled: showInitiation,
  });

  const closure = useQuery({
    queryKey: projectsQueryKeys.closureReadiness(projectId),
    queryFn: ({ signal }) => getClosureReadiness(projectId, { signal }),
    enabled: showClosure || stage === "closing",
  });

  const baselines = useQuery({
    queryKey: projectsQueryKeys.baselines(projectId),
    queryFn: ({ signal }) => listProjectBaselines(projectId, { signal }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
  };

  const transition = useMutation({
    mutationFn: (to: string) => {
      const waivers =
        waiverKeys.trim() && waiverReason.trim()
          ? waiverKeys
              .split(/[,\s]+/)
              .map((k) => k.trim())
              .filter(Boolean)
              .map((policyKey) => ({
                policyKey,
                reason: waiverReason.trim(),
              }))
          : undefined;
      return transitionProjectLifecycle(projectId, {
        to,
        reason: reason.trim() || undefined,
        outcome: outcome || undefined,
        closureSummary: closureSummary.trim() || undefined,
        waivers,
      });
    },
    onSuccess: async () => {
      setActionError(null);
      setReason("");
      await invalidate();
    },
    onError: (err: unknown) => {
      setActionError(isProjectsApiError(err) ? err.message : "Transition failed.");
    },
  });

  const rebaseline = useMutation({
    mutationFn: () =>
      rebaselineProject(projectId, {
        reason: rebaselineReason.trim(),
        targetEndAt: rebaselineEnd ? new Date(rebaselineEnd).toISOString() : undefined,
      }),
    onSuccess: async () => {
      setRebaselineReason("");
      setActionError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setActionError(isProjectsApiError(err) ? err.message : "Re-baseline failed.");
    },
  });

  const allowed = TRANSITIONS[stage] ?? [];

  return (
    <div
      className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] p-4"
      data-testid="projects-lifecycle-panel"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Project Lifecycle</h2>
        <StatusBadge status={stage as ProjectStatus} />
      </div>

      {lifecycle.isLoading ? <LoadingState label="Loading lifecycle…" /> : null}
      {lifecycle.isError ? (
        <ErrorState
          message={
            isProjectsApiError(lifecycle.error)
              ? lifecycle.error.message
              : "Lifecycle metadata not found. Create via Initiate wizard."
          }
        />
      ) : null}

      {lifecycle.data ? (
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Stage
            </dt>
            <dd>{formatProjectStatus(stage as ProjectStatus)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Classification
            </dt>
            <dd>{String(lifecycle.data.classification ?? "—")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Delivery model
            </dt>
            <dd>{String(lifecycle.data.deliveryModel ?? "—")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Governance profile
            </dt>
            <dd>
              {String(lifecycle.data.governanceProfileId ?? "—")}
              {lifecycle.data.governanceProfileVersion
                ? ` v${String(lifecycle.data.governanceProfileVersion)}`
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Owner
            </dt>
            <dd>{String(lifecycle.data.ownerUserId ?? "—")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Active baseline
            </dt>
            <dd>{String(lifecycle.data.activeBaselineId ?? "None")}</dd>
          </div>
        </dl>
      ) : null}

      {stage === "draft" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            window.location.href = projectCreatePath(projectId);
          }}
          data-testid="projects-lifecycle-resume-wizard"
        >
          Continue initiation wizard
        </Button>
      ) : null}

      {showInitiation && initiation.data ? (
        <div data-testid="projects-initiation-readiness">
          <p className="text-xs font-medium uppercase text-[var(--color-muted-foreground)]">
            Initiation gate — {initiation.data.ready ? "Ready" : "Blocked"}
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {initiation.data.gaps.map((g) => (
              <li key={g.code}>
                {g.message}
                {g.waivable ? " (waivable)" : ""}
              </li>
            ))}
            {initiation.data.gaps.length === 0 ? <li>All criteria met.</li> : null}
          </ul>
        </div>
      ) : null}

      {(stage === "closing" || stage === "active" || stage === "on_hold") &&
      closure.data ? (
        <div data-testid="projects-closure-readiness">
          <p className="text-xs font-medium uppercase text-[var(--color-muted-foreground)]">
            Closure readiness — {closure.data.ready ? "Ready" : "Blocked"}
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {closure.data.gaps.map((g) => (
              <li key={g.code}>
                {g.message}
                {g.waivable ? ` — waive with key "${g.code}"` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
        <p className="text-xs font-medium uppercase text-[var(--color-muted-foreground)]">
          Explicit transitions only
        </p>
        {(stage === "closing" || allowed.includes("closing")) && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Closure outcome</span>
              <select
                className={fieldClass()}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                data-testid="projects-lifecycle-outcome"
              >
                <option value="">Select outcome</option>
                {CLOSURE_OUTCOMES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Closure summary / evidence"
              value={closureSummary}
              onChange={(e) => setClosureSummary(e.target.value)}
              data-testid="projects-lifecycle-closure-summary"
            />
          </>
        )}
        <Input
          label="Transition reason (required for Hold / Restore / Reopen)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          data-testid="projects-lifecycle-reason"
        />
        <Input
          label="Waiver policy keys (comma-separated, optional)"
          value={waiverKeys}
          onChange={(e) => setWaiverKeys(e.target.value)}
          data-testid="projects-lifecycle-waiver-keys"
        />
        <Input
          label="Waiver reason"
          value={waiverReason}
          onChange={(e) => setWaiverReason(e.target.value)}
          data-testid="projects-lifecycle-waiver-reason"
        />
        <div className="flex flex-wrap gap-2">
          {allowed.map((to) => (
            <Button
              key={to}
              type="button"
              size="sm"
              variant={to === "archived" || to === "on_hold" ? "outline" : "default"}
              disabled={transition.isPending}
              onClick={() => transition.mutate(to)}
              data-testid={`projects-lifecycle-transition-${to}`}
            >
              → {formatProjectStatus(to as ProjectStatus)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
        <p className="text-xs font-medium uppercase text-[var(--color-muted-foreground)]">
          Baselines
        </p>
        {baselines.isLoading ? <LoadingState label="Loading baselines…" /> : null}
        <ul className="text-sm" data-testid="projects-baseline-history">
          {(baselines.data ?? []).map((b) => (
            <li key={String(b.id)}>
              v{String(b.version)} · {String(b.kind)} ·{" "}
              {formatProjectsDate(String(b.createdAt))}
              {b.reason ? ` — ${String(b.reason)}` : ""}
            </li>
          ))}
          {(baselines.data ?? []).length === 0 ? (
            <li className="text-[var(--color-muted-foreground)]">
              No baselines yet. Initial baseline is captured on transition to Active.
            </li>
          ) : null}
        </ul>
        {stage !== "draft" && stage !== "archived" ? (
          <div className="flex flex-col gap-2">
            <Input
              label="Re-baseline reason"
              value={rebaselineReason}
              onChange={(e) => setRebaselineReason(e.target.value)}
              data-testid="projects-rebaseline-reason"
            />
            <Input
              label="New target end"
              type="date"
              value={rebaselineEnd}
              onChange={(e) => setRebaselineEnd(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={rebaseline.isPending || !rebaselineReason.trim()}
              onClick={() => rebaseline.mutate()}
              data-testid="projects-rebaseline-submit"
            >
              Record re-baseline
            </Button>
          </div>
        ) : null}
      </div>

      {actionError ? <ErrorState message={actionError} /> : null}
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Status cannot be edited directly. Archive is only available from Closed; restore
        returns only to Closed.
      </p>
    </div>
  );
}
