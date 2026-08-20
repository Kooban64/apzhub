"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  QEP_AI_ANALYSIS_BASE_PATH,
  QEP_AI_COMPANION_BASE_PATH,
  QEP_AI_GENERATE_BASE_PATH,
  QEP_AI_REVIEW_BASE_PATH,
  parseQepAiReviewRouteId,
} from "@apzhub/qep-ai/presentation";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import {
  acceptAiProposal,
  askAi,
  createRiskFromProposal,
  fetchAiAnalysis,
  fetchAiCompanion,
  generateAiProposal,
  listAiProposals,
  modifyAiProposal,
  rejectAiProposal,
  sendAiProposalToReview,
} from "@/lib/qep/qep-ai-api";
import { useSessionOpenedId } from "@/lib/qep/use-session-opened-id";

import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

const TABS = [
  { id: "companion", label: "Companion", href: QEP_AI_COMPANION_BASE_PATH },
  { id: "generate", label: "Generate & Analyse", href: QEP_AI_GENERATE_BASE_PATH },
  { id: "review", label: "Review Queue", href: QEP_AI_REVIEW_BASE_PATH },
  { id: "analysis", label: "AI Analysis", href: QEP_AI_ANALYSIS_BASE_PATH },
] as const;

function Chrome({
  active,
  pendingCount,
  children,
}: {
  readonly active: (typeof TABS)[number]["id"];
  readonly pendingCount?: number;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4" data-testid="qep-phase7-chrome">
      <nav
        aria-label="Phase 7 AI screens"
        className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-2"
        data-testid="qep-phase7-tabs"
      >
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            data-testid={`qep-phase7-tab-${tab.id}`}
            className={`rounded-md px-3 py-1.5 text-sm ${
              active === tab.id
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "text-[var(--color-muted-foreground)]"
            }`}
          >
            {tab.label}
            {tab.id === "review" && pendingCount ? ` [${pendingCount}]` : ""}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

export function QepPhase7CompanionView() {
  const { selectedId, selected } = useQepApplicationContext();
  const [question, setQuestion] = useState("");
  const [mobileView, setMobileView] = useState<"cards" | "ask" | "actions">("cards");
  const companion = useQuery({
    queryKey: ["qep-ai-companion", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => fetchAiCompanion(selectedId!),
  });
  const ask = useMutation({
    mutationFn: () => askAi({ applicationId: selectedId!, question }),
  });
  const sourceLabel =
    companion.data?.sourceAccess === "authorised" ? "Authorised" : "Not Authorised";

  return (
    <QepPageShell
      title="AI Quality Companion"
      description="AI assists. Humans decide. Source access is fail-closed."
      breadcrumbs={
        selected ? ["APZQEP", selected.name, "AI Quality Companion"] : ["APZQEP"]
      }
    >
      <Chrome active="companion" pendingCount={undefined}>
        {!selectedId ? (
          <QepEmptyState title="Select an Application" />
        ) : companion.isLoading ? (
          <QepLoadingState label="Loading companion…" />
        ) : companion.isError ? (
          <QepErrorState
            message={(companion.error as Error).message}
            onRetry={() => companion.refetch()}
          />
        ) : (
          <div className="flex flex-col gap-4" data-testid="qep-phase7-screen-1">
            <div className="md:hidden flex gap-2" data-testid="qep-phase7-mobile-nav">
              {(["cards", "ask", "actions"] as const).map((id) => (
                <Button
                  key={id}
                  size="sm"
                  variant={mobileView === id ? "default" : "outline"}
                  onClick={() => setMobileView(id)}
                >
                  {id}
                </Button>
              ))}
            </div>
            <div
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
              data-testid="qep-phase7-readiness-cards"
            >
              <QepPanel title="Current Readiness Posture">
                <p
                  className="text-2xl font-semibold uppercase"
                  data-testid="qep-phase7-posture"
                >
                  {String(companion.data?.posture ?? "insufficient_data").replaceAll(
                    "_",
                    " ",
                  )}
                </p>
              </QepPanel>
              <QepPanel title="Open Quality Risks">
                <p className="text-2xl font-semibold">
                  {companion.data?.risks.filter((r) => r.status === "open").length ?? 0}
                </p>
              </QepPanel>
              <QepPanel title="Gate Results">
                <p className="text-2xl font-semibold">
                  {companion.data?.gates.length ?? 0}
                </p>
              </QepPanel>
              <QepPanel title="Unresolved Defects">
                <p className="text-2xl font-semibold">
                  {Number(companion.data?.facts.openCriticalDefects ?? 0)}
                </p>
              </QepPanel>
              <QepPanel title="Deterministic Gaps">
                <p className="text-2xl font-semibold">
                  {companion.data?.analysis.gaps.reduce(
                    (sum, row) => sum + row.count,
                    0,
                  ) ?? 0}
                </p>
              </QepPanel>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <QepPanel title="AI Suggestions For You">
                <ul className="space-y-2 text-sm">
                  {(companion.data?.analysis.gaps.filter((row) => row.count > 0) ?? [])
                    .slice(0, 5)
                    .map((row) => (
                      <li key={row.kind}>{row.summary}</li>
                    ))}
                  {(companion.data?.analysis.gaps.every((row) => row.count === 0) ??
                  true) ? (
                    <li>No deterministic gaps in the current Application facts.</li>
                  ) : null}
                </ul>
              </QepPanel>
              <QepPanel title="Ask AI">
                <textarea
                  data-testid="qep-phase7-ask-input"
                  className="min-h-28 w-full rounded-md border border-[var(--color-border)] bg-transparent p-2 text-sm"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Why are acceptance criteria unverified?"
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    data-testid="qep-phase7-ask-submit"
                    disabled={!question.trim() || ask.isPending}
                    onClick={() => ask.mutate()}
                  >
                    Ask AI
                  </Button>
                </div>
                {ask.data ? (
                  <p className="mt-2 text-sm" data-testid="qep-phase7-ask-answer">
                    {ask.data.answer || "No answer returned."}
                  </p>
                ) : null}
                {ask.error ? (
                  <p className="mt-2 text-sm text-[var(--color-destructive)]">
                    {(ask.error as Error).message}
                  </p>
                ) : null}
              </QepPanel>
              <QepPanel title="Quick Actions">
                <div className="flex flex-col gap-2">
                  <Link
                    className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
                    href={QEP_AI_GENERATE_BASE_PATH}
                  >
                    Generate Content
                  </Link>
                  <Link
                    className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
                    href={QEP_AI_ANALYSIS_BASE_PATH}
                  >
                    Analyse Quality
                  </Link>
                  <Link
                    className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
                    href={`${QEP_AI_GENERATE_BASE_PATH}?type=quality_risk`}
                  >
                    Draft Risk
                  </Link>
                  <Link
                    className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
                    href={QEP_AI_ANALYSIS_BASE_PATH}
                  >
                    Find Gaps
                  </Link>
                </div>
              </QepPanel>
            </div>
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] p-3 text-sm"
              data-testid="qep-phase7-context-snapshot"
            >
              <span>
                Authorised records: {companion.data?.contextCounts.records ?? 0}
              </span>
              <span>
                Evidence metadata: {companion.data?.contextCounts.evidence ?? 0}
              </span>
              <span data-testid="qep-phase7-source-access">
                Source Access: {sourceLabel}
                {sourceLabel === "Not Authorised" ? (
                  <span className="ml-2 text-[var(--color-muted-foreground)]">
                    source.read not granted
                  </span>
                ) : null}
              </span>
            </div>
          </div>
        )}
      </Chrome>
    </QepPageShell>
  );
}

export function QepPhase7GenerateView() {
  const { selectedId } = useQepApplicationContext();
  const [mode, setMode] = useState<"generate" | "analyse">("generate");
  const [proposalType, setProposalType] = useState("test_case");
  const [instruction, setInstruction] = useState(
    "Draft a Test Case from authorised QEP facts",
  );
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [provider, setProvider] = useState("");
  const generate = useMutation({
    mutationFn: () =>
      generateAiProposal({
        applicationId: selectedId,
        proposalType,
        instruction,
      }),
    onSuccess: (row) => {
      setDraft(row.content);
      setProvider(row.provider);
    },
  });
  const send = useMutation({
    mutationFn: () =>
      sendAiProposalToReview({
        applicationId: selectedId,
        proposalType,
        content: draft ?? { title: "Untitled proposal" },
        provider: provider || "untrusted",
        model: provider || "untrusted",
      }),
  });

  return (
    <QepPageShell
      title="Generate & Analyse"
      description="Results are proposals. Send to Review only."
    >
      <Chrome active="generate">
        <div className="flex flex-col gap-4" data-testid="qep-phase7-screen-2">
          <div className="flex gap-2">
            <Button
              variant={mode === "generate" ? "default" : "outline"}
              onClick={() => setMode("generate")}
            >
              Generate
            </Button>
            <Button
              variant={mode === "analyse" ? "default" : "outline"}
              onClick={() => setMode("analyse")}
            >
              Analyse
            </Button>
          </div>
          <QepPanel title="Workbench">
            <label className="text-sm">
              Proposal type
              <select
                className="mt-1 block rounded-md border border-[var(--color-border)] bg-transparent p-2"
                value={proposalType}
                onChange={(event) => setProposalType(event.target.value)}
                data-testid="qep-phase7-proposal-type"
              >
                <option value="test_case">Test Case</option>
                <option value="user_story">User Story</option>
                <option value="acceptance_criterion">Acceptance Criterion</option>
                <option value="quality_risk">Quality Risk (draft only)</option>
              </select>
            </label>
            <textarea
              className="mt-3 min-h-24 w-full rounded-md border border-[var(--color-border)] bg-transparent p-2 text-sm"
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                data-testid="qep-phase7-generate"
                disabled={!selectedId || generate.isPending}
                onClick={() => generate.mutate()}
              >
                Generate proposal
              </Button>
              <Button
                data-testid="qep-phase7-send-review"
                variant="outline"
                disabled={!draft || send.isPending}
                onClick={() => send.mutate()}
              >
                Send to Review
              </Button>
            </div>
            {generate.error ? (
              <p
                className="mt-2 text-sm text-[var(--color-destructive)]"
                data-testid="qep-phase7-generate-error"
              >
                {(generate.error as Error).message}
              </p>
            ) : null}
            {draft ? (
              <pre
                className="mt-3 overflow-auto rounded-md border border-[var(--color-border)] p-3 text-xs"
                data-testid="qep-phase7-draft"
              >
                {JSON.stringify(draft, null, 2)}
              </pre>
            ) : null}
            {send.data ? (
              <p className="mt-2 text-sm" data-testid="qep-phase7-sent">
                Proposal {send.data.id} sent to Review. Authoritative domain unchanged.
              </p>
            ) : null}
          </QepPanel>
        </div>
      </Chrome>
    </QepPageShell>
  );
}

export function QepPhase7ReviewView({ pathname }: { readonly pathname: string }) {
  const { selectedId } = useQepApplicationContext();
  const queryClient = useQueryClient();
  const routeId = parseQepAiReviewRouteId(pathname);
  const { openedId, setOpenedId } = useSessionOpenedId("apzqep.openedAiProposalId");
  const proposalId = routeId ?? openedId;
  const [edited, setEdited] = useState("");
  const listQ = useQuery({
    queryKey: ["qep-ai-proposals", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listAiProposals(selectedId!),
  });
  const selected = listQ.data?.find((row) => row.id === proposalId);
  const pending =
    listQ.data?.filter(
      (row) => row.status === "pending" || row.status === "modified",
    ) ?? [];

  const modify = useMutation({
    mutationFn: () =>
      modifyAiProposal(proposalId!, JSON.parse(edited) as Record<string, unknown>),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["qep-ai-proposals"] });
    },
  });
  const reject = useMutation({
    mutationFn: () => rejectAiProposal(proposalId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["qep-ai-proposals"] });
    },
  });
  const accept = useMutation({
    mutationFn: () => acceptAiProposal(proposalId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["qep-ai-proposals"] });
    },
  });
  const createRisk = useMutation({
    mutationFn: () =>
      createRiskFromProposal({
        applicationId: selectedId,
        title: String(selected?.reviewedContent.title ?? ""),
        description: String(
          selected?.reviewedContent.description ??
            selected?.reviewedContent.title ??
            "",
        ),
        severity: String(selected?.reviewedContent.severity ?? "medium"),
      }),
  });

  return (
    <QepPageShell
      title="AI Review Queue"
      description="Accept is type-specific. Destination AuthZ is re-evaluated."
    >
      <Chrome active="review" pendingCount={pending.length}>
        <div
          className="grid gap-4 lg:grid-cols-[280px_1fr]"
          data-testid="qep-phase7-screen-3"
        >
          <QepPanel title="Pending">
            {listQ.isLoading ? <QepLoadingState label="Loading proposals…" /> : null}
            {(listQ.data ?? []).length === 0 ? (
              <QepEmptyState title="No proposals" />
            ) : null}
            <ul className="space-y-2 text-sm">
              {(listQ.data ?? []).map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    className="w-full text-left"
                    data-testid={`qep-phase7-proposal-${row.id}`}
                    onClick={() => {
                      setOpenedId(row.id);
                      setEdited(JSON.stringify(row.reviewedContent, null, 2));
                    }}
                  >
                    {String(row.reviewedContent.title ?? row.id)}{" "}
                    <QepStatusBadge status={row.status} />
                  </button>
                </li>
              ))}
            </ul>
          </QepPanel>
          <QepPanel title="Compare & decide">
            {!selected ? (
              <QepEmptyState title="Select a proposal" />
            ) : (
              <div
                className="grid gap-3 md:grid-cols-2"
                data-testid="qep-phase7-compare"
              >
                <div>
                  <h3 className="text-xs uppercase text-[var(--color-muted-foreground)]">
                    Original AI
                  </h3>
                  <pre
                    className="mt-1 overflow-auto rounded-md border border-[var(--color-border)] p-2 text-xs"
                    data-testid="qep-phase7-original"
                  >
                    {JSON.stringify(selected.originalContent, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="text-xs uppercase text-[var(--color-muted-foreground)]">
                    Reviewed
                  </h3>
                  <textarea
                    className="mt-1 min-h-40 w-full rounded-md border border-[var(--color-border)] bg-transparent p-2 text-xs"
                    value={edited || JSON.stringify(selected.reviewedContent, null, 2)}
                    onChange={(event) => setEdited(event.target.value)}
                    data-testid="qep-phase7-reviewed"
                  />
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <Button
                    data-testid="qep-phase7-modify"
                    onClick={() => modify.mutate()}
                  >
                    Modify
                  </Button>
                  <Button
                    data-testid="qep-phase7-reject"
                    variant="outline"
                    onClick={() => reject.mutate()}
                  >
                    Reject
                  </Button>
                  {selected.proposalType === "quality_risk" ||
                  selected.proposalType === "defect" ? (
                    <Button
                      data-testid="qep-phase7-create-risk"
                      variant="outline"
                      disabled={selected.proposalType !== "quality_risk"}
                      onClick={() => createRisk.mutate()}
                    >
                      Create Risk from Proposal
                    </Button>
                  ) : (
                    <Button
                      data-testid="qep-phase7-accept"
                      onClick={() => accept.mutate()}
                    >
                      Accept
                    </Button>
                  )}
                </div>
                {accept.data ? (
                  <p data-testid="qep-phase7-accepted">
                    Accepted as {accept.data.resultingRecordKind}:
                    {accept.data.resultingRecordId}
                  </p>
                ) : null}
                {accept.error ? (
                  <p
                    className="text-[var(--color-destructive)]"
                    data-testid="qep-phase7-accept-error"
                  >
                    {(accept.error as Error).message}
                  </p>
                ) : null}
                {createRisk.data ? (
                  <p data-testid="qep-phase7-risk-created">
                    Risk created through the existing authorised workflow.
                  </p>
                ) : null}
              </div>
            )}
          </QepPanel>
        </div>
      </Chrome>
    </QepPageShell>
  );
}

