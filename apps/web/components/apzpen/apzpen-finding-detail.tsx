"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  FindingAssignEvidenceForm,
  FindingStatusButtons,
} from "@/components/apzpen/finding-operator-controls";
import { OperatorGate } from "@/components/operator/operator-gate";
import { OperatorPage, OperatorPanel } from "@/components/operator/operator-shell";
import type { Finding, FindingSeverity } from "@/lib/apzpen/types";

export function ApzpenFindingDetailPage({ findingId }: { findingId: string }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["apzpen", "finding", findingId],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/apzpen/findings?findingId=${encodeURIComponent(findingId)}`,
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load");
      return body.data as { finding: Finding };
    },
  });
  const finding = q.data?.finding;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [remediation, setRemediation] = useState("");
  const [location, setLocation] = useState("");
  const [cwe, setCwe] = useState("");
  const [severity, setSeverity] = useState<FindingSeverity>("medium");

  useEffect(() => {
    if (!finding) return;
    setTitle(finding.title);
    setDescription(finding.description);
    setRemediation(finding.remediation ?? "");
    setLocation(finding.location ?? "");
    setCwe(finding.cwe ?? "");
    setSeverity(finding.severity);
  }, [finding]);

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

  return (
    <OperatorGate shell="apzpen">
      <OperatorPage
        title={finding?.title ?? "Finding"}
        subtitle="Full finding record — remediation, evidence, lifecycle."
        actions={
          finding ? (
            <Link
              href={`/workspace/pen/engagements/${finding.engagementId}`}
              className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
            >
              Engagement
            </Link>
          ) : null
        }
      >
        {q.isLoading ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
        ) : null}
        {q.error ? (
          <p className="text-xs text-[var(--color-destructive)]">
            {(q.error as Error).message}
          </p>
        ) : null}
        {finding ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <OperatorPanel title="Details">
              <div className="space-y-2">
                <input
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[12px]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-label="Title"
                />
                <select
                  className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as FindingSeverity)}
                  aria-label="Severity"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="info">Info</option>
                </select>
                <textarea
                  className="min-h-[80px] w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-[11px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  aria-label="Description"
                />
                <input
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <input
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                  placeholder="CWE"
                  value={cwe}
                  onChange={(e) => setCwe(e.target.value)}
                />
                <textarea
                  className="min-h-[64px] w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-[11px]"
                  placeholder="Remediation"
                  value={remediation}
                  onChange={(e) => setRemediation(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
                  disabled={action.isPending}
                  onClick={() =>
                    action.mutate({
                      action: "update_details",
                      findingId,
                      title,
                      description,
                      remediation,
                      location,
                      cwe,
                      severity,
                    })
                  }
                >
                  Save details
                </button>
                {action.error ? (
                  <p className="text-[11px] text-[var(--color-destructive)]">
                    {(action.error as Error).message}
                  </p>
                ) : null}
              </div>
            </OperatorPanel>
            <OperatorPanel title="Lifecycle">
              <p className="mb-2 text-[12px]">
                Status: <strong>{finding.status}</strong>
                {finding.assignedTo ? ` · ${finding.assignedTo}` : ""}
              </p>
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
              <div className="mt-4">
                <p className="mb-1 text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
                  Evidence
                </p>
                {finding.evidence.length === 0 ? (
                  <p className="text-[12px] text-[var(--color-muted-foreground)]">
                    No evidence attached.
                  </p>
                ) : (
                  <ul className="space-y-1 text-[12px]">
                    {finding.evidence.map((e) => (
                      <li key={e.evidenceId}>
                        <span className="font-mono text-[11px]">{e.kind}</span> ·{" "}
                        {e.label} ·{" "}
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
                )}
              </div>
            </OperatorPanel>
          </div>
        ) : null}
      </OperatorPage>
    </OperatorGate>
  );
}
