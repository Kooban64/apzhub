"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  QEP_CERTIFICATION_ROUTES,
  parseQepCertificationEvaluationId,
} from "@/lib/qep/certification-routes";
import { QEP_QUALITY_JOURNEY_ROUTES } from "@/lib/qep/quality-journey-routes";
import { QEP_EVIDENCE_ROUTES, QEP_QI_ROUTES, QEP_SCM_ROUTES } from "@/lib/qep/routes";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

type RcDomainTile = {
  domainId: string;
  label: string;
  status: "pass" | "fail" | "not_present" | "info";
  summary: string;
  evidenceIds: string[];
  explainRefs: string[];
};

type CertificationEvaluation = {
  evaluationId: string;
  changeEventId: string;
  title: string;
  score: number;
  readiness: "READY" | "BLOCKED";
  summary: string;
  residualRisk: string;
  compositionSatisfied: boolean;
  domains: RcDomainTile[];
  impactSummary?: {
    riskLevel: string;
    requirementCount: number;
    suiteMatchCount: number;
    nodeCount: number;
  };
  gates: Array<{
    gateId: string;
    name: string;
    status: string;
    reason: string;
    evidenceRefs: string[];
    outstandingWork: string[];
  }>;
  evidenceLinks: Array<{
    evidenceId: string;
    domain: string;
    ref: string;
    note?: string;
  }>;
  explainability: Array<{
    gateId: string;
    reason: string;
    evidenceEvaluated: string[];
  }>;
  humanDecision?: {
    outcome: "GO" | "NO_GO";
    actorId: string;
    coApproverActorId?: string;
    rationale: string;
    decidedAt: string;
  };
  authorityVotes?: Array<{
    authorityId: string;
    outcome: "GO" | "NO_GO";
    actorId: string;
    rationale: string;
    decidedAt: string;
  }>;
};

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

function domainMark(status: RcDomainTile["status"]): string {
  switch (status) {
    case "pass":
      return "✓";
    case "fail":
      return "✗";
    case "info":
      return "·";
    default:
      return "—";
  }
}

function domainTone(status: RcDomainTile["status"]): string {
  switch (status) {
    case "pass":
      return "border-[var(--color-border)] text-[var(--color-foreground)]";
    case "fail":
      return "border-red-500/40 text-red-700 dark:text-red-300";
    case "info":
      return "border-[var(--color-border)] text-[var(--color-muted-foreground)]";
    default:
      return "border-dashed border-[var(--color-border)] text-[var(--color-muted-foreground)]";
  }
}

export function QepCertificationRouterView() {
  const pathname = usePathname() ?? "";
  const evaluationId = parseQepCertificationEvaluationId(pathname);
  if (evaluationId) {
    return <RcWorkbenchView evaluationId={evaluationId} />;
  }
  return <RcHomeView />;
}

