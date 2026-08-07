"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createBusinessJourney,
  createProcessInstance,
  getBusinessJourney,
  getProcessMonitoring,
  instantiateProcessTemplate,
  listBusinessJourneys,
  listJourneyAudit,
  listProcessTemplates,
  transitionJourneyGovernance,
  updateBusinessJourney,
  type BusinessProcessPublicationStatus,
} from "@/lib/workflow/business-process-api";
import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canManageBusinessProcesses,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import {
  workflowJourneyDetailPath,
  workflowJourneysPath,
  workflowMonitoringPath,
  workflowTemplatesPath,
} from "@/lib/workflow/routes";

import { EnterpriseContextPanel } from "@/components/context/enterprise-context-panel";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  WORKFLOW_PRODUCT_NAME,
  WorkflowWorkspaceFrame,
} from "./workflow-ui";

const queryKeys = {
  journeys: ["workflow", "business-journeys"] as const,
  journey: (id: string) => ["workflow", "business-journeys", id] as const,
  templates: ["workflow", "process-templates"] as const,
  monitoring: (id?: string) => ["workflow", "process-monitoring", id ?? "all"] as const,
  audit: (id: string) => ["workflow", "business-journeys", id, "audit"] as const,
};

function StatusChip({ status }: { readonly status: BusinessProcessPublicationStatus }) {
  return (
    <span
      className="inline-flex rounded-md bg-[var(--color-muted)] px-2 py-0.5 text-xs font-medium uppercase"
      data-testid={`workflow-publication-${status}`}
    >
      {status}
    </span>
  );
}

