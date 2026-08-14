"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { OperatorGate } from "@/components/operator/operator-gate";
import {
  OperatorMetricStrip,
  OperatorPage,
  OperatorPanel,
} from "@/components/operator/operator-shell";
import { ApzpenGrantsPanel } from "@/components/apzpen/apzpen-follow-on-pages";
import {
  formatSourceBindingsSummary,
  ProjectSourceFields,
  useProjectSourceForm,
} from "@/components/commercial/project-source-fields";
import {
  FindingAssignEvidenceForm,
  FindingStatusButtons,
  ManualFindingCreateForm,
} from "@/components/apzpen/finding-operator-controls";
import {
  APZPEN_PROVIDERS,
  ALL_DISPATCH_TOOLS,
  providerStatusLabel,
} from "@/lib/apzpen/provider-catalogue";
import {
  CATALOGUE_ALLOWED_TECHNIQUES,
  CATALOGUE_RESTRICTED_TECHNIQUES,
} from "@/lib/apzpen/domain";
import {
  defaultScopeTargetId,
  scopeTargetsForTool,
} from "@/lib/apzpen/dispatch-targets";
import type {
  AssessmentPosition,
  Engagement,
  Finding,
  SecurityPosture,
} from "@/lib/apzpen/types";
import { summariseWorkQueues } from "@/lib/apzpen/workflow-views";

type EngagementRow = Engagement & {
  posture?: SecurityPosture;
  sourceBindings?: readonly {
    providerId: string;
    externalRef: string;
    mode: string;
  }[];
};

