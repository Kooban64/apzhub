"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { QEP_EARLY_CHECK_ROUTES } from "@/lib/qep/early-check-routes";
import { QEP_PORTFOLIO_ROUTES } from "@/lib/qep/portfolio-routes";
import { QEP_QUALITY_JOURNEY_ROUTES } from "@/lib/qep/quality-journey-routes";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

type JourneyStep = {
  stepId: string;
  order: number;
  title: string;
  summary: string;
  status: string;
  href: string;
  actionLabel: string;
  detail?: string;
};

type JourneyBundle = {
  journey: {
    changeEventId: string;
    advisory: true;
    headline: string;
    nextStepId: string;
    impactSummary: {
      riskLevel: string;
      requirementCount: number;
      suiteMatchCount: number;
    };
    designSummary: { draftCount: number; domainGapCount: number };
    evidenceSummary: { domainCount: number; domains: string[] };
    certificationSummary?: {
      evaluationId: string;
      readiness: string;
      score: number;
      humanDecision?: string;
    };
    domainTiles: Array<{
      domainId: string;
      label: string;
      status: string;
      summary: string;
    }>;
    steps: JourneyStep[];
    deepLinks: {
      journey: string;
      scmRepository?: string;
      designAssist?: string;
      automation: string;
      qi: string;
      rc: string;
      rcEvaluation?: string;
    };
  };
};

export function QepQualityJourneyRouterView() {
  return <JourneyHomeView />;
}

