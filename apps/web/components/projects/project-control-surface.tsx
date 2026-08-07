"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { isProjectsApiError } from "@/lib/projects/errors";
import { getControlSurface, scanProjectExceptions } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { ErrorState, LoadingState } from "./projects-ui";

export function ProjectControlSurface({ projectId }: { readonly projectId: string }) {
  const queryClient = useQueryClient();
  const control = useQuery({
    queryKey: [...projectsQueryKeys.all, "control", projectId],
    queryFn: ({ signal }) => getControlSurface(projectId, { signal }),
  });

  const scan = useMutation({
    mutationFn: () => scanProjectExceptions(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  const data = control.data;
  const health = data?.health as { status?: string } | undefined;
  const confidence = data?.confidence as { score?: number; band?: string } | undefined;
  const governance = data?.governanceStatus as Record<string, unknown> | undefined;

  return (
    <div className="flex flex-col gap-4" data-testid="projects-control-surface">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Control</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={scan.isPending}
          onClick={() => scan.mutate()}
          data-testid="projects-control-scan"
        >
          {scan.isPending ? "Scanning…" : "Scan & raise exceptions"}
        </Button>
      </div>

      {control.isLoading ? <LoadingState label="Loading control…" /> : null}
      {control.isError ? (
        <ErrorState
          message={
            isProjectsApiError(control.error)
              ? control.error.message
              : "Unable to load Control surface."
          }
          onRetry={() => void control.refetch()}
        />
      ) : null}

      {data ? (
        <>
          <section className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Health
              </p>
              <p className="font-semibold">{health?.status ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Confidence
              </p>
              <p className="font-semibold">
                {confidence ? `${confidence.score} · ${confidence.band}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Governance
              </p>
              <p className="text-sm">
                Pending checkpoints:{" "}
                {String(governance?.requiredCheckpointsPending ?? 0)} · Major
                exceptions: {String(governance?.openMajorExceptions ?? 0)}
                {governance?.approvalsUnavailable
                  ? " · Approvals unavailable (Workflow bridge)"
                  : ""}
              </p>
            </div>
          </section>

          <ControlList
            title="Open Decisions"
            testId="control-decisions"
            items={asItems(data.openDecisions, (d) => String(d.title ?? d.id))}
          />
          <ControlList
            title="Active Risks"
            testId="control-risks"
            items={asItems(data.activeRisks, (d) => String(d.title ?? d.id))}
          />
          <ControlList
            title="Active Exceptions"
            testId="control-exceptions"
            items={asItems(
              data.activeExceptions,
              (d) => `${String(d.severity)} · ${String(d.type)} · ${String(d.reason)}`,
            )}
          />
          <ControlList
            title="Waiting"
            testId="control-waiting"
            items={asItems(
              data.waiting,
              (d) => `${String(d.category)} · ${String(d.subject)}`,
            )}
          />
          <ControlList
            title="Checkpoints"
            testId="control-checkpoints"
            items={asItems(
              data.checkpoints,
              (d) => `${String(d.status)} · ${String(d.name)}`,
            )}
          />
        </>
      ) : null}

      {scan.isError ? (
        <ErrorState
          message={
            isProjectsApiError(scan.error)
              ? scan.error.message
              : "Exception scan failed."
          }
        />
      ) : null}
      {scan.isSuccess ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="status">
          Raised {scan.data.count} exception(s).
        </p>
      ) : null}
    </div>
  );
}

function asItems(
  value: unknown,
  label: (row: Record<string, unknown>) => string,
): readonly { id: string; label: string }[] {
  if (!Array.isArray(value)) return [];
  return value.map((row, index) => {
    const r = row as Record<string, unknown>;
    return { id: String(r.id ?? index), label: label(r) };
  });
}

function ControlList({
  title,
  items,
  testId,
}: {
  readonly title: string;
  readonly items: readonly { id: string; label: string }[];
  readonly testId: string;
}) {
  return (
    <section
      className="rounded-lg border border-[var(--color-border)] p-4"
      data-testid={testId}
    >
      <h3 className="text-sm font-semibold">
        {title}{" "}
        <span className="font-normal text-[var(--color-muted-foreground)]">
          ({items.length})
        </span>
      </h3>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {items.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
        {items.length === 0 ? (
          <li className="list-none text-[var(--color-muted-foreground)]">None</li>
        ) : null}
      </ul>
    </section>
  );
}
