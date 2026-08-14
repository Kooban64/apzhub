"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { OperatorGate } from "@/components/operator/operator-gate";
import { OperatorPage, OperatorPanel } from "@/components/operator/operator-shell";

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

export function ApzpenCodeSecurityPage() {
  const engagements = useQuery({
    queryKey: ["apzpen", "engagements"],
    queryFn: async () => {
      const res = await fetch("/api/v1/apzpen/engagements?seed=1");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data as {
        engagements: Array<{ engagementId: string; title: string }>;
      };
    },
  });
  const [engagementId, setEngagementId] = useState("");
  const q = useQuery({
    queryKey: ["apzpen", "github"],
    queryFn: async () => {
      const res = await fetch("/api/v1/apzpen/github?seed=1");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data as {
        auth?: {
          mode: string;
          appConfigured: boolean;
          patConfigured: boolean;
        };
        assessments: Array<{
          eventId: string;
          engagementId: string;
          repository: string;
          prNumber: number;
          title: string;
          url: string;
          position: string;
          sensitivePaths: string[];
          requiredChecksFailed: string[];
          openFindingOverlap: Array<{
            findingId: string;
            title: string;
            severity: string;
          }>;
          summary: string;
        }>;
      };
    },
  });
  const sync = useMutation({
    mutationFn: async () => {
      const id = engagementId || engagements.data?.engagements[0]?.engagementId;
      if (!id) throw new Error("No engagement");
      const res = await fetch("/api/v1/apzpen/github", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "sync_prs", engagementId: id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Sync failed");
      return body.data;
    },
    onSuccess: async () => {
      await q.refetch();
    },
  });

  return (
    <Frame
      title="Code security"
      subtitle="GitHub PR security position — App JWT or PAT. Sensitive paths, required checks, finding overlap."
    >
      <OperatorPanel title="GitHub connection">
        <p className="mb-2 text-[12px] text-[var(--color-muted-foreground)]">
          Auth mode: <span className="font-mono">{q.data?.auth?.mode ?? "…"}</span>
          {q.data?.auth?.appConfigured ? " · App configured" : " · App not configured"}
          {q.data?.auth?.patConfigured ? " · PAT available" : ""}
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          <select
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
            value={engagementId}
            onChange={(e) => setEngagementId(e.target.value)}
            aria-label="Engagement"
          >
            <option value="">Primary engagement</option>
            {(engagements.data?.engagements ?? []).map((e) => (
              <option key={e.engagementId} value={e.engagementId}>
                {e.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            data-testid="apzpen-github-sync"
            className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
            disabled={sync.isPending}
            onClick={() => sync.mutate()}
          >
            {sync.isPending ? "Syncing…" : "Sync open PRs"}
          </button>
        </div>
        {sync.error ? (
          <p className="text-[11px] text-[var(--color-destructive)]">
            {(sync.error as Error).message}
          </p>
        ) : null}
        {sync.data ? (
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            Imported {(sync.data as { imported?: number }).imported ?? 0} PR(s) via{" "}
            {(sync.data as { mode?: string }).mode}
          </p>
        ) : null}
      </OperatorPanel>
      <OperatorPanel title="PR security positions">
        {q.isLoading ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
        ) : null}
        {(q.data?.assessments ?? []).filter((a) =>
          engagementId ? a.engagementId === engagementId : true,
        ).length === 0 ? (
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            No PR events yet. Configure{" "}
            <code className="font-mono">.secrets/github-app</code> or{" "}
            <code className="font-mono">.secrets/git</code>, add a repository scope
            target, then Sync — or use webhook{" "}
            <code className="font-mono">POST /api/v1/apzpen/github/webhook</code>.
          </p>
        ) : (
          <ul className="space-y-3 text-[12px]">
            {(q.data?.assessments ?? [])
              .filter((a) => (engagementId ? a.engagementId === engagementId : true))
              .map((a) => (
                <li
                  key={a.eventId}
                  className="rounded border border-[var(--color-border)] p-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">
                      {a.repository}#{a.prNumber} — {a.title}
                    </p>
                    <span className="font-mono text-[11px] uppercase">
                      {a.position.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-[var(--color-muted-foreground)]">
                    {a.summary}
                  </p>
                  {a.sensitivePaths.length > 0 ? (
                    <p className="mt-1 font-mono text-[10px]">
                      Sensitive: {a.sensitivePaths.join(", ")}
                    </p>
                  ) : null}
                  {a.requiredChecksFailed.length > 0 ? (
                    <p className="mt-1 text-[11px] text-[var(--color-destructive)]">
                      Failed checks: {a.requiredChecksFailed.join(", ")}
                    </p>
                  ) : null}
                  {a.openFindingOverlap.length > 0 ? (
                    <ul className="mt-1 space-y-0.5 text-[11px]">
                      {a.openFindingOverlap.map((f) => (
                        <li key={f.findingId}>
                          <Link
                            href={`/apzpen/findings/${f.findingId}`}
                            className="underline"
                          >
                            [{f.severity}] {f.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {a.url ? (
                    <a
                      href={a.url}
                      className="mt-1 inline-block text-[11px] underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open PR
                    </a>
                  ) : null}
                </li>
              ))}
          </ul>
        )}
      </OperatorPanel>
    </Frame>
  );
}

export function ApzpenIntelligencePage() {
  const qc = useQueryClient();
  const status = useQuery({
    queryKey: ["apzpen", "intelligence", "status"],
    queryFn: async () => {
      const res = await fetch("/api/v1/apzpen/intelligence");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data as {
        openaiConfigured: boolean;
        provider: string;
        autoCertify: boolean;
      };
    },
  });
  const engagements = useQuery({
    queryKey: ["apzpen", "engagements"],
    queryFn: async () => {
      const res = await fetch("/api/v1/apzpen/engagements?seed=1");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data as {
        engagements: Array<{ engagementId: string; title: string }>;
      };
    },
  });
  const [engagementId, setEngagementId] = useState("");
  const [assignEmail, setAssignEmail] = useState("operator@apzor.com");
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  const assist = useMutation({
    mutationFn: async () => {
      const id = engagementId || engagements.data?.engagements[0]?.engagementId;
      if (!id) throw new Error("No engagement");
      const res = await fetch("/api/v1/apzpen/intelligence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ engagementId: id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Assist failed");
      return body.data.assist as {
        mode: string;
        autoCertify: boolean;
        suggestions: Array<{
          id: string;
          kind: string;
          title: string;
          body: string;
          confidence: number;
          disclaimer: string;
          findingIds: string[];
        }>;
      };
    },
  });

  const applyAction = useMutation({
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
    <Frame
      title="Security intelligence"
      subtitle="OpenAI when `.secrets/openai` is present — otherwise offline rules. Never auto-certifies."
    >
      <OperatorPanel title="Assist">
        <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
          Provider preference:{" "}
          <span className="font-mono">{status.data?.provider ?? "…"}</span>
          {" · "}
          OpenAI {status.data?.openaiConfigured ? "configured" : "not configured"}
          {" · "}
          autoCertify={String(status.data?.autoCertify ?? false)}
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          <select
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
            value={engagementId}
            onChange={(e) => setEngagementId(e.target.value)}
            aria-label="Engagement"
          >
            <option value="">Primary engagement</option>
            {(engagements.data?.engagements ?? []).map((e) => (
              <option key={e.engagementId} value={e.engagementId}>
                {e.title}
              </option>
            ))}
          </select>
          <input
            className="min-w-[160px] rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            placeholder="Assignee for priority"
            aria-label="Assignee email"
          />
          <button
            type="button"
            data-testid="apzpen-intelligence-run"
            className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
            disabled={assist.isPending}
            onClick={() => {
              setApplyMessage(null);
              assist.mutate();
            }}
          >
            {assist.isPending ? "Running…" : "Run assist"}
          </button>
        </div>
        {applyMessage ? (
          <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
            {applyMessage}
          </p>
        ) : null}
        {assist.data ? (
          <div className="space-y-3 text-[12px]">
            <p className="text-[11px] text-[var(--color-muted-foreground)]">
              Mode {assist.data.mode} · autoCertify=
              {String(assist.data.autoCertify)}
            </p>
            {assist.data.suggestions.map((s) => (
              <div
                key={s.id}
                className="rounded border border-[var(--color-border)] p-3"
              >
                <p className="font-medium">
                  {s.title}{" "}
                  <span className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                    {s.kind} · conf {(s.confidence * 100).toFixed(0)}%
                  </span>
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-[12px]">
                  {s.body}
                </pre>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                  {(s.findingIds ?? []).slice(0, 3).map((id) => (
                    <Link
                      key={id}
                      href={`/apzpen/findings/${id}`}
                      className="underline"
                    >
                      Open {id.slice(0, 12)}…
                    </Link>
                  ))}
                  {s.kind === "fp_candidates" && (s.findingIds?.length ?? 0) > 0 ? (
                    <button
                      type="button"
                      className="underline disabled:opacity-50"
                      disabled={applyAction.isPending}
                      onClick={() =>
                        void (async () => {
                          let n = 0;
                          for (const findingId of s.findingIds) {
                            await applyAction.mutateAsync({
                              action: "update_status",
                              findingId,
                              status: "false_positive",
                            });
                            n += 1;
                          }
                          setApplyMessage(
                            `Marked ${n} finding(s) as false_positive (human-confirmed).`,
                          );
                        })()
                      }
                    >
                      Apply FP review
                    </button>
                  ) : null}
                  {s.kind === "priority_order" &&
                  (s.findingIds?.length ?? 0) > 0 &&
                  assignEmail.trim() ? (
                    <button
                      type="button"
                      className="underline disabled:opacity-50"
                      disabled={applyAction.isPending}
                      onClick={() =>
                        void (async () => {
                          const top = s.findingIds[0]!;
                          await applyAction.mutateAsync({
                            action: "assign",
                            findingId: top,
                            assignedTo: assignEmail.trim(),
                          });
                          setApplyMessage(
                            `Assigned top priority finding to ${assignEmail.trim()}.`,
                          );
                        })()
                      }
                    >
                      Assign top priority
                    </button>
                  ) : null}
                  {s.kind === "remediation_hints" && (s.findingIds?.length ?? 0) > 0 ? (
                    <button
                      type="button"
                      className="underline disabled:opacity-50"
                      disabled={applyAction.isPending}
                      onClick={() =>
                        void (async () => {
                          let n = 0;
                          for (const findingId of s.findingIds.slice(0, 3)) {
                            await applyAction.mutateAsync({
                              action: "update_status",
                              findingId,
                              status: "remediating",
                            });
                            n += 1;
                          }
                          setApplyMessage(`Moved ${n} finding(s) to remediating.`);
                        })()
                      }
                    >
                      Start remediating
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 text-[10px] text-[var(--color-muted-foreground)]">
                  {s.disclaimer}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            Uses OpenAI Chat Completions when configured; otherwise deterministic
            offline rules.
          </p>
        )}
      </OperatorPanel>
    </Frame>
  );
}

export function ApzpenGrantsPanel({ engagementId }: { engagementId: string }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("customer@example.com");
  const [issued, setIssued] = useState<string>("");
  const list = useQuery({
    queryKey: ["apzpen", "grants", engagementId],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/apzpen/grants?engagementId=${encodeURIComponent(engagementId)}`,
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data as {
        grants: Array<{
          grantId: string;
          customerEmail: string;
          expiresAt: string;
        }>;
      };
    },
  });
  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/apzpen/grants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ engagementId, customerEmail: email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data as { token: string; portalPath: string };
    },
    onSuccess: async (data) => {
      setIssued(data.portalPath);
      await qc.invalidateQueries({ queryKey: ["apzpen", "grants"] });
    },
  });
  const revoke = useMutation({
    mutationFn: async (grantId: string) => {
      const res = await fetch("/api/v1/apzpen/grants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "revoke", grantId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Revoke failed");
      return body.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apzpen", "grants"] });
    },
  });

  return (
    <OperatorPanel title="Customer portal grant">
      <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
        Issue a time-limited token for the external customer portal (
        <Link href="/portal" className="underline">
          /portal
        </Link>
        ). Token path is shown once — share privately.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Customer email"
        />
        <button
          type="button"
          className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
          disabled={create.isPending}
          onClick={() => create.mutate()}
        >
          Issue grant
        </button>
      </div>
      {issued ? <p className="mt-2 break-all font-mono text-[10px]">{issued}</p> : null}
      <ul className="mt-2 text-[11px] text-[var(--color-muted-foreground)]">
        {(list.data?.grants ?? []).map((g) => (
          <li key={g.grantId} className="flex flex-wrap items-center gap-2 py-0.5">
            <span>
              {g.customerEmail} · expires {g.expiresAt.slice(0, 10)}
            </span>
            <button
              type="button"
              className="underline"
              disabled={revoke.isPending}
              onClick={() => revoke.mutate(g.grantId)}
            >
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </OperatorPanel>
  );
}

export function CustomerPortalPage() {
  const search = useSearchParams();
  const tokenFromUrl = search.get("token")?.trim() ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [activeToken, setActiveToken] = useState(tokenFromUrl);
  const [reportKind, setReportKind] = useState("executive");
  const [assignTo, setAssignTo] = useState("");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceRef, setEvidenceRef] = useState("");
  const [activeFindingId, setActiveFindingId] = useState("");
  const [portalFilter, setPortalFilter] = useState<"all" | "open" | "critical_high">(
    "all",
  );

  const view = useQuery({
    queryKey: ["apzpen", "customer", activeToken],
    enabled: Boolean(activeToken),
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/apzpen/customer?token=${encodeURIComponent(activeToken)}`,
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data as {
        customerEmail: string;
        permissions: readonly string[];
        engagement: {
          engagementId: string;
          title: string;
          customerName: string;
          applicationName: string;
          status: string;
          assessmentPosition: string;
          scheduleMode?: string;
          nextRunAt?: string;
        };
        posture: {
          critical: number;
          high: number;
          openCount: number;
          assessmentPosition: string;
        };
        findings: Array<{
          findingId: string;
          title: string;
          severity: string;
          status: string;
          description: string;
          remediation?: string;
          location?: string;
          assignedTo?: string;
          evidence?: Array<{ label: string; ref: string; kind: string }>;
        }>;
      };
    },
  });

  const filteredPortalFindings = useMemo(() => {
    const findings = view.data?.findings ?? [];
    if (portalFilter === "open") {
      return findings.filter(
        (f) =>
          f.status === "open" ||
          f.status === "remediating" ||
          f.status === "retest_requested" ||
          f.status === "retest_failed",
      );
    }
    if (portalFilter === "critical_high") {
      return findings.filter((f) => f.severity === "critical" || f.severity === "high");
    }
    return findings;
  }, [view.data?.findings, portalFilter]);

  const action = useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const res = await fetch("/api/v1/apzpen/customer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data;
    },
    onSuccess: async () => {
      await view.refetch();
      setEvidenceLabel("");
      setEvidenceRef("");
      setAssignTo("");
    },
  });

  const pdfHref = useMemo(() => {
    if (!activeToken) return "#";
    return `/api/v1/apzpen/customer?token=${encodeURIComponent(activeToken)}&format=pdf&kind=${encodeURIComponent(reportKind)}`;
  }, [activeToken, reportKind]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <p className="text-[11px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
          APZPEN customer portal
        </p>
        <h1 className="text-lg font-semibold">Security assurance status</h1>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 px-6 py-6">
        <section className="rounded border border-[var(--color-border)] p-4">
          <p className="mb-2 text-[12px] text-[var(--color-muted-foreground)]">
            Enter the grant token issued by your APZPEN operator.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              className="min-w-[240px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 font-mono text-[11px]"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="apzpen_…"
              aria-label="Grant token"
            />
            <button
              type="button"
              className="rounded border border-[var(--color-border)] px-3 py-1.5 text-[12px] hover:bg-[var(--color-muted)]"
              onClick={() => setActiveToken(token.trim())}
            >
              Open
            </button>
          </div>
        </section>

        {view.error ? (
          <p className="text-[12px] text-[var(--color-destructive)]">
            {(view.error as Error).message}
          </p>
        ) : null}

        {view.data ? (
          <>
            <section className="rounded border border-[var(--color-border)] p-4 text-[13px]">
              <p className="font-medium">{view.data.engagement.title}</p>
              <p className="text-[var(--color-muted-foreground)]">
                {view.data.engagement.customerName} ·{" "}
                {view.data.engagement.applicationName}
              </p>
              <p className="mt-2">
                Status <strong>{view.data.engagement.status}</strong> · Certification{" "}
                <strong>{view.data.engagement.assessmentPosition.toUpperCase()}</strong>{" "}
                · Open {view.data.posture.openCount} (C
                {view.data.posture.critical}/H{view.data.posture.high})
              </p>
              {view.data.engagement.scheduleMode ? (
                <p className="mt-1 text-[12px] text-[var(--color-muted-foreground)]">
                  Schedule{" "}
                  <strong>
                    {view.data.engagement.scheduleMode.replaceAll("_", " ")}
                  </strong>
                  {view.data.engagement.nextRunAt
                    ? ` · next ${new Date(view.data.engagement.nextRunAt).toLocaleString()}`
                    : ""}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[12px]"
                  value={reportKind}
                  onChange={(e) => setReportKind(e.target.value)}
                  aria-label="Report kind"
                >
                  <option value="executive">Executive</option>
                  <option value="technical">Technical</option>
                  <option value="compliance">Compliance pack</option>
                </select>
                <a href={pdfHref} className="text-[12px] underline">
                  Download PDF
                </a>
              </div>
            </section>

            <section className="rounded border border-[var(--color-border)] p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[13px] font-medium">Findings</h2>
                <select
                  className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                  value={portalFilter}
                  onChange={(e) =>
                    setPortalFilter(e.target.value as "all" | "open" | "critical_high")
                  }
                  aria-label="Filter findings"
                >
                  <option value="all">All</option>
                  <option value="open">Open / remediating</option>
                  <option value="critical_high">Critical / High</option>
                </select>
              </div>
              {filteredPortalFindings.length === 0 ? (
                <p className="text-[12px] text-[var(--color-muted-foreground)]">
                  No findings match this filter.
                </p>
              ) : null}
              <ul className="space-y-3 text-[12px]">
                {filteredPortalFindings.map((f) => (
                  <li
                    key={f.findingId}
                    className="border-t border-[var(--color-border)] pt-2"
                  >
                    <p className="font-medium">
                      <span className="uppercase">{f.severity}</span> — {f.title}
                    </p>
                    <p className="text-[var(--color-muted-foreground)]">
                      {f.description}
                    </p>
                    {f.location ? (
                      <p className="mt-1 font-mono text-[11px]">
                        Location: {f.location}
                      </p>
                    ) : null}
                    {f.remediation ? (
                      <p className="mt-1">
                        <span className="text-[var(--color-muted-foreground)]">
                          Remediation:{" "}
                        </span>
                        {f.remediation}
                      </p>
                    ) : null}
                    {f.evidence && f.evidence.length > 0 ? (
                      <ul className="mt-1 space-y-0.5 text-[11px]">
                        {f.evidence.map((e, i) => (
                          <li key={`${f.findingId}-ev-${i}`}>
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
                    ) : null}
                    <p className="mt-1 text-[11px]">
                      Status: {f.status}
                      {f.assignedTo ? ` · Assignee: ${f.assignedTo}` : ""}
                      {f.evidence?.length ? ` · Evidence: ${f.evidence.length}` : ""}
                    </p>
                    <div className="mt-1 space-x-3">
                      {f.status === "open" ? (
                        <button
                          type="button"
                          className="underline"
                          onClick={() =>
                            action.mutate({
                              action: "mark_remediating",
                              findingId: f.findingId,
                            })
                          }
                        >
                          Mark remediating
                        </button>
                      ) : null}
                      {f.status === "open" || f.status === "remediating" ? (
                        <button
                          type="button"
                          className="underline"
                          onClick={() =>
                            action.mutate({
                              action: "request_retest",
                              findingId: f.findingId,
                            })
                          }
                        >
                          Request retest
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => setActiveFindingId(f.findingId)}
                      >
                        Assign / evidence
                      </button>
                    </div>
                    {activeFindingId === f.findingId ? (
                      <div className="mt-2 space-y-2 rounded border border-dashed border-[var(--color-border)] p-2">
                        <div className="flex flex-wrap gap-2">
                          <input
                            className="min-w-[140px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                            placeholder="Assignee email"
                            value={assignTo}
                            onChange={(e) => setAssignTo(e.target.value)}
                          />
                          <button
                            type="button"
                            className="underline text-[11px]"
                            disabled={!assignTo.trim() || action.isPending}
                            onClick={() =>
                              action.mutate({
                                action: "assign",
                                findingId: f.findingId,
                                assignedTo: assignTo.trim(),
                              })
                            }
                          >
                            Assign
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <input
                            className="min-w-[120px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                            placeholder="Evidence label"
                            value={evidenceLabel}
                            onChange={(e) => setEvidenceLabel(e.target.value)}
                          />
                          <input
                            className="min-w-[140px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                            placeholder="Evidence URL / ref"
                            value={evidenceRef}
                            onChange={(e) => setEvidenceRef(e.target.value)}
                          />
                          <button
                            type="button"
                            className="underline text-[11px]"
                            disabled={
                              !evidenceLabel.trim() ||
                              !evidenceRef.trim() ||
                              action.isPending
                            }
                            onClick={() =>
                              action.mutate({
                                action: "upload_evidence",
                                findingId: f.findingId,
                                evidenceLabel: evidenceLabel.trim(),
                                evidenceRef: evidenceRef.trim(),
                              })
                            }
                          >
                            Upload evidence
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
