"use client";

/**
 * S-08 Universal Object Surface — one chrome for all operational objects.
 */

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import {
  getCommunicationTimeline,
  listCommitments,
  listOpsDecisions,
  listProjectExceptions,
  listProjectMilestones,
  listProjectRisks,
  listWaiting,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { ProjectDiscussionPanel } from "./project-discussion-panel";
import { ErrorState, LoadingState } from "./projects-ui";

export type ObjectSurfaceType =
  | "commitment"
  | "milestone"
  | "decision"
  | "risk"
  | "exception"
  | "waiting"
  | "dependency"
  | "checkpoint";

export type ObjectSurfaceRef = {
  readonly type: ObjectSurfaceType;
  readonly id: string;
};

const TYPE_LABEL: Record<ObjectSurfaceType, string> = {
  commitment: "Commitment",
  milestone: "Milestone",
  decision: "Decision",
  risk: "Risk",
  exception: "Exception",
  waiting: "Waiting",
  dependency: "Dependency",
  checkpoint: "Checkpoint",
};

export function parseObjectSurfaceParam(
  value: string | null | undefined,
): ObjectSurfaceRef | null {
  if (!value) return null;
  const [type, id] = value.split(":");
  if (!type || !id) return null;
  const known: ObjectSurfaceType[] = [
    "commitment",
    "milestone",
    "decision",
    "risk",
    "exception",
    "waiting",
    "dependency",
    "checkpoint",
  ];
  if (!known.includes(type as ObjectSurfaceType)) return null;
  return { type: type as ObjectSurfaceType, id };
}

export function objectSurfaceParam(ref: ObjectSurfaceRef): string {
  return `${ref.type}:${ref.id}`;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function ProjectObjectSurface({
  projectId,
  objectRef,
  onClose,
  canWrite = false,
}: {
  readonly projectId: string;
  readonly objectRef: ObjectSurfaceRef;
  readonly onClose: () => void;
  readonly canWrite?: boolean;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [segment, setSegment] = useState<
    "details" | "timeline" | "discussion" | "links" | "evidence"
  >("details");

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const detailQuery = useQuery({
    queryKey: [
      ...projectsQueryKeys.all,
      "object-surface",
      projectId,
      objectRef.type,
      objectRef.id,
    ],
    queryFn: async ({ signal }) => {
      if (objectRef.type === "commitment") {
        const items = await listCommitments(projectId, { signal });
        return items.find((i) => asText(i.id) === objectRef.id) ?? null;
      }
      if (objectRef.type === "milestone") {
        const items = await listProjectMilestones(projectId, { signal });
        const hit = items.find((i) => i.id === objectRef.id);
        return hit ? ({ ...hit } as Record<string, unknown>) : null;
      }
      if (objectRef.type === "risk") {
        const items = await listProjectRisks(projectId, { signal });
        const hit = items.find((i) => i.id === objectRef.id);
        return hit ? ({ ...hit } as Record<string, unknown>) : null;
      }
      if (objectRef.type === "decision") {
        const items = await listOpsDecisions(projectId, { signal });
        return items.find((i) => asText(i.id) === objectRef.id) ?? null;
      }
      if (objectRef.type === "waiting") {
        const items = await listWaiting(projectId, { signal });
        return items.find((i) => asText(i.id) === objectRef.id) ?? null;
      }
      if (objectRef.type === "exception") {
        const items = await listProjectExceptions(projectId, { signal });
        return items.find((i) => asText(i.id) === objectRef.id) ?? null;
      }
      return null;
    },
  });

  const historyQuery = useQuery({
    queryKey: [
      ...projectsQueryKeys.all,
      "communication-timeline",
      projectId,
      objectRef.type,
      objectRef.id,
    ],
    queryFn: ({ signal }) =>
      getCommunicationTimeline(
        projectId,
        { objectType: objectRef.type, objectId: objectRef.id },
        { signal },
      ),
    enabled: segment === "timeline",
  });

  const row = detailQuery.data;
  const title =
    asText(row?.statement) ||
    asText(row?.title) ||
    asText(row?.name) ||
    asText(row?.subject) ||
    TYPE_LABEL[objectRef.type];
  const status = asText(row?.status) || "—";
  const owner =
    asText(row?.ownerUserId) ||
    asText(row?.decisionMakerUserId) ||
    asText(row?.chaseOwnerUserId) ||
    "—";

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/40"
      role="presentation"
      onClick={onClose}
      data-testid="project-object-surface-backdrop"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-full w-full max-w-lg flex-col border-l border-[var(--color-border)] bg-[var(--color-background)] shadow-lg"
        onClick={(event) => event.stopPropagation()}
        data-testid="project-object-surface"
      >
        <header className="space-y-1 border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                {TYPE_LABEL[objectRef.type]}
              </p>
              <h2
                id={titleId}
                className="text-base font-semibold text-[var(--color-foreground)]"
              >
                {title}
              </h2>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Status {status} · Accountable {owner}
              </p>
            </div>
            <Button
              ref={closeRef}
              type="button"
              size="sm"
              variant="outline"
              onClick={onClose}
              data-testid="object-surface-close"
            >
              Close
            </Button>
          </div>
          <nav aria-label="Object segments" className="flex flex-wrap gap-1 pt-2">
            {(
              [
                ["details", "Details"],
                ["timeline", "Timeline"],
                ["discussion", "Discussion"],
                ["links", "Links"],
                ["evidence", "Evidence"],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={segment === id ? "default" : "outline"}
                onClick={() => setSegment(id)}
                data-testid={`object-surface-segment-${id}`}
              >
                {label}
              </Button>
            ))}
          </nav>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {detailQuery.isLoading ? <LoadingState label="Loading object…" /> : null}
          {detailQuery.isError ? (
            <ErrorState
              message={
                isProjectsApiError(detailQuery.error)
                  ? detailQuery.error.message
                  : "Unable to load object."
              }
              onRetry={() => void detailQuery.refetch()}
            />
          ) : null}
          {!detailQuery.isLoading && !row ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Object not found or not available in this project.
            </p>
          ) : null}

          {segment === "details" && row ? (
            <dl className="space-y-2 text-sm">
              {Object.entries(row)
                .filter(([key]) => !["id", "projectId"].includes(key))
                .slice(0, 16)
                .map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                      {key}
                    </dt>
                    <dd className="text-[var(--color-foreground)]">
                      {typeof value === "string" || typeof value === "number"
                        ? String(value)
                        : Array.isArray(value)
                          ? value.length
                            ? value.map(String).join(", ")
                            : "—"
                          : value == null
                            ? "—"
                            : JSON.stringify(value)}
                    </dd>
                  </div>
                ))}
            </dl>
          ) : null}

          {segment === "timeline" ? (
            historyQuery.isLoading ? (
              <LoadingState label="Loading timeline…" />
            ) : (
              <ul
                className="space-y-2 text-sm"
                data-testid="unified-communication-timeline"
              >
                {(historyQuery.data ?? []).map((entry) => (
                  <li
                    key={asText(entry.id)}
                    className="border border-[var(--color-border)] px-2 py-1"
                  >
                    <p className="font-medium">{asText(entry.summary)}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {formatProjectsDate(asText(entry.at))} · {asText(entry.source)} ·{" "}
                      {asText(entry.kind)}
                    </p>
                  </li>
                ))}
                {(historyQuery.data ?? []).length === 0 ? (
                  <li className="text-[var(--color-muted-foreground)]">
                    No unified timeline entries yet.
                  </li>
                ) : null}
              </ul>
            )
          ) : null}

          {segment === "discussion" ? (
            <ProjectDiscussionPanel
              projectId={projectId}
              anchorType={objectRef.type}
              anchorId={objectRef.id}
              canWrite={canWrite}
            />
          ) : null}
          {segment === "links" ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Linked operational objects appear here as relationships are attached.
            </p>
          ) : null}
          {segment === "evidence" ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Evidence attachments use the shared Evidence capture pattern when Complete
              / Achieve is invoked.
            </p>
          ) : null}
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-[var(--color-border)] px-4 py-3">
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            data-testid="object-surface-primary"
          >
            Done
          </Button>
        </footer>
      </aside>
    </div>
  );
}
