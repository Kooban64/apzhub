/**
 * W005 / PX-02 — Strategic Objective progress from operational evidence.
 * Progress is never manually edited; derived from contributing projects.
 */

import {
  isAchievedMilestoneStatus,
  normalizeMilestoneStatus,
  type StrategicObjectiveStatus,
} from "@apzhub/platform-service-contracts";

export type ObjectiveEvidenceMilestone = {
  readonly status: string;
  readonly progressPercent?: number;
};

export type ObjectiveEvidenceCommitment = {
  readonly status: string;
};

export type ObjectiveEvidenceBundle = {
  readonly milestones: readonly ObjectiveEvidenceMilestone[];
  readonly commitments: readonly ObjectiveEvidenceCommitment[];
};

export type ObjectiveProgressContributor = {
  readonly code: string;
  readonly label: string;
  readonly impact: number;
};

export type ObjectiveProgressResult = {
  readonly progress: number;
  readonly status: StrategicObjectiveStatus;
  readonly contributors: readonly ObjectiveProgressContributor[];
};

const MILESTONE_WEIGHT = 0.6;
const COMMITMENT_WEIGHT = 0.4;

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Derive objective progress from milestones + commitments across contributing projects.
 * - Milestones: achieved / non-cancelled (weight 60%)
 * - Commitments: done / non-cancelled (weight 40%)
 * Status bands from completion + delivery pressure (slipped / at_risk).
 */
export function computeObjectiveProgress(
  evidence: ObjectiveEvidenceBundle,
  options?: { readonly abandoned?: boolean },
): ObjectiveProgressResult {
  if (options?.abandoned) {
    return {
      progress: 0,
      status: "abandoned",
      contributors: Object.freeze([
        {
          code: "abandoned",
          label: "Objective abandoned",
          impact: 0,
        },
      ]),
    };
  }

  const milestones = evidence.milestones.filter(
    (m) => normalizeMilestoneStatus(m.status) !== "cancelled",
  );
  const commitments = evidence.commitments.filter((c) => c.status !== "cancelled");

  const milestoneAchieved = milestones.filter((m) =>
    isAchievedMilestoneStatus(m.status),
  ).length;
  const milestoneRate =
    milestones.length === 0 ? null : milestoneAchieved / milestones.length;

  const commitmentsDone = commitments.filter((c) => c.status === "done").length;
  const commitmentRate =
    commitments.length === 0 ? null : commitmentsDone / commitments.length;

  const contributors: ObjectiveProgressContributor[] = [];
  let progress: number;

  if (milestoneRate === null && commitmentRate === null) {
    progress = 0;
    contributors.push({
      code: "no_evidence",
      label: "No contributing milestones or commitments yet",
      impact: 0,
    });
  } else if (milestoneRate === null) {
    progress = clampProgress((commitmentRate ?? 0) * 100);
    contributors.push({
      code: "commitments",
      label: `Commitments complete ${commitmentsDone}/${commitments.length}`,
      impact: progress,
    });
  } else if (commitmentRate === null) {
    progress = clampProgress(milestoneRate * 100);
    contributors.push({
      code: "milestones",
      label: `Milestones achieved ${milestoneAchieved}/${milestones.length}`,
      impact: progress,
    });
  } else {
    progress = clampProgress(
      (milestoneRate * MILESTONE_WEIGHT + commitmentRate * COMMITMENT_WEIGHT) * 100,
    );
    contributors.push(
      {
        code: "milestones",
        label: `Milestones achieved ${milestoneAchieved}/${milestones.length}`,
        impact: clampProgress(milestoneRate * 100 * MILESTONE_WEIGHT),
      },
      {
        code: "commitments",
        label: `Commitments complete ${commitmentsDone}/${commitments.length}`,
        impact: clampProgress(commitmentRate * 100 * COMMITMENT_WEIGHT),
      },
    );
  }

  const slipped = milestones.some(
    (m) => normalizeMilestoneStatus(m.status) === "slipped",
  );
  const atRisk = milestones.some(
    (m) => normalizeMilestoneStatus(m.status) === "at_risk",
  );
  const openWaitingPressure = commitments.some((c) => c.status === "waiting");

  let status: StrategicObjectiveStatus;
  if (progress >= 100) {
    status = "achieved";
  } else if (slipped || (progress < 40 && (atRisk || openWaitingPressure))) {
    status = "off_track";
    contributors.push({
      code: "delivery_pressure",
      label: slipped
        ? "Slipped milestones on contributing projects"
        : "Low completion with delivery pressure",
      impact: -20,
    });
  } else if (atRisk || openWaitingPressure || progress < 70) {
    status = "at_risk";
    if (atRisk || openWaitingPressure) {
      contributors.push({
        code: "delivery_pressure",
        label: atRisk
          ? "At-risk milestones on contributing projects"
          : "Waiting commitments on contributing projects",
        impact: -10,
      });
    }
  } else {
    status = "on_track";
  }

  return {
    progress,
    status,
    contributors: Object.freeze(contributors),
  };
}
