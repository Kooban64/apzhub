"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  createCommitment,
  getDeliveryConfidence,
  getDeliveryForecast,
  getOperationalHealth,
  getProjectPulse,
  listCommitments,
  listWaiting,
  transitionCommitment,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { ErrorState, LoadingState } from "./projects-ui";

export function ProjectOperationalPanel({ projectId }: { readonly projectId: string }) {
  const queryClient = useQueryClient();
  const [statement, setStatement] = useState("");
  const [ownerUserId, setOwnerUserId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const commitments = useQuery({
    queryKey: [...projectsQueryKeys.all, "commitments", projectId],
    queryFn: ({ signal }) => listCommitments(projectId, { signal }),
  });
  const waiting = useQuery({
    queryKey: [...projectsQueryKeys.all, "waiting", projectId],
    queryFn: ({ signal }) => listWaiting(projectId, { signal }),
  });
  const health = useQuery({
    queryKey: [...projectsQueryKeys.all, "ops-health", projectId],
    queryFn: ({ signal }) => getOperationalHealth(projectId, { signal }),
  });
  const confidence = useQuery({
    queryKey: [...projectsQueryKeys.all, "ops-confidence", projectId],
    queryFn: ({ signal }) => getDeliveryConfidence(projectId, { signal }),
  });
  const pulse = useQuery({
    queryKey: [...projectsQueryKeys.all, "ops-pulse", projectId],
    queryFn: ({ signal }) => getProjectPulse(projectId, { signal }),
  });
  const forecast = useQuery({
    queryKey: [...projectsQueryKeys.all, "ops-forecast", projectId],
    queryFn: ({ signal }) => getDeliveryForecast(projectId, 14, { signal }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createCommitment(projectId, {
        statement: statement.trim(),
        ownerUserId: ownerUserId.trim(),
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      }),
    onSuccess: async () => {
      setStatement("");
      setError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Unable to create commitment.");
    },
  });

  const transitionMutation = useMutation({
    mutationFn: ({
      id,
      to,
      extra,
    }: {
      id: string;
      to: string;
      extra?: Record<string, unknown>;
    }) => transitionCommitment(projectId, id, { to, ...extra }),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Transition failed.");
    },
  });

  return (
    <div className="flex flex-col gap-4" data-testid="projects-operational-panel">
      <section className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Health
          </p>
          <p className="text-sm font-semibold" data-testid="ops-health-status">
            {String(health.data?.status ?? "—")}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Confidence
          </p>
          <p className="text-sm font-semibold" data-testid="ops-confidence">
            {confidence.data
              ? `${String(confidence.data.score)} · ${String(confidence.data.band)}`
              : "—"}
          </p>
        </div>
        <div className="md:col-span-1">
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Pulse
          </p>
          <p className="text-sm" data-testid="ops-pulse">
            {String(pulse.data?.text ?? "—")}
          </p>
        </div>
        {forecast.data ? (
          <div className="md:col-span-3 text-sm" data-testid="ops-forecast">
            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
              14-day forecast
            </p>
            <p>
              {String(forecast.data.predictedOutcome)} · Δ confidence{" "}
              {String(forecast.data.projectedConfidenceDelta)} ·{" "}
              {String(forecast.data.narrative)}
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="text-sm font-semibold">Commitments</h2>
        {commitments.isLoading ? <LoadingState label="Loading commitments…" /> : null}
        <ul
          className="mt-2 flex flex-col gap-2 text-sm"
          data-testid="ops-commitment-list"
        >
          {(commitments.data ?? []).map((c) => (
            <li
              key={String(c.id)}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2"
            >
              <div>
                <p className="font-medium">{String(c.statement)}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {String(c.status)} · owner {String(c.ownerUserId)}
                  {c.dueAt ? ` · due ${String(c.dueAt).slice(0, 10)}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.status === "proposed" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      transitionMutation.mutate({ id: String(c.id), to: "accepted" })
                    }
                  >
                    Accept
                  </Button>
                ) : null}
                {c.status === "accepted" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      transitionMutation.mutate({
                        id: String(c.id),
                        to: "in_progress",
                      })
                    }
                  >
                    Start
                  </Button>
                ) : null}
                {c.status === "in_progress" || c.status === "accepted" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      transitionMutation.mutate({
                        id: String(c.id),
                        to: "waiting",
                        extra: {
                          waiting: {
                            subject: `Waiting on ${String(c.statement)}`,
                            category: "internal",
                            chaseOwnerUserId: String(c.ownerUserId),
                            slaDays: 7,
                          },
                        },
                      })
                    }
                  >
                    Log wait
                  </Button>
                ) : null}
                {c.status === "in_progress" || c.status === "waiting" ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      transitionMutation.mutate({
                        id: String(c.id),
                        to: "done",
                        extra: {
                          evidenceOptional: true,
                          evidence: [
                            {
                              type: "verification_note",
                              label: "Completed in operational workspace",
                            },
                          ],
                        },
                      })
                    }
                  >
                    Complete
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
          {(commitments.data ?? []).length === 0 ? (
            <li className="text-[var(--color-muted-foreground)]">
              No commitments yet. Commitments are the atomic delivery promises.
            </li>
          ) : null}
        </ul>

        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (statement.trim() && ownerUserId.trim()) createMutation.mutate();
          }}
          data-testid="ops-commitment-create"
        >
          <Input
            label="Statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />
          <Input
            label="Owner user ID"
            value={ownerUserId}
            onChange={(e) => setOwnerUserId(e.target.value)}
          />
          <Input
            label="Due"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            disabled={
              createMutation.isPending || !statement.trim() || !ownerUserId.trim()
            }
          >
            Create commitment
          </Button>
        </form>
      </section>

      <section className="rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="text-sm font-semibold">Waiting</h2>
        {waiting.isLoading ? <LoadingState label="Loading waiting…" /> : null}
        <ul className="mt-2 text-sm" data-testid="ops-waiting-list">
          {(waiting.data ?? []).map((w) => (
            <li key={String(w.id)}>
              {String(w.subject)} · {String(w.category)} · {String(w.status)}
            </li>
          ))}
          {(waiting.data ?? []).length === 0 ? (
            <li className="text-[var(--color-muted-foreground)]">No active waits.</li>
          ) : null}
        </ul>
      </section>

      {error ? <ErrorState message={error} /> : null}
    </div>
  );
}
