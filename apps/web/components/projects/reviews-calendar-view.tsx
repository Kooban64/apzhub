"use client";

/**
 * W008 S-12 Review Calendar — PX-05.
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
  createOperationalReview,
  createReviewSchedule,
  listOperationalReviews,
  listReviewSchedules,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { reviewDetailPath } from "@/lib/projects/routes";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

export function ReviewsCalendarView({
  permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageProjects(permissions);
  const [scopeId, setScopeId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reviews = useQuery({
    queryKey: [...projectsQueryKeys.all, "reviews"],
    queryFn: ({ signal }) => listOperationalReviews({}, { signal }),
  });
  const schedules = useQuery({
    queryKey: [...projectsQueryKeys.all, "review-schedules"],
    queryFn: ({ signal }) => listReviewSchedules({}, { signal }),
  });

  const createReview = useMutation({
    mutationFn: () =>
      createOperationalReview({
        type: "project",
        scopeType: "project",
        scopeId: scopeId.trim(),
        periodFrom: new Date(Date.now() - 7 * 86400000).toISOString(),
        periodTo: new Date().toISOString(),
      }),
    onSuccess: async (row) => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
      router.push(reviewDetailPath(String(row.id)));
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  const createSchedule = useMutation({
    mutationFn: () =>
      createReviewSchedule({
        type: "project",
        scopeType: "project",
        scopeId: scopeId.trim(),
        cadence: "weekly",
        nextRunAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      }),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Schedule failed.");
    },
  });

  return (
    <PageShell
      title="Reviews"
      description="Operational review calendar — history and future schedule. Not Analytics."
      breadcrumbs={["APZ Projects", "Reviews"]}
    >
      <div className="space-y-6" data-testid="reviews-calendar">
        {error ? <ErrorState message={error} /> : null}

        {canManage ? (
          <section className="flex flex-wrap items-end gap-2">
            <Input
              label="Project scope ID"
              value={scopeId}
              onChange={(e) => setScopeId(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={!scopeId.trim() || createReview.isPending}
              onClick={() => createReview.mutate()}
            >
              Schedule review
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!scopeId.trim() || createSchedule.isPending}
              onClick={() => createSchedule.mutate()}
            >
              Add cadence
            </Button>
          </section>
        ) : null}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Upcoming & history</h2>
          {reviews.isLoading ? <LoadingState label="Loading reviews…" /> : null}
          {!reviews.isLoading && (reviews.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="Schedule a Project, Programme, Portfolio, Delivery, or Governance review."
            />
          ) : null}
          <ul className="text-sm">
            {(reviews.data ?? []).map((r) => (
              <li
                key={String(r.id)}
                className="border-b border-[var(--color-border)] py-2"
              >
                <button
                  type="button"
                  className="underline"
                  onClick={() => router.push(reviewDetailPath(String(r.id)))}
                >
                  {String(r.type)} · {String(r.scopeType)}/{String(r.scopeId)} ·{" "}
                  {String(r.status)}
                </button>
                <span className="text-[var(--color-muted-foreground)]">
                  {" "}
                  · {String(r.periodFrom).slice(0, 10)} →{" "}
                  {String(r.periodTo).slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Cadence schedules</h2>
          {schedules.isLoading ? <LoadingState label="Loading schedules…" /> : null}
          <ul className="text-sm">
            {(schedules.data ?? []).map((s) => (
              <li
                key={String(s.id)}
                className="border-b border-[var(--color-border)] py-1"
              >
                {String(s.type)} · {String(s.cadence)} · next{" "}
                {String(s.nextRunAt).slice(0, 10)} · {String(s.status)}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
