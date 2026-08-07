import type {
  ConfidenceBand,
  DeliveryConfidenceResult,
  DeliveryFactor,
  DeliveryForecastResult,
  DeliveryHealthResult,
  ForecastRecommendedAction,
  ProjectCheckpoint,
  ProjectCommitment,
  ProjectDependency,
  ProjectException,
  ProjectMilestone,
  ProjectOpsDecision,
  ProjectPulseResult,
  ProjectRisk,
  ProjectWaiting,
} from "@apzhub/platform-service-contracts";
import {
  isOpenMilestoneStatus,
  normalizeMilestoneStatus,
} from "@apzhub/platform-service-contracts";

function band(score: number): ConfidenceBand {
  if (score >= 75) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

function daysBetween(iso: string, now = Date.now()): number {
  return Math.floor((now - new Date(iso).getTime()) / 86400000);
}

export function isWaitingAged(w: ProjectWaiting, now = Date.now()): boolean {
  if (w.status !== "active") return false;
  return daysBetween(w.since, now) > (w.slaDays || 7);
}

export function isOverdueCommitment(c: ProjectCommitment, now = Date.now()): boolean {
  if (!c.dueAt) return false;
  if (c.status === "done" || c.status === "cancelled") return false;
  return new Date(c.dueAt).getTime() < now;
}

export type OpsSnapshot = {
  commitments: readonly ProjectCommitment[];
  waiting: readonly ProjectWaiting[];
  dependencies: readonly ProjectDependency[];
  decisions: readonly ProjectOpsDecision[];
  checkpoints: readonly ProjectCheckpoint[];
  exceptions: readonly ProjectException[];
  risks: readonly ProjectRisk[];
  milestones: readonly ProjectMilestone[];
};

export function computeDeliveryHealth(
  projectId: string,
  snap: OpsSnapshot,
): DeliveryHealthResult {
  const factors: DeliveryFactor[] = [];
  const now = Date.now();
  const criticalRisks = snap.risks.filter(
    (r) =>
      (r.status === "open" || r.status === "mitigating") &&
      (r.impact === "critical" || r.probability === "critical"),
  );
  if (criticalRisks.length) {
    factors.push({
      code: "critical_risk",
      label: "Open critical risk",
      weight: 100,
      detail: `${criticalRisks.length} critical open risk(s)`,
      count: criticalRisks.length,
    });
  }
  const agedBlocking = snap.waiting.filter(
    (w) =>
      isWaitingAged(w, now) &&
      Boolean(
        w.linkedCommitmentId &&
        snap.commitments.some((c) => c.id === w.linkedCommitmentId && c.blocksGoLive),
      ),
  );
  if (agedBlocking.length) {
    factors.push({
      code: "aged_blocking_wait",
      label: "Aged wait on go-live commitment",
      weight: 100,
      detail: `${agedBlocking.length} aged blocking wait(s)`,
      count: agedBlocking.length,
    });
  }
  const rejected = snap.checkpoints.filter(
    (c) => c.status === "rejected" && c.releaseClass,
  );
  if (rejected.length) {
    factors.push({
      code: "rejected_checkpoint",
      label: "Rejected release checkpoint",
      weight: 100,
      detail: `${rejected.length} rejected release-class checkpoint(s)`,
      count: rejected.length,
    });
  }
  const overdueHigh = snap.commitments.filter(
    (c) =>
      isOverdueCommitment(c, now) &&
      (c.blocksGoLive ||
        c.priority === "high" ||
        Boolean(c.failureConsequence?.trim())),
  );
  if (overdueHigh.length) {
    factors.push({
      code: "overdue_blocking_commitment",
      label: "Overdue high-impact commitment",
      weight: 100,
      detail: `${overdueHigh.length} overdue blocking/high commitment(s)`,
      count: overdueHigh.length,
    });
  }

  if (factors.some((f) => f.weight >= 100)) {
    return {
      projectId,
      status: "Critical",
      factors,
      computedAt: new Date().toISOString(),
    };
  }

  const watchRisks = snap.risks.filter(
    (r) =>
      (r.status === "open" || r.status === "mitigating") &&
      (r.impact === "high" || r.probability === "high"),
  );
  if (watchRisks.length) {
    factors.push({
      code: "watch_risk",
      label: "Open watch risk",
      weight: 40,
      detail: `${watchRisks.length} high open risk(s)`,
      count: watchRisks.length,
    });
  }
  const aged = snap.waiting.filter((w) => isWaitingAged(w, now));
  if (aged.length) {
    factors.push({
      code: "aged_wait",
      label: "Aged waiting",
      weight: 40,
      detail: `${aged.length} aged wait(s)`,
      count: aged.length,
    });
  }
  const slippedCount = snap.milestones.filter((m) => {
    const s = normalizeMilestoneStatus(m.status);
    return s === "slipped" || s === "at_risk";
  }).length;
  if (slippedCount) {
    factors.push({
      code: "milestone_slipped",
      label: "Slipped / at-risk milestone",
      weight: 40,
      detail: `${slippedCount} slipped or at-risk milestone(s)`,
      count: slippedCount,
    });
  }
  const pastDueDecisions = snap.decisions.filter(
    (d) => d.status === "pending" && d.dueAt && new Date(d.dueAt).getTime() < now,
  );
  if (pastDueDecisions.length) {
    factors.push({
      code: "decision_past_due",
      label: "Pending decision past due",
      weight: 40,
      detail: `${pastDueDecisions.length} past-due decision(s)`,
      count: pastDueDecisions.length,
    });
  }

  const conf = computeDeliveryConfidence(projectId, snap);
  if (conf.band === "Low") {
    factors.push({
      code: "low_confidence",
      label: "Low delivery confidence",
      weight: 30,
      detail: `Confidence ${conf.score} (Low)`,
    });
  }

  return {
    projectId,
    status: factors.length ? "Watch" : "Healthy",
    factors,
    computedAt: new Date().toISOString(),
  };
}

export function computeDeliveryConfidence(
  projectId: string,
  snap: OpsSnapshot,
): DeliveryConfidenceResult {
  const now = Date.now();
  const factors: DeliveryFactor[] = [];
  let score = 100;

  const criticalOpenRisks = snap.risks.filter(
    (r) =>
      (r.status === "open" || r.status === "mitigating") &&
      (r.impact === "critical" || r.probability === "critical"),
  ).length;
  if (criticalOpenRisks) {
    const w = 15 * criticalOpenRisks;
    score -= w;
    factors.push({
      code: "critical_risks",
      label: "Critical open risks",
      weight: -w,
      detail: `${criticalOpenRisks} × −15`,
      count: criticalOpenRisks,
    });
  }

  const watchOpenRisks = snap.risks.filter(
    (r) =>
      (r.status === "open" || r.status === "mitigating") &&
      (r.impact === "high" || r.probability === "high") &&
      r.impact !== "critical" &&
      r.probability !== "critical",
  ).length;
  if (watchOpenRisks) {
    const w = 8 * watchOpenRisks;
    score -= w;
    factors.push({
      code: "watch_risks",
      label: "Watch open risks",
      weight: -w,
      detail: `${watchOpenRisks} × −8`,
      count: watchOpenRisks,
    });
  }

  const overdueCommitments = snap.commitments.filter((c) =>
    isOverdueCommitment(c, now),
  ).length;
  if (overdueCommitments) {
    const w = 10 * overdueCommitments;
    score -= w;
    factors.push({
      code: "overdue_commitments",
      label: "Overdue commitments",
      weight: -w,
      detail: `${overdueCommitments} × −10`,
      count: overdueCommitments,
    });
  }

  const agedActiveWaits = snap.waiting.filter((w) => isWaitingAged(w, now)).length;
  if (agedActiveWaits) {
    const w = 6 * agedActiveWaits;
    score -= w;
    factors.push({
      code: "aged_waits",
      label: "Aged active waits",
      weight: -w,
      detail: `${agedActiveWaits} × −6`,
      count: agedActiveWaits,
    });
  }

  const unresolvedDecisionsPastDue = snap.decisions.filter(
    (d) => d.status === "pending" && d.dueAt && new Date(d.dueAt).getTime() < now,
  ).length;
  if (unresolvedDecisionsPastDue) {
    const w = 5 * unresolvedDecisionsPastDue;
    score -= w;
    factors.push({
      code: "decisions_past_due",
      label: "Unresolved decisions past due",
      weight: -w,
      detail: `${unresolvedDecisionsPastDue} × −5`,
      count: unresolvedDecisionsPastDue,
    });
  }

  const milestonesConfidenceLow = snap.milestones.filter(
    (m) =>
      normalizeMilestoneStatus(m.status) === "slipped" ||
      m.confidence === "low" ||
      (isOpenMilestoneStatus(m.status) && (m.progressPercent ?? 0) < 40),
  ).length;
  if (milestonesConfidenceLow) {
    const w = 4 * milestonesConfidenceLow;
    score -= w;
    factors.push({
      code: "milestone_low",
      label: "Low milestone confidence / slip",
      weight: -w,
      detail: `${milestonesConfidenceLow} × −4`,
      count: milestonesConfidenceLow,
    });
  }

  const brokenDeps = snap.dependencies.filter(
    (d) => d.status === "broken" || d.status === "active",
  );
  const brokenOrBlocking = snap.dependencies.filter(
    (d) => d.status === "broken",
  ).length;
  if (brokenOrBlocking) {
    const w = 4 * brokenOrBlocking;
    score -= w;
    factors.push({
      code: "broken_dependencies",
      label: "Broken dependencies",
      weight: -w,
      detail: `${brokenOrBlocking} × −4`,
      count: brokenOrBlocking,
    });
  }
  void brokenDeps;

  const pendingRequiredCheckpoints = snap.checkpoints.filter(
    (c) =>
      c.requiredByProfile &&
      (c.status === "not_started" || c.status === "pending" || c.status === "rejected"),
  ).length;
  if (pendingRequiredCheckpoints) {
    const w = 3 * pendingRequiredCheckpoints;
    score -= w;
    factors.push({
      code: "pending_checkpoints",
      label: "Pending required checkpoints",
      weight: -w,
      detail: `${pendingRequiredCheckpoints} × −3`,
      count: pendingRequiredCheckpoints,
    });
  }

  const openMajorExceptions = snap.exceptions.filter(
    (e) =>
      e.status !== "concluded" && (e.severity === "major" || e.severity === "critical"),
  ).length;
  if (openMajorExceptions) {
    const w = Math.min(15, 5 * openMajorExceptions);
    score -= w;
    factors.push({
      code: "exceptions",
      label: "Open Major/Critical exceptions",
      weight: -w,
      detail: `${openMajorExceptions} open (cap −15)`,
      count: openMajorExceptions,
    });
  }

  // Completion trend: open vs done ratio
  const openC = snap.commitments.filter(
    (c) => c.status !== "done" && c.status !== "cancelled",
  ).length;
  const doneC = snap.commitments.filter((c) => c.status === "done").length;
  let completionTrendPenalty = 0;
  if (openC + doneC > 0 && doneC / (openC + doneC) < 0.35 && openC >= 3) {
    completionTrendPenalty = 8;
    score -= completionTrendPenalty;
    factors.push({
      code: "completion_trend",
      label: "Adverse completion trend",
      weight: -completionTrendPenalty,
      detail: "Completion rate below 35% with ≥3 open",
    });
  }

  score = Math.max(0, Math.min(100, score));
  return {
    projectId,
    score,
    band: band(score),
    factors,
    computedAt: new Date().toISOString(),
  };
}

export function computePulse(projectId: string, snap: OpsSnapshot): ProjectPulseResult {
  const now = Date.now();
  const pressure: string[] = [];
  const aged = snap.waiting.find((w) => isWaitingAged(w, now));
  if (aged) {
    pressure.push(
      `Waiting on ${aged.partyLabel || aged.category} for ${aged.subject} (${daysBetween(aged.since, now)} days).`,
    );
  }
  const crit = snap.risks.find(
    (r) =>
      (r.status === "open" || r.status === "mitigating") &&
      (r.impact === "critical" || r.probability === "critical"),
  );
  if (!pressure.length && crit) {
    pressure.push(`Critical risk open: ${crit.title}.`);
  }
  const rejected = snap.checkpoints.find(
    (c) => c.status === "rejected" && c.releaseClass,
  );
  if (!pressure.length && rejected) {
    pressure.push(`Rejected checkpoint: ${rejected.name}.`);
  }
  const overdue = snap.commitments.find(
    (c) => isOverdueCommitment(c, now) && (c.blocksGoLive || c.priority === "high"),
  );
  if (!pressure.length && overdue) {
    pressure.push(`Overdue blocking commitment: ${overdue.statement}.`);
  }
  const pastDue = snap.decisions.find(
    (d) => d.status === "pending" && d.dueAt && new Date(d.dueAt).getTime() < now,
  );
  if (!pressure.length && pastDue) {
    pressure.push(`Pending decision past due: ${pastDue.title}.`);
  }

  const nextMs = [...snap.milestones]
    .filter((m) => isOpenMilestoneStatus(m.status) && m.targetDate)
    .sort((a, b) => String(a.targetDate).localeCompare(String(b.targetDate)))[0];
  const nextC = [...snap.commitments]
    .filter((c) => c.status !== "done" && c.status !== "cancelled" && c.dueAt)
    .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))[0];

  const trajectory: string[] = [];
  if (nextMs) {
    trajectory.push(
      normalizeMilestoneStatus(nextMs.status) === "slipped"
        ? `Next milestone ${nextMs.name} has slipped.`
        : `Next milestone ${nextMs.name} remains on the working plan.`,
    );
  } else if (nextC) {
    trajectory.push(`Next commitment: ${nextC.statement}.`);
  } else if (!pressure.length) {
    trajectory.push("No operational pressure.");
  }

  const sentences = [...pressure.slice(0, 1), ...trajectory.slice(0, 1)].slice(0, 2);
  if (!sentences.length) sentences.push("No operational pressure.");

  return {
    projectId,
    sentences,
    text: sentences.join(" "),
    computedAt: new Date().toISOString(),
  };
}