export function QepPhase7AnalysisView() {
  const { selectedId } = useQepApplicationContext();
  const analysis = useQuery({
    queryKey: ["qep-ai-analysis", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => fetchAiAnalysis(selectedId!),
  });
  const findings = useMemo(
    () => (analysis.data?.analysis.gaps ?? []).filter((row) => row.count > 0),
    [analysis.data],
  );

  return (
    <QepPageShell
      title="AI Quality Analysis / Traceability"
      description="Gaps are derived from QEP facts. Findings are advisory. No AI quality score."
    >
      <Chrome active="analysis">
        <div className="flex flex-col gap-4" data-testid="qep-phase7-screen-4">
          {!selectedId ? <QepEmptyState title="Select an Application" /> : null}
          {analysis.isLoading ? (
            <QepLoadingState label="Calculating deterministic gaps…" />
          ) : null}
          <QepPanel title="Quality chain gaps">
            <ul className="space-y-2 text-sm" data-testid="qep-phase7-gaps">
              {(analysis.data?.analysis.gaps ?? []).map((row) => (
                <li key={row.kind} data-testid={`qep-phase7-gap-${row.kind}`}>
                  {row.summary}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
              Source: {analysis.data?.source ?? "qep_facts"} — not manufactured by the
              model.
            </p>
          </QepPanel>
          <QepPanel title="Advisory findings">
            {findings.length === 0 ? (
              <QepEmptyState title="No advisory findings" />
            ) : (
              <ul className="space-y-2 text-sm" data-testid="qep-phase7-findings">
                {findings.map((row) => (
                  <li key={row.kind}>
                    {row.summary}{" "}
                    <Link className="underline" href={QEP_AI_GENERATE_BASE_PATH}>
                      Generate proposal
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </QepPanel>
        </div>
      </Chrome>
    </QepPageShell>
  );
}

export function QepPhase7RouterView({ pathname }: { readonly pathname: string }) {
  if (pathname.startsWith(QEP_AI_GENERATE_BASE_PATH)) return <QepPhase7GenerateView />;
  if (pathname.startsWith(QEP_AI_REVIEW_BASE_PATH))
    return <QepPhase7ReviewView pathname={pathname} />;
  if (pathname.startsWith(QEP_AI_ANALYSIS_BASE_PATH)) return <QepPhase7AnalysisView />;
  return <QepPhase7CompanionView />;
}

export function QepLegacyAiSupersededView({ surface }: { readonly surface: string }) {
  return (
    <QepPageShell
      title="Superseded AI surface"
      description="Phase 7 is the authoritative APZQEP AI experience."
    >
      <QepPanel title={surface}>
        <p className="text-sm">
          This product experience has been absorbed by AI Quality Companion. Underlying
          primitives remain available to the platform; competing customer UX is retired.
        </p>
        <Link
          className="mt-3 inline-flex rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
          href={QEP_AI_COMPANION_BASE_PATH}
        >
          Open AI Quality Companion
        </Link>
      </QepPanel>
    </QepPageShell>
  );
}
