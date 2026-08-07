"use client";

/**
 * W007 History-intent collaboration — meeting outcomes · digests · contextual search.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  buildOperationalDigest,
  contextualCollaborationSearch,
  createMeetingOutcome,
  getCommunicationTimeline,
  listMeetingOutcomes,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { ErrorState, LoadingState } from "./projects-ui";

export function ProjectCollaborationPanels({
  projectId,
  canManage = false,
}: {
  readonly projectId: string;
  readonly canManage?: boolean;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [commitments, setCommitments] = useState("");
  const [decisions, setDecisions] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [digestKind, setDigestKind] = useState("weekly");
  const [error, setError] = useState<string | null>(null);

  const outcomes = useQuery({
    queryKey: [...projectsQueryKeys.all, "meeting-outcomes", projectId],
    queryFn: ({ signal }) => listMeetingOutcomes(projectId, { signal }),
  });

  const timeline = useQuery({
    queryKey: [...projectsQueryKeys.all, "project-communication-timeline", projectId],
    queryFn: ({ signal }) => getCommunicationTimeline(projectId, {}, { signal }),
  });

  const search = useQuery({
    queryKey: [...projectsQueryKeys.all, "contextual-search", projectId, searchQ],
    queryFn: ({ signal }) =>
      contextualCollaborationSearch(projectId, searchQ, { signal }),
    enabled: searchQ.trim().length >= 2,
  });

  const createOutcome = useMutation({
    mutationFn: () =>
      createMeetingOutcome(projectId, {
        heldAt: new Date().toISOString(),
        title: title.trim(),
        summary: summary.trim(),
        commitmentsCaptured: commitments
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        decisionsRecorded: decisions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    onSuccess: async () => {
      setTitle("");
      setSummary("");
      setCommitments("");
      setDecisions("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  const digest = useMutation({
    mutationFn: () => buildOperationalDigest(projectId, { kind: digestKind }),
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Digest failed.");
    },
  });

  return (
    <div className="space-y-6" data-testid="project-collaboration-panels">
      {error ? <ErrorState message={error} /> : null}

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Unified operational timeline</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Conversations · meeting outcomes · notices · operational changes.
        </p>
        {timeline.isLoading ? <LoadingState label="Loading timeline…" /> : null}
        <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
          {(timeline.data ?? []).slice(0, 40).map((e) => (
            <li
              key={String(e.id)}
              className="border-b border-[var(--color-border)] py-1"
            >
              {String(e.summary)} · {String(e.source)} · {String(e.kind)}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2" data-testid="meeting-outcomes-panel">
        <h3 className="text-sm font-semibold">Meeting outcomes</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Structured results that create/link Commitments and Decisions — not orphan
          minutes.
        </p>
        {canManage ? (
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <Input
              label="Commitment IDs (comma)"
              value={commitments}
              onChange={(e) => setCommitments(e.target.value)}
            />
            <Input
              label="Decision IDs (comma)"
              value={decisions}
              onChange={(e) => setDecisions(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={!title.trim() || !summary.trim() || createOutcome.isPending}
              onClick={() => createOutcome.mutate()}
            >
              Record outcome
            </Button>
          </div>
        ) : null}
        <ul className="text-sm">
          {(outcomes.data ?? []).map((o) => (
            <li
              key={String(o.id)}
              className="border-b border-[var(--color-border)] py-1"
            >
              {String(o.title)} · {String(o.summary).slice(0, 80)}
              {Array.isArray(o.commitmentsCaptured) && o.commitmentsCaptured.length > 0
                ? ` · commitments ${o.commitmentsCaptured.map(String).join(", ")}`
                : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2" data-testid="operational-digests-panel">
        <h3 className="text-sm font-semibold">Operational digests</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Projects publishes digest-ready projections — Attention Engine delivers.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Kind</span>
            <select
              className="h-9 border border-[var(--color-border)] bg-transparent px-2"
              value={digestKind}
              onChange={(e) => setDigestKind(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="milestone">Milestone</option>
              <option value="exception">Exception</option>
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            disabled={digest.isPending}
            onClick={() => digest.mutate()}
          >
            Build digest projection
          </Button>
        </div>
        {digest.data ? (
          <ul className="text-sm">
            {((digest.data.summaryLines as readonly string[] | undefined) ?? []).map(
              (line) => (
                <li key={line}>{line}</li>
              ),
            )}
            <li className="text-xs text-[var(--color-muted-foreground)]">
              Event intent: {String(digest.data.publishedEventIntent)}
            </li>
          </ul>
        ) : null}
      </section>

      <section className="space-y-2" data-testid="contextual-search-panel">
        <h3 className="text-sm font-semibold">Contextual search</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Returns conversations in owning object context — never orphan messages.
        </p>
        <Input
          label="Search within project"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
        {search.isFetching ? <LoadingState label="Searching…" /> : null}
        <ul className="text-sm">
          {(search.data ?? []).map((hit) => (
            <li key={String(hit.conversationId)} className="py-1">
              <a className="underline" href={String(hit.deepLink)}>
                {String(hit.title)}
              </a>
              <span className="text-[var(--color-muted-foreground)]">
                {" "}
                · {String(hit.anchorType)}:{String(hit.anchorId)} ·{" "}
                {String(hit.snippet).slice(0, 100)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
