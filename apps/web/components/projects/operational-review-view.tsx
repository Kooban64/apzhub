"use client";

/**
 * W008 S-11 Operational Review Workspace — pack · executive summary · outcomes · snapshot.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  canManageProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  completeOperationalReview,
  getOperationalReview,
  getReviewExecutiveSummary,
  getReviewSnapshot,
  startOperationalReview,
  updateReviewExecutiveSummary,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { reviewsCalendarPath } from "@/lib/projects/routes";

import { ErrorState, LoadingState, PageShell } from "./projects-ui";

export function OperationalReviewView({
  reviewId,
  permissions,
}: {
  readonly reviewId: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageProjects(permissions);
  const [followUp, setFollowUp] = useState("");
  const [commitmentId, setCommitmentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const review = useQuery({
    queryKey: [...projectsQueryKeys.all, "review", reviewId],
    queryFn: ({ signal }) => getOperationalReview(reviewId, { signal }),
  });

  const snapshot = useQuery({
    queryKey: [...projectsQueryKeys.all, "review-snapshot", reviewId],
    queryFn: ({ signal }) => getReviewSnapshot(reviewId, { signal }),
    enabled: Boolean(review.data?.packSnapshotId),
  });

  const summary = useQuery({
    queryKey: [...projectsQueryKeys.all, "review-summary", reviewId],
    queryFn: ({ signal }) => getReviewExecutiveSummary(reviewId, { signal }),
    enabled: Boolean(review.data?.executiveSummaryId),
  });

  const start = useMutation({
    mutationFn: () => startOperationalReview(reviewId),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Start failed.");
    },
  });

  const saveSummary = useMutation({
    mutationFn: () =>
      updateReviewExecutiveSummary(reviewId, {
        recommendedActions: String(summary.data?.recommendedActions ?? ""),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  const complete = useMutation({
    mutationFn: () =>
      completeOperationalReview(reviewId, {
        outcomes: {
          decisions: [],
          newCommitments: commitmentId.trim() ? [commitmentId.trim()] : [],
          risksRaised: [],
          risksClosed: [],
          exceptionsRaised: [],
          exceptionsClosed: [],
          governanceActions: [],
          followUpReviewAt: followUp.trim(),
          emptyCategoriesAttested: true,
        },
      }),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Complete failed.");
    },
  });

  const status = String(review.data?.status ?? "");

  return (
    <PageShell
      title="Operational Review"
      description="Cadenced operational ceremony — pack snapshot, executive summary, structured outcomes."
      breadcrumbs={["APZ Projects", "Reviews", reviewId]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(reviewsCalendarPath())}
        >
          Calendar
        </Button>
      }
    >
      <div className="space-y-6" data-testid="operational-review-workspace">
        {review.isLoading ? <LoadingState label="Loading review…" /> : null}
        {error ? <ErrorState message={error} /> : null}

        {review.data ? (
          <p className="text-sm">
            {String(review.data.type)} · {String(review.data.scopeType)}/
            {String(review.data.scopeId)} · <strong>{status}</strong>
          </p>
        ) : null}

        {canManage && status === "scheduled" ? (
          <Button
            type="button"
            size="sm"
            disabled={start.isPending}
            onClick={() => start.mutate()}
          >
            Open pack & start
          </Button>
        ) : null}

        {snapshot.data ? (
          <section
            className="space-y-2 border border-[var(--color-border)] p-4"
            data-testid="review-snapshot-viewer"
          >
            <h2 className="text-sm font-semibold">Review pack snapshot</h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              As of {String(snapshot.data.asOf)} · correlation{" "}
              {String(snapshot.data.correlationId)} — immutable after complete.
            </p>
            <ul className="text-sm">
              {(
                (snapshot.data.metrics as
                  | readonly {
                      key?: string;
                      label?: string;
                      value?: string | number;
                      howCalculated?: string;
                      drill?: { href?: string; label?: string };
                    }[]
                  | undefined) ?? []
              ).map((m) => (
                <li key={String(m.key)} className="py-1">
                  <a className="underline" href={String(m.drill?.href ?? "#")}>
                    {String(m.label)}: {String(m.value)}
                  </a>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {" "}
                    — {String(m.howCalculated)} · drill {String(m.drill?.label)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {summary.data ? (
          <section
            className="space-y-2 border border-[var(--color-border)] p-4"
            data-testid="executive-summary"
          >
            <h2 className="text-sm font-semibold">Executive summary</h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              ≤1 page · deterministic · no AI
              {summary.data.editable ? "" : " · frozen"}
            </p>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">Current position</dt>
                <dd>{String(summary.data.currentPosition)}</dd>
              </div>
              <div>
                <dt className="font-medium">Key changes</dt>
                <dd>{String(summary.data.keyChanges)}</dd>
              </div>
              <div>
                <dt className="font-medium">Principal risks</dt>
                <dd>{String(summary.data.principalRisks)}</dd>
              </div>
              <div>
                <dt className="font-medium">Decisions required</dt>
                <dd>{String(summary.data.decisionsRequired)}</dd>
              </div>
              <div>
                <dt className="font-medium">Recommended actions</dt>
                <dd>{String(summary.data.recommendedActions)}</dd>
              </div>
            </dl>
            {canManage && summary.data.editable ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saveSummary.isPending}
                onClick={() => saveSummary.mutate()}
              >
                Save summary edits
              </Button>
            ) : null}
          </section>
        ) : null}

        {canManage && status === "in_progress" ? (
          <section className="space-y-2 border border-[var(--color-border)] p-4">
            <h2 className="text-sm font-semibold">Structured outcomes</h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Actions become Commitments only. Follow-up review date mandatory.
            </p>
            <Input
              label="New commitment ID (optional)"
              value={commitmentId}
              onChange={(e) => setCommitmentId(e.target.value)}
            />
            <Input
              label="Follow-up review at (ISO)"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={!followUp.trim() || complete.isPending}
              onClick={() => complete.mutate()}
            >
              Complete review
            </Button>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