export function WorkflowBusinessJourneysView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageBusinessProcesses(permissions);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [owner, setOwner] = useState("");
  const [steward, setSteward] = useState("");

  const query = useQuery({
    queryKey: queryKeys.journeys,
    queryFn: ({ signal }) => listBusinessJourneys({ signal }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createBusinessJourney({
        name: name.trim(),
        summary: summary.trim(),
        processOwner: owner.trim(),
        businessSteward: steward.trim(),
        stages: [
          { name: "Start", order: 1, responsibility: owner.trim() || "Owner" },
          { name: "Complete", order: 2, responsibility: steward.trim() || "Steward" },
        ],
        outcomes: ["Complete"],
      }),
    onSuccess: async (created) => {
      setName("");
      setSummary("");
      setOwner("");
      setSteward("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.journeys });
      router.push(workflowJourneyDetailPath(created.id));
    },
  });

  return (
    <PageShell
      title="Business journeys"
      description="Design and maintain business journeys — stages, transitions, and outcomes in business language."
      breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Journeys"]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowTemplatesPath())}
          >
            Template library
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowMonitoringPath())}
          >
            Process monitoring
          </Button>
        </div>
      }
    >
      {canManage ? (
        <form
          className="mb-4 grid gap-2 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2"
          data-testid="workflow-journey-create"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim() && summary.trim() && owner.trim() && steward.trim()) {
              createMutation.mutate();
            }
          }}
        >
          <Input
            label="Journey name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="workflow-journey-name"
          />
          <Input
            label="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            data-testid="workflow-journey-summary"
          />
          <Input
            label="Process owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            data-testid="workflow-journey-owner"
          />
          <Input
            label="Business steward"
            value={steward}
            onChange={(e) => setSteward(e.target.value)}
            data-testid="workflow-journey-steward"
          />
          <div className="md:col-span-2">
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              data-testid="workflow-journey-submit"
            >
              Create journey
            </Button>
          </div>
        </form>
      ) : null}

      {query.isLoading ? <LoadingState label="Loading journeys…" /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load business journeys."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.isSuccess ? (
        query.data.length === 0 ? (
          <EmptyState
            title="No journeys yet"
            description="Create a journey or start from a template in the library."
          />
        ) : (
          <ul
            className="grid gap-3 md:grid-cols-2"
            data-testid="workflow-journey-catalogue"
          >
            {query.data.map((journey) => (
              <li key={journey.id}>
                <button
                  type="button"
                  className="flex h-full w-full flex-col rounded-lg border border-[var(--color-border)] px-4 py-3 text-left hover:bg-[var(--color-muted)]/30"
                  data-testid={`workflow-journey-${journey.id}`}
                  onClick={() => router.push(workflowJourneyDetailPath(journey.id))}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{journey.name}</span>
                    <StatusChip status={journey.publicationStatus} />
                  </span>
                  <span className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    {journey.summary}
                  </span>
                  <span className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                    Owner {journey.processOwner} · v{journey.version}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </PageShell>
  );
}

export function WorkflowBusinessJourneyDetailView({
  journeyId,
  permissions,
}: {
  readonly journeyId: string;
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageBusinessProcesses(permissions);
  const [stageName, setStageName] = useState("");
  const [instanceTitle, setInstanceTitle] = useState("");

  const query = useQuery({
    queryKey: queryKeys.journey(journeyId),
    queryFn: ({ signal }) => getBusinessJourney(journeyId, { signal }),
  });

  const auditQuery = useQuery({
    queryKey: queryKeys.audit(journeyId),
    queryFn: ({ signal }) => listJourneyAudit(journeyId, { signal }),
  });

  const monitoringQuery = useQuery({
    queryKey: queryKeys.monitoring(journeyId),
    queryFn: ({ signal }) => getProcessMonitoring(journeyId, { signal }),
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.journey(journeyId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.journeys }),
      queryClient.invalidateQueries({ queryKey: queryKeys.audit(journeyId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monitoring(journeyId) }),
    ]);
  };

  const addStageMutation = useMutation({
    mutationFn: async () => {
      const journey = query.data;
      if (!journey) throw new Error("missing");
      return updateBusinessJourney(journeyId, {
        stages: [
          ...journey.stages,
          {
            name: stageName.trim(),
            order: journey.stages.length + 1,
            responsibility: journey.processOwner,
          },
        ],
      });
    },
    onSuccess: async () => {
      setStageName("");
      await invalidate();
    },
  });

  const governanceMutation = useMutation({
    mutationFn: (publicationStatus: BusinessProcessPublicationStatus) =>
      transitionJourneyGovernance(journeyId, { publicationStatus }),
    onSuccess: async () => invalidate(),
  });

  const instanceMutation = useMutation({
    mutationFn: () =>
      createProcessInstance({
        journeyId,
        title: instanceTitle.trim(),
      }),
    onSuccess: async () => {
      setInstanceTitle("");
      await invalidate();
    },
  });

  if (query.isLoading) {
    return (
      <PageShell title="Journey" breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Journeys"]}>
        <LoadingState />
      </PageShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageShell
        title="Journey not found"
        breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Journeys"]}
      >
        <EmptyState
          title="Unknown journey"
          description="Choose a business journey from the catalogue."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(workflowJourneysPath())}
            >
              Open catalogue
            </Button>
          }
        />
      </PageShell>
    );
  }

  const journey = query.data;

  return (
    <PageShell
      title={journey.name}
      description={journey.summary}
      breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Journeys", journey.name]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(workflowJourneysPath())}
        >
          All journeys
        </Button>
      }
    >
      <WorkflowWorkspaceFrame
        context={
          <EnterpriseContextPanel
            focusType="workflow"
            focusId={journeyId}
            focusName={journey.name}
          />
        }
      >
        <div
          className="grid gap-4 lg:grid-cols-2"
          data-testid="workflow-journey-detail"
        >
          <section className="rounded-lg border border-[var(--color-border)] p-4">
            <h2 className="text-sm font-semibold">Process ownership</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Process owner</dt>
                <dd>{journey.processOwner}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">
                  Business steward
                </dt>
                <dd>{journey.businessSteward}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Version</dt>
                <dd>v{journey.version}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Publication</dt>
                <dd>
                  <StatusChip status={journey.publicationStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Review cycle</dt>
                <dd>
                  {journey.reviewCycleDays
                    ? `${journey.reviewCycleDays} days`
                    : "Not set"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-[var(--color-border)] p-4">
            <h2 className="text-sm font-semibold">Outcomes</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
              {journey.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ol>
          </section>

          <section className="rounded-lg border border-[var(--color-border)] p-4 lg:col-span-2">
            <h2 className="text-sm font-semibold">Stages</h2>
            <ol className="mt-3 space-y-3">
              {[...journey.stages]
                .sort((a, b) => a.order - b.order)
                .map((stage) => (
                  <li
                    key={stage.id}
                    className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
                  >
                    <div className="font-medium">
                      {stage.order}. {stage.name}
                    </div>
                    <div className="text-[var(--color-muted-foreground)]">
                      {stage.responsibility
                        ? `Responsibility: ${stage.responsibility}`
                        : null}
                      {stage.entryCondition
                        ? ` · Entry: ${stage.entryCondition}`
                        : null}
                      {stage.exitCondition ? ` · Exit: ${stage.exitCondition}` : null}
                    </div>
                  </li>
                ))}
            </ol>
            {journey.transitions.length > 0 ? (
              <>
                <h3 className="mt-4 text-sm font-semibold">Transitions</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted-foreground)]">
                  {journey.transitions.map((t) => (
                    <li key={t.id}>
                      {t.name}
                      {t.outcome ? ` → ${t.outcome}` : ""}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {canManage && journey.publicationStatus !== "retired" ? (
              <form
                className="mt-4 flex flex-wrap items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (stageName.trim()) addStageMutation.mutate();
                }}
              >
                <Input
                  label="Add stage"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  data-testid="workflow-stage-name"
                />
                <Button type="submit" size="sm" disabled={addStageMutation.isPending}>
                  Add stage
                </Button>
              </form>
            ) : null}
          </section>

          {canManage ? (
            <section className="rounded-lg border border-[var(--color-border)] p-4">
              <h2 className="text-sm font-semibold">Process governance</h2>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Draft → Review → Approved → Retired. Publication control with audit
                history.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["draft", "review", "approved", "retired"] as const).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={
                      journey.publicationStatus === status ? "default" : "outline"
                    }
                    disabled={governanceMutation.isPending}
                    onClick={() => governanceMutation.mutate(status)}
                    data-testid={`workflow-governance-${status}`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-[var(--color-border)] p-4">
            <h2 className="text-sm font-semibold">Operational monitoring</h2>
            {monitoringQuery.data ? (
              <ul className="mt-3 space-y-1 text-sm">
                <li>Active instances: {monitoringQuery.data.activeInstances}</li>
                <li>Stalled stages: {monitoringQuery.data.stalledStages}</li>
                <li>Overdue transitions: {monitoringQuery.data.overdueTransitions}</li>
                <li>
                  Completion: {monitoringQuery.data.completedCount} (
                  {monitoringQuery.data.completionRatePercent}%)
                </li>
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                No monitoring data yet.
              </p>
            )}
            {canManage && journey.publicationStatus === "approved" ? (
              <form
                className="mt-3 flex flex-wrap items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (instanceTitle.trim()) instanceMutation.mutate();
                }}
              >
                <Input
                  label="Start process instance"
                  value={instanceTitle}
                  onChange={(e) => setInstanceTitle(e.target.value)}
                  data-testid="workflow-instance-title"
                />
                <Button type="submit" size="sm" disabled={instanceMutation.isPending}>
                  Start
                </Button>
              </form>
            ) : null}
          </section>

          <section className="rounded-lg border border-[var(--color-border)] p-4 lg:col-span-2">
            <h2 className="text-sm font-semibold">Audit history</h2>
            {auditQuery.data && auditQuery.data.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {auditQuery.data.map((entry) => (
                  <li key={entry.id}>
                    <span className="font-medium">{entry.action}</span>
                    {entry.fromStatus || entry.toStatus
                      ? ` · ${entry.fromStatus ?? "—"} → ${entry.toStatus ?? "—"}`
                      : null}
                    <span className="text-[var(--color-muted-foreground)]">
                      {" "}
                      · {entry.actor}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                No audit entries yet.
              </p>
            )}
          </section>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          This journey describes what the business intends to happen. How technology
          executes each step remains below the product boundary.
        </p>
      </WorkflowWorkspaceFrame>
    </PageShell>
  );
}

export function WorkflowProcessTemplatesView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageBusinessProcesses(permissions);
  const [owner, setOwner] = useState("Process Owner");
  const [steward, setSteward] = useState("Business Steward");

  const query = useQuery({
    queryKey: queryKeys.templates,
    queryFn: ({ signal }) => listProcessTemplates({ signal }),
  });

  const instantiateMutation = useMutation({
    mutationFn: (templateKey: string) =>
      instantiateProcessTemplate(templateKey, {
        processOwner: owner.trim(),
        businessSteward: steward.trim(),
      }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.journeys });
      router.push(workflowJourneyDetailPath(created.id));
    },
  });

  return (
    <PageShell
      title="Workflow template library"
      description="Reusable, editable, versioned business process templates."
      breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Templates"]}
    >
      {canManage ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <Input
            label="Process owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
          <Input
            label="Business steward"
            value={steward}
            onChange={(e) => setSteward(e.target.value)}
          />
        </div>
      ) : null}

      {query.isLoading ? <LoadingState label="Loading templates…" /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load templates."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.isSuccess ? (
        <ul
          className="grid gap-3 md:grid-cols-2"
          data-testid="workflow-template-library"
        >
          {query.data.map((template) => (
            <li
              key={template.id}
              className="rounded-lg border border-[var(--color-border)] p-4"
              data-testid={`workflow-template-${template.key}`}
            >
              <div className="font-medium">{template.name}</div>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {template.summary}
              </p>
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                v{template.version}
                {template.editable ? " · editable" : ""}
              </p>
              {canManage ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  disabled={instantiateMutation.isPending}
                  onClick={() => instantiateMutation.mutate(template.key)}
                >
                  Use template
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </PageShell>
  );
}

export function WorkflowProcessMonitoringView() {
  const query = useQuery({
    queryKey: queryKeys.monitoring(),
    queryFn: ({ signal }) => getProcessMonitoring(undefined, { signal }),
  });

  return (
    <PageShell
      title="Process monitoring"
      description="Active instances, stalled stages, overdue transitions, and completion — business terminology only."
      breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Monitoring"]}
    >
      {query.isLoading ? <LoadingState label="Loading monitoring…" /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load monitoring."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data ? (
        <div
          className="grid gap-4 md:grid-cols-4"
          data-testid="workflow-process-monitoring"
        >
          <div className="rounded-lg border border-[var(--color-border)] p-4">
            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Active instances
            </p>
            <p className="mt-1 text-2xl font-semibold">{query.data.activeInstances}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-4">
            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Stalled stages
            </p>
            <p className="mt-1 text-2xl font-semibold">{query.data.stalledStages}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-4">
            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Overdue transitions
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {query.data.overdueTransitions}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-4">
            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
              Completion rate
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {query.data.completionRatePercent}%
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-4 md:col-span-4">
            <h2 className="text-sm font-semibold">By stage</h2>
            {query.data.byStage.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                No active stages to report.
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {query.data.byStage.map((stage) => (
                  <li key={stage.stageId}>
                    {stage.stageName}: {stage.activeCount} active
                    {stage.stalledCount > 0 ? ` · ${stage.stalledCount} stalled` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
