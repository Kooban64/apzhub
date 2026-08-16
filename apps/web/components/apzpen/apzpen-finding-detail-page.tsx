"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import {
  FindingAssignEvidenceForm,
  FindingStatusButtons,
} from "@/components/apzpen/finding-operator-controls";
import {
  OperatorMetricStrip,
  OperatorPage,
  OperatorPanel,
} from "@/components/operator/operator-shell";
import { OperatorGate } from "@/components/operator/operator-gate";
import type { Finding } from "@/lib/apzpen/types";

async function fetchFinding(findingId: string): Promise<Finding> {
  const res = await fetch(
    `/api/v1/apzpen/findings?findingId=${encodeURIComponent(findingId)}`,
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Finding not found");
  return body.data.finding as Finding;
}

function severityClass(severity: string): string {
  if (severity === "critical") return "text-[var(--color-destructive)]";
  if (severity === "high") return "text-orange-600";
  if (severity === "medium") return "text-amber-600";
  return "text-[var(--color-muted-foreground)]";
}

function Section({
  title,
  children,
  testId,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly testId: string;
}) {
  return (
    <section
      className="rounded-lg border border-[var(--color-border)] p-4"
      data-testid={testId}
    >
      <h2 className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
        {title}
      </h2>
      <div className="text-sm text-[var(--color-foreground)]">{children}</div>
    </section>
  );
}

/**
 * Stream 3 P3-06 — structured Finding Detail (not a single RTE dump).
 */
export function ApzpenFindingDetailPage({ findingId }: { readonly findingId: string }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["apzpen", "finding", findingId],
    queryFn: () => fetchFinding(findingId),
  });
  const action = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/v1/apzpen/findings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Action failed");
      return body.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apzpen"] });
    },
  });

  const finding = q.data;

  return (
    <OperatorGate shell="apzpen">
      <OperatorPage
        title={finding?.title ?? "Finding"}
        subtitle={
          finding
            ? `${finding.severity.toUpperCase()} · ${finding.status} · ${finding.providerTool ?? "manual"}`
            : "Loading…"
        }
        actions={
          <Link
            href="/apzpen/findings"
            className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
          >
            Back to findings
          </Link>
        }
      >
        {q.isLoading ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
        ) : null}
        {q.isError ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {(q.error as Error).message}
          </p>
        ) : null}

        {finding ? (
          <div className="space-y-4" data-testid="apzpen-finding-detail">
            <OperatorMetricStrip
              metrics={[
                {
                  label: "Severity",
                  value: finding.severity.toUpperCase(),
                },
                { label: "Status", value: finding.status },
                {
                  label: "Evidence",
                  value: String(finding.evidence.length),
                },
                {
                  label: "Assignee",
                  value: finding.assignedTo ?? "Unassigned",
                },
              ]}
            />

            <div className="grid gap-3 lg:grid-cols-2">
              <Section title="Description" testId="apzpen-finding-description">
                <p
                  className={`mb-2 font-medium uppercase ${severityClass(finding.severity)}`}
                >
                  {finding.severity}
                </p>
                <p className="whitespace-pre-wrap">{finding.description}</p>
              </Section>

              <Section title="Impact" testId="apzpen-finding-impact">
                <dl className="grid gap-2">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-muted-foreground)]">CWE</dt>
                    <dd>{finding.cwe ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-muted-foreground)]">CVSS</dt>
                    <dd>{finding.cvss ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-muted-foreground)]">OWASP</dt>
                    <dd>{finding.owaspCategory ?? "—"}</dd>
                  </div>
                </dl>
              </Section>

              <Section title="Asset" testId="apzpen-finding-asset">
                <dl className="grid gap-2">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-muted-foreground)]">Asset</dt>
                    <dd>{finding.assetLabel ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-muted-foreground)]">Component</dt>
                    <dd>{finding.component ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--color-muted-foreground)]">Location</dt>
                    <dd className="font-mono text-xs">{finding.location ?? "—"}</dd>
                  </div>
                </dl>
              </Section>

              <Section title="Remediation" testId="apzpen-finding-remediation">
                <p className="whitespace-pre-wrap">
                  {finding.remediation ?? "No remediation guidance recorded yet."}
                </p>
                <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
                  Engagement:{" "}
                  <Link
                    href={`/apzpen/engagements/${finding.engagementId}`}
                    className="underline"
                  >
                    {finding.engagementId}
                  </Link>
                </p>
              </Section>
            </div>

            <Section title="Evidence" testId="apzpen-finding-evidence">
              {finding.evidence.length === 0 ? (
                <p className="text-[var(--color-muted-foreground)]">
                  No evidence attached.
                </p>
              ) : (
                <ul className="space-y-2">
                  {finding.evidence.map((item) => (
                    <li
                      key={item.evidenceId}
                      className="rounded border border-[var(--color-border)] px-3 py-2"
                    >
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {item.kind} · {item.createdAt}
                      </p>
                      {item.kind.toLowerCase().includes("http") ||
                      item.ref.includes("HTTP/") ||
                      item.ref.includes("\n") ? (
                        <pre
                          className="mt-2 max-h-48 overflow-auto rounded bg-[var(--color-muted)]/30 p-2 font-mono text-[11px]"
                          data-testid={`apzpen-finding-http-${item.evidenceId}`}
                        >
                          {item.ref}
                        </pre>
                      ) : (
                        <p className="mt-1 font-mono text-[11px] break-all">
                          {item.ref}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <OperatorPanel title="Operator actions">
              <FindingStatusButtons
                finding={finding}
                onAction={(payload) => action.mutate(payload)}
                pending={action.isPending}
              />
              <FindingAssignEvidenceForm
                finding={finding}
                onAction={(payload) => action.mutate(payload)}
                pending={action.isPending}
              />
              {action.error ? (
                <p
                  className="mt-2 text-[11px] text-[var(--color-destructive)]"
                  role="alert"
                >
                  {(action.error as Error).message}
                </p>
              ) : null}
            </OperatorPanel>
          </div>
        ) : null}
      </OperatorPage>
    </OperatorGate>
  );
}
