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
    rationale: string;
    decidedAt: string;
  };
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

  return (
    <QepPageShell
      title="Release Candidate"
      description="Flagship Quality OS face — one change, domain readiness, explain-why, human GO / NO-GO. Domains are provider-masked."
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
      <QepPanel title="Select engineering change">
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
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Cold path: SCM change → provider evidence → evaluate RC → human decision.
          Security and Performance stay honest empty until those providers join the
          matrix.
        </p>
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
            columns={["RC", "Readiness", "Score", "Human"]}
            rows={(byChangeQuery.data?.evaluations ?? []).map((item) => ({
              id: item.evaluationId,
              href: QEP_CERTIFICATION_ROUTES.rcEvaluation(item.evaluationId),
              cells: [
                item.title ?? item.evaluationId.slice(0, 18),
                <QepStatusBadge key="r" status={item.readiness} />,
                `${item.score}%`,
                item.humanDecision?.outcome ?? "—",
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
  const [rationale, setRationale] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["qep-certification", "evaluation", evaluationId],
    queryFn: () =>
      fetchJson<{ evaluation: CertificationEvaluation }>(
        `/api/v1/qep/certification/evaluations/${evaluationId}`,
      ),
  });

  const decisionMutation = useMutation({
    mutationFn: (outcome: "GO" | "NO_GO") =>
      fetchJson<{ evaluation: CertificationEvaluation }>(
        `/api/v1/qep/certification/evaluations/${evaluationId}/decision`,
        {
          method: "POST",
          body: JSON.stringify({ outcome, rationale }),
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
  const domains = evaluation.domains ?? [];
  const activeDomain =
    domains.find((domain) => domain.domainId === selectedDomain) ?? domains[0];
  const explainForDomain = (evaluation.explainability ?? []).filter((row) =>
    activeDomain?.explainRefs.includes(row.gateId),
  );
  const evidenceForDomain = (evaluation.evidenceLinks ?? []).filter((link) =>
    activeDomain?.evidenceIds.includes(link.evidenceId),
  );

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
      </div>

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
              <p className="mt-1 text-xs opacity-80">{domain.summary}</p>
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
          {evaluation.humanDecision ? (
            <div className="text-sm" data-testid="qep-rc-human-decision">
              <p>
                Decision: <QepStatusBadge status={evaluation.humanDecision.outcome} />
              </p>
              <p className="mt-1">Actor: {evaluation.humanDecision.actorId}</p>
              <p className="mt-1">At: {evaluation.humanDecision.decidedAt}</p>
              <p className="mt-2">{evaluation.humanDecision.rationale}</p>
            </div>
          ) : (
            <>
              <p className="mb-2 text-sm text-[var(--color-muted-foreground)]">
                Advisory score never certifies. Record an explicit human decision.
              </p>
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
                  disabled={decisionMutation.isPending || rationale.trim().length < 3}
                  onClick={() => decisionMutation.mutate("GO")}
                >
                  Record GO
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={decisionMutation.isPending || rationale.trim().length < 3}
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