async function fetchEngagements(seed = false) {
  const res = await fetch(`/api/v1/apzpen/engagements${seed ? "?seed=1" : ""}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load");
  return body.data as { engagements: EngagementRow[] };
}

async function fetchEngagement(engagementId: string) {
  const res = await fetch(`/api/v1/apzpen/engagements/${engagementId}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load");
  return body.data as {
    engagement: Engagement & {
      sourceBindings?: readonly {
        providerId: string;
        externalRef: string;
        mode: string;
      }[];
    };
    findings: Finding[];
    posture: SecurityPosture;
    suggestedAssessmentPosition: AssessmentPosition;
  };
}

async function fetchFindings() {
  const res = await fetch("/api/v1/apzpen/findings");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load");
  return body.data as { findings: Finding[] };
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

function Frame({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <OperatorGate shell="apzpen">
      <OperatorPage title={title} subtitle={subtitle} actions={actions}>
        {children}
      </OperatorPage>
    </OperatorGate>
  );
}

function severityClass(severity: string): string {
  switch (severity) {
    case "critical":
      return "text-[var(--color-destructive)]";
    case "high":
      return "text-[var(--color-warning)]";
    default:
      return "text-[var(--color-muted-foreground)]";
  }
}

export function ApzpenHomePage() {
  const engagementsQ = useQuery({
    queryKey: ["apzpen", "engagements", "seed"],
    queryFn: () => fetchEngagements(true),
  });
  const findingsQ = useQuery({
    queryKey: ["apzpen", "findings", "home"],
    queryFn: fetchFindings,
  });
  const engagements = engagementsQ.data?.engagements ?? [];
  const findings = findingsQ.data?.findings ?? [];
  const primary = engagements[0];
  const posture = primary?.posture;
  const queues = summariseWorkQueues({ findings, engagements });
  const loading = engagementsQ.isLoading || findingsQ.isLoading;
  const error = engagementsQ.error ?? findingsQ.error;

  return (
    <Frame
      title="Security Assurance"
      subtitle="Work queues and risk posture — not a scanner dashboard."
      actions={
        <Link
          href="/apzpen/engagements"
          className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
        >
          All engagements
        </Link>
      }
    >
      {loading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Loading security posture…
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--color-destructive)]">
          {(error as Error).message}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          <OperatorMetricStrip
            metrics={[
              {
                label: "Critical / High open",
                value: `${queues.criticalOpen} / ${queues.highOpen}`,
              },
              {
                label: "Remediation",
                value: String(queues.remediationCount),
              },
              { label: "Retests", value: String(queues.retestCount) },
              {
                label: "Evidence gaps",
                value: String(queues.evidenceGapCount),
              },
            ]}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <OperatorPanel title="Work queues">
              <ul className="space-y-2 text-[12px]">
                {(
                  [
                    {
                      href: "/apzpen/my-work",
                      label: "My Work",
                      count: "→",
                      hint: "Assigned to you",
                    },
                    {
                      href: "/apzpen/remediation",
                      label: "Remediation",
                      count: String(queues.remediationCount),
                      hint: "Open + remediating",
                    },
                    {
                      href: "/apzpen/retests",
                      label: "Retests",
                      count: String(queues.retestCount),
                      hint: "Verify fixes",
                    },
                    {
                      href: "/apzpen/evidence",
                      label: "Evidence",
                      count: String(queues.evidenceGapCount),
                      hint: "Gaps needing proof",
                    },
                    {
                      href: "/apzpen/certification",
                      label: "Certification",
                      count: String(queues.certifiedCount),
                      hint: `${queues.blockedCount} blocked`,
                    },
                  ] as const
                ).map((row) => (
                  <li
                    key={row.href}
                    className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-2 first:border-t-0 first:pt-0"
                  >
                    <div>
                      <Link href={row.href} className="font-medium hover:underline">
                        {row.label}
                      </Link>
                      <p className="text-[11px] text-[var(--color-muted-foreground)]">
                        {row.hint}
                      </p>
                    </div>
                    <span className="font-mono tabular-nums text-[13px]">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </OperatorPanel>
            <OperatorPanel title="Primary engagement">
              {primary && posture ? (
                <dl className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="col-span-2">
                    <dt className="text-[var(--color-muted-foreground)]">Engagement</dt>
                    <dd>
                      <Link
                        href={`/apzpen/engagements/${primary.engagementId}`}
                        className="font-medium hover:underline"
                      >
                        {primary.title}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Assessment</dt>
                    <dd className="font-medium uppercase">
                      {posture.assessmentPosition}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">RoE</dt>
                    <dd className="font-medium">
                      {posture.roeApproved ? "Approved" : "Pending"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Open / retest
                    </dt>
                    <dd className="font-medium">
                      {posture.openCount} / {posture.retestCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Environment
                    </dt>
                    <dd className="font-medium">{primary.environment}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-[12px] text-[var(--color-muted-foreground)]">
                  Create an engagement, approve Rules of Engagement, then record or
                  import findings from providers.
                </p>
              )}
            </OperatorPanel>
          </div>
        </>
      ) : null}
    </Frame>
  );
}

export function ApzpenEngagementsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["apzpen", "engagements"],
    queryFn: () => fetchEngagements(true),
  });
  const [customerName, setCustomerName] = useState("");
  const [applicationName, setApplicationName] = useState("");
  const [title, setTitle] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState<
    "all" | "due_soon" | "overdue" | "scheduled"
  >("all");
  const {
    form: sourceForm,
    setForm: setSourceForm,
    payload: sourcePayload,
    reset: resetSourceForm,
  } = useProjectSourceForm();

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/apzpen/engagements", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName,
          applicationName,
          title,
          source: sourcePayload,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Create failed");
      return body.data;
    },
    onSuccess: async () => {
      setCustomerName("");
      setApplicationName("");
      setTitle("");
      resetSourceForm();
      await qc.invalidateQueries({ queryKey: ["apzpen"] });
    },
  });

  return (
    <Frame
      title="Engagements"
      subtitle="Formal assessments with scope, RoE and schedule — once, frequent or on-demand."
    >
      <OperatorPanel title="New engagement">
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-[12px]"
            placeholder="Customer"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-[12px]"
            placeholder="Application"
            value={applicationName}
            onChange={(e) => setApplicationName(e.target.value)}
          />
          <input
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-[12px]"
            placeholder="Engagement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <ProjectSourceFields
          value={sourceForm}
          onChange={setSourceForm}
          productLabel="APZPEN"
          testIdPrefix="apzpen-engagement-source"
          compact
        />
        <button
          type="button"
          className="mt-2 rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
          disabled={
            create.isPending ||
            !customerName ||
            !applicationName ||
            !title ||
            (sourceForm.enabled && !sourceForm.externalRef.trim())
          }
          onClick={() => create.mutate()}
        >
          {create.isPending ? "Creating…" : "Create engagement"}
        </button>
        {create.error ? (
          <p className="mt-2 text-[11px] text-[var(--color-destructive)]">
            {(create.error as Error).message}
          </p>
        ) : null}
      </OperatorPanel>

      <OperatorPanel title="Active engagements">
        <div className="mb-3">
          <select
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
            value={scheduleFilter}
            onChange={(e) =>
              setScheduleFilter(
                e.target.value as "all" | "due_soon" | "overdue" | "scheduled",
              )
            }
            aria-label="Schedule filter"
            data-testid="apzpen-schedule-filter"
          >
            <option value="all">All schedules</option>
            <option value="due_soon">Due within 7 days</option>
            <option value="overdue">Overdue</option>
            <option value="scheduled">Has next run</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
              <tr>
                <th className="py-1.5 pr-2">Engagement</th>
                <th className="py-1.5 pr-2">Source</th>
                <th className="py-1.5 pr-2">Status</th>
                <th className="py-1.5 pr-2">Position</th>
                <th className="py-1.5 pr-2">Schedule</th>
                <th className="py-1.5 pr-2">C/H/M</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const now = Date.now();
                const week = 7 * 24 * 60 * 60 * 1000;
                return (q.data?.engagements ?? [])
                  .filter((e) => {
                    if (scheduleFilter === "all") return true;
                    if (!e.nextRunAt) return false;
                    const t = new Date(e.nextRunAt).getTime();
                    if (scheduleFilter === "scheduled") return true;
                    if (scheduleFilter === "overdue") return t < now;
                    if (scheduleFilter === "due_soon")
                      return t >= now && t - now <= week;
                    return true;
                  })
                  .slice()
                  .sort((a, b) => {
                    const at = a.nextRunAt
                      ? new Date(a.nextRunAt).getTime()
                      : Number.MAX_SAFE_INTEGER;
                    const bt = b.nextRunAt
                      ? new Date(b.nextRunAt).getTime()
                      : Number.MAX_SAFE_INTEGER;
                    return at - bt;
                  })
                  .map((e) => (
                    <tr
                      key={e.engagementId}
                      className="border-t border-[var(--color-border)]"
                    >
                      <td className="py-2 pr-2">
                        <Link
                          href={`/apzpen/engagements/${e.engagementId}`}
                          className="font-medium hover:underline"
                        >
                          {e.title}
                        </Link>
                        <p className="text-[11px] text-[var(--color-muted-foreground)]">
                          {e.customerName} · {e.applicationName}
                        </p>
                      </td>
                      <td className="py-2 pr-2 font-mono text-[11px] text-[var(--color-muted-foreground)]">
                        {formatSourceBindingsSummary(e.sourceBindings) ?? "—"}
                      </td>
                      <td className="py-2 pr-2">{e.status}</td>
                      <td className="py-2 pr-2">
                        {e.posture?.assessmentPosition ?? e.assessmentPosition}
                      </td>
                      <td className="py-2 pr-2 text-[11px]">
                        <span className="font-medium">
                          {e.scheduleMode.replaceAll("_", " ")}
                        </span>
                        {e.nextRunAt ? (
                          <p className="text-[var(--color-muted-foreground)]">
                            {new Date(e.nextRunAt).toLocaleString()}
                            {new Date(e.nextRunAt).getTime() < Date.now()
                              ? " · overdue"
                              : ""}
                          </p>
                        ) : (
                          <p className="text-[var(--color-muted-foreground)]">—</p>
                        )}
                      </td>
                      <td className="py-2 pr-2 font-mono tabular-nums">
                        {e.posture
                          ? `${e.posture.critical}/${e.posture.high}/${e.posture.medium}`
                          : "—"}
                      </td>
                    </tr>
                  ));
              })()}
            </tbody>
          </table>
        </div>
      </OperatorPanel>
    </Frame>
  );
}

