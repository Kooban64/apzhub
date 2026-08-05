"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery } from "@tanstack/react-query";

import { isTimeApiError } from "@/lib/time/errors";
import { timeQueryKeys } from "@/lib/time/query-keys";
import {
  getTimeCapabilities,
  getTimeCompatibility,
  getTimeDiagnostics,
  getTimeReadiness,
  testTimeConnection,
} from "@/lib/time/time-api";

import { DeveloperDetails, ErrorState, LoadingState, PageShell } from "./time-ui";

function SummaryCard({
  label,
  value,
  testId,
}: {
  readonly label: string;
  readonly value: string;
  readonly testId?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] p-3">
      <p className="text-xs uppercase text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-1 text-sm font-medium" data-testid={testId}>
        {value}
      </p>
    </div>
  );
}

function asStatus(value: unknown): string {
  if (value && typeof value === "object" && "status" in value) {
    const status = (value as { status?: unknown }).status;
    if (typeof status === "string" && status.trim()) return status;
  }
  if (typeof value === "string" && value.trim()) return value;
  return "Available";
}

/**
 * Operator platform readiness — APZHUB product framing only.
 * Structured details stay behind developer disclosure; never raw adapter console.
 */
export function TimeDiagnosticsView() {
  const diagnosticsQuery = useQuery({
    queryKey: timeQueryKeys.diagnostics(),
    queryFn: ({ signal }) => getTimeDiagnostics({ signal }),
  });

  const capabilitiesQuery = useQuery({
    queryKey: timeQueryKeys.capabilities(),
    queryFn: ({ signal }) => getTimeCapabilities({ signal }),
  });

  const readinessQuery = useQuery({
    queryKey: timeQueryKeys.readiness(),
    queryFn: ({ signal }) => getTimeReadiness({ signal }),
  });

  const compatibilityQuery = useQuery({
    queryKey: timeQueryKeys.compatibility(),
    queryFn: ({ signal }) => getTimeCompatibility({ signal }),
  });

  const readinessMutation = useMutation({
    mutationFn: () => testTimeConnection(),
  });

  return (
    <PageShell
      title="Platform readiness"
      description="Operator view of APZ Time platform readiness. Support details are available when needed."
      breadcrumbs={["APZ Time", "Platform readiness"]}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Diagnostics"
          value={
            diagnosticsQuery.isLoading
              ? "Checking…"
              : diagnosticsQuery.isError
                ? "Unavailable"
                : asStatus(diagnosticsQuery.data)
          }
          testId="time-diagnostics-summary"
        />
        <SummaryCard
          label="Capabilities"
          value={
            capabilitiesQuery.isLoading
              ? "Checking…"
              : capabilitiesQuery.isError
                ? "Unavailable"
                : asStatus(capabilitiesQuery.data)
          }
          testId="time-capabilities-summary"
        />
        <SummaryCard
          label="Readiness"
          value={
            readinessQuery.isLoading
              ? "Checking…"
              : readinessQuery.isError
                ? "Unavailable"
                : asStatus(readinessQuery.data)
          }
          testId="time-readiness-summary"
        />
        <SummaryCard
          label="Compatibility"
          value={
            compatibilityQuery.isLoading
              ? "Checking…"
              : compatibilityQuery.isError
                ? "Unavailable"
                : asStatus(compatibilityQuery.data)
          }
          testId="time-compatibility-summary"
        />
      </div>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-connection-panel"
      >
        <h2 className="text-sm font-semibold">Check platform readiness</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Verifies that APZ Time can reach its platform services. This is an operator
          check — not an integration console.
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-3"
          disabled={readinessMutation.isPending}
          onClick={() => readinessMutation.mutate()}
          data-testid="time-connection-test"
        >
          {readinessMutation.isPending ? "Checking…" : "Run readiness check"}
        </Button>
        {readinessMutation.isError ? (
          <div className="mt-3">
            <ErrorState
              message={
                isTimeApiError(readinessMutation.error)
                  ? readinessMutation.error.message
                  : "Readiness check failed."
              }
            />
          </div>
        ) : null}
        {readinessMutation.data ? (
          <div className="mt-3 space-y-2">
            <SummaryCard
              label="Last check"
              value={asStatus(readinessMutation.data)}
              testId="time-connection-result-summary"
            />
            <DeveloperDetails
              title="Developer details"
              value={readinessMutation.data}
              testId="time-connection-result"
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-3" data-testid="time-diagnostics-panel">
        <h2 className="text-sm font-semibold">Support details</h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Expand only when supporting an incident. Values are redacted for safe display.
        </p>
        {diagnosticsQuery.isLoading ||
        capabilitiesQuery.isLoading ||
        readinessQuery.isLoading ||
        compatibilityQuery.isLoading ? (
          <LoadingState label="Loading readiness details…" />
        ) : null}
        {diagnosticsQuery.isError ? (
          <ErrorState
            message={
              isTimeApiError(diagnosticsQuery.error)
                ? diagnosticsQuery.error.message
                : "Unable to load diagnostics."
            }
            onRetry={() => void diagnosticsQuery.refetch()}
          />
        ) : null}
        {diagnosticsQuery.data ? (
          <DeveloperDetails title="Diagnostics detail" value={diagnosticsQuery.data} />
        ) : null}
        {capabilitiesQuery.data ? (
          <DeveloperDetails
            title="Capabilities detail"
            value={capabilitiesQuery.data}
            testId="time-capabilities-panel"
          />
        ) : null}
        {readinessQuery.data ? (
          <DeveloperDetails
            title="Readiness detail"
            value={readinessQuery.data}
            testId="time-readiness-panel"
          />
        ) : null}
        {compatibilityQuery.data ? (
          <DeveloperDetails
            title="Compatibility detail"
            value={compatibilityQuery.data}
            testId="time-compatibility-panel"
          />
        ) : null}
      </section>
    </PageShell>
  );
}
