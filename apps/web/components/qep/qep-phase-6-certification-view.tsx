"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import {
  QEP_QUALITY_GATES_BASE_PATH,
  QEP_QUALITY_RISK_BASE_PATH,
} from "@apzhub/qep-assurance/presentation";
import type { CertificationOutcome } from "@apzhub/qep-assurance/domain";
import { QEP_CERTIFICATION_ROUTES } from "@/lib/qep/certification-routes";
import { QEP_RELEASE_READINESS_BASE_PATH } from "@/lib/qep/release-readiness-routes";
import { listApplicationEnvironments } from "@/lib/qep/qep-applications-api";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import {
  authoriseCertificationException,
  getReadiness,
} from "@/lib/qep/qep-assurance-api";
import { QepErrorState, QepLoadingState, QepStatusBadge } from "./qep-ui";

const F4_CERTIFIER_AUTHORITY = "quality_certifier";
const F4_CO_APPROVER_AUTHORITY = "quality_co_approver";

type CertificationEvaluation = {
  evaluationId: string;
  changeEventId: string;
  title: string;
  applicationId?: string;
  environmentId?: string;
  humanDecision?: {
    outcome: CertificationOutcome;
    actorId: string;
    coApproverActorId?: string;
    rationale: string;
    decidedAt: string;
  };
  authorityVotes?: readonly {
    authorityId: string;
    outcome: CertificationOutcome;
    actorId: string;
    rationale: string;
  }[];
  phase6?: {
    environmentSnapshot: { id: string; name: string };
    scmIdentity: {
      changeEventId: string;
      sha?: string;
      kind?: string;
      externalKey?: string;
    };
    readinessSnapshot: { posture: string };
    gateEvaluations: readonly {
      id: string;
      result: string;
      reason: string;
      gateDefinitionId: string;
      definitionSnapshot: { name: string; number: string; gateType: string };
    }[];
    exceptionsUsed: readonly { id: string; reason: string; status: string }[];
  };
};

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok)
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  if (body.data === undefined) throw new Error("Empty response");
  return body.data;
}

const OUTCOMES: readonly { id: CertificationOutcome; label: string; hint: string }[] = [
  {
    id: "GO",
    label: "GO",
    hint: "All Blocking Gates passed. Dual authority required.",
  },
  {
    id: "CONDITIONAL_GO",
    label: "CONDITIONAL GO",
    hint: "Failed Blocking Gate only with a valid authorised exception. Dual authority required. GO remains prohibited.",
  },
  { id: "NO_GO", label: "NO-GO", hint: "Do not proceed. Distinct from Defer." },
  { id: "DEFER", label: "DEFER", hint: "Postpone the decision. Distinct from No-Go." },
];

