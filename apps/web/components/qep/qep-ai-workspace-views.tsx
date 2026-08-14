"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type {
  QualityAssistMode,
  QualityAssistSession,
} from "@/lib/qep/quality-assist-store";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

const MODE_LABELS: Readonly<Record<QualityAssistMode, string>> = {
  coverage_gaps: "Coverage gaps",
  failure_explain: "Explain failure",
  test_draft: "Draft a test",
  suite_recommend: "Recommend suites",
};

export function QepAiWorkspaceRouterView() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<QualityAssistMode>("coverage_gaps");
  const [subjectRef, setSubjectRef] = useState("");
  const [context, setContext] = useState("");
  const [liveLlmRequested, setLiveLlmRequested] = useState(false);

  const sessionsQuery = useQuery({
    queryKey: ["qep-quality-assist", "sessions"],
    queryFn: () =>
      fetchJson<{ sessions: QualityAssistSession[] }>(
        "/api/v1/qep/quality-assist?limit=50",
      ),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ session: QualityAssistSession }>("/api/v1/qep/quality-assist", {
        method: "POST",
        body: JSON.stringify({ mode, subjectRef, context, liveLlmRequested }),
      }),
    onSuccess: () => {
      setContext("");
      void queryClient.invalidateQueries({ queryKey: ["qep-quality-assist"] });
    },
  });

  const actionMutation = useMutation({
    mutationFn: (input: {
      sessionId: string;
      suggestionId: string;
      action: "accept" | "reject";
    }) =>
      fetchJson(
        `/api/v1/qep/quality-assist/${encodeURIComponent(input.sessionId)}/suggestions/${encodeURIComponent(input.suggestionId)}/${input.action}`,
        { method: "POST", body: JSON.stringify({}) },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-quality-assist"] });
    },
  });

  const sessions = sessionsQuery.data?.sessions ?? [];

  return (
    <QepPageShell
      title="Governed Quality Assist"
      description="Audited advisory suggestions. Humans accept or reject; this workspace cannot certify or set GO/NO-GO."
    >
      <QepPanel title="Start an assist session">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Assist mode
            <select
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-2"
              value={mode}
              onChange={(event) => setMode(event.target.value as QualityAssistMode)}
            >
              {Object.entries(MODE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Change, execution, or suite reference
            <input
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-2"
              value={subjectRef}
              onChange={(event) => setSubjectRef(event.target.value)}
              placeholder="chg-…, execution-…, suite-…"
              data-testid="qep-quality-assist-subject"
            />
          </label>
        </div>
        <label className="mt-3 block text-sm">
          Governed context
          <textarea
            className="mt-1 min-h-28 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-2"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Paste bounded failure, coverage, or change context. Do not include secrets."
          />
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={liveLlmRequested}
            onChange={(event) => setLiveLlmRequested(event.target.checked)}
          />
          Request live LLM (requires APZHUB_QEP_AI_ASSIST=true and server secret)
        </label>
        <div className="mt-3 flex items-center gap-3">
          <Button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={!subjectRef.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating…" : "Create advisory session"}
          </Button>
          {!liveLlmRequested ? (
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Deterministic rule assist will be used.
            </span>
          ) : null}
        </div>
        {createMutation.isError ? (
          <div className="mt-3">
            <QepErrorState message={(createMutation.error as Error).message} />
          </div>
        ) : null}
      </QepPanel>

      <QepPanel title="Audited sessions">
        {sessionsQuery.isLoading ? (
          <QepLoadingState label="Loading assist sessions…" />
        ) : sessionsQuery.isError ? (
          <QepErrorState message={(sessionsQuery.error as Error).message} />
        ) : sessions.length === 0 ? (
          <QepEmptyState title="No assist sessions yet." />
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <article
                key={session.sessionId}
                className="rounded-md border border-[var(--color-border)] p-4"
                data-testid={`qep-quality-assist-session-${session.sessionId}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{MODE_LABELS[session.mode]}</h3>
                  <QepStatusBadge status={session.provider} />
                  <QepStatusBadge status={session.status} />
                  <span className="font-mono text-xs">{session.subjectRef}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  {session.providerReason}
                </p>
                {session.status === "disabled" ? (
                  <p className="mt-3 text-sm">
                    No live request was sent and no suggestion was fabricated.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {session.suggestions.map((item) => (
                      <li
                        key={item.suggestionId}
                        className="rounded border border-[var(--color-border)] p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          <QepStatusBadge status={item.status} />
                          <span className="text-xs">
                            confidence {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{item.rationale}</p>
                        <ol className="mt-2 list-decimal pl-5 text-sm">
                          {item.actions.map((action) => (
                            <li key={action}>{action}</li>
                          ))}
                        </ol>
                        {item.status === "pending" ? (
                          <div className="mt-3 flex gap-2">
                            <Button
                              type="button"
                              onClick={() =>
                                actionMutation.mutate({
                                  sessionId: session.sessionId,
                                  suggestionId: item.suggestionId,
                                  action: "accept",
                                })
                              }
                              disabled={actionMutation.isPending}
                            >
                              Accept suggestion
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                actionMutation.mutate({
                                  sessionId: session.sessionId,
                                  suggestionId: item.suggestionId,
                                  action: "reject",
                                })
                              }
                              disabled={actionMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
                <details className="mt-3 text-xs">
                  <summary>Audit trail ({session.auditTrail.length})</summary>
                  <ul className="mt-2 space-y-1">
                    {session.auditTrail.map((event) => (
                      <li key={event.eventId}>
                        {event.occurredAt} · {event.action} · {event.detail}
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            ))}
          </div>
        )}
      </QepPanel>
    </QepPageShell>
  );
}
