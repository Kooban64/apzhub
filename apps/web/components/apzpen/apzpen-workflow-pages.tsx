"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  FindingAssignEvidenceForm,
  FindingStatusButtons,
} from "@/components/apzpen/finding-operator-controls";
import { OperatorGate } from "@/components/operator/operator-gate";
import {
  OperatorMetricStrip,
  OperatorPage,
  OperatorPanel,
} from "@/components/operator/operator-shell";
import type { Engagement, Finding, SecurityPosture } from "@/lib/apzpen/types";
import {
  buildCertificationBoard,
  filterEvidenceGaps,
  filterEvidenceLibrary,
  filterMyWorkQueue,
  filterRemediationQueue,
  filterRetestQueue,
} from "@/lib/apzpen/workflow-views";
import { useSession } from "@apzhub/auth";

async function fetchFindings() {
  const res = await fetch("/api/v1/apzpen/findings");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load");
  return body.data as { findings: Finding[] };
}

async function fetchEngagements() {
  const res = await fetch("/api/v1/apzpen/engagements?seed=1");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load");
  return body.data as {
    engagements: Array<Engagement & { posture?: SecurityPosture }>;
  };
}

async function postFindingAction(payload: Record<string, unknown>) {
  const res = await fetch("/api/v1/apzpen/findings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Action failed");
  return body.data;
}

