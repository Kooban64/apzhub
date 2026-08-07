/**
 * W004 Exception Automation — detectable operational failures → Exceptions.
 * Idempotent: skips if an open/acknowledged exception already covers the subject.
 */

import type {
  CreateExceptionInput,
  ExceptionSeverity,
  ExceptionType,
  ProjectCheckpoint,
  ProjectCommitment,
  ProjectDependency,
  ProjectException,
  ProjectMilestone,
  ProjectWaiting,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  isOpenMilestoneStatus,
  normalizeMilestoneStatus,
} from "@apzhub/platform-service-contracts";

import { isOverdueCommitment, isWaitingAged } from "./compute-engines";

export type AutomatedExceptionDraft = CreateExceptionInput & {
  readonly recommendedAction: string;
};

function hasOpenFor(
  exceptions: readonly ProjectException[],
  type: ExceptionType,
  subjectId: string,
): boolean {
  return exceptions.some(
    (e) => e.status !== "concluded" && e.type === type && e.subjectRef.id === subjectId,
  );
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / (24 * 60 * 60 * 1000));
}

export function detectAutomatedExceptions(input: {
  readonly milestones: readonly ProjectMilestone[];
  readonly waiting: readonly ProjectWaiting[];
  readonly commitments: readonly ProjectCommitment[];
  readonly dependencies: readonly ProjectDependency[];
  readonly checkpoints: readonly ProjectCheckpoint[];
  readonly exceptions: readonly ProjectException[];
  readonly waitingBreachEscalationDays: number;
  readonly milestoneDateToleranceDays: number;
}): readonly AutomatedExceptionDraft[] {
  const drafts: AutomatedExceptionDraft[] = [];
  const now = Date.now();

  for (const m of input.milestones) {
    if (!isOpenMilestoneStatus(m.status)) continue;
    const status = normalizeMilestoneStatus(m.status);
    if (status === "slipped" && !hasOpenFor(input.exceptions, "date_exception", m.id)) {
      drafts.push({
        type: "date_exception",
        severity: "major",
        subjectRef: { type: "milestone", id: m.id },
        reason: `Milestone slipped: ${m.name}`,
        impactSummary: `Trajectory anchor ${m.name} has slipped${
          m.varianceDays != null ? ` (${m.varianceDays}d vs baseline)` : ""
        }.`,
        failureConsequence: m.failureConsequence,
        recommendedAction:
          "Confirm recovery date, open Decision if re-baseline required, chase linked commitments.",
      });
    }
    if (
      m.baselineDueAt &&
      m.targetDate &&
      daysBetween(m.baselineDueAt, m.targetDate) > input.milestoneDateToleranceDays &&
      !hasOpenFor(input.exceptions, "date_exception", m.id)
    ) {
      drafts.push({
        type: "date_exception",
        severity:
          daysBetween(m.baselineDueAt, m.targetDate) >
          input.milestoneDateToleranceDays * 2
            ? "critical"
            : "major",
        subjectRef: { type: "milestone", id: m.id },
        reason: `Milestone ${m.name} exceeds governance date tolerance vs baseline`,
        impactSummary: `Working plan is ${daysBetween(m.baselineDueAt, m.targetDate)} days beyond baseline (tolerance ${input.milestoneDateToleranceDays}d).`,
        failureConsequence: m.failureConsequence,
        recommendedAction:
          "Raise Decision for re-baseline or recover the milestone date within tolerance.",
      });
    }
  }

  for (const w of input.waiting) {
    if (w.status !== "active") continue;
    if (!isWaitingAged(w, now)) continue;
    const over = Math.floor((now - Date.parse(w.since)) / 86400000 - (w.slaDays || 7));
    if (over < input.waitingBreachEscalationDays) continue;
    if (hasOpenFor(input.exceptions, "wait_breach", w.id)) continue;
    drafts.push({
      type: "wait_breach",
      severity: over >= input.waitingBreachEscalationDays * 2 ? "critical" : "major",
      subjectRef: { type: "waiting", id: w.id },
      reason: `Waiting breached SLA: ${w.subject}`,
      impactSummary: `Aged ${over} day(s) beyond SLA (${w.category}).`,
      failureConsequence: w.failureConsequence,
      recommendedAction:
        "Escalate chase owner; open Decision if external party cannot recover.",
    });
  }

  for (const c of input.commitments) {
    if (!isOverdueCommitment(c, now)) continue;
    if (!(c.blocksGoLive || c.priority === "high" || c.failureConsequence)) continue;
    if (hasOpenFor(input.exceptions, "scope_exception", c.id)) continue;
    drafts.push({
      type: "scope_exception",
      severity: c.blocksGoLive ? "critical" : "major",
      subjectRef: { type: "commitment", id: c.id },
      reason: `Commitment breach (overdue): ${c.statement}`,
      impactSummary: `Commitment overdue${c.dueAt ? ` since ${c.dueAt.slice(0, 10)}` : ""}.`,
      failureConsequence: c.failureConsequence,
      recommendedAction:
        "Complete, re-plan with Exception reason, or cancel with scope review.",
    });
  }

  for (const d of input.dependencies) {
    if (d.status !== "broken") continue;
    if (hasOpenFor(input.exceptions, "dependency_break", d.id)) continue;
    drafts.push({
      type: "dependency_break",
      severity: "major",
      subjectRef: { type: "dependency", id: d.id },
      reason: "Dependency broken",
      impactSummary: "Structural dependency is broken — delivery order at risk.",
      failureConsequence: d.failureConsequence,
      recommendedAction:
        "Assign recovery owner; open Decision if profile requires; restore or replace edge.",
    });
  }

  for (const chk of input.checkpoints) {
    if (chk.status !== "rejected") continue;
    if (hasOpenFor(input.exceptions, "checkpoint_rejected", chk.id)) continue;
    drafts.push({
      type: "checkpoint_rejected",
      severity: chk.releaseClass ? "critical" : "major",
      subjectRef: { type: "checkpoint", id: chk.id },
      reason: `Checkpoint rejected: ${chk.name}`,
      impactSummary: "Rejected checkpoint blocks quiet proceed.",
      recommendedAction:
        "Mandatory Decision; resubmit after remediation or waive with audit.",
    });
  }

  return drafts;
}

export async function applyAutomatedExceptions(
  ctx: ServiceRequestContext,
  projectId: string,
  drafts: readonly AutomatedExceptionDraft[],
  openException: (
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateExceptionInput,
  ) => Promise<ProjectException>,
): Promise<readonly ProjectException[]> {
  const created: ProjectException[] = [];
  for (const draft of drafts) {
    const { recommendedAction: _rec, ...input } = draft;
    void _rec;
    created.push(await openException(ctx, projectId, input));
  }
  return created;
}

export function severityForHealthDrop(
  previous: string,
  next: string,
): ExceptionSeverity | null {
  if (next === "Critical" && previous !== "Critical") return "critical";
  if (next === "Watch" && previous === "Healthy") return "minor";
  return null;
}
