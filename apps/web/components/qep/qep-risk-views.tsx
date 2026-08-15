"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { QepPageShell, QepPanel } from "./qep-ui";

type RiskItem = {
  riskId: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "mitigated" | "accepted" | "waived";
  waiverNote?: string;
  updatedAt: string;
};

async function fetchRisks(): Promise<readonly RiskItem[]> {
  const res = await fetch("/api/v1/qep/risk");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load risks");
  return (body.data?.items ?? []) as RiskItem[];
}

async function postRisk(payload: Record<string, unknown>) {
  const res = await fetch("/api/v1/qep/risk", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Risk action failed");
  return body.data;
}

export function QepRiskRouterView() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["qep", "risk"], queryFn: fetchRisks });
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<RiskItem["severity"]>("medium");

  const create = useMutation({
    mutationFn: () => postRisk({ action: "create", title, severity }),
    onSuccess: () => {
      setTitle("");
      void qc.invalidateQueries({ queryKey: ["qep", "risk"] });
    },
  });

  return (
    <QepPageShell
      title="Risk Management"
      description="Release risk register — feeds readiness and certification (WF-20)."
      breadcrumbs={["QEP", "Risk"]}
    >
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link
          href="/workspace/qep/release-readiness"
          className="text-[var(--color-primary)] underline-offset-2 hover:underline"
        >
          Release Readiness
        </Link>
        <span className="text-[var(--color-muted-foreground)]">·</span>
        <Link
          href="/workspace/qep/certification"
          className="text-[var(--color-primary)] underline-offset-2 hover:underline"
        >
          Certification
        </Link>
      </div>

      <QepPanel title="Register risk">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <input
            className="h-8 min-w-[220px] flex-1 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            placeholder="Risk title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as RiskItem["severity"])}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
          <button
            type="button"
            className="h-8 rounded bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)] disabled:opacity-50"
            disabled={!title.trim() || create.isPending}
            onClick={() => create.mutate()}
          >
            Add
          </button>
        </div>
        {create.error ? (
          <p className="mt-2 text-xs text-[var(--color-destructive)]">
            {(create.error as Error).message}
          </p>
        ) : null}
      </QepPanel>

      <QepPanel title="Open risks">
        {q.isLoading ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
        ) : null}
        {q.error ? (
          <p className="text-xs text-[var(--color-destructive)]">
            {(q.error as Error).message}
          </p>
        ) : null}
        {(q.data?.length ?? 0) === 0 ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            No risks registered. Add release risks before certification decisions.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
            {(q.data ?? []).map((r) => (
              <li
                key={r.riskId}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-xs"
              >
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                    {r.riskId} · {r.severity} · {r.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  {r.status === "open" ? (
                    <>
                      <button
                        type="button"
                        className="text-[var(--color-primary)]"
                        onClick={() =>
                          void postRisk({
                            action: "mitigate",
                            riskId: r.riskId,
                          }).then(() =>
                            qc.invalidateQueries({ queryKey: ["qep", "risk"] }),
                          )
                        }
                      >
                        Mitigate
                      </button>
                      <button
                        type="button"
                        className="text-[var(--color-primary)]"
                        onClick={() => {
                          const note =
                            window.prompt("Waiver rationale (required)") ?? "";
                          if (!note.trim()) return;
                          void postRisk({
                            action: "waive",
                            riskId: r.riskId,
                            waiverNote: note,
                          }).then(() =>
                            qc.invalidateQueries({ queryKey: ["qep", "risk"] }),
                          );
                        }}
                      >
                        Waive
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </QepPanel>
    </QepPageShell>
  );
}