function JourneyHomeView() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [changeEventId, setChangeEventId] = useState(
    searchParams?.get("changeEventId") ?? "",
  );
  const [signerName, setSignerName] = useState("");
  const [signerRole, setSignerRole] = useState("QA Manager");
  const [publishDecision, setPublishDecision] = useState("accepted_with_residual_risk");
  const [residualRisk, setResidualRisk] = useState("");
  const [publishNotes, setPublishNotes] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>([]);
  const [createDefectsOnConfirm, setCreateDefectsOnConfirm] = useState(true);

  const trimmedId = changeEventId.trim();
  const journeyReady = trimmedId.length > 8;

  const journeyQuery = useQuery({
    queryKey: ["qep-journey", "by-change", trimmedId],
    enabled: journeyReady,
    queryFn: () =>
      fetchJson<JourneyBundle>(
        `/api/v1/qep/quality-journey/by-change/${encodeURIComponent(trimmedId)}`,
      ),
  });

  const dispatchQuery = useQuery({
    queryKey: ["qep-dispatch", "by-change", trimmedId],
    enabled: journeyReady,
    queryFn: () =>
      fetchJson<{
        dispatches: Array<{
          dispatchId: string;
          status: string;
          channel: string;
          domains: string[];
          detail?: string;
          externalRef?: string;
          createdAt: string;
          pack?: string;
          assistOrigin?: string;
        }>;
      }>(
        `/api/v1/qep/verification-dispatches?changeEventId=${encodeURIComponent(trimmedId)}`,
      ),
  });

  const reportQuery = useQuery({
    queryKey: ["qep-report-pack", "by-change", trimmedId],
    enabled: journeyReady,
    queryFn: () =>
      fetchJson<{
        pack: {
          status: string;
          assessment: { band: string; headline: string };
          severityRollup: { total: number };
          signOff: {
            signed: boolean;
            signerName?: string;
            decision?: string;
            signedAt?: string;
          };
          residualRisk: { placeholder: boolean; statement: string };
        };
      }>(`/api/v1/qep/report-packs/by-change/${encodeURIComponent(trimmedId)}`),
  });

  const qaGateQuery = useQuery({
    queryKey: ["qep-qa-gate", "by-change", trimmedId],
    enabled: journeyReady,
    queryFn: () =>
      fetchJson<{
        headline: string;
        nextHint: string;
        confirmedCount: number;
        securityDispatchCount: number;
        qualityDispatchCount: number;
        checklist: Array<{
          id: string;
          label: string;
          status: string;
          detail: string;
        }>;
        findings: Array<{
          id: string;
          title: string;
          severity: string;
          toolId: string;
          location?: string;
          confirmed: boolean;
          defectId?: string;
        }>;
      }>(`/api/v1/qep/qa-gate/by-change/${encodeURIComponent(trimmedId)}`),
  });

  const runPacksMutation = useMutation({
    mutationFn: () =>
      fetchJson<{
        quality: Array<{ status: string; detail?: string }>;
        security: Array<{ status: string; detail?: string }>;
        qualityEnabled: boolean;
        securityEnabled: boolean;
        note?: string;
      }>(
        `/api/v1/qep/verification-packs/by-change/${encodeURIComponent(trimmedId)}/run`,
        {
          method: "POST",
          body: JSON.stringify({ packs: ["quality", "security"], force: true }),
        },
      ),
    onSuccess: (data) => {
      setActionMessage(
        `Dispatched quality=${data.quality.map((r) => r.status).join(",") || "none"} · security=${data.security.map((r) => r.status).join(",") || "none"}${!data.qualityEnabled || !data.securityEnabled ? " (check APZHUB_*_DISPATCH flags)" : ""}`,
      );
      void queryClient.invalidateQueries({
        queryKey: ["qep-dispatch", "by-change", trimmedId],
      });
    },
    onError: (error) => {
      setActionMessage((error as Error).message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: () =>
      fetchJson<{
        pack: { status: string };
        note?: string;
      }>(`/api/v1/qep/report-packs/by-change/${encodeURIComponent(trimmedId)}`, {
        method: "POST",
        body: JSON.stringify({
          signerName,
          signerRole,
          decision: publishDecision,
          residualRiskStatement: residualRisk,
          notes: publishNotes || undefined,
        }),
      }),
    onSuccess: (data) => {
      setActionMessage(
        `Report pack ${data.pack.status}. ${data.note ?? "Not a GO/NO-GO."}`,
      );
      void queryClient.invalidateQueries({
        queryKey: ["qep-report-pack", "by-change", trimmedId],
      });
    },
    onError: (error) => {
      setActionMessage((error as Error).message);
    },
  });

  const qaRunPacksMutation = useMutation({
    mutationFn: () =>
      fetchJson<{
        packs: {
          quality: Array<{ status: string }>;
          security: Array<{ status: string }>;
        };
        penTestIncluded: boolean;
        note?: string;
      }>(`/api/v1/qep/qa-gate/by-change/${encodeURIComponent(trimmedId)}/run-packs`, {
        method: "POST",
        body: JSON.stringify({
          includeQuality: true,
          includePenTest: true,
          force: true,
        }),
      }),
    onSuccess: (data) => {
      setActionMessage(
        `QA Gate packs · quality=${data.packs.quality.map((r) => r.status).join(",") || "none"} · pen-test/security=${data.packs.security.map((r) => r.status).join(",") || "none"}. ${data.note ?? ""}`,
      );
      void queryClient.invalidateQueries({
        queryKey: ["qep-dispatch", "by-change", trimmedId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["qep-qa-gate", "by-change", trimmedId],
      });
    },
    onError: (error) => setActionMessage((error as Error).message),
  });

  const qaConfirmMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ note?: string; gate: { confirmedCount: number } }>(
        `/api/v1/qep/qa-gate/by-change/${encodeURIComponent(trimmedId)}/confirm`,
        {
          method: "POST",
          body: JSON.stringify({
            findingIds: selectedFindingIds,
            createDefects: createDefectsOnConfirm,
          }),
        },
      ),
    onSuccess: (data) => {
      setActionMessage(
        `Confirmed ${data.gate.confirmedCount} finding(s). ${data.note ?? ""}`,
      );
      setSelectedFindingIds([]);
      void queryClient.invalidateQueries({
        queryKey: ["qep-qa-gate", "by-change", trimmedId],
      });
    },
    onError: (error) => setActionMessage((error as Error).message),
  });

  const qaAlmProduceMutation = useMutation({
    mutationFn: () =>
      fetchJson<{
        results: Array<{
          defectId: string;
          records: Array<{ channel: string; status: string; detail?: string }>;
          error?: string;
        }>;
        note?: string;
        config?: { mode: string };
      }>(`/api/v1/qep/qa-gate/by-change/${encodeURIComponent(trimmedId)}/alm-produce`, {
        method: "POST",
        body: JSON.stringify({ channels: ["projects", "support"] }),
      }),
    onSuccess: (data) => {
      const summary = data.results
        .map((r) =>
          r.error
            ? `${r.defectId}:error`
            : `${r.defectId}:${r.records.map((x) => `${x.channel}=${x.status}`).join(",")}`,
        )
        .join(" · ");
      setActionMessage(
        `ALM produce (${data.config?.mode ?? "record_only"}): ${summary || "none"}. ${data.note ?? ""}`,
      );
    },
    onError: (error) => setActionMessage((error as Error).message),
  });

  const journey = journeyQuery.data?.journey;
  const dispatches = dispatchQuery.data?.dispatches ?? [];
  const pack = reportQuery.data?.pack;
  const qaGate = qaGateQuery.data;

  function toggleFinding(id: string) {
    setSelectedFindingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <QepPageShell
      title="Quality Journey"
      description="Flagship F8 — one guided path for a change. Humans act; the system structures the path. Never auto-certifies."
    >
      <QepPanel title="Open a change">
        <label className="mb-2 block text-sm">
          changeEventId
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
            value={changeEventId}
            onChange={(event) => setChangeEventId(event.target.value)}
            placeholder="chg-github-…"
            data-testid="qep-journey-change-event-id"
          />
        </label>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Tip: open from Source Control with “Open journey”, or paste a durable change
          id.
        </p>
      </QepPanel>

      {actionMessage ? (
        <p
          className="mt-2 text-sm text-[var(--color-muted-foreground)]"
          data-testid="qep-journey-action-message"
        >
          {actionMessage}
        </p>
      ) : null}

      {journeyQuery.isFetching ? (
        <QepLoadingState label="Composing journey…" />
      ) : journeyQuery.isError ? (
        <QepErrorState message={(journeyQuery.error as Error).message} />
      ) : journey ? (
        <div className="mt-4 space-y-4" data-testid="qep-journey-bundle">
          <QepPanel title="Where you are">
            <p className="text-sm font-medium" data-testid="qep-journey-headline">
              {journey.headline}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Risk {journey.impactSummary.riskLevel} · design drafts{" "}
              {journey.designSummary.draftCount} · evidence domains{" "}
              {journey.evidenceSummary.domainCount}
              {journey.certificationSummary
                ? ` · cert ${journey.certificationSummary.readiness} ${journey.certificationSummary.score}%`
                : " · cert none"}
              {journey.certificationSummary?.humanDecision
                ? ` · human ${journey.certificationSummary.humanDecision}`
                : ""}
              <span className="ml-1">· advisory only</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {journey.deepLinks.scmRepository ? (
                <Link href={journey.deepLinks.scmRepository}>Source Control</Link>
              ) : null}
              {journey.deepLinks.designAssist ? (
                <Link href={journey.deepLinks.designAssist}>Design assist</Link>
              ) : null}
              <Link href={journey.deepLinks.automation}>Automation</Link>
              <Link href={journey.deepLinks.qi}>Quality Intelligence</Link>
              <Link href={journey.deepLinks.rc}>Release Candidate</Link>
              <Link href={QEP_EARLY_CHECK_ROUTES.byChange(journey.changeEventId)}>
                Early Check
              </Link>
              <Link href={QEP_PORTFOLIO_ROUTES.home}>Portfolio</Link>
            </div>
          </QepPanel>

          <QepPanel title="Guided steps">
            <ol className="space-y-3">
              {journey.steps.map((step) => {
                const isNext = step.stepId === journey.nextStepId;
                return (
                  <li
                    key={step.stepId}
                    className="rounded-md border border-[var(--color-border)] p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <QepStatusBadge status={step.status} />
                      <span className="font-medium">{step.title}</span>
                      {isNext ? <QepStatusBadge status="next" /> : null}
                    </div>
                    <p className="mt-1 text-[var(--color-muted-foreground)]">
                      {step.summary}
                    </p>
                    {step.detail ? (
                      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                        {step.detail}
                      </p>
                    ) : null}
                    <div className="mt-2">
                      <Link
                        href={step.href}
                        className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
                      >
                        {step.actionLabel}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </QepPanel>

          {journey.domainTiles.length > 0 ? (
            <QepPanel title="Domain strip (from latest RC evaluation)">
              <ul className="flex flex-wrap gap-2">
                {journey.domainTiles.map((tile) => (
                  <li key={tile.domainId}>
                    <QepStatusBadge status={tile.status} />{" "}
                    <span className="text-sm">{tile.label}</span>
                  </li>
                ))}
              </ul>
            </QepPanel>
          ) : null}

          <QepPanel title="External verification dispatches (F10 quality · F11 security)">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="qep-journey-run-packs"
                className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
                disabled={runPacksMutation.isPending}
                onClick={() => {
                  setActionMessage(null);
                  runPacksMutation.mutate();
                }}
              >
                {runPacksMutation.isPending
                  ? "Dispatching…"
                  : "Run quality + security packs"}
              </button>
              <Link
                href={QEP_EARLY_CHECK_ROUTES.byChange(journey.changeEventId)}
                className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
                data-testid="qep-journey-open-early-check"
              >
                Open Early Check
              </Link>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                Force re-dispatch. Requires <code>APZHUB_VERIFICATION_DISPATCH</code> /{" "}
                <code>APZHUB_SECURITY_DISPATCH</code>. Does not certify.
              </span>
            </div>
            {dispatches.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No runner dispatches yet. Use the button above, or wait for webhook/sync
                when flags are on. Tools run on separate clusters; reports ingest back.
                Humans still certify.
              </p>
            ) : (
              <ul className="space-y-2" data-testid="qep-journey-dispatches">
                {dispatches.map((row) => (
                  <li
                    key={row.dispatchId}
                    className="rounded-md border border-[var(--color-border)] p-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <QepStatusBadge status={row.status} />
                      {row.pack ? <QepStatusBadge status={row.pack} /> : null}
                      <span className="font-mono text-xs">{row.channel}</span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {row.domains.join(", ")}
                      </span>
                    </div>
                    {row.detail ? (
                      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                        {row.detail}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </QepPanel>

          <QepPanel title="QA Gate (F15) — evaluate · pen-test · confirm · fix directions">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              QA owns this gate. Run quality + <strong>pen-test</strong> (security)
              packs, confirm findings (optional defects), export Fix Direction Pack for
              Dev. GO/NO-GO stays on Release Candidate.
            </p>
            {qaGate ? (
              <div className="mt-2 space-y-3" data-testid="qep-journey-qa-gate">
                <p className="text-sm font-medium">{qaGate.headline}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Next: {qaGate.nextHint}
                </p>
                <ul className="space-y-1">
                  {qaGate.checklist.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <QepStatusBadge status={item.status} />
                      <span>{item.label}</span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {item.detail}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-testid="qep-journey-qa-run-pentest"
                    className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
                    disabled={qaRunPacksMutation.isPending}
                    onClick={() => {
                      setActionMessage(null);
                      qaRunPacksMutation.mutate();
                    }}
                  >
                    {qaRunPacksMutation.isPending
                      ? "Dispatching…"
                      : "Run quality + pen-test packs"}
                  </button>
                  <a
                    href={`/api/v1/qep/fix-direction-packs/by-change/${encodeURIComponent(journey.changeEventId)}?format=markdown`}
                    data-testid="qep-journey-fix-direction-md"
                    className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
                  >
                    Open Fix Direction Pack
                  </a>
                  <button
                    type="button"
                    data-testid="qep-journey-alm-produce"
                    className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
                    disabled={qaAlmProduceMutation.isPending}
                    onClick={() => {
                      setActionMessage(null);
                      qaAlmProduceMutation.mutate();
                    }}
                  >
                    {qaAlmProduceMutation.isPending
                      ? "Producing…"
                      : "Produce fix work items (F16)"}
                  </button>
                  {journey.deepLinks.rcEvaluation || journey.deepLinks.rc ? (
                    <Link
                      href={journey.deepLinks.rcEvaluation ?? journey.deepLinks.rc}
                      className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
                    >
                      RC GO/NO-GO
                    </Link>
                  ) : null}
                </div>
                {qaGate.findings.length > 0 ? (
                  <div className="border-t border-[var(--color-border)] pt-3">
                    <p className="mb-2 text-sm font-medium">
                      Confirm findings ({qaGate.confirmedCount} confirmed)
                    </p>
                    <ul className="max-h-48 space-y-1 overflow-auto text-sm">
                      {qaGate.findings.slice(0, 40).map((finding) => (
                        <li key={finding.id}>
                          <label className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={
                                finding.confirmed ||
                                selectedFindingIds.includes(finding.id)
                              }
                              disabled={finding.confirmed}
                              onChange={() => toggleFinding(finding.id)}
                            />
                            <span>
                              <QepStatusBadge status={finding.severity} />{" "}
                              {finding.title}{" "}
                              <span className="text-xs text-[var(--color-muted-foreground)]">
                                ({finding.toolId}
                                {finding.defectId
                                  ? ` · defect ${finding.defectId}`
                                  : ""}
                                )
                              </span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <label className="mt-2 flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={createDefectsOnConfirm}
                        onChange={(e) => setCreateDefectsOnConfirm(e.target.checked)}
                      />
                      Create QEP defects on confirm
                    </label>
                    <button
                      type="button"
                      data-testid="qep-journey-qa-confirm"
                      className="mt-2 inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
                      disabled={
                        selectedFindingIds.length === 0 || qaConfirmMutation.isPending
                      }
                      onClick={() => {
                        setActionMessage(null);
                        qaConfirmMutation.mutate();
                      }}
                    >
                      {qaConfirmMutation.isPending
                        ? "Confirming…"
                        : `Confirm ${selectedFindingIds.length} finding(s)`}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    No findings yet — run packs and wait for ingest.
                  </p>
                )}
              </div>
            ) : qaGateQuery.isFetching ? (
              <QepLoadingState label="Loading QA Gate…" />
            ) : qaGateQuery.isError ? (
              <QepErrorState message={(qaGateQuery.error as Error).message} />
            ) : null}
          </QepPanel>

          <QepPanel title="Report pack — F12 (draft → publish)">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Security Bill of Health from governed evidence. Publish records human
              residual-risk + sign-off — still not auto-certification.
            </p>
            {pack ? (
              <div
                className="mt-2 space-y-1 text-sm"
                data-testid="qep-journey-report-status"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <QepStatusBadge status={pack.status} />
                  <span>
                    {pack.assessment.band} — {pack.assessment.headline}
                  </span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {pack.severityRollup.total} findings
                  </span>
                </div>
                {pack.signOff.signed ? (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Signed by {pack.signOff.signerName} · {pack.signOff.decision} ·{" "}
                    {pack.signOff.signedAt}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <a
                href={`/api/v1/qep/report-packs/by-change/${encodeURIComponent(journey.changeEventId)}`}
                data-testid="qep-journey-report-pack-json"
              >
                Open JSON
              </a>
              <a
                href={`/api/v1/qep/report-packs/by-change/${encodeURIComponent(journey.changeEventId)}?format=markdown`}
                data-testid="qep-journey-report-pack-md"
              >
                Open markdown
              </a>
              <a
                href={`/api/v1/qep/report-packs/by-change/${encodeURIComponent(journey.changeEventId)}?format=pdf`}
                data-testid="qep-journey-report-pack-pdf"
              >
                Open PDF
              </a>
            </div>

            {pack?.status !== "published" ? (
              <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-3">
                <p className="text-sm font-medium">Publish (human sign-off)</p>
                <label className="block text-sm">
                  Signer name
                  <input
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    data-testid="qep-journey-publish-signer"
                  />
                </label>
                <label className="block text-sm">
                  Role
                  <input
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  Decision
                  <select
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                    value={publishDecision}
                    onChange={(e) => setPublishDecision(e.target.value)}
                    data-testid="qep-journey-publish-decision"
                  >
                    <option value="accepted_with_residual_risk">
                      accepted_with_residual_risk
                    </option>
                    <option value="needs_rework">needs_rework</option>
                    <option value="rejected">rejected</option>
                  </select>
                </label>
                <label className="block text-sm">
                  Residual risk statement (≥20 chars)
                  <textarea
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                    rows={3}
                    value={residualRisk}
                    onChange={(e) => setResidualRisk(e.target.value)}
                    data-testid="qep-journey-publish-residual"
                    placeholder="Document accepted residual risk or rework rationale…"
                  />
                </label>
                <label className="block text-sm">
                  Notes (optional)
                  <input
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                    value={publishNotes}
                    onChange={(e) => setPublishNotes(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  data-testid="qep-journey-publish-report"
                  className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
                  disabled={publishMutation.isPending}
                  onClick={() => {
                    setActionMessage(null);
                    publishMutation.mutate();
                  }}
                >
                  {publishMutation.isPending ? "Publishing…" : "Publish report pack"}
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                Already published. Re-export JSON/markdown/PDF to see signed status.
                Certification GO/NO-GO remains a separate action.
              </p>
            )}
          </QepPanel>
        </div>
      ) : (
        <div className="mt-4">
          <QepEmptyState title="Enter a changeEventId to open the guided Quality Journey." />
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Deep-link shape: <code>{QEP_QUALITY_JOURNEY_ROUTES.byChange("chg-…")}</code>
          </p>
        </div>
      )}
    </QepPageShell>
  );
}