export function ApzpenEngagementDetailPage({ engagementId }: { engagementId: string }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["apzpen", "engagement", engagementId],
    queryFn: () => fetchEngagement(engagementId),
  });
  const [scopeLabel, setScopeLabel] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [scopeKind, setScopeKind] = useState<
    | "web_application"
    | "api"
    | "mobile"
    | "repository"
    | "host"
    | "domain"
    | "container"
    | "cloud_account"
    | "other"
  >("web_application");
  const [ingestText, setIngestText] = useState("");
  const [ingestFormat, setIngestFormat] = useState("auto");
  const [ingestTool, setIngestTool] = useState("zap");
  const [ingestMessage, setIngestMessage] = useState<string | null>(null);
  const [dispatchTarget, setDispatchTarget] = useState("");
  const [nextRunAt, setNextRunAt] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [roeNotes, setRoeNotes] = useState("");
  const [testingWindowStart, setTestingWindowStart] = useState("");
  const [testingWindowEnd, setTestingWindowEnd] = useState("");
  const [methodologyText, setMethodologyText] = useState("");
  const [allowedTech, setAllowedTech] = useState<string[]>([]);
  const [restrictedTech, setRestrictedTech] = useState<string[]>([]);
  const [roeHydrated, setRoeHydrated] = useState(false);

  const engForRoe = q.data?.engagement;
  useEffect(() => {
    if (!engForRoe || roeHydrated) return;
    setAllowedTech([...engForRoe.roe.allowedTechniques]);
    setRestrictedTech([...engForRoe.roe.restrictedTechniques]);
    setEmergencyContact(engForRoe.roe.emergencyContact ?? "");
    setRoeNotes(engForRoe.roe.notes ?? "");
    setTestingWindowStart(engForRoe.roe.testingWindowStart?.slice(0, 16) ?? "");
    setTestingWindowEnd(engForRoe.roe.testingWindowEnd?.slice(0, 16) ?? "");
    setMethodologyText(engForRoe.methodology.join("\n"));
    setNextRunAt(engForRoe.nextRunAt?.slice(0, 16) ?? "");
    setDispatchTarget(
      defaultScopeTargetId("zap", engForRoe.scope) ||
        engForRoe.scope[0]?.identifier ||
        "",
    );
    setRoeHydrated(true);
  }, [engForRoe, roeHydrated]);

  const jobsQ = useQuery({
    queryKey: ["apzpen", "jobs", engagementId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/apzpen/engagements/${engagementId}/dispatch`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load jobs");
      return body.data as {
        jobs: Array<{
          jobId: string;
          tool: string;
          target: string;
          status: string;
          dryRun: boolean;
          createdAt: string;
          artefactPath?: string;
          error?: string;
        }>;
      };
    },
  });

  const action = useMutation({
    mutationFn: (payload: { action: string } & Record<string, unknown>) =>
      postEngagementAction(engagementId, payload.action, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apzpen"] });
      setScopeLabel("");
      setScopeId("");
      setRoeHydrated(false);
    },
  });

  const findingAction = useMutation({
    mutationFn: postFindingAction,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apzpen"] });
    },
  });

  const ingest = useMutation({
    mutationFn: async () => {
      let payload: unknown;
      let rawText: string | undefined = ingestText;
      try {
        payload = JSON.parse(ingestText) as unknown;
        rawText = undefined;
      } catch {
        payload = undefined;
      }
      const res = await fetch(`/api/v1/apzpen/engagements/${engagementId}/ingest`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          format: ingestFormat,
          toolId: ingestTool,
          payload,
          rawText,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Ingest failed");
      return body.data as {
        createdCount: number;
        skipped: number;
        parsedCount: number;
        toolId: string;
      };
    },
    onSuccess: async (data) => {
      setIngestMessage(
        `Imported ${data.createdCount} · skipped ${data.skipped} duplicates · parsed ${data.parsedCount} (${data.toolId})`,
      );
      setIngestText("");
      await qc.invalidateQueries({ queryKey: ["apzpen"] });
    },
    onError: (err) => {
      setIngestMessage((err as Error).message);
    },
  });

  const eng = q.data?.engagement;
  const posture = q.data?.posture;
  const findings = q.data?.findings ?? [];

  return (
    <Frame
      title={eng?.title ?? "Engagement"}
      subtitle={
        eng
          ? [
              eng.customerName,
              eng.applicationName,
              eng.environment,
              formatSourceBindingsSummary(eng.sourceBindings),
            ]
              .filter(Boolean)
              .join(" · ")
          : "Loading…"
      }
      actions={
        <Link
          href="/apzpen/engagements"
          className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
        >
          Back
        </Link>
      }
    >
      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {eng && posture ? (
        <>
          <OperatorMetricStrip
            metrics={[
              { label: "Status", value: eng.status },
              {
                label: "Assessment",
                value: posture.assessmentPosition.toUpperCase(),
              },
              {
                label: "Findings open",
                value: String(posture.openCount),
              },
              {
                label: "RoE",
                value: eng.roe.status,
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <OperatorPanel title="Rules of Engagement">
              <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
                Testers must always know what is authorised.
              </p>
              {eng.roe.status === "approved" ? (
                <div className="grid gap-3 sm:grid-cols-2 text-[12px]">
                  <div>
                    <p className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
                      Allowed
                    </p>
                    <ul className="mt-1 list-disc pl-4">
                      {eng.roe.allowedTechniques.map((t) => (
                        <li key={t}>{t.replaceAll("_", " ")}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
                      Restricted
                    </p>
                    <ul className="mt-1 list-disc pl-4">
                      {eng.roe.restrictedTechniques.map((t) => (
                        <li key={t}>{t.replaceAll("_", " ")}</li>
                      ))}
                    </ul>
                  </div>
                  {eng.roe.emergencyContact ? (
                    <p className="col-span-2 text-[11px]">
                      Emergency: {eng.roe.emergencyContact}
                    </p>
                  ) : null}
                  {eng.roe.testingWindowStart || eng.roe.testingWindowEnd ? (
                    <p className="col-span-2 text-[11px]">
                      Window: {eng.roe.testingWindowStart ?? "—"} →{" "}
                      {eng.roe.testingWindowEnd ?? "—"}
                    </p>
                  ) : null}
                  {eng.methodology.length > 0 ? (
                    <p className="col-span-2 text-[11px]">
                      Methodology: {eng.methodology.join(" · ")}
                    </p>
                  ) : null}
                  {eng.roe.notes ? (
                    <p className="col-span-2 text-[11px] text-[var(--color-muted-foreground)]">
                      Notes: {eng.roe.notes}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3 text-[12px]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[10px] uppercase text-[var(--color-muted-foreground)]">
                        Allowed
                      </p>
                      <ul className="space-y-1">
                        {CATALOGUE_ALLOWED_TECHNIQUES.map((t) => (
                          <li key={t}>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={allowedTech.includes(t)}
                                onChange={(e) =>
                                  setAllowedTech((prev) =>
                                    e.target.checked
                                      ? [...prev, t]
                                      : prev.filter((x) => x !== t),
                                  )
                                }
                              />
                              <span>{t.replaceAll("_", " ")}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase text-[var(--color-muted-foreground)]">
                        Restricted
                      </p>
                      <ul className="space-y-1">
                        {CATALOGUE_RESTRICTED_TECHNIQUES.map((t) => (
                          <li key={t}>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={restrictedTech.includes(t)}
                                onChange={(e) =>
                                  setRestrictedTech((prev) =>
                                    e.target.checked
                                      ? [...prev, t]
                                      : prev.filter((x) => x !== t),
                                  )
                                }
                              />
                              <span>{t.replaceAll("_", " ")}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <input
                    className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                    placeholder="Emergency contact"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-[10px] uppercase text-[var(--color-muted-foreground)]">
                      Window start
                      <input
                        type="datetime-local"
                        className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px] normal-case tracking-normal"
                        value={testingWindowStart}
                        onChange={(e) => setTestingWindowStart(e.target.value)}
                        data-testid="apzpen-roe-window-start"
                        aria-label="Testing window start"
                      />
                    </label>
                    <label className="block text-[10px] uppercase text-[var(--color-muted-foreground)]">
                      Window end
                      <input
                        type="datetime-local"
                        className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px] normal-case tracking-normal"
                        value={testingWindowEnd}
                        onChange={(e) => setTestingWindowEnd(e.target.value)}
                        data-testid="apzpen-roe-window-end"
                        aria-label="Testing window end"
                      />
                    </label>
                  </div>
                  <textarea
                    className="min-h-[48px] w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-[11px]"
                    placeholder="Methodology (one per line)"
                    value={methodologyText}
                    onChange={(e) => setMethodologyText(e.target.value)}
                    data-testid="apzpen-roe-methodology"
                    aria-label="Engagement methodology"
                  />
                  <textarea
                    className="min-h-[56px] w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-[11px]"
                    placeholder="RoE notes (window, contacts, constraints)"
                    value={roeNotes}
                    onChange={(e) => setRoeNotes(e.target.value)}
                    aria-label="RoE notes"
                  />
                  <button
                    type="button"
                    className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
                    disabled={action.isPending || allowedTech.length === 0}
                    onClick={() =>
                      action.mutate({
                        action: "update_roe",
                        allowedTechniques: allowedTech,
                        restrictedTechniques: restrictedTech,
                        emergencyContact,
                        notes: roeNotes,
                        testingWindowStart: testingWindowStart
                          ? new Date(testingWindowStart).toISOString()
                          : "",
                        testingWindowEnd: testingWindowEnd
                          ? new Date(testingWindowEnd).toISOString()
                          : "",
                        methodology: methodologyText
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean),
                      })
                    }
                  >
                    Save RoE draft
                  </button>
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
                  disabled={action.isPending || eng.roe.status === "approved"}
                  onClick={() => action.mutate({ action: "approve_roe" })}
                >
                  Approve RoE
                </button>
                <button
                  type="button"
                  className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
                  disabled={action.isPending || eng.status === "in_progress"}
                  onClick={() => action.mutate({ action: "start_testing" })}
                >
                  Start testing
                </button>
              </div>
              {action.error ? (
                <p className="mt-2 text-[11px] text-[var(--color-destructive)]">
                  {(action.error as Error).message}
                </p>
              ) : null}
            </OperatorPanel>

            <OperatorPanel title="Scope targets">
              <ul className="mb-3 space-y-1 text-[12px]">
                {eng.scope.map((t) => (
                  <li key={t.targetId}>
                    <span className="font-medium">{t.label}</span>
                    <span className="text-[var(--color-muted-foreground)]">
                      {" "}
                      · {t.kind} · {t.identifier}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[12px]"
                  value={scopeKind}
                  onChange={(e) => setScopeKind(e.target.value as typeof scopeKind)}
                  aria-label="Scope kind"
                >
                  <option value="web_application">Web application</option>
                  <option value="api">API</option>
                  <option value="repository">Repository (owner/repo)</option>
                  <option value="mobile">Mobile</option>
                  <option value="host">Host</option>
                  <option value="domain">Domain</option>
                  <option value="container">Container</option>
                  <option value="cloud_account">Cloud account</option>
                  <option value="other">Other</option>
                </select>
                <input
                  className="min-w-[140px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[12px]"
                  placeholder="Label"
                  value={scopeLabel}
                  onChange={(e) => setScopeLabel(e.target.value)}
                />
                <input
                  className="min-w-[180px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[12px]"
                  placeholder={
                    scopeKind === "repository" ? "owner/repo" : "Identifier / URL"
                  }
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
                  disabled={!scopeLabel || !scopeId || action.isPending}
                  onClick={() =>
                    action.mutate({
                      action: "add_scope",
                      kind: scopeKind,
                      label: scopeLabel,
                      identifier: scopeId,
                      environment: eng.environment,
                    })
                  }
                >
                  Add target
                </button>
              </div>
            </OperatorPanel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <OperatorPanel title="Assessment position">
              <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
                Current: <strong className="uppercase">{eng.assessmentPosition}</strong>
                {q.data?.suggestedAssessmentPosition &&
                q.data.suggestedAssessmentPosition !== eng.assessmentPosition ? (
                  <>
                    {" "}
                    · Suggested from findings:{" "}
                    <strong className="uppercase">
                      {q.data.suggestedAssessmentPosition}
                    </strong>
                  </>
                ) : null}
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "not_started",
                    "in_progress",
                    "blocked",
                    "conditional",
                    "complete",
                  ] as const
                ).map((position) => (
                  <button
                    key={position}
                    type="button"
                    className={`rounded border px-2 py-1 text-[11px] ${
                      eng.assessmentPosition === position
                        ? "border-[var(--color-foreground)] bg-[var(--color-muted)]"
                        : "border-[var(--color-border)] hover:bg-[var(--color-muted)]"
                    }`}
                    disabled={action.isPending}
                    onClick={() =>
                      action.mutate({
                        action: "set_assessment_position",
                        assessmentPosition: position,
                      })
                    }
                  >
                    {position.replaceAll("_", " ")}
                  </button>
                ))}
                <button
                  type="button"
                  data-testid="apzpen-sync-assessment"
                  className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
                  disabled={action.isPending}
                  onClick={() => action.mutate({ action: "sync_assessment" })}
                >
                  Sync from findings
                </button>
              </div>
              {formatSourceBindingsSummary(eng.sourceBindings) ? (
                <p className="mt-2 font-mono text-[11px] text-[var(--color-muted-foreground)]">
                  Source: {formatSourceBindingsSummary(eng.sourceBindings)}
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-[var(--color-muted-foreground)]">
                  No source binding — add a repository scope or bind GitHub on create.
                </p>
              )}
            </OperatorPanel>

            <OperatorPanel title="Schedule">
              <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
                Once-off · frequent · on-demand assurance runs.
              </p>
              <div className="flex flex-wrap gap-2">
                {(["once", "frequent", "on_demand"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    data-testid={`apzpen-schedule-${mode}`}
                    className={`rounded border px-2 py-1 text-[11px] ${
                      eng.scheduleMode === mode
                        ? "border-[var(--color-foreground)] bg-[var(--color-muted)]"
                        : "border-[var(--color-border)] hover:bg-[var(--color-muted)]"
                    }`}
                    disabled={action.isPending}
                    onClick={() =>
                      action.mutate({
                        action: "set_schedule",
                        scheduleMode: mode,
                        nextRunAt:
                          mode === "on_demand"
                            ? undefined
                            : nextRunAt
                              ? new Date(nextRunAt).toISOString()
                              : eng.nextRunAt,
                      })
                    }
                  >
                    {mode.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
              {eng.scheduleMode !== "on_demand" ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="datetime-local"
                    className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                    value={nextRunAt}
                    onChange={(e) => setNextRunAt(e.target.value)}
                    aria-label="Next run at"
                  />
                  <button
                    type="button"
                    className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
                    disabled={action.isPending || !nextRunAt}
                    onClick={() =>
                      action.mutate({
                        action: "set_schedule",
                        scheduleMode: eng.scheduleMode,
                        nextRunAt: new Date(nextRunAt).toISOString(),
                      })
                    }
                  >
                    Save next run
                  </button>
                </div>
              ) : null}
              {eng.nextRunAt ? (
                <p className="mt-2 text-[11px] text-[var(--color-muted-foreground)]">
                  Next run: {new Date(eng.nextRunAt).toLocaleString()}
                </p>
              ) : null}
            </OperatorPanel>

            <OperatorPanel title="Certification">
              <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
                Completes when no open critical findings remain. Humans certify — tools
                never auto-certify.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="apzpen-certify"
                  className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
                  disabled={action.isPending || eng.status === "certified"}
                  onClick={() => action.mutate({ action: "certify" })}
                >
                  {eng.status === "certified" ? "Certified" : "Certify assessment"}
                </button>
                <Link
                  href={`/apzpen/reports?engagementId=${encodeURIComponent(engagementId)}`}
                  className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
                >
                  Generate report
                </Link>
              </div>
            </OperatorPanel>
          </div>

          <ApzpenGrantsPanel engagementId={engagementId} />

          <OperatorPanel title="Live runner dispatch">
            <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
              Runs CE tools in <code className="font-mono">~/apztools/security</code>{" "}
              Docker runners. Targets must be in scope. Dry-run first; live executes
              Docker. MobSF opens at <code className="font-mono">127.0.0.1:8000</code>{" "}
              for APK/IPA.
            </p>
            <div className="mb-3">
              <label className="mb-1 block text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
                Dispatch target
              </label>
              <select
                data-testid="apzpen-dispatch-target"
                className="w-full max-w-xl rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                value={dispatchTarget}
                onChange={(e) => setDispatchTarget(e.target.value)}
                aria-label="Dispatch target"
              >
                <option value="">Auto (tool default)</option>
                {eng.scope.map((t) => (
                  <option key={t.targetId} value={t.identifier}>
                    {t.label} · {t.kind} · {t.identifier}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_DISPATCH_TOOLS.map((tool) => (
                <div key={tool} className="flex gap-1">
                  <button
                    type="button"
                    data-testid={`apzpen-dispatch-${tool}`}
                    className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
                    disabled={action.isPending}
                    onClick={() =>
                      void (async () => {
                        const preferred =
                          dispatchTarget || defaultScopeTargetId(tool, eng.scope);
                        const res = await fetch(
                          `/api/v1/apzpen/engagements/${engagementId}/dispatch`,
                          {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({
                              tool,
                              dryRun: true,
                              target: preferred || undefined,
                            }),
                          },
                        );
                        const body = await res.json();
                        const targets = scopeTargetsForTool(tool, eng.scope)
                          .map((t) => t.identifier)
                          .join(", ");
                        setIngestMessage(
                          res.ok
                            ? `Dry-run ${tool} → ${body.data?.job?.target ?? preferred}: ${body.data?.job?.commandPreview?.slice(0, 120) ?? "ok"}…${targets ? ` · scope ${targets}` : ""}`
                            : (body?.error?.message ?? "Dispatch failed"),
                        );
                        if (res.ok) {
                          await qc.invalidateQueries({
                            queryKey: ["apzpen", "jobs", engagementId],
                          });
                        }
                      })()
                    }
                  >
                    Dry {tool}
                  </button>
                  <button
                    type="button"
                    data-testid={`apzpen-dispatch-live-${tool}`}
                    className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] disabled:opacity-50"
                    disabled={action.isPending}
                    title="Live Docker exec — authorised scope only"
                    onClick={() =>
                      void (async () => {
                        const preferred =
                          dispatchTarget || defaultScopeTargetId(tool, eng.scope);
                        const res = await fetch(
                          `/api/v1/apzpen/engagements/${engagementId}/dispatch`,
                          {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({
                              tool,
                              dryRun: false,
                              target: preferred || undefined,
                            }),
                          },
                        );
                        const body = await res.json();
                        setIngestMessage(
                          res.ok
                            ? `Live ${tool} → ${body.data?.job?.target ?? preferred}: ${body.data?.job?.status}${
                                body.data?.ingest
                                  ? ` · ingested ${body.data.ingest.createdCount ?? body.data.ingest.created?.length ?? 0}`
                                  : ""
                              }`
                            : (body?.error?.message ?? "Dispatch failed"),
                        );
                        if (res.ok) {
                          await qc.invalidateQueries({
                            queryKey: ["apzpen"],
                          });
                        }
                      })()
                    }
                  >
                    Live
                  </button>
                </div>
              ))}
            </div>
          </OperatorPanel>

          <OperatorPanel title="Dispatch jobs">
            {(jobsQ.data?.jobs ?? []).length === 0 ? (
              <p className="text-[12px] text-[var(--color-muted-foreground)]">
                No jobs yet — dry-run or live dispatch a tool above.
              </p>
            ) : (
              <table className="w-full text-left text-[12px]">
                <thead className="text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
                  <tr>
                    <th className="py-1.5 pr-2">When</th>
                    <th className="py-1.5 pr-2">Tool</th>
                    <th className="py-1.5 pr-2">Status</th>
                    <th className="py-1.5 pr-2">Target</th>
                    <th className="py-1.5 pr-2">Artefact</th>
                    <th className="py-1.5 pr-2" />
                  </tr>
                </thead>
                <tbody>
                  {(jobsQ.data?.jobs ?? []).map((job) => (
                    <tr
                      key={job.jobId}
                      className="border-t border-[var(--color-border)] align-top"
                    >
                      <td className="py-2 pr-2 font-mono text-[10px]">
                        {job.createdAt.slice(0, 19)}
                      </td>
                      <td className="py-2 pr-2">
                        {job.tool}
                        {job.dryRun ? " · dry" : ""}
                      </td>
                      <td className="py-2 pr-2">{job.status}</td>
                      <td className="py-2 pr-2 font-mono text-[10px]">{job.target}</td>
                      <td className="py-2 pr-2 font-mono text-[10px] text-[var(--color-muted-foreground)]">
                        {job.artefactPath
                          ? job.artefactPath.split("/").slice(-2).join("/")
                          : "—"}
                        {job.error ? (
                          <p className="text-[var(--color-destructive)]">
                            {job.error.slice(0, 120)}
                          </p>
                        ) : null}
                      </td>
                      <td className="space-y-1 py-2 pr-2">
                        {job.artefactPath && !job.dryRun ? (
                          <button
                            type="button"
                            data-testid={`apzpen-reingest-${job.jobId}`}
                            className="block text-[11px] underline disabled:opacity-50"
                            disabled={ingest.isPending}
                            onClick={() =>
                              void (async () => {
                                const res = await fetch(
                                  `/api/v1/apzpen/engagements/${engagementId}/ingest`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "content-type": "application/json",
                                    },
                                    body: JSON.stringify({ jobId: job.jobId }),
                                  },
                                );
                                const body = await res.json();
                                setIngestMessage(
                                  res.ok
                                    ? `Re-ingest ${job.tool}: created ${body.data?.createdCount ?? 0}, skipped ${body.data?.skipped ?? 0}`
                                    : (body?.error?.message ?? "Re-ingest failed"),
                                );
                                if (res.ok) {
                                  await qc.invalidateQueries({
                                    queryKey: ["apzpen"],
                                  });
                                }
                              })()
                            }
                          >
                            Re-ingest
                          </button>
                        ) : null}
                        {job.status === "failed" || job.status === "skipped" ? (
                          <button
                            type="button"
                            data-testid={`apzpen-redispatch-${job.jobId}`}
                            className="block text-[11px] underline disabled:opacity-50"
                            onClick={() =>
                              void (async () => {
                                const res = await fetch(
                                  `/api/v1/apzpen/engagements/${engagementId}/dispatch`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "content-type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      jobId: job.jobId,
                                      dryRun: job.dryRun,
                                    }),
                                  },
                                );
                                const body = await res.json();
                                setIngestMessage(
                                  res.ok
                                    ? `Re-run ${job.tool}: ${body.data?.job?.status ?? "queued"} (${body.data?.job?.jobId ?? "new"})`
                                    : (body?.error?.message ?? "Re-dispatch failed"),
                                );
                                if (res.ok) {
                                  await qc.invalidateQueries({
                                    queryKey: ["apzpen", "jobs", engagementId],
                                  });
                                }
                              })()
                            }
                          >
                            Re-run
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </OperatorPanel>

          <OperatorPanel title="Provider ingest">
            <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
              Paste or upload ZAP JSON, SARIF, Greenbone simplified, Nuclei JSONL,
              Gitleaks JSON, or MobSF JSON. Duplicates are skipped.
            </p>
            <div className="mb-2 flex flex-wrap gap-2">
              <select
                className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                value={ingestFormat}
                onChange={(e) => setIngestFormat(e.target.value)}
                aria-label="Ingest format"
              >
                <option value="auto">Auto-detect</option>
                <option value="zap">ZAP JSON</option>
                <option value="sarif">SARIF</option>
                <option value="simplified">Simplified / Greenbone</option>
                <option value="nuclei_jsonl">Nuclei JSONL</option>
                <option value="gitleaks">Gitleaks JSON</option>
                <option value="mobsf">MobSF JSON</option>
              </select>
              <select
                className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
                value={ingestTool}
                onChange={(e) => setIngestTool(e.target.value)}
                aria-label="Provider tool"
              >
                {APZPEN_PROVIDERS.filter(
                  (p) => p.id !== "github" && p.id !== "kali",
                ).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <label className="inline-flex cursor-pointer items-center rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]">
                Upload file
                <input
                  type="file"
                  accept=".json,.jsonl,.sarif,.txt,application/json,text/plain"
                  className="sr-only"
                  data-testid="apzpen-ingest-file"
                  aria-label="Upload provider artefact file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const text =
                        typeof reader.result === "string" ? reader.result : "";
                      setIngestText(text);
                      setIngestMessage(
                        `Loaded ${file.name} (${Math.round(file.size / 1024)} KB)`,
                      );
                    };
                    reader.onerror = () => {
                      setIngestMessage(`Failed to read ${file.name}`);
                    };
                    reader.readAsText(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                data-testid="apzpen-ingest-submit"
                className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
                disabled={!ingestText.trim() || ingest.isPending}
                onClick={() => ingest.mutate()}
              >
                {ingest.isPending ? "Importing…" : "Import artefact"}
              </button>
              <button
                type="button"
                className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
                disabled={findingAction.isPending}
                onClick={() =>
                  findingAction.mutate({
                    action: "import",
                    engagementId,
                    seeds: [
                      {
                        title: "Imported Nuclei finding (sample)",
                        description: "Provider import path verification",
                        severity: "low",
                        providerTool: "nuclei",
                      },
                    ],
                  })
                }
              >
                Sample seed
              </button>
            </div>
            <textarea
              data-testid="apzpen-ingest-payload"
              className="min-h-[120px] w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 font-mono text-[11px]"
              placeholder='{"site":[{"alerts":[{"name":"…","riskdesc":"High","desc":"…"}]}]}'
              value={ingestText}
              onChange={(e) => setIngestText(e.target.value)}
            />
            {ingestMessage ? (
              <p className="mt-2 text-[11px] text-[var(--color-muted-foreground)]">
                {ingestMessage}
              </p>
            ) : null}
          </OperatorPanel>

          <OperatorPanel title="Manual finding">
            <ManualFindingCreateForm
              engagementId={engagementId}
              pending={findingAction.isPending}
              onAction={(payload) => findingAction.mutate(payload)}
            />
            {findingAction.error ? (
              <p className="mt-2 text-[11px] text-[var(--color-destructive)]">
                {(findingAction.error as Error).message}
              </p>
            ) : null}
          </OperatorPanel>

          <OperatorPanel title="Findings">
            <FindingsTable
              findings={findings}
              pending={findingAction.isPending}
              onAction={(payload) => findingAction.mutate(payload)}
            />
          </OperatorPanel>
        </>
      ) : null}
    </Frame>
  );
}

function FindingsTable({
  findings,
  onAction,
  pending,
}: {
  findings: readonly Finding[];
  onAction: (payload: Record<string, unknown>) => void;
  pending?: boolean;
}) {
  if (findings.length === 0) {
    return (
      <p className="text-[12px] text-[var(--color-muted-foreground)]">
        No findings yet.
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
            <th className="py-1.5 pr-2">Provider</th>
            <th className="py-1.5 pr-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f) => (
            <tr
              key={f.findingId}
              className="border-t border-[var(--color-border)] align-top"
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
                >
                  {f.title}
                </Link>
                <p className="text-[11px] text-[var(--color-muted-foreground)]">
                  {f.description}
                </p>
                {f.remediation ? (
                  <p className="mt-1 text-[11px]">
                    <span className="text-[var(--color-muted-foreground)]">Fix: </span>
                    {f.remediation}
                  </p>
                ) : null}
                {f.location ? (
                  <p className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                    {f.location}
                  </p>
                ) : null}
                {f.evidence?.length ? (
                  <p className="mt-1 text-[10px] text-[var(--color-muted-foreground)]">
                    Evidence: {f.evidence.length}
                  </p>
                ) : null}
              </td>
              <td className="py-2 pr-2">{f.status}</td>
              <td className="py-2 pr-2 text-[11px]">{f.assignedTo ?? "—"}</td>
              <td className="py-2 pr-2">{f.providerTool ?? "—"}</td>
              <td className="py-2 pr-2">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ApzpenFindingsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["apzpen", "findings"],
    queryFn: fetchFindings,
  });
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "critical_high">(
    "all",
  );
  const findingAction = useMutation({
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
  const findings = (q.data?.findings ?? []).filter((f) => {
    if (statusFilter === "open") {
      return (
        f.status === "open" ||
        f.status === "remediating" ||
        f.status === "retest_requested" ||
        f.status === "retest_failed"
      );
    }
    if (statusFilter === "critical_high") {
      return f.severity === "critical" || f.severity === "high";
    }
    return true;
  });
  return (
    <Frame
      title="Findings"
      subtitle="Normalised across tools and manual testing — one problem, many evidence streams."
    >
      <OperatorPanel title="All findings">
        <div className="mb-3">
          <select
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "open" | "critical_high")
            }
            aria-label="Filter findings"
          >
            <option value="all">All</option>
            <option value="open">Open / remediating</option>
            <option value="critical_high">Critical / High</option>
          </select>
        </div>
        {findingAction.error ? (
          <p className="mb-2 text-[11px] text-[var(--color-destructive)]">
            {(findingAction.error as Error).message}
          </p>
        ) : null}
        <FindingsTable
          findings={findings}
          pending={findingAction.isPending}
          onAction={(payload) => findingAction.mutate(payload)}
        />
      </OperatorPanel>
    </Frame>
  );
}

export function ApzpenAssetsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["apzpen", "assets"],
    queryFn: async () => {
      const res = await fetch("/api/v1/apzpen/assets?seed=1");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load");
      return body.data as {
        assets: Array<{
          assetKey: string;
          kind: string;
          label: string;
          identifier: string;
          environment: string;
          engagementIds: string[];
          engagementTitles: string[];
          openFindingCount: number;
        }>;
      };
    },
  });
  const graphQ = useQuery({
    queryKey: ["apzpen", "graph"],
    queryFn: async () => {
      const res = await fetch("/api/v1/apzpen/graph");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load graph");
      return body.data as {
        summary: {
          nodeCounts: Record<string, number>;
          edgeCount: number;
        };
        graph: {
          nodes: Array<{ nodeId: string; kind: string; label: string }>;
          edges: Array<{ relation: string }>;
        };
      };
    },
  });
  const rebuild = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/apzpen/graph", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rebuildAll: true }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Rebuild failed");
      return body.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apzpen", "graph"] });
    },
  });
  const assets = q.data?.assets ?? [];
  const summary = graphQ.data?.summary;
  return (
    <Frame
      title="Assets"
      subtitle="Attack-surface inventory and thin Security Graph — Engagement ↔ Asset ↔ Finding."
    >
      <OperatorMetricStrip
        metrics={[
          {
            label: "Assets",
            value: String(summary?.nodeCounts.asset ?? assets.length),
          },
          {
            label: "Findings (graph)",
            value: String(summary?.nodeCounts.finding ?? 0),
          },
          {
            label: "Edges",
            value: String(summary?.edgeCount ?? 0),
          },
        ]}
      />
      <OperatorPanel title="Security Graph">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
            disabled={rebuild.isPending}
            onClick={() => rebuild.mutate()}
          >
            Rebuild graph
          </button>
          {rebuild.error ? (
            <span className="text-[11px] text-[var(--color-destructive)]">
              {(rebuild.error as Error).message}
            </span>
          ) : null}
        </div>
        <p className="text-[11px] text-[var(--color-muted-foreground)]">
          Nodes: engagement {summary?.nodeCounts.engagement ?? 0} · asset{" "}
          {summary?.nodeCounts.asset ?? 0} · finding {summary?.nodeCounts.finding ?? 0}{" "}
          · edges {summary?.edgeCount ?? 0}
        </p>
      </OperatorPanel>
      <OperatorPanel title="In-scope assets">
        {q.isLoading ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
        ) : null}
        {assets.length === 0 ? (
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            No assets yet — add scope targets on an engagement.
          </p>
        ) : (
          <table className="w-full text-left text-[12px]">
            <thead className="text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
              <tr>
                <th className="py-1.5 pr-2">Kind</th>
                <th className="py-1.5 pr-2">Asset</th>
                <th className="py-1.5 pr-2">Identifier</th>
                <th className="py-1.5 pr-2">Env</th>
                <th className="py-1.5 pr-2">Open</th>
                <th className="py-1.5 pr-2">Engagements</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.assetKey} className="border-t border-[var(--color-border)]">
                  <td className="py-2 pr-2 font-mono text-[11px]">{a.kind}</td>
                  <td className="py-2 pr-2 font-medium">{a.label}</td>
                  <td className="py-2 pr-2 font-mono text-[11px]">{a.identifier}</td>
                  <td className="py-2 pr-2">{a.environment}</td>
                  <td className="py-2 pr-2 font-mono tabular-nums">
                    {a.openFindingCount}
                  </td>
                  <td className="py-2 pr-2">
                    <ul className="space-y-0.5">
                      {a.engagementIds.map((id, i) => (
                        <li key={id}>
                          <Link
                            href={`/apzpen/engagements/${id}`}
                            className="hover:underline"
                          >
                            {a.engagementTitles[i] ?? id}
                          </Link>
                        </li>
                      ))}
                    </ul>
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

export function ApzpenProvidersPage() {
  const providers = APZPEN_PROVIDERS;
  const health = useQuery({
    queryKey: ["apzpen", "providers", "health"],
    queryFn: async () => {
      const res = await fetch("/api/v1/apzpen/providers/health");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data as {
        health: Array<{
          id: string;
          status: string;
          detail: string;
          checkedAt: string;
        }>;
      };
    },
  });
  const healthById = new Map((health.data?.health ?? []).map((h) => [h.id, h]));
  return (
    <Frame
      title="Providers"
      subtitle="Best-of-breed CE/OSS tools underneath APZPEN. Users work in APZPEN — providers supply evidence."
    >
      <OperatorPanel title="Provider catalogue">
        <table className="w-full text-left text-[12px]">
          <thead className="text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
            <tr>
              <th className="py-1.5 pr-2">Provider</th>
              <th className="py-1.5 pr-2">Discipline</th>
              <th className="py-1.5 pr-2">Integration</th>
              <th className="py-1.5 pr-2">Health</th>
              <th className="py-1.5 pr-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => {
              const h = healthById.get(p.id);
              return (
                <tr key={p.id} className="border-t border-[var(--color-border)]">
                  <td className="py-2 pr-2 font-medium">{p.name}</td>
                  <td className="py-2 pr-2">{p.discipline}</td>
                  <td className="py-2 pr-2 text-[var(--color-muted-foreground)]">
                    {providerStatusLabel(p.status)}
                    {p.notes ? ` — ${p.notes}` : ""}
                  </td>
                  <td className="py-2 pr-2 text-[11px]">
                    {h ? (
                      <>
                        <span className="font-mono uppercase">{h.status}</span>
                        <p className="text-[10px] text-[var(--color-muted-foreground)]">
                          {h.detail}
                        </p>
                      </>
                    ) : (
                      <span className="text-[var(--color-muted-foreground)]">
                        {health.isLoading ? "…" : "—"}
                      </span>
                    )}
                  </td>
                  <td className="space-x-2 py-2 pr-2 text-[11px]">
                    {p.dispatchable ? (
                      <Link href="/apzpen/engagements" className="underline">
                        Dispatch
                      </Link>
                    ) : null}
                    {p.id === "mobsf" ? (
                      <a
                        href="http://127.0.0.1:8000"
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        MobSF UI
                      </a>
                    ) : null}
                    {p.id === "github" ? (
                      <Link href="/apzpen/code" className="underline">
                        Code security
                      </Link>
                    ) : null}
                    {!p.dispatchable && p.id !== "github" && p.id !== "mobsf" ? (
                      <span className="text-[var(--color-muted-foreground)]">
                        Ingest
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </OperatorPanel>
    </Frame>
  );
}

export function ApzpenReportsPage() {
  const list = useQuery({
    queryKey: ["apzpen", "reports", "list"],
    queryFn: async () => {
      const res = await fetch("/api/v1/apzpen/reports");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data as {
        engagements: Array<{
          engagementId: string;
          title: string;
          status: string;
          assessmentPosition: string;
        }>;
        kinds: string[];
      };
    },
  });
  const [engagementId, setEngagementId] = useState("");
  const [kind, setKind] = useState("executive");
  const [markdown, setMarkdown] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromQuery = new URLSearchParams(window.location.search).get("engagementId");
    if (fromQuery) {
      setEngagementId(fromQuery);
      return;
    }
    const first = list.data?.engagements[0]?.engagementId;
    if (first && !engagementId) setEngagementId(first);
  }, [list.data, engagementId]);

  const load = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/v1/apzpen/reports?engagementId=${encodeURIComponent(engagementId)}&kind=${kind}`,
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Failed");
      return body.data.pack as { title: string; markdown: string };
    },
    onSuccess: (pack) => {
      setMarkdown(pack.markdown);
      setTitle(pack.title);
    },
  });

  useEffect(() => {
    if (!engagementId) return;
    load.mutate();
  }, [engagementId, kind]);

  const downloadMarkdown = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "apzpen-report").replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Frame
      title="Reports"
      subtitle="Executive, technical and compliance packs from the same assessment data."
    >
      <OperatorPanel title="Generate pack">
        <div className="mb-3 flex flex-wrap gap-2">
          <select
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
            value={engagementId}
            onChange={(e) => setEngagementId(e.target.value)}
            aria-label="Engagement"
          >
            {(list.data?.engagements ?? []).map((e) => (
              <option key={e.engagementId} value={e.engagementId}>
                {e.title}
              </option>
            ))}
          </select>
          <select
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            aria-label="Report kind"
          >
            <option value="executive">Executive</option>
            <option value="technical">Technical</option>
            <option value="compliance">Compliance</option>
          </select>
          <button
            type="button"
            data-testid="apzpen-report-generate"
            className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
            disabled={!engagementId || load.isPending}
            onClick={() => load.mutate()}
          >
            {load.isPending ? "Generating…" : "Refresh"}
          </button>
          {engagementId ? (
            <a
              data-testid="apzpen-report-pdf"
              className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
              href={`/api/v1/apzpen/reports?engagementId=${encodeURIComponent(engagementId)}&kind=${kind}&format=pdf`}
            >
              Download PDF
            </a>
          ) : null}
          {markdown ? (
            <button
              type="button"
              data-testid="apzpen-report-md"
              className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]"
              onClick={downloadMarkdown}
            >
              Download Markdown
            </button>
          ) : null}
        </div>
        {load.error ? (
          <p className="mb-2 text-[11px] text-[var(--color-destructive)]">
            {(load.error as Error).message}
          </p>
        ) : null}
        {markdown ? (
          <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded border border-[var(--color-border)] p-3 font-mono text-[11px]">
            {markdown}
          </pre>
        ) : (
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            Select an engagement to preview an executive, technical, or compliance
            evidence pack.
          </p>
        )}
      </OperatorPanel>
    </Frame>
  );
}
