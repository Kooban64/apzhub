/**
 * Table-driven Quality Flow state machine (QO-004).
 *
 * Declarative transition rules — no nested progression conditionals.
 * Not a generic workflow / BPMN engine.
 */

import { OrchestrationError } from "../contracts/errors";
import {
  isTerminalQualityFlowState,
  QUALITY_FLOW_STATES,
  type QualityFlowState,
} from "../contracts/quality-flow";

export type QualityFlowTransitionKind = "progression" | "terminal" | "recovery";

export interface QualityFlowTransitionRule {
  readonly from: QualityFlowState;
  readonly to: QualityFlowState;
  readonly kind: QualityFlowTransitionKind;
}

/** Happy-path progression (one Quality Flow = one state machine). */
const PROGRESSION: readonly (readonly [QualityFlowState, QualityFlowState])[] = [
  ["registered", "ready"],
  ["ready", "triggered"],
  ["triggered", "impact_analysed"],
  ["impact_analysed", "selection_complete"],
  ["selection_complete", "capability_coordination"],
  ["capability_coordination", "awaiting_gates"],
  ["awaiting_gates", "awaiting_approval"],
  ["awaiting_approval", "recommendation_ready"],
  ["recommendation_ready", "completed"],
];

const ACTIVE_STATES: readonly QualityFlowState[] = QUALITY_FLOW_STATES.filter(
  (s) => !isTerminalQualityFlowState(s),
);

const REJECT_FROM: readonly QualityFlowState[] = [
  "awaiting_approval",
  "recommendation_ready",
];

/** Recovery / control targets reachable from failed (retry to recovery point). */
const RETRY_TARGETS: readonly QualityFlowState[] = [
  "registered",
  "ready",
  "triggered",
  "impact_analysed",
  "selection_complete",
  "capability_coordination",
  "awaiting_gates",
  "awaiting_approval",
  "recommendation_ready",
];

const RESTART_FROM: readonly QualityFlowState[] = [
  "failed",
  "cancelled",
  "timed_out",
  "rejected",
];

function buildRules(): readonly QualityFlowTransitionRule[] {
  const rules: QualityFlowTransitionRule[] = [];

  for (const [from, to] of PROGRESSION) {
    rules.push({ from, to, kind: "progression" });
  }

  for (const from of ACTIVE_STATES) {
    rules.push({ from, to: "cancelled", kind: "terminal" });
    rules.push({ from, to: "failed", kind: "terminal" });
    rules.push({ from, to: "timed_out", kind: "terminal" });
    rules.push({ from, to: "superseded", kind: "terminal" });
  }

  for (const from of REJECT_FROM) {
    rules.push({ from, to: "rejected", kind: "terminal" });
  }

  for (const to of RETRY_TARGETS) {
    rules.push({ from: "failed", to, kind: "recovery" });
  }

  for (const from of RESTART_FROM) {
    rules.push({ from, to: "ready", kind: "recovery" });
  }

  return rules;
}

/** Authoritative declarative transition table. */
export const QUALITY_FLOW_TRANSITION_RULES: readonly QualityFlowTransitionRule[] =
  buildRules();

const ALLOWED = new Map<string, QualityFlowTransitionKind>();
for (const rule of QUALITY_FLOW_TRANSITION_RULES) {
  ALLOWED.set(`${rule.from}->${rule.to}`, rule.kind);
}

export function listAllowedTransitions(
  from: QualityFlowState,
): readonly QualityFlowTransitionRule[] {
  return QUALITY_FLOW_TRANSITION_RULES.filter((r) => r.from === from);
}

export function canTransitionQualityFlow(
  from: QualityFlowState,
  to: QualityFlowState,
): boolean {
  return ALLOWED.has(`${from}->${to}`);
}

export function transitionKind(
  from: QualityFlowState,
  to: QualityFlowState,
): QualityFlowTransitionKind | undefined {
  return ALLOWED.get(`${from}->${to}`);
}

export function assertQualityFlowTransition(
  from: QualityFlowState,
  to: QualityFlowState,
): QualityFlowTransitionKind {
  const kind = transitionKind(from, to);
  if (!kind) {
    throw new OrchestrationError(
      "lifecycle",
      "INVALID_QUALITY_FLOW_TRANSITION",
      `Invalid Quality Flow transition: ${from} → ${to}`,
      { from, to },
    );
  }
  return kind;
}

/** Every progression edge for certification / coverage tests. */
export function listProgressionEdges(): readonly (readonly [
  QualityFlowState,
  QualityFlowState,
])[] {
  return PROGRESSION;
}

export function listActiveQualityFlowStates(): readonly QualityFlowState[] {
  return ACTIVE_STATES;
}
