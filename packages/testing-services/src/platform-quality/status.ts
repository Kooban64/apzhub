import type {
  PlatformQualityStatus,
  PlatformReleaseReadinessVerdict,
} from "@apzhub/testing-contracts";

/** Higher number = worse quality. */
const QUALITY_RANK: Readonly<Record<PlatformQualityStatus, number>> = {
  healthy: 0,
  unknown: 1,
  degraded: 2,
  at_risk: 3,
  blocked: 4,
};

const READINESS_RANK: Readonly<Record<PlatformReleaseReadinessVerdict, number>> = {
  READY: 0,
  READY_WITH_WARNINGS: 1,
  NOT_READY: 2,
};

export function worstQualityStatus(
  statuses: readonly PlatformQualityStatus[],
): PlatformQualityStatus {
  if (statuses.length === 0) return "unknown";
  let worst: PlatformQualityStatus = statuses[0]!;
  for (const status of statuses) {
    if (QUALITY_RANK[status] > QUALITY_RANK[worst]) {
      worst = status;
    }
  }
  return worst;
}

export function qualityStatusToReadiness(
  status: PlatformQualityStatus,
): PlatformReleaseReadinessVerdict {
  switch (status) {
    case "healthy":
      return "READY";
    case "degraded":
    case "unknown":
      return "READY_WITH_WARNINGS";
    case "at_risk":
    case "blocked":
      return "NOT_READY";
  }
}

export function worstReadinessVerdict(
  verdicts: readonly PlatformReleaseReadinessVerdict[],
): PlatformReleaseReadinessVerdict {
  if (verdicts.length === 0) return "NOT_READY";
  let worst: PlatformReleaseReadinessVerdict = "READY";
  for (const verdict of verdicts) {
    if (READINESS_RANK[verdict] > READINESS_RANK[worst]) {
      worst = verdict;
    }
  }
  return worst;
}

export function combineReadinessVerdicts(
  verdicts: readonly PlatformReleaseReadinessVerdict[],
): PlatformReleaseReadinessVerdict {
  if (verdicts.length === 0) return "READY";
  if (verdicts.every((v) => v === "READY")) return "READY";
  if (verdicts.some((v) => v === "NOT_READY")) return "NOT_READY";
  return "READY_WITH_WARNINGS";
}
