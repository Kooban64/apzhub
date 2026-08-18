"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { WorkbenchBottomTabId } from "@apzhub/ui";

import { QEP_TEST_EXECUTION_BASE_PATH } from "@apzhub/qep-test-execution/presentation";

type AutomationExecutionSummary = {
  readonly executionId: string;
  readonly providerId: string;
  readonly state: string;
  readonly resultSummary?: string;
};

async function fetchAutomationExecutions(): Promise<
  readonly AutomationExecutionSummary[]
> {
  try {
    const res = await fetch("/api/v1/qep/automation/executions", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      data?: { executions?: AutomationExecutionSummary[] };
    };
    return body.data?.executions ?? [];
  } catch {
    return [];
  }
}

function HonestEmptyTestResults() {
  return (
    <div data-testid="qep-bottom-test-results-empty">
      <p className="font-medium text-[var(--color-foreground)]">
        No recent run results in this session.
      </p>
      <p className="mt-1 max-w-xl">
        Open{" "}
        <Link
          href={QEP_TEST_EXECUTION_BASE_PATH}
          className="underline underline-offset-2 hover:text-[var(--color-foreground)]"
        >
          Test Execution
        </Link>{" "}
        to browse runs.
      </p>
    </div>
  );
}

function QepTestResultsPanel() {
  const executionsQ = useQuery({
    queryKey: ["workbench", "qep-bottom", "automation-executions"],
    queryFn: fetchAutomationExecutions,
    staleTime: 30_000,
  });

  const executions = executionsQ.data ?? [];
  const latest = executions[0];

  if (executionsQ.isLoading) {
    return <p className="text-[var(--color-muted-foreground)]">Loading run results…</p>;
  }

  if (!latest) {
    return <HonestEmptyTestResults />;
  }

  return (
    <div data-testid="qep-bottom-test-results">
      <p className="font-medium text-[var(--color-foreground)]">
        Latest automation run
      </p>
      <dl className="mt-2 grid gap-1">
        <div className="flex gap-2">
          <dt className="text-[var(--color-muted-foreground)]">State</dt>
          <dd>{latest.state}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-[var(--color-muted-foreground)]">Provider</dt>
          <dd className="font-mono text-[11px]">{latest.providerId}</dd>
        </div>
        {latest.resultSummary ? (
          <div className="mt-1">
            <dt className="sr-only">Summary</dt>
            <dd>{latest.resultSummary}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-2">
        <Link
          href={QEP_TEST_EXECUTION_BASE_PATH}
          className="underline underline-offset-2 hover:text-[var(--color-foreground)]"
        >
          Open Test Execution
        </Link>
      </p>
    </div>
  );
}

function QepOutputPanel() {
  return (
    <div data-testid="qep-bottom-output">
      <p className="font-medium text-[var(--color-foreground)]">Output</p>
      <p className="mt-1 max-w-xl">
        No streamed output for this session. Run details live in Test Execution and
        Automation.
      </p>
    </div>
  );
}

/** Source workspace: honest empty test-results only (Slice 3). */
function SourceTestResultsPanel() {
  return <HonestEmptyTestResults />;
}

/**
 * Bottom-panel content for Quality / Source workspaces (Workbench Slice 3).
 * Terminal stays Not configured in the shell layout.
 */
export function resolveQepBottomPanelContent(
  pathname: string,
): Partial<Record<WorkbenchBottomTabId, ReactNode>> | undefined {
  if (pathname.startsWith("/workspace/qep")) {
    return {
      "test-results": <QepTestResultsPanel />,
      output: <QepOutputPanel />,
    };
  }
  if (pathname.startsWith("/workspace/source")) {
    return {
      "test-results": <SourceTestResultsPanel />,
    };
  }
  return undefined;
}
