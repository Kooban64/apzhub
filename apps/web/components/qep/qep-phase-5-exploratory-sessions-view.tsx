"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { formatDuration } from "@apzhub/qep-experience/domain";
import { parseQepExploratorySessionRouteId } from "@apzhub/qep-experience/presentation";
import { listApplicationEnvironments } from "@/lib/qep/qep-applications-api";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import {
  captureAndAttachEvidence,
  createExploratorySession,
  createQualityCapture,
  exploratorySessionAction,
  getExploratorySession,
  listExploratorySessions,
  qualityIssueAction,
} from "@/lib/qep/qep-experience-api";
import { useSessionOpenedId } from "@/lib/qep/use-session-opened-id";
import { QepErrorState, QepLoadingState, QepStatusBadge } from "./qep-ui";

const TABS = [
  "All Sessions",
  "My Sessions",
  "By Status",
  "By Application",
  "By Tester",
  "Recent",
] as const;

function statusClass(status: string): string {
  if (status === "in_progress") return "text-amber-600";
  if (status === "completed") return "text-emerald-600";
  if (status === "planned") return "text-sky-600";
  if (status === "blocked") return "text-red-600";
  return "text-[var(--color-muted-foreground)]";
}

export function QepPhase5ExploratorySessionsView({
  pathname,
}: {
  readonly pathname: string;
}) {
  const { selectedId, selected } = useQepApplicationContext();
  const queryClient = useQueryClient();
  const routeId = parseQepExploratorySessionRouteId(pathname);
  const { openedId, setOpenedId } = useSessionOpenedId(
    "apzqep.openedExploratorySessionId",
  );
  const sessionId = routeId ?? openedId;
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All Sessions");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mobileView, setMobileView] = useState<
    "overview" | "activity" | "capture" | "summary"
  >("overview");
  const [name, setName] = useState("");
  const [mission, setMission] = useState("");
  const [scope, setScope] = useState("");
  const [areas, setAreas] = useState("Cart behaviour\nAddress validation");
  const [environmentId, setEnvironmentId] = useState("");
  const [captureTitle, setCaptureTitle] = useState("");
  const [captureBody, setCaptureBody] = useState("");

  const listQ = useQuery({
    queryKey: ["qep-exploratory-sessions", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listExploratorySessions(selectedId!),
  });
  const detailQ = useQuery({
    queryKey: ["qep-exploratory-session", sessionId],
    enabled: Boolean(sessionId),
    queryFn: () => getExploratorySession(sessionId!),
  });
  const envQ = useQuery({
    queryKey: ["qep-application-environments", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listApplicationEnvironments(selectedId!),
  });

  const create = useMutation({
    mutationFn: () =>
      createExploratorySession({
        applicationId: selectedId!,
        name,
        mission: mission || name,
        scope: scope || "In scope for this charter",
        ...(environmentId ? { environmentId } : {}),
        areas: areas
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      }),
    onSuccess: async (session) => {
      setName("");
      setShowCreate(false);
      await queryClient.invalidateQueries({ queryKey: ["qep-exploratory-sessions"] });
      setOpenedId(session.id);
    },
  });
  const act = useMutation({
    mutationFn: (action: string) => exploratorySessionAction(sessionId!, action),
    onSuccess: async (session) => {
      queryClient.setQueryData(["qep-exploratory-session", session.id], session);
      await queryClient.invalidateQueries({ queryKey: ["qep-exploratory-sessions"] });
    },
  });
  const capture = useMutation({
    mutationFn: (kind: "observation" | "issue" | "note") =>
      createQualityCapture({
        kind,
        hostKind: "exploratory_session",
        hostId: sessionId,
        title: captureTitle || (kind === "note" ? "Note" : "Captured item"),
        body: captureBody || captureTitle,
      }),
    onSuccess: async () => {
      setCaptureTitle("");
      setCaptureBody("");
      await queryClient.invalidateQueries({
        queryKey: ["qep-exploratory-session", sessionId],
      });
    },
  });

  const rows = listQ.data ?? [];
  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (status && row.status !== status) return false;
      if (tab === "My Sessions" && selectedId && row.testerId !== row.createdBy) {
        /* still show all for org_member demo */
      }
      if (search) {
        const hay = `${row.number} ${row.name} ${row.testerName ?? ""}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, search, status, tab, selectedId]);

  if (!selectedId) {
    return (
      <QepLoadingState label="Select an application to view exploratory sessions." />
    );
  }
  if (listQ.isError) return <QepErrorState message={(listQ.error as Error).message} />;

  if (sessionId) {
    const session = detailQ.data ?? rows.find((row) => row.id === sessionId);
    if (!session) {
      if (detailQ.isError)
        return <QepErrorState message={(detailQ.error as Error).message} />;
      return <QepLoadingState label="Loading session…" />;
    }
    return (
      <div
        className="flex h-full min-h-0 flex-col gap-4 p-5"
        data-testid="qep-exploratory-workspace"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              <button
                type="button"
                data-testid="qep-exploratory-back"
                onClick={() => setOpenedId(null)}
              >
                Exploratory Sessions
              </button>{" "}
              / {session.number}
            </p>
            <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
              {session.number} {session.name}
            </h1>
            <p className={`text-sm ${statusClass(session.status)}`}>
              <QepStatusBadge status={session.status} />
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Tester {session.testerName ?? session.testerId} ·{" "}
              {selected?.name ?? "Application"} ·{" "}
              {session.environmentName ?? session.environmentId ?? "Environment"} ·
              Started{" "}
              {session.startedAt ? new Date(session.startedAt).toLocaleString() : "—"} ·
              Duration {formatDuration(session.durationMs)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
              data-testid="qep-exploratory-add-observation"
              onClick={() => capture.mutate("observation")}
            >
              + Add Observation
            </button>
            {session.status === "in_progress" ? (
              <button
                type="button"
                className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm"
                data-testid="qep-exploratory-pause"
                onClick={() => act.mutate("pause")}
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm"
                data-testid="qep-exploratory-start"
                onClick={() =>
                  act.mutate(session.status === "paused" ? "resume" : "start")
                }
              >
                {session.status === "paused" ? "Resume" : "Start"}
              </button>
            )}
            <button
              type="button"
              className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
              data-testid="qep-exploratory-complete"
              onClick={() => act.mutate("complete")}
            >
              Complete
            </button>
          </div>
        </div>
        <div
          className="flex gap-2 text-sm md:hidden"
          data-testid="qep-exploratory-mobile-nav"
        >
          {(["overview", "activity", "capture", "summary"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-md px-2 py-1 capitalize ${mobileView === item ? "bg-[var(--color-muted)]" : ""}`}
              onClick={() => setMobileView(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3">
          <section
            className={`rounded-lg border border-[var(--color-border)] p-4 ${mobileView !== "overview" ? "hidden md:block" : ""}`}
            data-testid="qep-exploratory-charter"
          >
            <h2 className="mb-2 text-sm font-semibold">Session Charter & Context</h2>
            <p className="text-xs font-medium">Mission / Objective</p>
            <p className="mb-2 text-sm">{session.mission}</p>
            <p className="text-xs font-medium">Scope</p>
            <p className="mb-2 text-sm">{session.scope}</p>
            <p className="text-xs font-medium">Areas to Explore</p>
            <ul className="mb-2 list-disc pl-4 text-sm">
              {session.areas.map((area) => (
                <li key={area.id}>
                  <button
                    type="button"
                    className={area.explored ? "line-through" : ""}
                    data-testid={`qep-exploratory-area-${area.id}`}
                    onClick={() =>
                      exploratorySessionAction(session.id, "explore_area", {
                        areaId: area.id,
                      }).then((next) =>
                        queryClient.setQueryData(
                          ["qep-exploratory-session", session.id],
                          next,
                        ),
                      )
                    }
                  >
                    {area.prompt}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {session.sessionNotes ?? "No session notes yet."}
            </p>
          </section>
          <section
            className={`rounded-lg border border-[var(--color-border)] p-4 ${mobileView !== "activity" ? "max-md:hidden md:block" : ""}`}
            data-testid="qep-exploratory-activity"
          >
            <h2 className="mb-2 text-sm font-semibold">Live Activity</h2>
            <ol className="space-y-2 text-sm">
              {session.history.map((entry) => (
                <li key={entry.id} data-testid={`qep-history-${entry.eventType}`}>
                  <span className="font-medium">
                    {entry.eventType.replaceAll("_", " ")}
                  </span>
                  {entry.detail ? ` — ${entry.detail}` : ""}
                  <span className="block text-xs text-[var(--color-muted-foreground)]">
                    {new Date(entry.occurredAt).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section
            className={`rounded-lg border border-[var(--color-border)] p-4 ${mobileView !== "summary" && mobileView !== "capture" ? "max-md:hidden md:block" : ""}`}
            data-testid="qep-exploratory-summary"
          >
            <h2 className="mb-2 text-sm font-semibold">Session Summary & Progress</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border border-[var(--color-border)] p-2">
                Observations {session.counts.observations}
              </div>
              <div className="rounded-md border border-[var(--color-border)] p-2">
                Issues Found {session.counts.issues}
              </div>
              <div className="rounded-md border border-[var(--color-border)] p-2">
                Evidence Items {session.counts.evidence}
              </div>
              <div className="rounded-md border border-[var(--color-border)] p-2">
                Notes {session.counts.notes}
              </div>
            </div>
            <p className="mt-3 text-sm" data-testid="qep-exploratory-progress">
              Exploration areas covered {session.progress.percent ?? 0}% (
              {session.progress.completed} of {session.progress.total})
            </p>
            <div className="mt-4 space-y-2" data-testid="qep-exploratory-capture">
              <h3 className="text-sm font-semibold">Quick Capture</h3>
              <input
                className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                placeholder="Title"
                value={captureTitle}
                onChange={(e) => setCaptureTitle(e.target.value)}
                data-testid="qep-capture-title"
              />
              <textarea
                className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                placeholder="Detail"
                value={captureBody}
                onChange={(e) => setCaptureBody(e.target.value)}
                data-testid="qep-capture-body"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="rounded-md bg-amber-600 px-2 py-2 text-xs text-white"
                  data-testid="qep-capture-observation"
                  onClick={() => capture.mutate("observation")}
                >
                  Observation
                </button>
                <button
                  type="button"
                  className="rounded-md bg-emerald-700 px-2 py-2 text-xs text-white"
                  data-testid="qep-capture-evidence"
                  onClick={() =>
                    captureAndAttachEvidence({
                      applicationId: selectedId,
                      targetKind: "exploratory_session",
                      targetId: session.id,
                      title: captureTitle || "Session evidence",
                      body: captureBody,
                    }).then(() =>
                      queryClient.invalidateQueries({
                        queryKey: ["qep-exploratory-session", session.id],
                      }),
                    )
                  }
                >
                  Upload Evidence
                </button>
                <button
                  type="button"
                  className="rounded-md bg-red-700 px-2 py-2 text-xs text-white"
                  data-testid="qep-capture-issue"
                  onClick={() => capture.mutate("issue")}
                >
                  Create Issue
                </button>
                <button
                  type="button"
                  className="rounded-md bg-sky-700 px-2 py-2 text-xs text-white"
                  data-testid="qep-capture-note"
                  onClick={() => capture.mutate("note")}
                >
                  Add Note
                </button>
              </div>
            </div>
          </section>
        </div>
        <div
          className={`grid gap-3 md:grid-cols-2 ${mobileView !== "overview" && mobileView !== "summary" ? "max-md:hidden" : ""}`}
        >
          <section
            className="rounded-lg border border-[var(--color-border)] p-3"
            data-testid="qep-exploratory-observations"
          >
            <h3 className="text-sm font-semibold">Observations</h3>
            {session.observations.map((item) => (
              <p key={item.id} className="text-sm">
                {item.title}
              </p>
            ))}
          </section>
          <section
            className="rounded-lg border border-[var(--color-border)] p-3"
            data-testid="qep-exploratory-issues"
          >
            <h3 className="text-sm font-semibold">Issues</h3>
            {session.issues.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>
                  {item.title} · {item.priority}
                </span>
                {item.status === "open" ? (
                  <button
                    type="button"
                    data-testid={`qep-issue-promote-${item.id}`}
                    onClick={() =>
                      qualityIssueAction(item.id, "promote_defect").then(() =>
                        queryClient.invalidateQueries({
                          queryKey: ["qep-exploratory-session", session.id],
                        }),
                      )
                    }
                  >
                    Promote to Defect
                  </button>
                ) : (
                  <span>
                    {item.status}
                    {item.defectId ? ` · ${item.defectId}` : ""}
                  </span>
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
  const issues = rows.reduce((sum, row) => sum + row.counts.issues, 0);
  const evidence = rows.reduce((sum, row) => sum + row.counts.evidence, 0);

  return (
    <div className="flex flex-col gap-4 p-5" data-testid="qep-exploratory-sessions">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Exploratory Sessions</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Discover, explore and learn from the system. Capture observations, evidence
            and issues.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-primary-foreground)]"
          data-testid="qep-new-session"
          onClick={() => setShowCreate((open) => !open)}
        >
          + New Session
        </button>
      </div>
      <div className="flex flex-wrap gap-2 text-sm" data-testid="qep-exploratory-tabs">
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
      <div className="flex flex-wrap gap-2" data-testid="qep-exploratory-filters">
        <input
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Status</option>
          <option value="draft">Draft</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
      {showCreate ? (
        <div
          className="grid gap-2 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-2"
          data-testid="qep-new-session-form"
        >
          <input
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            placeholder="Session name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="qep-session-name"
          />
          <input
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            placeholder="Mission / objective"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            data-testid="qep-session-mission"
          />
          <input
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            placeholder="Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            data-testid="qep-session-scope"
          />
          <select
            className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={environmentId}
            onChange={(e) => setEnvironmentId(e.target.value)}
            data-testid="qep-session-environment"
          >
            <option value="">Environment</option>
            {(envQ.data?.items ?? []).map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
          <textarea
            className="md:col-span-2 rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={areas}
            onChange={(e) => setAreas(e.target.value)}
            data-testid="qep-session-areas"
          />
          <button
            type="button"
            className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-primary-foreground)]"
            data-testid="qep-create-session"
            onClick={() => create.mutate()}
            disabled={!name.trim()}
          >
            Create session
          </button>
        </div>
      ) : null}
      <div
        className="hidden overflow-x-auto rounded-lg border border-[var(--color-border)] md:block"
        data-testid="qep-exploratory-table"
      >
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-muted)]/40 text-left">
            <tr>
              {[
                "ID",
                "Session Name",
                "Application",
                "Tester",
                "Environment",
                "Status",
                "Duration",
                "Started",
                "Updated",
                "Issues",
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
                data-testid={`qep-session-row-${row.id}`}
                onClick={() => setOpenedId(row.id)}
              >
                <td className="px-3 py-2 text-[var(--color-primary)]">{row.number}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{selected?.name ?? "—"}</td>
                <td className="px-3 py-2">{row.testerName ?? row.testerId}</td>
                <td className="px-3 py-2">
                  {row.environmentName ?? row.environmentId ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <QepStatusBadge status={row.status} />
                </td>
                <td className="px-3 py-2">{formatDuration(row.durationMs)}</td>
                <td className="px-3 py-2">
                  {row.startedAt ? new Date(row.startedAt).toLocaleString() : "—"}
                </td>
                <td className="px-3 py-2">
                  {new Date(row.updatedAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">{row.counts.issues}</td>
                <td className="px-3 py-2">{row.counts.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 md:hidden" data-testid="qep-exploratory-cards">
        {filtered.map((row) => (
          <button
            key={row.id}
            type="button"
            className="rounded-lg border border-[var(--color-border)] p-3 text-left"
            data-testid={`qep-session-card-${row.id}`}
            onClick={() => setOpenedId(row.id)}
          >
            <p className="text-sm font-medium">
              {row.number} {row.name}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {row.environmentName ?? "—"} · {row.testerName ?? row.testerId}
            </p>
            <QepStatusBadge status={row.status} />
            <p className="text-xs">
              Issues {row.counts.issues} · Evidence {row.counts.evidence}
            </p>
          </button>
        ))}
      </div>
      <div
        className="grid gap-2 sm:grid-cols-5"
        data-testid="qep-exploratory-summary-cards"
      >
        <div className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          Sessions {rows.length}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          In Progress {inProgress}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          Completed {completed}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          Issues Found {issues}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
          Evidence Items {evidence}
        </div>
      </div>
    </div>
  );
}
