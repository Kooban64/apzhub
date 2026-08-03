"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { QEP_AUTOMATION_ROUTES, parseQepAutomationExecutionId } from "@/lib/qep/routes";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

export function QepAutomationRouterView() {
  const pathname = usePathname() ?? "";
  const executionId = parseQepAutomationExecutionId(pathname);

  if (pathname.includes("/providers")) {
    return <ProvidersView />;
  }
  if (executionId) {
    return <ExecutionDetailView executionId={executionId} />;
  }
  return <AutomationHomeView />;
}

function AutomationHomeView() {
  const queryClient = useQueryClient();
  const [correlationId] = useState(() => crypto.randomUUID());

  const executionsQuery = useQuery({
    queryKey: ["qep-automation", "executions"],
    queryFn: () =>
      fetchJson<{
        executions: Array<{
          executionId: string;
          providerId: string;
          state: string;
          resultSummary?: string;
        }>;
      }>("/api/v1/qep/automation/executions"),
  });

  const runMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ execution: { executionId: string } }>(
        "/api/v1/qep/automation/executions",
        {
          method: "POST",
          body: JSON.stringify({
            providerId: "playwright",
            correlationId,
            runImmediately: true,
            target: {
              kind: "url",
              name: "workspace-smoke",
              baseUrl: "about:blank",
            },
            options: { dryRun: true },
          }),
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-automation"] });
    },
  });

  if (executionsQuery.isLoading) {
    return <QepLoadingState label="Loading automation queue…" />;
  }
  if (executionsQuery.isError) {
    return <QepErrorState message={(executionsQuery.error as Error).message} />;
  }

  const executions = executionsQuery.data?.executions ?? [];

  return (
    <QepPageShell
      title="Enterprise Automation"
      description="Provider-neutral automation foundation. Playwright is the first active provider."
      actions={
        <Button
          type="button"
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
        >
          {runMutation.isPending ? "Running…" : "Run Playwright dry-run"}
        </Button>
      }
    >
      <div className="mb-4 flex gap-3 text-sm">
        <Link href={QEP_AUTOMATION_ROUTES.providers}>Providers</Link>
        <Link href={QEP_AUTOMATION_ROUTES.queue}>Queue</Link>
        <Link href={QEP_AUTOMATION_ROUTES.history}>History</Link>
      </div>

      <QepPanel title="Execution queue / history">
        {executions.length === 0 ? (
          <QepEmptyState title="No executions yet — run a Playwright dry-run to begin." />
        ) : (
          <QepTable
            caption="Automation executions"
            columns={["Execution", "Provider", "State", "Summary"]}
            rows={executions.map((execution) => ({
              id: execution.executionId,
              href: QEP_AUTOMATION_ROUTES.execution(execution.executionId),
              cells: [
                execution.executionId.slice(0, 8),
                execution.providerId,
                <QepStatusBadge key="state" status={execution.state} />,
                execution.resultSummary ?? "—",
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function ProvidersView() {
  const providersQuery = useQuery({
    queryKey: ["qep-automation", "providers"],
    queryFn: () =>
      fetchJson<{
        providers: Array<{
          providerId: string;
          name: string;
          status: string;
          capabilities: string[];
        }>;
      }>("/api/v1/qep/automation/providers"),
  });

  if (providersQuery.isLoading) {
    return <QepLoadingState label="Loading providers…" />;
  }
  if (providersQuery.isError) {
    return <QepErrorState message={(providersQuery.error as Error).message} />;
  }

  return (
    <QepPageShell
      title="Automation providers"
      description="Active and placeholder providers"
    >
      <QepPanel title="Provider registry">
        <QepTable
          caption="Providers"
          columns={["Provider", "Status", "Capabilities"]}
          rows={(providersQuery.data?.providers ?? []).map((provider) => ({
            id: provider.providerId,
            href: QEP_AUTOMATION_ROUTES.provider(provider.providerId),
            cells: [
              provider.name,
              <QepStatusBadge key="st" status={provider.status} />,
              provider.capabilities.join(", "),
            ],
          }))}
        />
      </QepPanel>
    </QepPageShell>
  );
}

function ExecutionDetailView({ executionId }: { executionId: string }) {
  const detailQuery = useQuery({
    queryKey: ["qep-automation", "execution", executionId],
    queryFn: () =>
      fetchJson<{
        execution: {
          executionId: string;
          state: string;
          providerId: string;
          artifacts: Array<{ name: string; kind: string }>;
          evidenceRefs: string[];
          resultSummary?: string;
          timing: Record<string, string | number | undefined>;
        };
      }>(`/api/v1/qep/automation/executions/${executionId}`),
  });

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading execution…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={(detailQuery.error as Error | undefined)?.message ?? "Not found"}
      />
    );
  }

  const execution = detailQuery.data.execution;

  return (
    <QepPageShell
      title={`Execution ${execution.executionId.slice(0, 8)}`}
      description={`${execution.providerId} · ${execution.state}`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <QepPanel title="Live status">
          <QepStatusBadge status={execution.state} />
          <p className="mt-2 text-sm">{execution.resultSummary ?? "—"}</p>
        </QepPanel>
        <QepPanel title="Timeline / timing">
          <pre className="overflow-auto text-xs">
            {JSON.stringify(execution.timing, null, 2)}
          </pre>
        </QepPanel>
        <QepPanel title="Artifacts">
          <ul className="list-disc pl-5 text-sm">
            {execution.artifacts.map((artifact) => (
              <li key={artifact.name}>
                {artifact.kind}: {artifact.name}
              </li>
            ))}
          </ul>
        </QepPanel>
        <QepPanel title="Evidence references">
          <ul className="list-disc pl-5 text-sm">
            {execution.evidenceRefs.map((ref) => (
              <li key={ref}>{ref}</li>
            ))}
          </ul>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}