export function QepPhase6CertificationView() {
  const { selectedId, selected } = useQepApplicationContext();
  const queryClient = useQueryClient();
  const [environmentId, setEnvironmentId] = useState("");
  const [changeEventId, setChangeEventId] = useState("scm-decision-subject");
  const [evaluationId, setEvaluationId] = useState("");
  const [outcome, setOutcome] = useState<CertificationOutcome>("GO");
  const [rationale, setRationale] = useState("");
  const [authorityId, setAuthorityId] = useState(F4_CERTIFIER_AUTHORITY);
  const [exceptionReason, setExceptionReason] = useState("");
  const [mobileView, setMobileView] = useState<"decision" | "snapshot" | "history">(
    "decision",
  );

  const envQ = useQuery({
    queryKey: ["qep-application-environments", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listApplicationEnvironments(selectedId!),
  });
  const readinessQ = useQuery({
    queryKey: ["qep-readiness", selectedId, changeEventId],
    enabled: Boolean(selectedId),
    queryFn: () => getReadiness({ applicationId: selectedId!, changeEventId }),
  });
  const evalQ = useQuery({
    queryKey: ["qep-certification-evaluation", evaluationId],
    enabled: evaluationId.length > 4,
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/qep/certification/evaluations/${encodeURIComponent(evaluationId)}`,
      );
      const body = await parseJson<{ evaluation: CertificationEvaluation }>(response);
      return body.evaluation;
    },
  });

  const start = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/qep/certification/evaluations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          changeEventId,
          applicationId: selectedId,
          environmentId,
        }),
      });
      return parseJson<{ evaluation: CertificationEvaluation }>(response);
    },
    onSuccess: async (body) => {
      setEvaluationId(body.evaluation.evaluationId);
      await queryClient.invalidateQueries({
        queryKey: ["qep-certification-evaluation"],
      });
      await queryClient.invalidateQueries({ queryKey: ["qep-readiness"] });
    },
  });
  const decide = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/v1/qep/certification/evaluations/${encodeURIComponent(evaluationId)}/decision`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ outcome, rationale, authorityId }),
        },
      );
      return parseJson<{ evaluation: CertificationEvaluation }>(response);
    },
    onSuccess: async (body) => {
      queryClient.setQueryData(
        ["qep-certification-evaluation", evaluationId],
        body.evaluation,
      );
    },
  });
  const exception = useMutation({
    mutationFn: (gateEvaluationId: string) =>
      authoriseCertificationException({
        gateEvaluationId,
        reason: exceptionReason,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["qep-certification-evaluation"],
      });
    },
  });

  if (!selectedId) {
    return <QepLoadingState label="Select an application to certify." />;
  }

  const evaluation = evalQ.data;
  const posture =
    evaluation?.phase6?.readinessSnapshot.posture ??
    readinessQ.data?.posture ??
    "insufficient_data";
  const failedBlocking =
    evaluation?.phase6?.gateEvaluations.filter(
      (row) =>
        row.definitionSnapshot.gateType === "blocking" && row.result === "failed",
    ) ?? [];

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 p-5"
      data-testid="qep-certification"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {selected?.name ?? "Application"} / Certification / Go-No-Go
          </p>
          <h1 className="text-xl font-semibold">Certification / Go-No-Go</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Human decision only. Dual authority for GO and CONDITIONAL GO. No automatic
            or AI certification.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
          data-testid="qep-cert-start"
          disabled={!environmentId || start.isPending}
          onClick={() => start.mutate()}
        >
          Start Certification
        </button>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="qep-cert-context">
        <span className="rounded-md border border-[var(--color-border)] px-2 py-1 text-sm">
          Application: {selected?.name ?? selectedId}
        </span>
        <select
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          data-testid="qep-cert-environment"
          value={environmentId}
          onChange={(event) => setEnvironmentId(event.target.value)}
        >
          <option value="">Environment</option>
          {(envQ.data?.items ?? []).map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          data-testid="qep-cert-change-event"
          value={changeEventId}
          onChange={(event) => setChangeEventId(event.target.value)}
          placeholder="SCM change identity"
        />
      </div>

      <div className="flex flex-wrap gap-2 md:hidden">
        {(["decision", "snapshot", "history"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-md border border-[var(--color-border)] px-2 py-1 text-xs ${mobileView === item ? "bg-[var(--color-muted)]" : ""}`}
            onClick={() => setMobileView(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {start.error ? <QepErrorState message={(start.error as Error).message} /> : null}
      {decide.error ? (
        <QepErrorState message={(decide.error as Error).message} />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          <div
            className="rounded-lg border border-[var(--color-border)] p-4"
            data-testid="qep-cert-posture"
          >
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Current Readiness Posture
            </p>
            <p className="mt-2 text-2xl font-semibold uppercase">
              {String(posture).replaceAll("_", " ")}
            </p>
            <Link
              className="text-xs text-[var(--color-primary)]"
              href={QEP_RELEASE_READINESS_BASE_PATH}
            >
              View readiness →
            </Link>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Gate outcomes
            </p>
            <p className="mt-2 text-sm">
              Passed{" "}
              {evaluation?.phase6?.gateEvaluations.filter(
                (row) => row.result === "passed",
              ).length ?? 0}{" "}
              · Failed{" "}
              {evaluation?.phase6?.gateEvaluations.filter(
                (row) => row.result === "failed",
              ).length ?? 0}
            </p>
            <Link
              className="text-xs text-[var(--color-primary)]"
              href={QEP_QUALITY_GATES_BASE_PATH}
            >
              View gate results →
            </Link>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Quality risks
            </p>
            <p className="mt-2 text-sm">
              {readinessQ.data?.risks.filter((row) => row.status === "open").length ??
                0}{" "}
              open
            </p>
            <Link
              className="text-xs text-[var(--color-primary)]"
              href={QEP_QUALITY_RISK_BASE_PATH}
            >
              View all risks →
            </Link>
          </div>
        </div>

        <div
          className={`space-y-3 ${mobileView === "decision" ? "" : "hidden md:block"}`}
        >
          <div
            className="rounded-lg border border-[var(--color-border)] p-4"
            data-testid="qep-cert-decision"
          >
            <h2 className="font-medium">Make certification decision</h2>
            <div className="mt-3 grid gap-2">
              {OUTCOMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-left text-sm ${outcome === item.id ? "border-[var(--color-primary)] bg-[var(--color-muted)]" : "border-[var(--color-border)]"}`}
                  data-testid={`qep-cert-outcome-${item.id}`}
                  onClick={() => setOutcome(item.id)}
                >
                  <span className="font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs text-[var(--color-muted-foreground)]">
                    {item.hint}
                  </span>
                </button>
              ))}
            </div>
            <textarea
              className="mt-3 w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              data-testid="qep-cert-rationale"
              placeholder="Decision justification"
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
            />
            <select
              className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              data-testid="qep-cert-authority"
              value={authorityId}
              onChange={(event) => setAuthorityId(event.target.value)}
            >
              <option value={F4_CERTIFIER_AUTHORITY}>Quality Certifier</option>
              <option value={F4_CO_APPROVER_AUTHORITY}>Quality Co-Approver</option>
            </select>
            <button
              type="button"
              className="mt-3 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-[var(--color-primary-foreground)]"
              data-testid="qep-cert-record"
              disabled={!evaluationId || decide.isPending}
              onClick={() => decide.mutate()}
            >
              Record Decision
            </button>
            {evaluation?.humanDecision ? (
              <p className="mt-2 text-sm" data-testid="qep-cert-recorded">
                Recorded {evaluation.humanDecision.outcome} · certifier{" "}
                {evaluation.humanDecision.actorId}
                {evaluation.humanDecision.coApproverActorId
                  ? ` · co-approver ${evaluation.humanDecision.coApproverActorId}`
                  : ""}
              </p>
            ) : (
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                Votes:{" "}
                {(evaluation?.authorityVotes ?? [])
                  .map((row) => `${row.authorityId}:${row.outcome}`)
                  .join(" · ") || "none"}
              </p>
            )}
          </div>
        </div>

        <div
          className={`space-y-3 ${mobileView === "snapshot" ? "" : "hidden md:block"}`}
        >
          <div
            className="rounded-lg border border-[var(--color-border)] p-4"
            data-testid="qep-cert-snapshot"
          >
            <h2 className="font-medium">Decision context snapshot</h2>
            <p className="mt-2 text-sm">
              Environment{" "}
              {evaluation?.phase6?.environmentSnapshot.name ??
                envQ.data?.items.find((row) => row.id === environmentId)?.name ??
                "—"}
            </p>
            <p className="text-sm">
              SCM {evaluation?.phase6?.scmIdentity.changeEventId ?? changeEventId}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              SHA {evaluation?.phase6?.scmIdentity.sha ?? "—"} ·{" "}
              {evaluation?.phase6?.scmIdentity.kind ?? "identity"}
            </p>
          </div>
          {failedBlocking.length > 0 ? (
            <div
              className="rounded-lg border border-[var(--color-border)] p-4"
              data-testid="qep-cert-exceptions"
            >
              <h2 className="font-medium">Failed Blocking Gates</h2>
              {failedBlocking.map((row) => (
                <div key={row.id} className="mt-2 text-sm">
                  <QepStatusBadge status="failed" /> {row.definitionSnapshot.number}{" "}
                  {row.definitionSnapshot.name}
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {row.reason}
                  </p>
                  <textarea
                    className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
                    placeholder="Exception justification"
                    value={exceptionReason}
                    onChange={(event) => setExceptionReason(event.target.value)}
                  />
                  <button
                    type="button"
                    className="mt-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs"
                    data-testid="qep-cert-authorise-exception"
                    onClick={() => exception.mutate(row.id)}
                  >
                    Authorise exception
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className={`${mobileView === "history" ? "" : "hidden md:block"}`}>
        <h2 className="font-medium">Recent decision</h2>
        {evaluation?.humanDecision ? (
          <p className="mt-1 text-sm" data-testid="qep-cert-history">
            {new Date(evaluation.humanDecision.decidedAt).toLocaleString()} ·{" "}
            {evaluation.humanDecision.outcome} · {evaluation.title}
          </p>
        ) : (
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            No terminal decision recorded yet.
          </p>
        )}
        <p className="mt-2 text-xs">
          <Link
            className="text-[var(--color-primary)]"
            href={QEP_CERTIFICATION_ROUTES.home}
          >
            Certification workbench
          </Link>
        </p>
      </div>
    </div>
  );
}
