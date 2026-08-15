/**
 * SPR-APZQEP-201 / SPR-BRIDGE-001 — read-only APZPEN → QEP security assurance bridge.
 * Presentation/compose only: never certifies, never writes APZPEN SoR.
 */

import type { AssessmentPosition, SecurityPosture } from "@/lib/apzpen/types";
import type { ProjectSourceBinding } from "@/lib/commercial/project-source-bindings";

/** Honest operator status — never drives GO/NO-GO. */
export type AssuranceStatus = "healthy" | "degraded" | "unavailable" | "not_entitled";

export type SecurityAssuranceEngagementRow = {
  readonly engagementId: string;
  readonly title?: string;
  readonly applicationName?: string;
  readonly assessmentPosition: AssessmentPosition;
  readonly posture: SecurityPosture;
  readonly externalRefs: readonly string[];
};

export type SecurityAssuranceSummary = {
  /** Org has pentest/APZPEN product access for this caller. */
  readonly entitled: boolean;
  /** At least one engagement is linked (tenant or externalRef match). */
  readonly linked: boolean;
  /** BRIDGE-001 four-state honesty. */
  readonly status: AssuranceStatus;
  readonly engagementId?: string;
  readonly engagementTitle?: string;
  /** Deep-link only when entitled; empty string when not. */
  readonly href: string;
  readonly assessmentPosition?: AssessmentPosition;
  readonly critical: number;
  readonly high: number;
  readonly openCount: number;
  /**
   * True only when linked and posture is not blocked and no open critical findings.
   * Never implies human certification.
   */
  readonly reviewClear: boolean;
  readonly detail: string;
  /** Optional Greenbone VA probe freshness (ENT-001 / BRIDGE). */
  readonly vaFreshness?: {
    readonly toolId: string;
    readonly probedAt: string;
    readonly status: string;
    readonly detail: string;
  };
};

function engagementHref(engagementId?: string): string {
  if (engagementId) return `/apzpen/engagements/${engagementId}`;
  return "/apzpen";
}

function pickWorst(
  rows: readonly SecurityAssuranceEngagementRow[],
): SecurityAssuranceEngagementRow | undefined {
  if (rows.length === 0) return undefined;
  const rank = (position: AssessmentPosition): number => {
    switch (position) {
      case "blocked":
        return 0;
      case "conditional":
        return 1;
      case "in_progress":
        return 2;
      case "not_started":
        return 3;
      case "complete":
        return 4;
      default:
        return 3;
    }
  };
  return [...rows].sort((a, b) => {
    const byPos = rank(a.assessmentPosition) - rank(b.assessmentPosition);
    if (byPos !== 0) return byPos;
    const aRisk = a.posture.critical * 100 + a.posture.high;
    const bRisk = b.posture.critical * 100 + b.posture.high;
    return bRisk - aRisk;
  })[0];
}

export function summariseSecurityAssurance(input: {
  readonly entitled: boolean;
  readonly engagements: readonly SecurityAssuranceEngagementRow[];
  readonly externalRef?: string;
}): SecurityAssuranceSummary {
  if (!input.entitled) {
    return {
      entitled: false,
      linked: false,
      status: "not_entitled",
      href: "",
      critical: 0,
      high: 0,
      openCount: 0,
      reviewClear: false,
      detail:
        "Security assurance (APZPEN) is not entitled for this organisation — release control cannot claim a security review.",
    };
  }

  const ref = input.externalRef?.trim().toLowerCase();
  const scoped = ref
    ? input.engagements.filter((row) =>
        row.externalRefs.some((r) => r.trim().toLowerCase() === ref),
      )
    : [...input.engagements];

  if (scoped.length === 0) {
    return {
      entitled: true,
      linked: false,
      status: "unavailable",
      href: engagementHref(),
      critical: 0,
      high: 0,
      openCount: 0,
      reviewClear: false,
      detail: ref
        ? `No APZPEN engagement is bound to repository ${input.externalRef}. Link source in APZPEN before treating security as reviewed.`
        : "No APZPEN engagements yet. Open Security Assurance to start an engagement — do not treat security as reviewed.",
    };
  }

  const worst = pickWorst(scoped)!;
  const critical = worst.posture.critical;
  const high = worst.posture.high;
  const openCount = worst.posture.openCount;
  const blocked = worst.assessmentPosition === "blocked";
  const reviewClear = !blocked && critical === 0;
  const status: AssuranceStatus =
    blocked || critical > 0 ? "degraded" : reviewClear ? "healthy" : "degraded";

  let detail: string;
  if (blocked) {
    detail = `APZPEN assessment is blocked on ${worst.engagementId} (critical ${critical} / high ${high} open ${openCount}).`;
  } else if (critical > 0) {
    detail = `APZPEN reports ${critical} critical finding(s) on ${worst.engagementId} — not clear for release review.`;
  } else if (high > 0) {
    detail = `APZPEN linked (${worst.assessmentPosition}); ${high} high finding(s) remain — review before certify.`;
  } else if (worst.assessmentPosition === "complete") {
    detail = `APZPEN engagement ${worst.engagementId} assessment complete with no open critical findings.`;
  } else {
    detail = `APZPEN engagement ${worst.engagementId} is ${worst.assessmentPosition} — review security posture before human certify.`;
  }

  return {
    entitled: true,
    linked: true,
    status,
    engagementId: worst.engagementId,
    engagementTitle: worst.title ?? worst.applicationName,
    href: engagementHref(worst.engagementId),
    assessmentPosition: worst.assessmentPosition,
    critical,
    high,
    openCount,
    reviewClear,
    detail,
  };
}

/** Readiness checklist: security row is ok only when reviewClear. */
export function isSecurityReadinessClear(summary: SecurityAssuranceSummary): boolean {
  return summary.reviewClear;
}

export function buildEngagementRows(input: {
  readonly engagements: readonly {
    readonly engagementId: string;
    readonly title?: string;
    readonly applicationName?: string;
    readonly assessmentPosition: AssessmentPosition;
    readonly posture: SecurityPosture;
  }[];
  readonly bindings: readonly ProjectSourceBinding[];
}): SecurityAssuranceEngagementRow[] {
  return input.engagements.map((engagement) => {
    const refs = input.bindings
      .filter(
        (b) =>
          b.productKey === "pentest" &&
          b.projectId === engagement.engagementId &&
          b.status !== "disabled",
      )
      .map((b) => b.externalRef);
    return {
      engagementId: engagement.engagementId,
      title: engagement.title,
      applicationName: engagement.applicationName,
      assessmentPosition: engagement.assessmentPosition,
      posture: engagement.posture,
      externalRefs: refs,
    };
  });
}
