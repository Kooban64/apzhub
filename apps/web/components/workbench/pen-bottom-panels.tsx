"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { WorkbenchBottomTabId } from "@apzhub/ui";

import { APZPEN_WB, isApzpenWorkbenchRoute } from "@/lib/apzpen/workbench-routes";

type DispatchJob = {
  readonly jobId: string;
  readonly tool: string;
  readonly status: string;
  readonly message?: string;
};

async function fetchLatestJobs(): Promise<readonly DispatchJob[]> {
  try {
    const eng = await fetch("/api/v1/apzpen/engagements?seed=0", {
      cache: "no-store",
    });
    if (!eng.ok) return [];
    const engBody = (await eng.json()) as {
      data?: { engagements?: Array<{ engagementId: string }> };
    };
    const first = engBody.data?.engagements?.[0];
    if (!first) return [];
    const res = await fetch(
      `/api/v1/apzpen/engagements/${first.engagementId}/dispatch`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: { jobs?: DispatchJob[] } };
    return body.data?.jobs ?? [];
  } catch {
    return [];
  }
}

function PenToolOutputPanel() {
  const jobsQ = useQuery({
    queryKey: ["workbench", "pen-bottom", "dispatch-jobs"],
    queryFn: fetchLatestJobs,
    staleTime: 30_000,
  });

  const jobs = jobsQ.data ?? [];
  const latest = jobs[0];

  if (jobsQ.isLoading) {
    return <p className="text-[var(--color-muted-foreground)]">Loading tool output…</p>;
  }

  if (!latest) {
    return (
      <div data-testid="pen-bottom-tool-output-empty">
        <p className="font-medium text-[var(--color-foreground)]">
          No tool output in this session.
        </p>
        <p className="mt-1 max-w-xl">
          Open an engagement and run a configured provider, or browse{" "}
          <Link
            href={APZPEN_WB.providers}
            className="underline underline-offset-2 hover:text-[var(--color-foreground)]"
          >
            Tools
          </Link>
          . Raw provider alerts are not automatic findings.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="pen-bottom-tool-output">
      <p className="font-medium text-[var(--color-foreground)]">Latest tool job</p>
      <dl className="mt-2 grid gap-1">
        <div className="flex gap-2">
          <dt className="text-[var(--color-muted-foreground)]">Tool</dt>
          <dd className="font-mono text-[11px]">{latest.tool}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-[var(--color-muted-foreground)]">Status</dt>
          <dd>{latest.status}</dd>
        </div>
        {latest.message ? (
          <div className="mt-1">
            <dd className="whitespace-pre-wrap font-mono text-[11px]">
              {latest.message}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function PenEvidencePanel() {
  return (
    <div data-testid="pen-bottom-evidence">
      <p className="font-medium text-[var(--color-foreground)]">Evidence</p>
      <p className="mt-1 max-w-xl">
        Open the{" "}
        <Link
          href={APZPEN_WB.evidence}
          className="underline underline-offset-2 hover:text-[var(--color-foreground)]"
        >
          Evidence
        </Link>{" "}
        workspace for engagement-scoped artefacts. Forensic integrity is only claimed
        where the vault records it.
      </p>
    </div>
  );
}

export const PEN_BOTTOM_TAB_LABELS: Partial<Record<WorkbenchBottomTabId, string>> = {
  output: "Tool Output",
  "test-results": "Evidence",
};

/**
 * Bottom-panel content for Security / PEN workspaces (Workbench Slice 4).
 * Terminal stays Not configured — PEN ≠ Terminal entitlement.
 */
export function resolvePenBottomPanelContent(
  pathname: string,
): Partial<Record<WorkbenchBottomTabId, ReactNode>> | undefined {
  if (!isApzpenWorkbenchRoute(pathname)) return undefined;
  return {
    output: <PenToolOutputPanel />,
    "test-results": <PenEvidencePanel />,
  };
}
