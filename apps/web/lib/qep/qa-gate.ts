/**
 * Flagship F15 — QA Gate compose (checklist + findings for human confirm).
 * Never auto-certifies; GO/NO-GO remains on RC.
 */

import { getReportPack } from "@/lib/qep/report-pack";
import {
  getQaGateConfirmations,
  type QaGateConfirmationRecord,
} from "@/lib/qep/qa-gate-confirm-store";
import { listVerificationDispatches } from "@/lib/qep/verification-dispatch-store";
import {
  getCertificationByChange,
  collectEvidenceForChange,
} from "@/lib/qep/certification-runtime";
import type { ReportFinding } from "@/lib/qep/report-pack-findings";

export const F15_ASSIST_ORIGIN = "f15_qa_gate" as const;

export type QaGateChecklistItem = {
  readonly id: string;
  readonly label: string;
  readonly status: "ready" | "attention" | "complete" | "blocked" | "not_started";
  readonly detail: string;
};

export type QaGateView = {
  readonly changeEventId: string;
  readonly tenantId: string;
  readonly generatedAt: string;
  readonly advisory: true;
  readonly autoCertified: false;
  readonly headline: string;
  readonly checklist: readonly QaGateChecklistItem[];
  readonly findings: readonly (ReportFinding & {
    readonly confirmed: boolean;
    readonly defectId?: string;
  })[];
  readonly confirmedCount: number;
  readonly securityDispatchCount: number;
  readonly qualityDispatchCount: number;
  readonly evidenceDomainCount: number;
  readonly certification?: {
    readonly evaluationId: string;
    readonly readiness: string;
    readonly score: number;
    readonly humanDecision?: string;
  };
  readonly confirmations?: QaGateConfirmationRecord;
  readonly nextHint: string;
};

export async function composeQaGate(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly now?: () => Date;
}): Promise<QaGateView> {
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("qa_gate.change_id_required");
  }

  const pack = await getReportPack({
    tenantId: input.tenantId,
    changeEventId,
  });
  const dispatches = listVerificationDispatches({
    tenantId: input.tenantId,
    changeEventId,
    limit: 100,
  });
  const qualityDispatchCount = dispatches.filter(
    (d) => d.pack === "quality" || (!d.pack && d.assistOrigin.includes("f10")),
  ).length;
  const securityDispatchCount = dispatches.filter(
    (d) =>
      d.pack === "security" ||
      d.assistOrigin.includes("f11") ||
      d.assistOrigin.includes("f15"),
  ).length;

  let evidenceDomainCount = 0;
  try {
    const evidence = await collectEvidenceForChange(input.tenantId, changeEventId);
    evidenceDomainCount = new Set(evidence.evidenceLinks.map((l) => l.domain)).size;
  } catch {
    // soft
  }

  const certBundle = await getCertificationByChange(input.tenantId, changeEventId);
  const evaluation = [...certBundle.evaluations].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0];

  const confirmations = getQaGateConfirmations(input.tenantId, changeEventId);
  const confirmedIds = new Set((confirmations?.findings ?? []).map((f) => f.findingId));
  const defectByFinding = new Map(
    (confirmations?.findings ?? [])
      .filter((f) => f.defectId)
      .map((f) => [f.findingId, f.defectId!] as const),
  );

  const findings = pack.findings.map((f) => ({
    ...f,
    confirmed: confirmedIds.has(f.id),
    defectId: defectByFinding.get(f.id),
  }));

  const checklist: QaGateChecklistItem[] = [
    {
      id: "run_quality_pack",
      label: "Quality pack dispatched (F10)",
      status:
        qualityDispatchCount > 0
          ? "complete"
          : evidenceDomainCount > 0
            ? "attention"
            : "not_started",
      detail:
        qualityDispatchCount > 0
          ? `${qualityDispatchCount} quality dispatch row(s)`
          : "Run QA Gate packs (includes quality domains)",
    },
    {
      id: "run_pen_test_pack",
      label: "Pen-test / security pack dispatched (F11)",
      status: securityDispatchCount > 0 ? "complete" : "not_started",
      detail:
        securityDispatchCount > 0
          ? `${securityDispatchCount} security/pen-test dispatch row(s)`
          : "QA may run pen-test packs from this gate (Trivy/Semgrep/Nuclei/ZAP)",
    },
    {
      id: "evidence_present",
      label: "Evidence domains present",
      status:
        evidenceDomainCount >= 2
          ? "complete"
          : evidenceDomainCount === 1
            ? "attention"
            : "not_started",
      detail: `${evidenceDomainCount} domain(s)`,
    },
    {
      id: "evaluate_findings",
      label: "Findings evaluated",
      status:
        pack.findings.length === 0
          ? evidenceDomainCount > 0
            ? "attention"
            : "not_started"
          : "ready",
      detail: `${pack.findings.length} finding(s) · assessment ${pack.assessment.band}`,
    },
    {
      id: "human_confirm",
      label: "Human confirm findings",
      status:
        confirmedIds.size === 0
          ? pack.findings.length > 0
            ? "ready"
            : "not_started"
          : confirmedIds.size >= Math.min(pack.findings.length, 1)
            ? "complete"
            : "attention",
      detail: `${confirmedIds.size} confirmed`,
    },
    {
      id: "fix_direction",
      label: "Fix Direction Pack for Dev",
      status: confirmedIds.size > 0 ? "ready" : "not_started",
      detail:
        confirmedIds.size > 0
          ? "Export Fix Direction Pack (confirmed findings)"
          : "Confirm findings first (or export advisory pack from all findings)",
    },
    {
      id: "rc_go_nogo",
      label: "RC human GO/NO-GO (separate)",
      status: evaluation?.humanDecision
        ? "complete"
        : evaluation
          ? "ready"
          : "not_started",
      detail: evaluation
        ? `${evaluation.readiness} ${evaluation.score}% · human ${evaluation.humanDecision?.outcome ?? "pending"}`
        : "Evaluate on Release Candidate — not part of pack dispatch",
    },
  ];

  const next =
    checklist.find(
      (c) =>
        c.status === "not_started" || c.status === "ready" || c.status === "attention",
    ) ?? checklist[checklist.length - 1]!;

  return {
    changeEventId,
    tenantId: input.tenantId,
    generatedAt: (input.now ?? (() => new Date()))().toISOString(),
    advisory: true,
    autoCertified: false,
    headline: `QA Gate · ${pack.assessment.band} · ${pack.findings.length} findings`,
    checklist,
    findings,
    confirmedCount: confirmedIds.size,
    securityDispatchCount,
    qualityDispatchCount,
    evidenceDomainCount,
    certification: evaluation
      ? {
          evaluationId: evaluation.evaluationId,
          readiness: evaluation.readiness,
          score: evaluation.score,
          humanDecision: evaluation.humanDecision?.outcome,
        }
      : undefined,
    confirmations,
    nextHint: `${next.label}: ${next.detail}`,
  };
}