export function computeForecast(
  projectId: string,
  snap: OpsSnapshot,
  windowDays: 7 | 14 | 30,
): DeliveryForecastResult {
  const now = Date.now();
  const end = now + windowDays * 86400000;
  const inWindow = (iso?: string) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return t >= now && t <= end;
  };

  const dueCommitments = snap.commitments.filter(
    (c) => c.status !== "done" && c.status !== "cancelled" && inWindow(c.dueAt),
  );
  let onTrack = 0;
  let atRisk = 0;
  let overdueProjected = 0;
  for (const c of dueCommitments) {
    const blocked = c.blockedByDependencyIds.length > 0 || c.status === "waiting";
    const agedWait =
      c.waitingId &&
      snap.waiting.some((w) => w.id === c.waitingId && isWaitingAged(w, now));
    if (isOverdueCommitment(c, now)) overdueProjected += 1;
    else if (blocked || agedWait) atRisk += 1;
    else onTrack += 1;
  }

  const milestonesInWindow = snap.milestones
    .filter((m) => isOpenMilestoneStatus(m.status) && inWindow(m.targetDate))
    .map((m) => ({ id: m.id, name: m.name, dueAt: m.targetDate }));

  const waitsLikelyToAge = snap.waiting.filter((w) => {
    if (w.status !== "active") return false;
    const age = daysBetween(w.since, now);
    return age + windowDays > (w.slaDays || 7);
  }).length;

  const decisionsDue = snap.decisions.filter(
    (d) => d.status === "pending" && inWindow(d.dueAt),
  ).length;
  const checkpointsDue = snap.checkpoints.filter(
    (c) => (c.status === "not_started" || c.status === "pending") && inWindow(c.dueAt),
  ).length;

  const conf = computeDeliveryConfidence(projectId, snap);
  const factors: DeliveryFactor[] = [
    ...conf.factors.slice(0, 6),
    {
      code: "window_load",
      label: `Commitments due in ${windowDays}d`,
      weight: dueCommitments.length,
      detail: `${dueCommitments.length} due (${atRisk} at risk, ${overdueProjected} overdue)`,
      count: dueCommitments.length,
    },
  ];

  let projectedConfidenceDelta = 0;
  if (atRisk + overdueProjected > onTrack) projectedConfidenceDelta -= 8;
  if (waitsLikelyToAge) projectedConfidenceDelta -= 4 * Math.min(3, waitsLikelyToAge);
  if (decisionsDue) projectedConfidenceDelta -= 2 * Math.min(3, decisionsDue);
  if (onTrack > 0 && atRisk === 0 && overdueProjected === 0) {
    projectedConfidenceDelta += 3;
  }

  let predictedOutcome: DeliveryForecastResult["predictedOutcome"] = "on_track";
  if (overdueProjected > 0 || projectedConfidenceDelta <= -10 || conf.band === "Low") {
    predictedOutcome = "off_track";
  } else if (atRisk > 0 || projectedConfidenceDelta < 0 || conf.band === "Medium") {
    predictedOutcome = "at_risk";
  }

  const recommendedActions: ForecastRecommendedAction[] = [];
  if (overdueProjected) {
    recommendedActions.push({
      label: "Clear overdue commitments",
      rationale: "Overdue stock drives off-track forecast",
    });
  }
  if (waitsLikelyToAge) {
    recommendedActions.push({
      label: "Chase aged or ageing waits",
      rationale: "Waiting age reduces predictability",
    });
  }
  if (decisionsDue) {
    recommendedActions.push({
      label: "Decide pending items due in window",
      rationale: "Decision latency reduces confidence",
    });
  }

  const narrativeParts = [
    `Next ${windowDays} days: ${predictedOutcome.replace("_", " ")}.`,
    projectedConfidenceDelta < 0
      ? `Projected confidence change ${projectedConfidenceDelta}.`
      : "Trajectory stable if current plan holds.",
  ];

  return {
    projectId,
    windowDays,
    predictedOutcome,
    confidenceLevel: conf.score,
    confidenceBand: conf.band,
    contributingFactors: factors,
    recommendedActions,
    commitmentsDue: {
      total: dueCommitments.length,
      onTrack,
      atRisk,
      overdueProjected,
    },
    milestonesInWindow,
    waitsLikelyToAge,
    decisionsDue,
    checkpointsDue,
    projectedConfidenceDelta,
    narrative: narrativeParts.slice(0, 2).join(" "),
    computedAt: new Date().toISOString(),
  };
}
