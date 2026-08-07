/**
 * W006 indicative Team Health / Delivery Capacity / Resource Forecast.
 */

import type {
  DeliveryCapacity,
  DeliveryCapacityBand,
  ResourceForecast,
  TeamHealth,
  TeamHealthBand,
  TeamHealthFactor,
} from "@apzhub/platform-service-contracts";

export type TeamSignalInput = {
  readonly teamId: string;
  readonly memberCount: number;
  readonly openCommitments: number;
  readonly agedWaits: number;
  readonly openExceptions: number;
  readonly escalations: number;
  readonly slippedMilestones: number;
  readonly avgConfidence: number;
  readonly dueIn7: number;
  readonly dueIn14: number;
  readonly dueIn30: number;
};

function now() {
  return new Date().toISOString();
}

function bandHealth(score: number): TeamHealthBand {
  if (score >= 70) return "healthy";
  if (score >= 40) return "attention";
  return "critical";
}

function bandCapacity(loadPerMember: number): DeliveryCapacityBand {
  if (loadPerMember <= 3) return "available";
  if (loadPerMember <= 6) return "constrained";
  return "overloaded";
}

export function computeTeamHealth(input: TeamSignalInput): TeamHealth {
  const factors: TeamHealthFactor[] = [];
  let score = 100;

  // Delivery stability
  if (input.slippedMilestones > 0 || input.openExceptions > 0) {
    const impact = Math.min(
      30,
      input.slippedMilestones * 10 + input.openExceptions * 8,
    );
    score -= impact;
    factors.push({
      code: "delivery_stability",
      label: `Slip/exception pressure (${input.slippedMilestones} slipped · ${input.openExceptions} exceptions)`,
      impact: -impact,
    });
  }

  // Assignment pressure
  const load =
    input.memberCount === 0
      ? input.openCommitments
      : input.openCommitments / Math.max(1, input.memberCount);
  if (input.memberCount === 0) {
    score -= 65;
    factors.push({
      code: "assignment_pressure",
      label: "No active members",
      impact: -65,
    });
  } else if (load > 6) {
    score -= 25;
    factors.push({
      code: "assignment_pressure",
      label: "Overloaded assignment pressure (indicative)",
      impact: -25,
    });
  } else if (load > 3) {
    score -= 12;
    factors.push({
      code: "assignment_pressure",
      label: "Elevated assignment pressure (indicative)",
      impact: -12,
    });
  }

  // Waiting exposure
  if (input.agedWaits > 0) {
    const impact = Math.min(25, input.agedWaits * 10);
    score -= impact;
    factors.push({
      code: "waiting_exposure",
      label: `${input.agedWaits} aged waits chased/owned by team`,
      impact: -impact,
    });
  }

  // Escalation load
  if (input.escalations > 0) {
    const impact = Math.min(20, input.escalations * 8);
    score -= impact;
    factors.push({
      code: "escalation_frequency",
      label: `${input.escalations} escalations involving team principals`,
      impact: -impact,
    });
  }

  // Delivery confidence contribution
  if (input.avgConfidence > 0 && input.avgConfidence < 60) {
    const impact = Math.round((60 - input.avgConfidence) / 3);
    score -= impact;
    factors.push({
      code: "confidence_contribution",
      label: `Aggregate delivery confidence ${Math.round(input.avgConfidence)}`,
      impact: -impact,
    });
  } else if (input.avgConfidence >= 60) {
    factors.push({
      code: "confidence_contribution",
      label: `Aggregate delivery confidence ${Math.round(input.avgConfidence)}`,
      impact: 0,
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return {
    teamId: input.teamId,
    score,
    band: bandHealth(score),
    factors: Object.freeze(factors),
    computedAt: now(),
    indicative: true,
  };
}

export function computeDeliveryCapacity(input: TeamSignalInput): DeliveryCapacity {
  const load =
    input.memberCount === 0
      ? input.openCommitments
      : input.openCommitments / Math.max(1, input.memberCount);
  const factors: TeamHealthFactor[] = [
    {
      code: "open_commitments",
      label: `${input.openCommitments} open commitments across ${input.memberCount} members`,
      impact: Math.round(load * 10),
    },
  ];
  if (input.agedWaits > 0) {
    factors.push({
      code: "waiting_dependencies",
      label: `${input.agedWaits} aged waits`,
      impact: input.agedWaits * 5,
    });
  }
  return {
    scopeType: "team",
    scopeId: input.teamId,
    band: bandCapacity(load),
    memberCount: input.memberCount,
    openCommitmentLoad: Math.round(load * 10) / 10,
    factors: Object.freeze(factors),
    computedAt: now(),
    indicative: true,
  };
}

export function computeResourceForecast(input: TeamSignalInput): ResourceForecast {
  const perMember = Math.max(1, input.memberCount);
  const buckets = [
    {
      windowDays: 7,
      dueCommitments: input.dueIn7,
      pressureBand: bandCapacity(input.dueIn7 / perMember),
    },
    {
      windowDays: 14,
      dueCommitments: input.dueIn14,
      pressureBand: bandCapacity(input.dueIn14 / perMember),
    },
    {
      windowDays: 30,
      dueCommitments: input.dueIn30,
      pressureBand: bandCapacity(input.dueIn30 / perMember),
    },
  ] as const;
  return {
    teamId: input.teamId,
    buckets: Object.freeze([...buckets]),
    computedAt: now(),
    indicative: true,
  };
}