function RcHomeView() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [changeEventId, setChangeEventId] = useState(
    searchParams?.get("changeEventId") ?? "",
  );
  const [lastEvaluationId, setLastEvaluationId] = useState<string | null>(null);
  const [certSignalEvalId, setCertSignalEvalId] = useState("");
  const [certSignalDetail, setCertSignalDetail] = useState("");

  const continuousCertQuery = useQuery({
    queryKey: ["qep-continuous-cert", "signals"],
    queryFn: () =>
      fetchJson<{
        signals: Array<{
          signalId: string;
          evaluationId: string;
          kind: string;
          detail: string;
          status: string;
          detectedAt: string;
          expiresAt?: string;
        }>;
      }>("/api/v1/qep/continuous-cert/signals"),
  });

  const continuousCertMutation = useMutation({
    mutationFn: (input: Record<string, string>) =>
      fetchJson("/api/v1/qep/continuous-cert/signals", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-continuous-cert"] });
    },
  });

  const recentChangesQuery = useQuery({
    queryKey: ["qep-scm", "changes", "rc-picker"],
    queryFn: () =>
      fetchJson<{
        changes: Array<{
          changeEventId: string;
          kind: string;
          summary: string;
          occurredAt: string;
          repositoryId?: string;
        }>;
      }>("/api/v1/qep/scm/changes?limit=12"),
  });

  const securityQuery = useQuery({
    queryKey: ["qep-security-assurance", "rc", changeEventId.trim()],
    queryFn: () => {
      const qs =
        changeEventId.trim().length > 8
          ? `?changeEventId=${encodeURIComponent(changeEventId.trim())}`
          : "";
      return fetchJson<{
        summary: {
          entitled: boolean;
          linked: boolean;
          href: string;
          reviewClear: boolean;
          detail: string;
          critical: number;
          high: number;
          openCount: number;
          assessmentPosition?: string;
        };
        externalRef: string | null;
      }>(`/api/v1/qep/security-assurance${qs}`);
    },
    refetchInterval: 30_000,
  });

  const byChangeQuery = useQuery({
    queryKey: ["qep-certification", "by-change", changeEventId.trim()],
    enabled: changeEventId.trim().length > 8,
    queryFn: () =>
      fetchJson<{
        changeEventId: string;
        evaluations: CertificationEvaluation[];
      }>(
        `/api/v1/qep/certification/by-change/${encodeURIComponent(changeEventId.trim())}`,
      ),
  });

  const evaluateMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ evaluation: CertificationEvaluation }>(
        "/api/v1/qep/certification/evaluations",
        {
          method: "POST",
          body: JSON.stringify({ changeEventId: changeEventId.trim() }),
        },
      ),
    onSuccess: (data) => {
      setLastEvaluationId(data.evaluation.evaluationId);
      void queryClient.invalidateQueries({ queryKey: ["qep-certification"] });
    },
  });

  const security = securityQuery.data?.summary;

  return (
    <QepPageShell
      title="Release Candidate"
      description="One change → domain readiness (automation, security, performance, a11y, coverage, code quality) → explain-why → human GO / NO-GO. AI never certifies."
      actions={
        <Button
          type="button"
          disabled={evaluateMutation.isPending || changeEventId.trim().length < 8}
          onClick={() => evaluateMutation.mutate()}
        >
          {evaluateMutation.isPending ? "Evaluating…" : "Open RC for change"}
        </Button>
      }
    >
      <QepPanel title="Security assurance (APZPEN)">
        <div data-testid="qep-rc-security">
          {securityQuery.isLoading ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Loading security posture…
            </p>
          ) : securityQuery.isError ? (
            <QepErrorState message={(securityQuery.error as Error).message} />
          ) : security ? (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <QepStatusBadge status={security.reviewClear ? "ready" : "blocked"} />
                  <span className="text-sm font-medium">
                    {security.assessmentPosition ??
                      (security.linked ? "linked" : "not linked")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {security.detail}
                </p>
                {securityQuery.data?.externalRef ? (
                  <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                    Bound repository: {securityQuery.data.externalRef}
                  </p>
                ) : null}
              </div>
              {security.href ? (
                <Link
                  className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
                  href={security.href}
                >
                  Open APZPEN
                </Link>
              ) : (
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  Entitlement required for APZPEN deep link
                </span>
              )}
            </div>
          ) : null}
        </div>
      </QepPanel>

      <QepPanel title="Continuous certification signals">
        <div data-testid="qep-continuous-cert">
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            Advisory expiry / drift / freshness on cert packs (SPR-APZQEP-230-B).
            Escalate requests human re-approval — signals never auto-flip GO/NO-GO.
          </p>
          <form
            className="mb-4 grid gap-2 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!certSignalEvalId.trim() || !certSignalDetail.trim()) return;
              continuousCertMutation.mutate({
                action: "create",
                evaluationId: certSignalEvalId.trim(),
                kind: "drift",
                detail: certSignalDetail.trim(),
              });
              setCertSignalDetail("");
            }}
          >
            <label className="block text-sm">
              evaluationId
              <input
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
                value={certSignalEvalId}
                onChange={(event) => setCertSignalEvalId(event.target.value)}
                placeholder="eval-…"
                data-testid="qep-ccs-evaluation-id"
              />
            </label>
            <label className="block text-sm">
              detail
              <input
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
                value={certSignalDetail}
                onChange={(event) => setCertSignalDetail(event.target.value)}
                placeholder="Evidence pack drift detected…"
                data-testid="qep-ccs-detail"
              />
            </label>
            <div className="md:col-span-2">
              <Button
                type="submit"
                size="sm"
                disabled={continuousCertMutation.isPending}
              >
                Record drift signal
              </Button>
            </div>
          </form>
          {continuousCertQuery.isLoading ? (
            <QepLoadingState label="Loading cert signals…" />
          ) : continuousCertQuery.isError ? (
            <QepErrorState message={(continuousCertQuery.error as Error).message} />
          ) : (continuousCertQuery.data?.signals.length ?? 0) === 0 ? (
            <QepEmptyState title="No continuous cert signals yet." />
          ) : (
            <ul className="space-y-2">
              {(continuousCertQuery.data?.signals ?? []).map((signal) => (
                <li
                  key={signal.signalId}
                  className="flex flex-wrap items-center gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
                >
                  <QepStatusBadge status={signal.status} />
                  <QepStatusBadge status={signal.kind} />
                  <span className="font-mono text-xs">{signal.evaluationId}</span>
                  <span className="text-xs">{signal.detail}</span>
                  {signal.status === "open" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          continuousCertMutation.mutate({
                            action: "acknowledge",
                            signalId: signal.signalId,
                          })
                        }
                      >
                        Acknowledge
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          continuousCertMutation.mutate({
                            action: "escalate",
                            signalId: signal.signalId,
                          })
                        }
                      >
                        Request re-cert
                      </Button>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </QepPanel>

      <QepPanel title="Select engineering change">
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          Prefer a recent SCM change below, or paste a changeEventId. Path: SCM change →
          provider evidence → evaluate RC → human decision. Security domain uses QEP
          evidence plus APZPEN posture when linked.
        </p>

        {recentChangesQuery.isLoading ? (
          <QepLoadingState label="Loading recent changes…" />
        ) : recentChangesQuery.isError ? (
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            Recent changes unavailable ({(recentChangesQuery.error as Error).message}).
            Use manual id entry.
          </p>
        ) : (recentChangesQuery.data?.changes.length ?? 0) === 0 ? (
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            No recent SCM changes yet. Sync a repository or paste a changeEventId.
          </p>
        ) : (
          <ul className="mb-4 space-y-2" data-testid="qep-rc-recent-changes">
            {(recentChangesQuery.data?.changes ?? []).map((change) => (
              <li key={change.changeEventId}>
                <button
                  type="button"
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]"
                  onClick={() => setChangeEventId(change.changeEventId)}
                >
                  <span className="font-medium">{change.kind}</span>
                  <span className="text-[var(--color-muted-foreground)]">
                    {" "}
                    · {change.summary}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-[var(--color-muted-foreground)]">
                    {change.changeEventId}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="mb-2 block text-sm">
          changeEventId
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
            value={changeEventId}
            onChange={(event) => setChangeEventId(event.target.value)}
            placeholder="chg-github-…"
            data-testid="qep-rc-change-event-id"
          />
        </label>
        {evaluateMutation.isError ? (
          <QepErrorState message={(evaluateMutation.error as Error).message} />
        ) : null}
        {lastEvaluationId ? (
          <p className="mt-2 text-sm">
            Open workbench:{" "}
            <Link
              href={QEP_CERTIFICATION_ROUTES.rcEvaluation(lastEvaluationId)}
              data-testid="qep-rc-open-latest"
            >
              {lastEvaluationId}
            </Link>
          </p>
        ) : null}
      </QepPanel>

      <QepPanel title="Recent RC evaluations">
        {byChangeQuery.isLoading ? (
          <QepLoadingState label="Loading evaluations…" />
        ) : byChangeQuery.isError ? (
          <QepErrorState message={(byChangeQuery.error as Error).message} />
        ) : (byChangeQuery.data?.evaluations.length ?? 0) === 0 ? (
          <QepEmptyState title="No RC evaluations yet for this change." />
        ) : (
          <QepTable
            caption="Release candidate evaluations"
            columns={["RC", "Readiness", "Score", "Human", "Reproduce"]}
            rows={(byChangeQuery.data?.evaluations ?? []).map((item) => ({
              id: item.evaluationId,
              href: QEP_CERTIFICATION_ROUTES.rcEvaluation(item.evaluationId),
              cells: [
                item.title ?? item.evaluationId.slice(0, 18),
                <QepStatusBadge key="r" status={item.readiness} />,
                `${item.score}%`,
                item.humanDecision?.outcome ?? "—",
                item.humanDecision ? (
                  <Link
                    key="rep"
                    href={`${QEP_CERTIFICATION_ROUTES.rcEvaluation(item.evaluationId)}?reproduce=1`}
                    className="text-[var(--color-primary)] underline-offset-2 hover:underline"
                  >
                    Snapshot
                  </Link>
                ) : (
                  "—"
                ),
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function RcWorkbenchView({ evaluationId }: { evaluationId: string }) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const reproduceMode = searchParams.get("reproduce") === "1";
  const [rationale, setRationale] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [authorityId, setAuthorityId] = useState<
    "quality_certifier" | "quality_co_approver"
  >("quality_certifier");

  const detailQuery = useQuery({
    queryKey: ["qep-certification", "evaluation", evaluationId],
    queryFn: () =>
      fetchJson<{ evaluation: CertificationEvaluation }>(
        `/api/v1/qep/certification/evaluations/${evaluationId}`,
      ),
  });

  const reproduceQuery = useQuery({
    queryKey: ["qep-certification", "reproduce", evaluationId],
    enabled: reproduceMode,
    queryFn: () =>
      fetchJson<{
        mode: "reproduce";
        immutable: true;
        lockedAt: string;
        evaluation: CertificationEvaluation;
        reportPackHref: string;
      }>(`/api/v1/qep/certification/evaluations/${evaluationId}/reproduce`),
  });

  const securityQuery = useQuery({
    queryKey: [
      "qep-security-assurance",
      "rc-workbench",
      detailQuery.data?.evaluation.changeEventId,
    ],
    enabled: Boolean(detailQuery.data?.evaluation.changeEventId),
    queryFn: () =>
      fetchJson<{
        summary: {
          href: string;
          reviewClear: boolean;
          detail: string;
          assessmentPosition?: string;
          critical: number;
          high: number;
        };
      }>(
        `/api/v1/qep/security-assurance?changeEventId=${encodeURIComponent(
          detailQuery.data!.evaluation.changeEventId,
        )}`,
      ),
  });

  const decisionMutation = useMutation({
    mutationFn: (outcome: "GO" | "NO_GO") =>
      fetchJson<{ evaluation: CertificationEvaluation }>(
        `/api/v1/qep/certification/evaluations/${evaluationId}/decision`,
        {
          method: "POST",
          body: JSON.stringify({ outcome, rationale, authorityId }),
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-certification"] });
    },
  });

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading release candidate…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={(detailQuery.error as Error | undefined)?.message ?? "Not found"}
      />
    );
  }

  const evaluation = detailQuery.data.evaluation;
  const votes = evaluation.authorityVotes ?? [];
  const certVoted = votes.some((v) => v.authorityId === "quality_certifier");
  const coVoted = votes.some((v) => v.authorityId === "quality_co_approver");
  const domains = evaluation.domains ?? [];
  const activeDomain =
    domains.find((domain) => domain.domainId === selectedDomain) ?? domains[0];
  const explainForDomain = (evaluation.explainability ?? []).filter((row) =>
    activeDomain?.explainRefs.includes(row.gateId),
  );
  const evidenceForDomain = (evaluation.evidenceLinks ?? []).filter((link) =>
    activeDomain?.evidenceIds.includes(link.evidenceId),
  );
  const security = securityQuery.data?.summary;

  return (
    <QepPageShell
      title={evaluation.title || "Release Candidate"}
      description={evaluation.summary}
      actions={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span data-testid="qep-rc-score">
            Score <strong>{evaluation.score}%</strong>
          </span>
          <QepStatusBadge status={evaluation.readiness} />
          {evaluation.humanDecision ? (
            <QepStatusBadge status={evaluation.humanDecision.outcome} />
          ) : null}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={QEP_CERTIFICATION_ROUTES.rcHome}>← RC home</Link>
        <Link
          href={QEP_QUALITY_JOURNEY_ROUTES.byChange(evaluation.changeEventId)}
          data-testid="qep-rc-open-journey"
        >
          Quality Journey
        </Link>
        <Link
          href={QEP_QI_ROUTES.byChange(evaluation.changeEventId)}
          data-testid="qep-rc-open-qi"
        >
          Quality Intelligence
        </Link>
        <Link
          href={`${QEP_SCM_ROUTES.home}`}
          className="text-[var(--color-muted-foreground)]"
        >
          Source Control
        </Link>
        {security?.href ? (
          <Link href={security.href} data-testid="qep-rc-open-apzpen">
            APZPEN security
          </Link>
        ) : null}
      </div>

      {security ? (
        <QepPanel title="Security assurance (APZPEN)">
          <div
            className="flex flex-wrap items-center gap-2"
            data-testid="qep-rc-workbench-security"
          >
            <QepStatusBadge status={security.reviewClear ? "ready" : "blocked"} />
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {security.detail}
            </p>
          </div>
        </QepPanel>
      ) : null}

      {/* One composition: domain strip — programme face */}
      <section
        className="mb-6 rounded-lg border border-[var(--color-border)] p-4"
        data-testid="qep-rc-domain-strip"
        aria-label="Release candidate quality domains"
      >
        <p className="mb-3 font-mono text-xs text-[var(--color-muted-foreground)]">
          {evaluation.changeEventId}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((domain) => (
            <button
              key={domain.domainId}
              type="button"
              onClick={() => setSelectedDomain(domain.domainId)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition ${domainTone(domain.status)} ${
                activeDomain?.domainId === domain.domainId
                  ? "ring-2 ring-[var(--color-foreground)]/20"
                  : ""
              }`}
              data-testid={`qep-rc-domain-${domain.domainId}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{domain.label}</span>
                <span aria-hidden="true">{domainMark(domain.status)}</span>
              </div>
              <p className="mt-1 text-xs opacity-80">
                {domain.domainId === "security" && security
                  ? `${domain.summary} · APZPEN: ${
                      security.assessmentPosition ?? "n/a"
                    } (crit ${security.critical}/high ${security.high})`
                  : domain.summary}
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <QepPanel
          title={activeDomain ? `Explain-why · ${activeDomain.label}` : "Explain-why"}
        >
          {activeDomain?.status === "not_present" ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {activeDomain.summary}
            </p>
          ) : null}
          {explainForDomain.length > 0 ? (
            <ul className="list-disc pl-5 text-sm">
              {explainForDomain.map((row) => (
                <li key={row.gateId}>
                  <span className="font-mono text-xs">{row.gateId}</span>: {row.reason}
                  {row.evidenceEvaluated.length > 0 ? (
                    <span className="text-[var(--color-muted-foreground)]">
                      {" "}
                      · refs {row.evidenceEvaluated.length}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {activeDomain?.summary ?? "Select a domain tile."}
            </p>
          )}
          {evaluation.impactSummary ? (
            <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
              Graph: risk {evaluation.impactSummary.riskLevel} · reqs{" "}
              {evaluation.impactSummary.requirementCount} · suites{" "}
              {evaluation.impactSummary.suiteMatchCount} · nodes{" "}
              {evaluation.impactSummary.nodeCount}
            </p>
          ) : null}
        </QepPanel>

        <QepPanel title="Human certification">
          {reproduceMode ? (
            <div className="space-y-2 text-sm" data-testid="qep-rc-reproduce">
              {reproduceQuery.isLoading ? (
                <QepLoadingState label="Loading locked snapshot…" />
              ) : reproduceQuery.isError ? (
                <QepErrorState message={(reproduceQuery.error as Error).message} />
              ) : reproduceQuery.data ? (
                <>
                  <p>
                    <QepStatusBadge status="ready" /> Immutable reproduce snapshot ·
                    locked {reproduceQuery.data.lockedAt}
                  </p>
                  <p>
                    Decision:{" "}
                    <QepStatusBadge
                      status={reproduceQuery.data.evaluation.humanDecision!.outcome}
                    />
                  </p>
                  <p>
                    Certifier: {reproduceQuery.data.evaluation.humanDecision!.actorId}
                  </p>
                  {reproduceQuery.data.evaluation.humanDecision!.coApproverActorId ? (
                    <p>
                      Co-approver:{" "}
                      {reproduceQuery.data.evaluation.humanDecision!.coApproverActorId}
                    </p>
                  ) : null}
                  <p className="text-[var(--color-muted-foreground)]">
                    {reproduceQuery.data.evaluation.humanDecision!.rationale}
                  </p>
                  <Link
                    className="text-[var(--color-primary)] underline-offset-2 hover:underline"
                    href={reproduceQuery.data.reportPackHref}
                  >
                    Open report pack JSON (as-of change)
                  </Link>
                </>
              ) : null}
            </div>
          ) : evaluation.humanDecision ? (
            <div className="text-sm" data-testid="qep-rc-human-decision">
              <p>
                Decision: <QepStatusBadge status={evaluation.humanDecision.outcome} />
              </p>
              <p className="mt-1">Certifier: {evaluation.humanDecision.actorId}</p>
              {evaluation.humanDecision.coApproverActorId ? (
                <p className="mt-1">
                  Co-approver: {evaluation.humanDecision.coApproverActorId}
                </p>
              ) : null}
              <p className="mt-1">At: {evaluation.humanDecision.decidedAt}</p>
              <p className="mt-2">{evaluation.humanDecision.rationale}</p>
              <p className="mt-3">
                <Link
                  href={`${QEP_CERTIFICATION_ROUTES.rcEvaluation(evaluation.evaluationId)}?reproduce=1`}
                  className="text-[var(--color-primary)] underline-offset-2 hover:underline"
                >
                  Reproduce locked snapshot (WF-27)
                </Link>
              </p>
            </div>
          ) : (
            <>
              <p className="mb-2 text-sm text-[var(--color-muted-foreground)]">
                Dual human authority required for GO (certifier + co-approver, distinct
                actors). Any NO-GO finalises immediately. Advisory score never
                certifies.
              </p>
              {votes.length > 0 ? (
                <ul className="mb-3 space-y-1 text-xs">
                  {votes.map((v) => (
                    <li key={v.authorityId}>
                      <span className="font-mono">{v.authorityId}</span>: {v.outcome} by{" "}
                      {v.actorId}
                    </li>
                  ))}
                </ul>
              ) : null}
              <label className="mb-2 block text-sm">
                Authority role
                <select
                  className="mt-1 h-8 w-full rounded border border-[var(--color-border)] bg-transparent px-2 text-sm"
                  value={authorityId}
                  onChange={(e) =>
                    setAuthorityId(
                      e.target.value as "quality_certifier" | "quality_co_approver",
                    )
                  }
                  data-testid="qep-rc-authority"
                >
                  <option value="quality_certifier" disabled={certVoted}>
                    Quality certifier
                    {certVoted ? " (recorded)" : ""}
                  </option>
                  <option value="quality_co_approver" disabled={coVoted}>
                    Quality co-approver
                    {coVoted ? " (recorded)" : ""}
                  </option>
                </select>
              </label>
              <label className="mb-2 block text-sm">
                Rationale (required)
                <textarea
                  className="mt-1 min-h-20 w-full rounded border border-[var(--color-border)] bg-transparent p-2 text-sm"
                  value={rationale}
                  onChange={(event) => setRationale(event.target.value)}
                  data-testid="qep-rc-rationale"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={
                    decisionMutation.isPending ||
                    rationale.trim().length < 3 ||
                    (authorityId === "quality_certifier" && certVoted) ||
                    (authorityId === "quality_co_approver" && coVoted)
                  }
                  onClick={() => decisionMutation.mutate("GO")}
                >
                  Record GO
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    decisionMutation.isPending ||
                    rationale.trim().length < 3 ||
                    (authorityId === "quality_certifier" && certVoted) ||
                    (authorityId === "quality_co_approver" && coVoted)
                  }
                  onClick={() => decisionMutation.mutate("NO_GO")}
                >
                  Record NO-GO
                </Button>
              </div>
              {decisionMutation.isError ? (
                <QepErrorState message={(decisionMutation.error as Error).message} />
              ) : null}
            </>
          )}
        </QepPanel>
      </div>

      <QepPanel title="Evidence drill-down">
        {evidenceForDomain.length === 0 &&
        (activeDomain?.evidenceIds.length ?? 0) === 0 ? (
          <QepEmptyState
            title={
              activeDomain?.status === "not_present"
                ? `${activeDomain.label} not present — no fake pass`
                : "No evidence items for this domain"
            }
          />
        ) : (
          <ul className="list-disc pl-5 text-sm" data-testid="qep-rc-evidence-list">
            {(evidenceForDomain.length > 0
              ? evidenceForDomain
              : evaluation.evidenceLinks.filter((link) =>
                  activeDomain?.evidenceIds.includes(link.evidenceId),
                )
            ).map((link) => (
              <li key={`${link.domain}:${link.evidenceId}`}>
                <span className="font-medium">{link.domain}</span>:{" "}
                {link.evidenceId.startsWith("ev-") ? (
                  <Link href={QEP_EVIDENCE_ROUTES.detail(link.evidenceId)}>
                    {link.evidenceId}
                  </Link>
                ) : (
                  <span className="font-mono text-xs">{link.evidenceId}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </QepPanel>

      <QepPanel title="Gate detail">
        <QepTable
          caption="Gate results"
          columns={["Gate", "Status", "Reason"]}
          rows={evaluation.gates.map((gate) => ({
            id: gate.gateId,
            cells: [
              gate.name,
              <QepStatusBadge key="s" status={gate.status} />,
              gate.reason,
            ],
          }))}
        />
      </QepPanel>
    </QepPageShell>
  );
}
