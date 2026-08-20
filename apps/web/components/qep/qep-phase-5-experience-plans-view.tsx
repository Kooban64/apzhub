"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { formatDuration } from "@apzhub/qep-experience/domain";
import { parseQepExperiencePlanRouteId } from "@apzhub/qep-experience/presentation";
import { listApplicationEnvironments } from "@/lib/qep/qep-applications-api";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import {
  captureAndAttachEvidence,
  createExperiencePlan,
  createQualityCapture,
  experienceActivityAction,
  experiencePlanAction,
  getExperienceActivity,
  getExperiencePlan,
  listExperiencePlans,
  qualityIssueAction,
} from "@/lib/qep/qep-experience-api";
import { useSessionOpenedId } from "@/lib/qep/use-session-opened-id";
import { QepErrorState, QepLoadingState, QepStatusBadge } from "./qep-ui";

const TABS = [
  "All Plans",
  "My Plans",
  "By Application",
  "By Environment",
  "By Device",
  "By Tester",
  "Recent",
] as const;
const DISCIPLINES = [
  "functional_ux",
  "responsive",
  "usability",
  "accessibility",
  "visual",
] as const;

export function QepPhase5ExperiencePlansView({
  pathname,
}: {
  readonly pathname: string;
}) {
  const { selectedId, selected } = useQepApplicationContext();
  const queryClient = useQueryClient();
  const routeId = parseQepExperiencePlanRouteId(pathname);
  const { openedId, setOpenedId } = useSessionOpenedId("apzqep.openedExperiencePlanId");
  const planId = routeId ?? openedId;
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All Plans");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<
    "overview" | "activity" | "criteria" | "capture" | "summary"
  >("overview");
  const [name, setName] = useState("");
  const [mission, setMission] = useState("");
  const [scope, setScope] = useState("");
  const [environmentId, setEnvironmentId] = useState("");
  const [contextLabel, setContextLabel] = useState("Desktop 1920x1080");
  const [deviceClass, setDeviceClass] = useState("desktop");
  const [criterion, setCriterion] = useState("Primary CTA remains visible");
  const [discipline, setDiscipline] = useState("functional_ux");
  const [captureTitle, setCaptureTitle] = useState("");
  const [captureBody, setCaptureBody] = useState("");

  const listQ = useQuery({
    queryKey: ["qep-experience-plans", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listExperiencePlans(selectedId!),
  });
  const planQ = useQuery({
    queryKey: ["qep-experience-plan", planId],
    enabled: Boolean(planId),
    queryFn: () => getExperiencePlan(planId!),
  });
  const listedPlan = (listQ.data ?? []).find((row) => row.id === planId);
  const activityId = planQ.data?.latestActivityId ?? listedPlan?.latestActivityId;
  const activityQ = useQuery({
    queryKey: ["qep-experience-activity", activityId],
    enabled: Boolean(activityId),
    queryFn: () => getExperienceActivity(activityId!),
  });
  const envQ = useQuery({
    queryKey: ["qep-application-environments", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listApplicationEnvironments(selectedId!),
  });

  const create = useMutation({
    mutationFn: () =>
      createExperiencePlan({
        applicationId: selectedId!,
        name,
        mission: mission || name,
        scope: scope || "Experience verification scope",
        ...(environmentId ? { environmentId } : {}),
        disciplines: [...DISCIPLINES],
      }),
    onSuccess: async (plan) => {
      setName("");
      setShowCreate(false);
      await queryClient.invalidateQueries({ queryKey: ["qep-experience-plans"] });
      setOpenedId(plan.id);
    },
  });

  const rows = listQ.data ?? [];
  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (!search) return true;
      return `${row.number} ${row.name}`.toLowerCase().includes(search.toLowerCase());
    });
  }, [rows, search, tab]);

  if (!selectedId) {
    return (
      <QepLoadingState label="Select an application to view UI/UX verification plans." />
    );
  }
  if (listQ.isError) return <QepErrorState message={(listQ.error as Error).message} />;

  if (planId) {
    const plan = planQ.data ?? rows.find((row) => row.id === planId);
    if (!plan) {
      if (planQ.isError)
        return <QepErrorState message={(planQ.error as Error).message} />;
      return <QepLoadingState label="Loading plan…" />;
    }
    const activity = activityQ.data;
    return (
      <div
        className="flex h-full min-h-0 flex-col gap-4 p-5"
        data-testid="qep-experience-workspace"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              <button
                type="button"
                data-testid="qep-experience-back"
                onClick={() => setOpenedId(null)}
              >
                UI / UX Plans
              </button>{" "}
              / {plan.number}
            </p>
            <h1 className="text-xl font-semibold">
              {plan.number} {plan.name}
            </h1>
            <QepStatusBadge status={activity?.status ?? plan.status} />
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {activity?.testerName ?? plan.ownerName ?? plan.ownerId} ·{" "}
              {selected?.name ?? "Application"} ·{" "}
              {plan.environmentName ?? "Environment"} ·{" "}
              {plan.disciplines.join(", ") || "No disciplines"} ·{" "}
              {plan.contexts.map((ctx) => ctx.deviceClass).join(", ") || "No devices"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!activity ? (
              <button
                type="button"
                className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
                data-testid="qep-experience-start"
                onClick={() =>
                  experiencePlanAction(plan.id, "start").then(() =>
                    queryClient.invalidateQueries({
                      queryKey: ["qep-experience-plan", plan.id],
                    }),
                  )
                }
              >
                Start verification
              </button>
            ) : (
              <>
                {activity.status === "in_progress" ? (
                  <button
                    type="button"
                    className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm"
                    data-testid="qep-experience-pause"
                    onClick={() =>
                      experienceActivityAction(activity.id, "pause").then((next) =>
                        queryClient.setQueryData(
                          ["qep-experience-activity", next.id],
                          next,
                        ),
                      )
                    }
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm"
                    data-testid="qep-experience-resume"
                    onClick={() =>
                      experienceActivityAction(activity.id, "resume").then((next) =>
                        queryClient.setQueryData(
                          ["qep-experience-activity", next.id],
                          next,
                        ),
                      )
                    }
                  >
                    Resume
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
                  data-testid="qep-experience-complete"
                  onClick={() =>
                    experienceActivityAction(activity.id, "complete").then((next) =>
                      queryClient.setQueryData(
                        ["qep-experience-activity", next.id],
                        next,
                      ),
                    )
                  }
                >
                  Complete
                </button>
              </>
            )}
          </div>
        </div>
        <div
          className="flex gap-2 text-sm md:hidden"
          data-testid="qep-experience-mobile-nav"
        >
          {(["overview", "activity", "criteria", "capture", "summary"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                className={`rounded-md px-2 py-1 capitalize ${mobileView === item ? "bg-[var(--color-muted)]" : ""}`}
                onClick={() => setMobileView(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>
        {!activity ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div
              className="rounded-lg border border-[var(--color-border)] p-3"
              data-testid="qep-experience-plan-builder"
            >
              <h3 className="text-sm font-semibold">Plan contexts & criteria</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                  value={contextLabel}
                  onChange={(e) => setContextLabel(e.target.value)}
                  data-testid="qep-context-label"
                />
                <select
                  className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                  value={deviceClass}
                  onChange={(e) => setDeviceClass(e.target.value)}
                  data-testid="qep-context-device"
                >
                  <option value="desktop">Desktop</option>
                  <option value="tablet">Tablet</option>
                  <option value="mobile">Mobile</option>
                </select>
                <button
                  type="button"
                  data-testid="qep-add-context"
                  onClick={() =>
                    experiencePlanAction(plan.id, "add_context", {
                      label: contextLabel,
                      deviceClass,
                    }).then(() =>
                      queryClient.invalidateQueries({
                        queryKey: ["qep-experience-plan", plan.id],
                      }),
                    )
                  }
                >
                  Add context
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <select
                  className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                >
                  {DISCIPLINES.map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <input
                  className="flex-1 rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                  value={criterion}
                  onChange={(e) => setCriterion(e.target.value)}
                  data-testid="qep-criterion-statement"
                />
                <button
                  type="button"
                  data-testid="qep-add-criterion"
                  onClick={() =>
                    experiencePlanAction(plan.id, "add_criterion", {
                      discipline,
                      statement: criterion,
                    }).then(() =>
                      queryClient.invalidateQueries({
                        queryKey: ["qep-experience-plan", plan.id],
                      }),
                    )
                  }
                >
                  Add criterion
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3">
          <section
            className={`rounded-lg border border-[var(--color-border)] p-4 ${mobileView !== "overview" ? "max-md:hidden" : ""}`}
            data-testid="qep-experience-context-panel"
          >
            <h2 className="mb-2 text-sm font-semibold">Plan Context</h2>
            <p className="text-xs font-medium">Mission / Objective</p>
            <p className="mb-2 text-sm">{plan.mission}</p>
            <p className="text-xs font-medium">Scope</p>
            <p className="mb-2 text-sm">{plan.scope}</p>
            <p className="text-xs font-medium">Verification Disciplines</p>
            <ul className="mb-2 list-disc pl-4 text-sm">
              {plan.disciplines.map((item) => (
                <li key={item}>{item.replaceAll("_", " ")}</li>
              ))}
            </ul>
            <p className="text-xs font-medium">Target Devices / Viewports</p>
            <ul className="list-disc pl-4 text-sm">
              {plan.contexts.map((ctx) => (
                <li key={ctx.id}>
                  {ctx.label}
                  {activity ? (
                    <button
                      type="button"
                      className="ml-2 text-xs text-[var(--color-primary)]"
                      data-testid={`qep-activate-context-${ctx.id}`}
                      onClick={() =>
                        experienceActivityAction(activity.id, "activate_context", {
                          contextId: ctx.id,
                        }).then((next) =>
                          queryClient.setQueryData(
                            ["qep-experience-activity", next.id],
                            next,
                          ),
                        )
                      }
                    >
                      Activate
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          <section
            className={`rounded-lg border border-[var(--color-border)] p-4 ${mobileView !== "activity" ? "max-md:hidden md:block" : ""}`}
            data-testid="qep-experience-activity"
          >
            <h2 className="mb-2 text-sm font-semibold">Live Verification Activity</h2>
            <ol className="space-y-2 text-sm">
              {(activity?.history ?? []).map((entry) => (
                <li key={entry.id}>
                  {entry.eventType.replaceAll("_", " ")}
                  {entry.detail ? ` — ${entry.detail}` : ""}
                </li>
              ))}
            </ol>
          </section>
          <section
            className={`rounded-lg border border-[var(--color-border)] p-4 ${mobileView !== "summary" && mobileView !== "capture" ? "max-md:hidden md:block" : ""}`}
            data-testid="qep-experience-summary"
          >
            <h2 className="mb-2 text-sm font-semibold">Session Summary</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border border-[var(--color-border)] p-2">
                Viewports{" "}
                {activity?.viewportMatrix.filter((cell) => cell.status !== "pending")
                  .length ?? 0}
              </div>
              <div className="rounded-md border border-[var(--color-border)] p-2">
                Observations {activity?.counts.observations ?? 0}
              </div>
              <div className="rounded-md border border-[var(--color-border)] p-2">
                Issues {activity?.counts.issues ?? 0}
              </div>
              <div className="rounded-md border border-[var(--color-border)] p-2">
                Evidence {activity?.counts.evidence ?? 0}
              </div>
            </div>
            <p className="mt-3 text-sm" data-testid="qep-experience-progress">
              Progress {activity?.progress.percent ?? 0}% (
              {activity?.progress.completed ?? 0} of {activity?.progress.total ?? 0}{" "}
              criteria)
              {activity ? ` · ${formatDuration(activity.durationMs)}` : ""}
            </p>
            <div className="mt-3" data-testid="qep-viewport-matrix">
              <h3 className="text-sm font-semibold">Viewport Matrix</h3>
              <ul className="text-sm">
                {(
                  activity?.viewportMatrix ??
                  plan.contexts.map((ctx) => ({
                    contextId: ctx.id,
                    label: ctx.label,
                    deviceClass: ctx.deviceClass,
                    status: "pending" as const,
                  }))
                ).map((cell) => (
                  <li key={cell.contextId}>
                    {cell.label}: {cell.status.replaceAll("_", " ")}
                  </li>
                ))}
              </ul>
            </div>
            {activity ? (
              <div className="mt-4 space-y-2" data-testid="qep-experience-capture">
                <input
                  className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                  placeholder="Title"
                  value={captureTitle}
                  onChange={(e) => setCaptureTitle(e.target.value)}
                  data-testid="qep-ux-capture-title"
                />
                <textarea
                  className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                  value={captureBody}
                  onChange={(e) => setCaptureBody(e.target.value)}
                  data-testid="qep-ux-capture-body"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-amber-600 px-2 py-2 text-xs text-white"
                    data-testid="qep-ux-capture-observation"
                    onClick={() =>
                      createQualityCapture({
                        kind: "observation",
                        hostKind: "experience_verification",
                        hostId: activity.id,
                        title: captureTitle || "Observation",
                        body: captureBody || captureTitle,
                      }).then(() =>
                        queryClient.invalidateQueries({
                          queryKey: ["qep-experience-activity", activity.id],
                        }),
                      )
                    }
                  >
                    Observation
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-emerald-700 px-2 py-2 text-xs text-white"
                    data-testid="qep-ux-capture-evidence"
                    onClick={() =>
                      captureAndAttachEvidence({
                        applicationId: selectedId!,
                        targetKind: "experience_verification",
                        targetId: activity.id,
                        title: captureTitle || "Verification evidence",
                        body: captureBody,
                      }).then(() =>
                        queryClient.invalidateQueries({
                          queryKey: ["qep-experience-activity", activity.id],
                        }),
                      )
                    }
                  >
                    Upload Evidence
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-red-700 px-2 py-2 text-xs text-white"
                    data-testid="qep-ux-capture-issue"
                    onClick={() =>
                      createQualityCapture({
                        kind: "issue",
                        hostKind: "experience_verification",
                        hostId: activity.id,
                        title: captureTitle || "Issue",
                        body: captureBody || captureTitle,
                      }).then(() =>
                        queryClient.invalidateQueries({
                          queryKey: ["qep-experience-activity", activity.id],
                        }),
                      )
                    }
                  >
                    Create Issue
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-sky-700 px-2 py-2 text-xs text-white"
                    data-testid="qep-ux-capture-note"
                    onClick={() =>
                      createQualityCapture({
                        kind: "note",
                        hostKind: "experience_verification",
                        hostId: activity.id,
                        body: captureBody || captureTitle || "Note",
                      }).then(() =>
                        queryClient.invalidateQueries({
                          queryKey: ["qep-experience-activity", activity.id],
                        }),
                      )
                    }
                  >
                    Add Note
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
        {activity ? (
          <section
            className={`rounded-lg border border-[var(--color-border)] p-3 ${mobileView !== "criteria" ? "max-md:hidden md:block" : ""}`}
            data-testid="qep-experience-criteria"
          >
            <h3 className="text-sm font-semibold">Criteria</h3>
            <ul className="text-sm">
              {plan.criteria.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-2 py-1">
                  <span>{item.statement}</span>
                  {activity.currentContextId ? (
                    <>
                      <button
                        type="button"
                        data-testid={`qep-criterion-verified-${item.id}`}
                        onClick={() =>
                          experienceActivityAction(activity.id, "record_result", {
                            criterionId: item.id,
                            contextId: activity.currentContextId,
                            state: "verified",
                          }).then((next) =>
                            queryClient.setQueryData(
                              ["qep-experience-activity", next.id],
                              next,
                            ),
                          )
                        }
                      >
                        Verified
                      </button>
                      <button
                        type="button"
                        data-testid={`qep-criterion-partial-${item.id}`}
                        onClick={() =>
                          experienceActivityAction(activity.id, "record_result", {
                            criterionId: item.id,
                            contextId: activity.currentContextId,
                            state: "partially_verified",
                            concernFound: true,
                          }).then((next) =>
                            queryClient.setQueryData(
                              ["qep-experience-activity", next.id],
                              next,
                            ),
                          )
                        }
                      >
                        Partially verified
                      </button>
                      <button
                        type="button"
                        data-testid={`qep-criterion-not-${item.id}`}
                        onClick={() =>
                          experienceActivityAction(activity.id, "record_result", {
                            criterionId: item.id,
                            contextId: activity.currentContextId,
                            state: "not_verified",
                          }).then((next) =>
                            queryClient.setQueryData(
                              ["qep-experience-activity", next.id],
                              next,
                            ),
                          )
                        }
                      >
                        Not verified
                      </button>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <div
          className={`grid gap-3 md:grid-cols-2 ${mobileView !== "summary" && mobileView !== "overview" ? "max-md:hidden" : ""}`}
        >
          <section
            className="rounded-lg border border-[var(--color-border)] p-3"
            data-testid="qep-experience-observations"
          >
            <h3 className="text-sm font-semibold">Recent Observations</h3>
            {(activity?.observations ?? []).map((item) => (
              <p key={item.id} className="text-sm">
                {item.title}
              </p>
            ))}
          </section>
          <section
            className="rounded-lg border border-[var(--color-border)] p-3"
            data-testid="qep-experience-issues"
          >
            <h3 className="text-sm font-semibold">Active Issues</h3>
            {(activity?.issues ?? []).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.title} · {item.priority}
                </span>
                {item.status === "open" ? (
                  <button
                    type="button"
                    data-testid={`qep-ux-issue-promote-${item.id}`}
                    onClick={() =>
                      qualityIssueAction(item.id, "promote_defect").then(() =>
                        queryClient.invalidateQueries({
                          queryKey: ["qep-experience-activity", activity?.id],
                        }),
                      )
                    }
                  >
                    Promote to Defect
                  </button>
                ) : (
                  <span>{item.status}</span>
                )}
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  }

  const inProgress = rows.filter((row) => row.status === "in_progress").length;
  const completed = rows.filter((row) => row.status === "completed").length;

  return (
    <div className="flex flex-col gap-4 p-5" data-testid="qep-experience-plans">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">UI / UX Verification Plans</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Plan and manage UI/UX verification activities across viewports, devices and
            experience criteria.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-primary-foreground)]"
          data-testid="qep-new-ux-plan"
          onClick={() => setShowCreate((open) => !open)}
        >
          + New UI / UX Plan
        </button>
      </div>
      <div className="flex flex-wrap gap-2 text-sm" data-testid="qep-experience-tabs">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-md px-2 py-1 ${tab === item ? "bg-[var(--color-muted)]" : ""}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          placeholder="Search plans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {showCreate ? (
        <div
          className="grid gap-2 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-2"
          data-testid="qep-new-plan-form"
        >
          <input
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            placeholder="Plan name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="qep-plan-name"
          />
          <input
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            placeholder="Mission / objective"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            data-testid="qep-plan-mission"
          />
          <input
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            placeholder="Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            data-testid="qep-plan-scope"
          />
          <select
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={environmentId}
            onChange={(e) => setEnvironmentId(e.target.value)}
          >
            <option value="">Environment</option>
            {(envQ.data?.items ?? []).map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-primary-foreground)]"
            data-testid="qep-create-plan"
            onClick={() => create.mutate()}
            disabled={!name.trim()}
          >
            Create plan
          </button>
        </div>
      ) : null}
      <div
        className="hidden overflow-x-auto rounded-lg border border-[var(--color-border)] md:block"
        data-testid="qep-experience-table"
      >
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-muted)]/40 text-left">
            <tr>
              {[
                "ID",
                "Plan Name",
                "Application",
                "Environment",
                "Devices",
                "Type",
                "Status",
                "Owner",
                "Updated",
                "Issues",
                "Items",
                "Evidence",
              ].map((col) => (
                <th key={col} className="px-3 py-2 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-t border-[var(--color-border)]"
                data-testid={`qep-plan-row-${row.id}`}
                onClick={() => setOpenedId(row.id)}
              >
                <td className="px-3 py-2 text-[var(--color-primary)]">{row.number}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{selected?.name ?? "—"}</td>
                <td className="px-3 py-2">{row.environmentName ?? "—"}</td>
                <td className="px-3 py-2">
                  {row.contexts.map((ctx) => ctx.deviceClass).join(", ") || "—"}
                </td>
                <td className="px-3 py-2">
                  {row.disciplines
                    .map((item) => item.replaceAll("_", " "))
                    .join(", ") || "—"}
                </td>
                <td className="px-3 py-2">
                  <QepStatusBadge status={row.status} />
                </td>
                <td className="px-3 py-2">{row.ownerName ?? row.ownerId}</td>
                <td className="px-3 py-2">
                  {new Date(row.updatedAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">{row.counts.issues}</td>
                <td className="px-3 py-2">{row.criteria.length}</td>
                <td className="px-3 py-2">{row.counts.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 md:hidden" data-testid="qep-experience-cards">
        {filtered.map((row) => (
          <button
            key={row.id}
            type="button"
            className="rounded-lg border border-[var(--color-border)] p-3 text-left"
            data-testid={`qep-plan-card-${row.id}`}
            onClick={() => setOpenedId(row.id)}
          >
            <p className="text-sm font-medium">
              {row.number} {row.name}
            </p>
            <QepStatusBadge status={row.status} />
            <p className="text-xs">
              Issues {row.counts.issues} · Evidence {row.counts.evidence}
            </p>
          </button>
        ))}
      </div>
      <div
        className="grid gap-2 sm:grid-cols-4"
        data-testid="qep-experience-summary-cards"
      >
        <div className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          Total Plans {rows.length}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          In Progress {inProgress}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          Completed {completed}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          Issues Found {rows.reduce((sum, row) => sum + row.counts.issues, 0)}
        </div>
      </div>
    </div>
  );
}
