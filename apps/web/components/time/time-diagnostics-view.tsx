"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery } from "@tanstack/react-query";

import { isTimeApiError } from "@/lib/time/errors";
import { formatSafeDiagnosticsJson } from "@/lib/time/format";
import { timeQueryKeys } from "@/lib/time/query-keys";
import {
  getTimeCapabilities,
  getTimeCompatibility,
  getTimeDiagnostics,
  getTimeReadiness,
  testTimeConnection,
} from "@/lib/time/time-api";

import { ErrorState, LoadingState, PageShell } from "./time-ui";

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

  const connectionMutation = useMutation({
    mutationFn: () => testTimeConnection(),
  });

  return (
    <PageShell
      title="Diagnostics"
      description="Time diagnostics, capabilities, readiness, compatibility, and connection test."
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-diagnostics-panel"
      >
        <h2 className="text-sm font-semibold">Diagnostics</h2>
        {diagnosticsQuery.isLoading ? <LoadingState /> : null}
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
          <pre className="mt-3 overflow-x-auto text-xs">
            {formatSafeDiagnosticsJson(diagnosticsQuery.data)}
          </pre>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-capabilities-panel"
      >
        <h2 className="text-sm font-semibold">Capabilities</h2>
        {capabilitiesQuery.isLoading ? (
          <LoadingState label="Loading capabilities…" />
        ) : null}
        {capabilitiesQuery.isError ? (
          <ErrorState
            message={
              isTimeApiError(capabilitiesQuery.error)
                ? capabilitiesQuery.error.message
                : "Unable to load capabilities."
            }
            onRetry={() => void capabilitiesQuery.refetch()}
          />
        ) : null}
        {capabilitiesQuery.data ? (
          <pre className="mt-3 overflow-x-auto text-xs">
            {JSON.stringify(capabilitiesQuery.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-readiness-panel"
      >
        <h2 className="text-sm font-semibold">Readiness</h2>
        {readinessQuery.isLoading ? <LoadingState label="Loading readiness…" /> : null}
        {readinessQuery.isError ? (
          <ErrorState
            message={
              isTimeApiError(readinessQuery.error)
                ? readinessQuery.error.message
                : "Unable to load readiness."
            }
            onRetry={() => void readinessQuery.refetch()}
          />
        ) : null}
        {readinessQuery.data ? (
          <pre className="mt-3 overflow-x-auto text-xs">
            {JSON.stringify(readinessQuery.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-compatibility-panel"
      >
        <h2 className="text-sm font-semibold">Compatibility</h2>
        {compatibilityQuery.isLoading ? (
          <LoadingState label="Loading compatibility…" />
        ) : null}
        {compatibilityQuery.isError ? (
          <ErrorState
            message={
              isTimeApiError(compatibilityQuery.error)
                ? compatibilityQuery.error.message
                : "Unable to load compatibility."
            }
            onRetry={() => void compatibilityQuery.refetch()}
          />
        ) : null}
        {compatibilityQuery.data ? (
          <pre className="mt-3 overflow-x-auto text-xs">
            {JSON.stringify(compatibilityQuery.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="time-connection-panel"
      >
        <h2 className="text-sm font-semibold">Connection test</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Runs a Platform Time connection check without exposing engine details.
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-3"
          disabled={connectionMutation.isPending}
          onClick={() => connectionMutation.mutate()}
          data-testid="time-connection-test"
        >
          {connectionMutation.isPending ? "Testing…" : "Test connection"}
        </Button>
        {connectionMutation.isError ? (
          <ErrorState
            message={
              isTimeApiError(connectionMutation.error)
                ? connectionMutation.error.message
                : "Connection test failed."
            }
          />
        ) : null}
        {connectionMutation.data ? (
          <pre
            className="mt-3 overflow-x-auto text-xs"
            data-testid="time-connection-result"
          >
            {JSON.stringify(connectionMutation.data, null, 2)}
          </pre>
        ) : null}
      </section>
    </PageShell>
  );
}