async function postEngagementAction(
  engagementId: string,
  action: string,
  payload: Record<string, unknown> = {},
) {
  const res = await fetch(`/api/v1/apzpen/engagements/${engagementId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Action failed");
  return body.data;
}

function Frame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <OperatorGate shell="apzpen">
      <OperatorPage title={title} subtitle={subtitle}>
        {children}
      </OperatorPage>
    </OperatorGate>
  );
}

function severityClass(severity: string): string {
  if (severity === "critical") return "text-[var(--color-destructive)]";
  if (severity === "high") return "text-[var(--color-warning)]";
  return "text-[var(--color-muted-foreground)]";
}

function FindingWorkbenchPanel({
  finding,
  onAction,
  pending,
  actionError,
}: {
  readonly finding: Finding;
  readonly onAction: (payload: Record<string, unknown>) => void;
  readonly pending?: boolean;
  readonly actionError?: Error | null;
}) {
  return (
    <aside
      className="rounded-lg border border-[var(--color-border)] p-3"
      data-testid="apzpen-finding-workbench-panel"
      aria-label="Selected finding detail"
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p
            className={`text-xs font-semibold uppercase ${severityClass(finding.severity)}`}
          >
            {finding.severity}
          </p>
          <h3 className="text-sm font-medium">{finding.title}</h3>
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {finding.status}
            {finding.assignedTo ? ` · ${finding.assignedTo}` : " · Unassigned"}
          </p>
        </div>
        <Link
          href={`/apzpen/findings/${finding.findingId}`}
          className="text-[11px] text-[var(--color-primary)] underline-offset-2 hover:underline"
        >
          Open full detail
        </Link>
      </div>

      <dl className="mb-3 grid gap-1 text-[11px]">
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--color-muted-foreground)]">Location</dt>
          <dd className="font-mono">{finding.location ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--color-muted-foreground)]">CWE / CVSS</dt>
          <dd>
            {finding.cwe ?? "—"} / {finding.cvss ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--color-muted-foreground)]">Engagement</dt>
          <dd>
            <Link
              href={`/apzpen/engagements/${finding.engagementId}`}
              className="underline"
            >
              {finding.engagementId}
            </Link>
          </dd>
        </div>
      </dl>

      <section className="mb-3">
        <h4 className="mb-1 text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
          Description
        </h4>
        <p className="max-h-28 overflow-auto whitespace-pre-wrap text-[12px]">
          {finding.description || "—"}
        </p>
      </section>

      <section className="mb-3">
        <h4 className="mb-1 text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
          Remediation
        </h4>
        <p className="max-h-28 overflow-auto whitespace-pre-wrap text-[12px]">
          {finding.remediation ?? "No remediation guidance recorded yet."}
        </p>
      </section>

      <section className="mb-3">
        <h4 className="mb-1 text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
          Evidence ({finding.evidence?.length ?? 0})
        </h4>
        {(finding.evidence?.length ?? 0) === 0 ? (
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            No evidence attached.
          </p>
        ) : (
          <ul className="max-h-24 space-y-1 overflow-auto text-[11px]">
            {finding.evidence.map((item) => (
              <li key={item.evidenceId} className="font-mono">
                {item.kind}: {item.label}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="border-t border-[var(--color-border)] pt-2">
        <FindingStatusButtons finding={finding} onAction={onAction} pending={pending} />
        <FindingAssignEvidenceForm
          finding={finding}
          onAction={onAction}
          pending={pending}
        />
        {actionError ? (
          <p className="mt-2 text-[11px] text-[var(--color-destructive)]" role="alert">
            {actionError.message}
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function WorkflowFindingsTable({
  findings,
  onAction,
  pending,
  selectedFindingId,
  onSelectFinding,
  compactActions = false,
}: {
  findings: readonly Finding[];
  onAction: (payload: Record<string, unknown>) => void;
  pending?: boolean;
  selectedFindingId?: string | null;
  onSelectFinding?: (findingId: string) => void;
  /** When true, actions live in the side panel only. */
  compactActions?: boolean;
}) {
  if (findings.length === 0) {
    return (
      <p className="text-[12px] text-[var(--color-muted-foreground)]">
        Queue is empty.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12px]">
        <thead className="text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
          <tr>
            <th className="py-1.5 pr-2">Severity</th>
            <th className="py-1.5 pr-2">Finding</th>
            <th className="py-1.5 pr-2">Status</th>
            <th className="py-1.5 pr-2">Assignee</th>
            <th className="py-1.5 pr-2">Evidence</th>
            {compactActions ? null : <th className="py-1.5 pr-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {findings.map((f) => {
            const selected = f.findingId === selectedFindingId;
            return (
              <tr
                key={f.findingId}
                className={`border-t border-[var(--color-border)] align-top ${
                  selected
                    ? "bg-[var(--color-muted)]/40 ring-1 ring-inset ring-[var(--color-ring)]"
                    : onSelectFinding
                      ? "cursor-pointer hover:bg-[var(--color-muted)]/20"
                      : ""
                }`}
                data-testid={`apzpen-workflow-row-${f.findingId}`}
                aria-selected={onSelectFinding ? selected : undefined}
                onClick={() => onSelectFinding?.(f.findingId)}
              >
                <td
                  className={`py-2 pr-2 font-medium uppercase ${severityClass(f.severity)}`}
                >
                  {f.severity}
                </td>
                <td className="py-2 pr-2">
                  <Link
                    href={`/apzpen/findings/${f.findingId}`}
                    className="font-medium hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {f.title}
                  </Link>
                  <Link
                    href={`/apzpen/engagements/${f.engagementId}`}
                    className="mt-0.5 block font-mono text-[10px] underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {f.engagementId}
                  </Link>
                </td>
                <td className="py-2 pr-2">{f.status}</td>
                <td className="py-2 pr-2">{f.assignedTo ?? "—"}</td>
                <td className="py-2 pr-2">{f.evidence?.length ?? 0}</td>
                {compactActions ? null : (
                  <td
                    className="py-2 pr-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <FindingStatusButtons
                      finding={f}
                      onAction={onAction}
                      pending={pending}
                    />
                    <FindingAssignEvidenceForm
                      finding={f}
                      onAction={onAction}
                      pending={pending}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function useSelectedFinding(findings: readonly Finding[]): {
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  selected: Finding | null;
} {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (findings.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !findings.some((f) => f.findingId === selectedId)) {
      setSelectedId(findings[0]!.findingId);
    }
  }, [findings, selectedId]);
  const selected =
    findings.find((f) => f.findingId === selectedId) ?? findings[0] ?? null;
  return {
    selectedId: selected?.findingId ?? null,
    setSelectedId,
    selected,
  };
}

function useFindingActions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postFindingAction,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apzpen"] });
    },
  });
}

export function ApzpenMyWorkPage() {
  const { data: session } = useSession();
  const me = session?.user?.email?.trim() || session?.user?.id?.trim() || "";
  const q = useQuery({
    queryKey: ["apzpen", "findings", "my-work", me],
    queryFn: fetchFindings,
    enabled: Boolean(me),
  });
  const action = useFindingActions();
  const rows = filterMyWorkQueue(q.data?.findings ?? [], me);

  return (
    <Frame
      title="My Work"
      subtitle="Findings assigned to you — remediation and retest handoff."
    >
      <OperatorMetricStrip
        metrics={[
          { label: "Assigned to me", value: String(rows.length) },
          {
            label: "Critical",
            value: String(rows.filter((f) => f.severity === "critical").length),
          },
          {
            label: "Retest",
            value: String(
              rows.filter(
                (f) => f.status === "retest_requested" || f.status === "retest_failed",
              ).length,
            ),
          },
        ]}
      />
      {!me ? (
        <p className="text-[12px] text-[var(--color-muted-foreground)]">
          Sign in to see assigned findings.
        </p>
      ) : (
        <OperatorPanel title={`Queue for ${me}`}>
          {action.error ? (
            <p className="mb-2 text-[11px] text-[var(--color-destructive)]">
              {(action.error as Error).message}
            </p>
          ) : null}
          <WorkflowFindingsTable
            findings={rows}
            pending={action.isPending}
            onAction={(payload) => action.mutate(payload)}
          />
        </OperatorPanel>
      )}
    </Frame>
  );
}

export function ApzpenRemediationPage() {
  const q = useQuery({
    queryKey: ["apzpen", "findings", "remediation"],
    queryFn: fetchFindings,
  });
  const action = useFindingActions();
  const rows = filterRemediationQueue(q.data?.findings ?? []);
  const { selectedId, setSelectedId, selected } = useSelectedFinding(rows);

  return (
    <Frame
      title="Remediation"
      subtitle="Developer / security fix queue — select a finding for remediation guidance beside the list."
    >
      <OperatorMetricStrip
        metrics={[
          { label: "In queue", value: String(rows.length) },
          {
            label: "Critical",
            value: String(rows.filter((f) => f.severity === "critical").length),
          },
          {
            label: "Unassigned",
            value: String(rows.filter((f) => !f.assignedTo).length),
          },
        ]}
      />
      <div
        className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]"
        data-testid="apzpen-remediation-workbench"
      >
        <OperatorPanel title="Fix queue">
          {action.error ? (
            <p className="mb-2 text-[11px] text-[var(--color-destructive)]">
              {(action.error as Error).message}
            </p>
          ) : null}
          <WorkflowFindingsTable
            findings={rows}
            pending={action.isPending}
            onAction={(payload) => action.mutate(payload)}
            selectedFindingId={selectedId}
            onSelectFinding={setSelectedId}
            compactActions
          />
        </OperatorPanel>
        {selected ? (
          <FindingWorkbenchPanel
            finding={selected}
            onAction={(payload) => action.mutate(payload)}
            pending={action.isPending}
            actionError={action.error as Error | null}
          />
        ) : (
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            Select a finding to review remediation side-by-side.
          </p>
        )}
      </div>
    </Frame>
  );
}

export function ApzpenRetestsPage() {
  const q = useQuery({
    queryKey: ["apzpen", "findings", "retests"],
    queryFn: fetchFindings,
  });
  const action = useFindingActions();
  const rows = filterRetestQueue(q.data?.findings ?? []);
  const { selectedId, setSelectedId, selected } = useSelectedFinding(rows);

  return (
    <Frame
      title="Retests"
      subtitle="Verify remediations — queue and selected finding detail for pass/fail decisions."
    >
      <OperatorMetricStrip
        metrics={[
          { label: "Retest items", value: String(rows.length) },
          {
            label: "Requested",
            value: String(rows.filter((f) => f.status === "retest_requested").length),
          },
          {
            label: "Failed",
            value: String(rows.filter((f) => f.status === "retest_failed").length),
          },
        ]}
      />
      <div
        className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]"
        data-testid="apzpen-retest-workbench"
      >
        <OperatorPanel title="Retest queue">
          <WorkflowFindingsTable
            findings={rows}
            pending={action.isPending}
            onAction={(payload) => action.mutate(payload)}
            selectedFindingId={selectedId}
            onSelectFinding={setSelectedId}
            compactActions
          />
        </OperatorPanel>
        {selected ? (
          <FindingWorkbenchPanel
            finding={selected}
            onAction={(payload) => action.mutate(payload)}
            pending={action.isPending}
            actionError={action.error as Error | null}
          />
        ) : (
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            Select a finding to retest side-by-side.
          </p>
        )}
      </div>
    </Frame>
  );
}

export function ApzpenEvidencePage() {
  const q = useQuery({
    queryKey: ["apzpen", "findings", "evidence"],
    queryFn: fetchFindings,
  });
  const action = useFindingActions();
  const gaps = filterEvidenceGaps(q.data?.findings ?? []);
  const library = filterEvidenceLibrary(q.data?.findings ?? []);

  return (
    <Frame
      title="Evidence"
      subtitle="Proof attached to findings — gaps first, then library."
    >
      <OperatorMetricStrip
        metrics={[
          { label: "Gaps", value: String(gaps.length) },
          { label: "With evidence", value: String(library.length) },
        ]}
      />
      <OperatorPanel title="Missing evidence">
        <WorkflowFindingsTable
          findings={gaps}
          pending={action.isPending}
          onAction={(payload) => action.mutate(payload)}
        />
      </OperatorPanel>
      <OperatorPanel title="Evidence library">
        {library.length === 0 ? (
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            No evidence uploaded yet.
          </p>
        ) : (
          <ul className="space-y-2 text-[12px]">
            {library.map((f) => (
              <li
                key={f.findingId}
                className="border-t border-[var(--color-border)] pt-2"
              >
                <Link
                  href={`/apzpen/findings/${f.findingId}`}
                  className="font-medium hover:underline"
                >
                  {f.title}
                </Link>
                <ul className="mt-1 space-y-1 text-[11px] text-[var(--color-muted-foreground)]">
                  {f.evidence.map((e) => (
                    <li key={e.evidenceId}>
                      <span className="font-mono">{e.kind}</span> · {e.label} ·{" "}
                      <a
                        href={e.ref}
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {e.ref}
                      </a>
                    </li>
                  ))}
                </ul>
                <FindingAssignEvidenceForm
                  finding={f}
                  onAction={(payload) => action.mutate(payload)}
                  pending={action.isPending}
                />
              </li>
            ))}
          </ul>
        )}
      </OperatorPanel>
    </Frame>
  );
}

export function ApzpenCertificationPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["apzpen", "engagements", "certification"],
    queryFn: fetchEngagements,
  });
  const ledgerQ = useQuery({
    queryKey: ["apzpen", "certification", "ledger"],
    queryFn: async () => {
      const res = await fetch("/api/v1/apzpen/certification/ledger");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load ledger");
      return body.data as {
        records: Array<{
          recordId: string;
          engagementId: string;
          engagementTitle: string;
          certifiedAt: string;
          certifiedBy: string;
          snapshotHash: string;
          posture: { critical: number; high: number; openCount: number };
        }>;
      };
    },
  });
  const certify = useMutation({
    mutationFn: (engagementId: string) => postEngagementAction(engagementId, "certify"),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apzpen"] });
    },
  });
  const rows = buildCertificationBoard(q.data?.engagements ?? []);

  return (
    <Frame
      title="Certification"
      subtitle="Assurance positions across engagements — complete, conditional, or blocked."
    >
      <OperatorPanel title="Certification board">
        {certify.error ? (
          <p className="mb-2 text-[11px] text-[var(--color-destructive)]">
            {(certify.error as Error).message}
          </p>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
              <tr>
                <th className="py-1.5 pr-2">Engagement</th>
                <th className="py-1.5 pr-2">Status</th>
                <th className="py-1.5 pr-2">Position</th>
                <th className="py-1.5 pr-2">Open C/H</th>
                <th className="py-1.5 pr-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.engagementId}
                  className="border-t border-[var(--color-border)]"
                >
                  <td className="py-2 pr-2">
                    <Link
                      href={`/apzpen/engagements/${row.engagementId}`}
                      className="font-medium hover:underline"
                    >
                      {row.title}
                    </Link>
                    <p className="text-[11px] text-[var(--color-muted-foreground)]">
                      {row.customerName} · {row.applicationName}
                    </p>
                  </td>
                  <td className="py-2 pr-2">{row.status}</td>
                  <td className="py-2 pr-2 uppercase">{row.assessmentPosition}</td>
                  <td className="py-2 pr-2 font-mono tabular-nums">
                    {row.critical}/{row.high} · open {row.openCount}
                  </td>
                  <td className="space-y-1 py-2 pr-2 whitespace-nowrap">
                    {row.blockers.length > 0 ? (
                      <p className="max-w-[220px] whitespace-normal text-[10px] text-[var(--color-muted-foreground)]">
                        {row.blockers.join(" · ")}
                      </p>
                    ) : null}
                    <div className="space-x-2">
                      <Link
                        href={`/apzpen/reports?engagementId=${encodeURIComponent(row.engagementId)}`}
                        className="text-[11px] underline"
                      >
                        Report
                      </Link>
                      {row.status !== "certified" ? (
                        <button
                          type="button"
                          className="text-[11px] underline disabled:opacity-50"
                          disabled={certify.isPending || !row.canCertify}
                          title={
                            row.canCertify
                              ? "Certify assessment"
                              : row.blockers.join("; ")
                          }
                          onClick={() => certify.mutate(row.engagementId)}
                        >
                          Certify
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OperatorPanel>
      <OperatorPanel title="Immutable certification ledger">
        <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
          Append-only records — snapshot hash is never rewritten.
        </p>
        {(ledgerQ.data?.records ?? []).length === 0 ? (
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            No certification records yet.
          </p>
        ) : (
          <table className="w-full text-left text-[12px]">
            <thead className="text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
              <tr>
                <th className="py-1.5 pr-2">When</th>
                <th className="py-1.5 pr-2">Engagement</th>
                <th className="py-1.5 pr-2">By</th>
                <th className="py-1.5 pr-2">Hash</th>
                <th className="py-1.5 pr-2">Posture</th>
              </tr>
            </thead>
            <tbody>
              {(ledgerQ.data?.records ?? []).map((r) => (
                <tr key={r.recordId} className="border-t border-[var(--color-border)]">
                  <td className="py-2 pr-2 font-mono text-[10px]">
                    {r.certifiedAt.slice(0, 19)}
                  </td>
                  <td className="py-2 pr-2">
                    <Link
                      href={`/apzpen/engagements/${r.engagementId}`}
                      className="hover:underline"
                    >
                      {r.engagementTitle}
                    </Link>
                  </td>
                  <td className="py-2 pr-2">{r.certifiedBy}</td>
                  <td className="py-2 pr-2 font-mono text-[10px]">
                    {r.snapshotHash.slice(0, 16)}…
                  </td>
                  <td className="py-2 pr-2 font-mono text-[11px]">
                    C{r.posture.critical}/H{r.posture.high} open {r.posture.openCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OperatorPanel>
    </Frame>
  );
}
