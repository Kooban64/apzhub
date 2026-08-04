/**
 * Immutable declarative Report Profiles (QO-014).
 * Profiles define inclusion criteria only — presentation is external.
 */

import type {
  EvidenceReferenceSlot,
  ReportProfile,
  ReportProfileKind,
} from "../contracts/evidence-integration";
import {
  EVIDENCE_REFERENCE_SLOTS,
  REPORT_PROFILE_KINDS,
} from "../contracts/evidence-integration";

export function isReportProfileKind(value: string): value is ReportProfileKind {
  return (REPORT_PROFILE_KINDS as readonly string[]).includes(value);
}

export function isEvidenceReferenceSlot(value: string): value is EvidenceReferenceSlot {
  return (EVIDENCE_REFERENCE_SLOTS as readonly string[]).includes(value);
}

function profile(
  kind: ReportProfileKind,
  name: string,
  description: string,
  inclusionSlots: readonly EvidenceReferenceSlot[],
): ReportProfile {
  return Object.freeze({
    profileId: `report_profile_${kind}`,
    kind,
    name,
    description,
    inclusionSlots: Object.freeze([...inclusionSlots]),
    immutable: true as const,
    presentationExternal: true as const,
    metadata: Object.freeze({}),
  });
}

/** Built-in immutable Report Profiles — inclusion criteria only. */
export const BUILTIN_REPORT_PROFILES: readonly ReportProfile[] = Object.freeze([
  profile(
    "developer",
    "Developer Report",
    "Developer-facing evidence chain for a Quality Flow",
    [
      "quality_flow",
      "impact_graph",
      "decision_package",
      "source_change_package",
      "automation_coordination_package",
      "evidence",
    ],
  ),
  profile(
    "pull_request",
    "Pull Request Report",
    "PR/MR-oriented evidence and coordination references",
    [
      "quality_flow",
      "source_change_package",
      "decision_package",
      "automation_coordination_package",
      "evidence",
    ],
  ),
  profile(
    "regression",
    "Regression Report",
    "Regression-oriented decision and automation coordination references",
    [
      "quality_flow",
      "impact_graph",
      "decision_package",
      "automation_coordination_package",
      "enrichment_package",
      "evidence",
    ],
  ),
  profile(
    "executive",
    "Executive Report",
    "Executive summary references across decision and enrichment",
    [
      "quality_flow",
      "governance_decision",
      "approval_bundle",
      "decision_package",
      "enrichment_package",
      "report",
    ],
  ),
  profile(
    "production_readiness",
    "Production Readiness Report",
    "Production readiness evidence chain",
    [
      "quality_flow",
      "impact_graph",
      "governance_decision",
      "approval_bundle",
      "decision_package",
      "automation_coordination_package",
      "source_change_package",
      "evidence",
      "audit",
    ],
  ),
  profile(
    "compliance",
    "Compliance Report",
    "Compliance-oriented governance, approval, and audit references",
    [
      "quality_flow",
      "governance_decision",
      "approval_bundle",
      "decision_package",
      "evidence",
      "audit",
      "report",
    ],
  ),
  profile(
    "audit",
    "Audit Report",
    "Full audit traceability across all authoritative artefacts",
    [...EVIDENCE_REFERENCE_SLOTS],
  ),
  profile(
    "custom",
    "Custom Report",
    "Caller-supplied inclusion slots — presentation remains external",
    [],
  ),
]);

const BY_KIND = new Map<ReportProfileKind, ReportProfile>(
  BUILTIN_REPORT_PROFILES.map((p) => [p.kind, p]),
);

export function listBuiltinReportProfiles(): readonly ReportProfile[] {
  return BUILTIN_REPORT_PROFILES;
}

export function getBuiltinReportProfile(kind: ReportProfileKind): ReportProfile {
  const found = BY_KIND.get(kind);
  if (!found) {
    throw new Error(`Unknown report profile kind: ${kind}`);
  }
  return found;
}

/**
 * Resolve a profile for report assembly.
 * Custom profiles require explicit inclusion slots from the caller.
 */
export function resolveReportProfile(
  kind: ReportProfileKind,
  customInclusionSlots?: readonly EvidenceReferenceSlot[],
  customProfileName?: string,
): ReportProfile {
  if (kind !== "custom") {
    return getBuiltinReportProfile(kind);
  }
  const slots = Object.freeze([...(customInclusionSlots ?? [])]);
  return Object.freeze({
    profileId: `report_profile_custom_${Date.now().toString(36)}`,
    kind: "custom" as const,
    name: customProfileName?.trim() || "Custom Report",
    description: "Custom inclusion criteria supplied at assembly time",
    inclusionSlots: slots,
    immutable: true as const,
    presentationExternal: true as const,
    metadata: Object.freeze({ resolved: "runtime" }),
  });
}
