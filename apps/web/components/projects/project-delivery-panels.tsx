"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import {
  canManageProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  createProjectAction,
  createProjectDecision,
  createProjectMilestone,
  createProjectRisk,
  getProjectDeliveryDashboard,
  listProjectActions,
  listProjectDecisions,
  listProjectMilestones,
  listProjectRisks,
  updateProjectAction,
  updateProjectMilestone,
  updateProjectRisk,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import type {
  ProjectDeliveryHealthStatus,
  ProjectRiskLevel,
} from "@/lib/projects/types";

import { EmptyState, ErrorState, LoadingState, ProjectsTable } from "./projects-ui";

const LEVELS: readonly ProjectRiskLevel[] = ["low", "medium", "high", "critical"];

function HealthBadge({ status }: { readonly status: ProjectDeliveryHealthStatus }) {
  const label =
    status === "green" ? "Healthy" : status === "amber" ? "At risk" : "Critical";
  const tone =
    status === "green"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : status === "amber"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
        : "bg-red-500/15 text-red-700 dark:text-red-300";
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${tone}`}
      data-testid={`projects-health-${status}`}
    >
      {label}
    </span>
  );
}

function invalidateDelivery(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: projectsQueryKeys.deliveryDashboard(projectId),
    }),
    queryClient.invalidateQueries({
      queryKey: projectsQueryKeys.deliveryHealth(projectId),
    }),
    queryClient.invalidateQueries({
      queryKey: projectsQueryKeys.milestones(projectId),
    }),
    queryClient.invalidateQueries({ queryKey: projectsQueryKeys.risks(projectId) }),
    queryClient.invalidateQueries({ queryKey: projectsQueryKeys.decisions(projectId) }),
    queryClient.invalidateQueries({ queryKey: projectsQueryKeys.actions(projectId) }),
  ]);
}

export function ProjectDeliveryDashboardPanel({
  projectId,
}: {
  readonly projectId: string;
}) {
  const query = useQuery({
    queryKey: projectsQueryKeys.deliveryDashboard(projectId),
    queryFn: ({ signal }) => getProjectDeliveryDashboard(projectId, { signal }),
  });

  if (query.isLoading) return <LoadingState label="Loading delivery dashboard…" />;
  if (query.isError) {
    return (
      <ErrorState
        message={
          isProjectsApiError(query.error)
            ? query.error.message
            : "Unable to load delivery dashboard."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data;
  if (!data) return <EmptyState title="No delivery data" />;

  return (
    <div className="flex flex-col gap-4" data-testid="projects-delivery-dashboard">
      <div className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Overall health
          </p>
          <div className="mt-1">
            <HealthBadge status={data.health.status} />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Milestones
          </p>
          <p className="text-sm font-medium">
            {data.milestoneCompleted}/{data.milestoneTotal} complete
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Risks
          </p>
          <p className="text-sm font-medium">
            {data.openRisks} open · {data.criticalRisks} critical
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Actions
          </p>
          <p className="text-sm font-medium">
            {data.openActions} open · {data.overdueActions} overdue
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] p-4">
        <h3 className="text-sm font-semibold">Health reasons</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {data.health.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
          Schedule {data.health.scheduleScore} · Risks {data.health.riskScore} ·
          Milestones {data.health.milestoneScore} · Actions {data.health.actionScore}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <h3 className="text-sm font-semibold">Blockers</h3>
          {data.blockers.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              No blockers identified.
            </p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {data.blockers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <h3 className="text-sm font-semibold">Upcoming milestones</h3>
          {data.upcomingMilestones.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              No open milestones.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {data.upcomingMilestones.map((ms) => (
                <li key={ms.id}>
                  <span className="font-medium">{ms.name}</span>
                  <span className="text-[var(--color-muted-foreground)]">
                    {" "}
                    · {formatProjectsDate(ms.targetDate)} · {ms.progressPercent}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectMilestonesPanel({
  projectId,
  permissions,
}: {
  readonly projectId: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const queryClient = useQueryClient();
  const canManage = canManageProjects(permissions);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const query = useQuery({
    queryKey: projectsQueryKeys.milestones(projectId),
    queryFn: ({ signal }) => listProjectMilestones(projectId, { signal }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProjectMilestone(projectId, {
        name: name.trim(),
        owner: owner.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      }),
    onSuccess: async () => {
      setName("");
      setOwner("");
      setTargetDate("");
      await invalidateDelivery(queryClient, projectId);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (milestoneId: string) =>
      updateProjectMilestone(projectId, milestoneId, {
        status: "completed",
        progressPercent: 100,
      }),
    onSuccess: async () => invalidateDelivery(queryClient, projectId),
  });

  if (query.isLoading) return <LoadingState label="Loading milestones…" />;
  if (query.isError) {
    return (
      <ErrorState
        message={
          isProjectsApiError(query.error)
            ? query.error.message
            : "Unable to load milestones."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items = query.data ?? [];

  return (
    <div className="flex flex-col gap-4" data-testid="projects-milestones-panel">
      {canManage ? (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) createMutation.mutate();
          }}
        >
          <Input
            label="Milestone"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="projects-milestone-name"
          />
          <Input
            label="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            data-testid="projects-milestone-owner"
          />
          <Input
            label="Target date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            data-testid="projects-milestone-date"
          />
          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending || !name.trim()}
            data-testid="projects-milestone-submit"
          >
            Add milestone
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title="No milestones yet" />
      ) : (
        <ProjectsTable headers={["Name", "Owner", "Target", "Progress", "Status", ""]}>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--color-border)] last:border-0"
            >
              <td className="px-3 py-2 font-medium">{item.name}</td>
              <td className="px-3 py-2">{item.owner ?? "—"}</td>
              <td className="px-3 py-2">{formatProjectsDate(item.targetDate)}</td>
              <td className="px-3 py-2">{item.progressPercent}%</td>
              <td className="px-3 py-2">{item.status}</td>
              <td className="px-3 py-2">
                {canManage && item.status === "open" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={completeMutation.isPending}
                    onClick={() => completeMutation.mutate(item.id)}
                  >
                    Complete
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </ProjectsTable>
      )}
    </div>
  );
}

export function ProjectRisksPanel({
  projectId,
  permissions,
}: {
  readonly projectId: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const queryClient = useQueryClient();
  const canManage = canManageProjects(permissions);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mitigation, setMitigation] = useState("");
  const [owner, setOwner] = useState("");
  const [probability, setProbability] = useState<ProjectRiskLevel>("medium");
  const [impact, setImpact] = useState<ProjectRiskLevel>("medium");

  const query = useQuery({
    queryKey: projectsQueryKeys.risks(projectId),
    queryFn: ({ signal }) => listProjectRisks(projectId, { signal }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProjectRisk(projectId, {
        title: title.trim(),
        description: description.trim(),
        mitigation: mitigation.trim(),
        owner: owner.trim(),
        probability,
        impact,
      }),
    onSuccess: async () => {
      setTitle("");
      setDescription("");
      setMitigation("");
      setOwner("");
      await invalidateDelivery(queryClient, projectId);
    },
  });

  const closeMutation = useMutation({
    mutationFn: (riskId: string) =>
      updateProjectRisk(projectId, riskId, { status: "closed" }),
    onSuccess: async () => invalidateDelivery(queryClient, projectId),
  });

  if (query.isLoading) return <LoadingState label="Loading risks…" />;
  if (query.isError) {
    return (
      <ErrorState
        message={
          isProjectsApiError(query.error)
            ? query.error.message
            : "Unable to load risks."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items = query.data ?? [];

  return (
    <div className="flex flex-col gap-4" data-testid="projects-risks-panel">
      {canManage ? (
        <form
          className="grid gap-2 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (
              title.trim() &&
              description.trim() &&
              mitigation.trim() &&
              owner.trim()
            ) {
              createMutation.mutate();
            }
          }}
        >
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="projects-risk-title"
          />
          <Input
            label="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            data-testid="projects-risk-owner"
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-testid="projects-risk-description"
          />
          <Input
            label="Mitigation"
            value={mitigation}
            onChange={(e) => setMitigation(e.target.value)}
            data-testid="projects-risk-mitigation"
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Probability</span>
            <select
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
              value={probability}
              onChange={(e) => setProbability(e.target.value as ProjectRiskLevel)}
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Impact</span>
            <select
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
              value={impact}
              onChange={(e) => setImpact(e.target.value as ProjectRiskLevel)}
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              data-testid="projects-risk-submit"
            >
              Add risk
            </Button>
          </div>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title="No risks recorded" />
      ) : (
        <ProjectsTable headers={["Title", "P/I", "Owner", "Status", "Mitigation", ""]}>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--color-border)] last:border-0"
            >
              <td className="px-3 py-2 font-medium">{item.title}</td>
              <td className="px-3 py-2 text-xs">
                {item.probability}/{item.impact}
              </td>
              <td className="px-3 py-2">{item.owner}</td>
              <td className="px-3 py-2">{item.status}</td>
              <td className="px-3 py-2">{item.mitigation}</td>
              <td className="px-3 py-2">
                {canManage && item.status !== "closed" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => closeMutation.mutate(item.id)}
                  >
                    Close
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </ProjectsTable>
      )}
    </div>
  );
}

export function ProjectDecisionsPanel({
  projectId,
  permissions,
}: {
  readonly projectId: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const queryClient = useQueryClient();
  const canManage = canManageProjects(permissions);
  const [decision, setDecision] = useState("");
  const [rationale, setRationale] = useState("");
  const [owner, setOwner] = useState("");
  const [outcome, setOutcome] = useState("");
  const [relatedWork, setRelatedWork] = useState("");

  const query = useQuery({
    queryKey: projectsQueryKeys.decisions(projectId),
    queryFn: ({ signal }) => listProjectDecisions(projectId, { signal }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProjectDecision(projectId, {
        decision: decision.trim(),
        rationale: rationale.trim(),
        owner: owner.trim(),
        outcome: outcome.trim(),
        relatedWork: relatedWork.trim() || undefined,
      }),
    onSuccess: async () => {
      setDecision("");
      setRationale("");
      setOwner("");
      setOutcome("");
      setRelatedWork("");
      await invalidateDelivery(queryClient, projectId);
    },
  });

  if (query.isLoading) return <LoadingState label="Loading decisions…" />;
  if (query.isError) {
    return (
      <ErrorState
        message={
          isProjectsApiError(query.error)
            ? query.error.message
            : "Unable to load decisions."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items = query.data ?? [];

  return (
    <div className="flex flex-col gap-4" data-testid="projects-decisions-panel">
      {canManage ? (
        <form
          className="grid gap-2 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (decision.trim() && rationale.trim() && owner.trim() && outcome.trim()) {
              createMutation.mutate();
            }
          }}
        >
          <Input
            label="Decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            data-testid="projects-decision-text"
          />
          <Input
            label="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            data-testid="projects-decision-owner"
          />
          <Input
            label="Rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            data-testid="projects-decision-rationale"
          />
          <Input
            label="Outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            data-testid="projects-decision-outcome"
          />
          <Input
            label="Related work"
            value={relatedWork}
            onChange={(e) => setRelatedWork(e.target.value)}
            data-testid="projects-decision-related"
          />
          <div className="flex items-end">
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              data-testid="projects-decision-submit"
            >
              Record decision
            </Button>
          </div>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title="No decisions recorded" />
      ) : (
        <ProjectsTable headers={["Decision", "Owner", "Date", "Outcome", "Related"]}>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--color-border)] last:border-0"
            >
              <td className="px-3 py-2 font-medium">{item.decision}</td>
              <td className="px-3 py-2">{item.owner}</td>
              <td className="px-3 py-2">{formatProjectsDate(item.decidedAt)}</td>
              <td className="px-3 py-2">{item.outcome}</td>
              <td className="px-3 py-2">{item.relatedWork ?? "—"}</td>
            </tr>
          ))}
        </ProjectsTable>
      )}
    </div>
  );
}

export function ProjectActionsPanel({
  projectId,
  permissions,
}: {
  readonly projectId: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const queryClient = useQueryClient();
  const canManage = canManageProjects(permissions);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");

  const query = useQuery({
    queryKey: projectsQueryKeys.actions(projectId),
    queryFn: ({ signal }) => listProjectActions(projectId, { signal }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProjectAction(projectId, {
        title: title.trim(),
        owner: owner.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      }),
    onSuccess: async () => {
      setTitle("");
      setOwner("");
      setDueDate("");
      await invalidateDelivery(queryClient, projectId);
    },
  });

  const doneMutation = useMutation({
    mutationFn: (actionId: string) =>
      updateProjectAction(projectId, actionId, { status: "done" }),
    onSuccess: async () => invalidateDelivery(queryClient, projectId),
  });

  if (query.isLoading) return <LoadingState label="Loading actions…" />;
  if (query.isError) {
    return (
      <ErrorState
        message={
          isProjectsApiError(query.error)
            ? query.error.message
            : "Unable to load actions."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items = query.data ?? [];

  return (
    <div className="flex flex-col gap-4" data-testid="projects-actions-panel">
      {canManage ? (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (title.trim() && owner.trim()) createMutation.mutate();
          }}
        >
          <Input
            label="Action"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="projects-action-title"
          />
          <Input
            label="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            data-testid="projects-action-owner"
          />
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            data-testid="projects-action-due"
          />
          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending || !title.trim() || !owner.trim()}
            data-testid="projects-action-submit"
          >
            Add action
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title="No governance actions" />
      ) : (
        <ProjectsTable headers={["Action", "Owner", "Due", "Status", ""]}>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--color-border)] last:border-0"
            >
              <td className="px-3 py-2 font-medium">{item.title}</td>
              <td className="px-3 py-2">{item.owner}</td>
              <td className="px-3 py-2">{formatProjectsDate(item.dueDate)}</td>
              <td className="px-3 py-2">{item.status}</td>
              <td className="px-3 py-2">
                {canManage && item.status === "open" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => doneMutation.mutate(item.id)}
                  >
                    Done
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </ProjectsTable>
      )}
    </div>
  );
}
