/**
 * Immutable declarative Executive Personas (QO-015).
 * Personas define consumption preferences only — never rendering.
 */

import type {
  ExecutiveArtefactSlot,
  ExecutivePersona,
  ExecutivePersonaKind,
  InformationPriority,
} from "../contracts/executive-experience";
import {
  EXECUTIVE_ARTEFACT_SLOTS,
  EXECUTIVE_PERSONA_KINDS,
} from "../contracts/executive-experience";

export function isExecutivePersonaKind(value: string): value is ExecutivePersonaKind {
  return (EXECUTIVE_PERSONA_KINDS as readonly string[]).includes(value);
}

export function isExecutiveArtefactSlot(value: string): value is ExecutiveArtefactSlot {
  return (EXECUTIVE_ARTEFACT_SLOTS as readonly string[]).includes(value);
}

function persona(
  kind: ExecutivePersonaKind,
  name: string,
  description: string,
  defaultReportProfileKinds: readonly string[],
  defaultArtefactSlots: readonly ExecutiveArtefactSlot[],
  defaultInformationPriority: InformationPriority,
): ExecutivePersona {
  return Object.freeze({
    personaId: `exec_persona_${kind}`,
    kind,
    name,
    description,
    defaultReportProfileKinds: Object.freeze([...defaultReportProfileKinds]),
    defaultArtefactSlots: Object.freeze([...defaultArtefactSlots]),
    defaultInformationPriority,
    immutable: true as const,
    projectionOnly: true as const,
    metadata: Object.freeze({}),
  });
}

/** Built-in immutable Executive Personas. */
export const BUILTIN_EXECUTIVE_PERSONAS: readonly ExecutivePersona[] = Object.freeze([
  persona(
    "ceo",
    "CEO",
    "Enterprise outcomes and decision posture",
    ["executive", "production_readiness"],
    [
      "decision_package",
      "approval_bundle",
      "evidence_integration_package",
      "report_profiles",
    ],
    "critical",
  ),
  persona(
    "cio",
    "CIO",
    "Technology risk, readiness, and governance posture",
    ["executive", "compliance", "production_readiness"],
    [
      "decision_package",
      "approval_bundle",
      "evidence_integration_package",
      "enrichment_package",
      "report_profiles",
    ],
    "high",
  ),
  persona(
    "cto",
    "CTO",
    "Engineering quality posture and technical decisions",
    ["executive", "regression", "production_readiness"],
    [
      "decision_package",
      "enrichment_package",
      "evidence_integration_package",
      "report_profiles",
    ],
    "high",
  ),
  persona(
    "head_of_engineering",
    "Head of Engineering",
    "Delivery quality and coordination posture",
    ["developer", "regression", "pull_request"],
    [
      "decision_package",
      "evidence_integration_package",
      "enrichment_package",
      "report_profiles",
    ],
    "normal",
  ),
  persona(
    "qa_director",
    "QA Director",
    "Quality assurance posture across flows",
    ["regression", "audit", "developer"],
    [
      "decision_package",
      "enrichment_package",
      "evidence_integration_package",
      "approval_bundle",
      "report_profiles",
    ],
    "high",
  ),
  persona(
    "compliance_officer",
    "Compliance Officer",
    "Compliance and audit consumption preferences",
    ["compliance", "audit"],
    [
      "approval_bundle",
      "decision_package",
      "evidence_integration_package",
      "report_profiles",
    ],
    "critical",
  ),
  persona(
    "product_board",
    "Product Board",
    "Product board decision and readiness consumption",
    ["executive", "production_readiness"],
    [
      "decision_package",
      "approval_bundle",
      "evidence_integration_package",
      "report_profiles",
    ],
    "high",
  ),
  persona(
    "programme_manager",
    "Programme Manager",
    "Programme-level quality flow consumption",
    ["executive", "regression", "pull_request"],
    [
      "decision_package",
      "evidence_integration_package",
      "enrichment_package",
      "report_profiles",
      "navigation_model",
    ],
    "normal",
  ),
  persona(
    "custom",
    "Custom Persona",
    "Caller-supplied consumption preferences",
    [],
    [],
    "normal",
  ),
]);

const BY_KIND = new Map<ExecutivePersonaKind, ExecutivePersona>(
  BUILTIN_EXECUTIVE_PERSONAS.map((p) => [p.kind, p]),
);

export function listBuiltinExecutivePersonas(): readonly ExecutivePersona[] {
  return BUILTIN_EXECUTIVE_PERSONAS;
}

export function getBuiltinExecutivePersona(
  kind: ExecutivePersonaKind,
): ExecutivePersona {
  const found = BY_KIND.get(kind);
  if (!found) {
    throw new Error(`Unknown executive persona kind: ${kind}`);
  }
  return found;
}

export function resolveExecutivePersona(
  kind: ExecutivePersonaKind,
  options?: {
    readonly customPersonaName?: string;
    readonly customReportProfileKinds?: readonly string[];
    readonly customArtefactSlots?: readonly ExecutiveArtefactSlot[];
  },
): ExecutivePersona {
  if (kind !== "custom") {
    return getBuiltinExecutivePersona(kind);
  }
  return Object.freeze({
    personaId: `exec_persona_custom_${Date.now().toString(36)}`,
    kind: "custom" as const,
    name: options?.customPersonaName?.trim() || "Custom Persona",
    description: "Custom executive consumption preferences",
    defaultReportProfileKinds: Object.freeze([
      ...(options?.customReportProfileKinds ?? []),
    ]),
    defaultArtefactSlots: Object.freeze([...(options?.customArtefactSlots ?? [])]),
    defaultInformationPriority: "normal" as const,
    immutable: true as const,
    projectionOnly: true as const,
    metadata: Object.freeze({ resolved: "runtime" }),
  });
}
