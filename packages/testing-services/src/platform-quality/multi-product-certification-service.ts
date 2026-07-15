import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  MultiProductCertificationAggregate,
  MultiProductCertificationInput,
  MultiProductCertificationService,
} from "@apzhub/testing-contracts";

import type { Clock } from "../services/types";

export interface MultiProductCertificationServiceDeps {
  readonly now: Clock;
}

function classifyCertificationStatus(
  status: string,
): "approved" | "pending" | "rejected" | "other" {
  const lower = status.toLowerCase();
  if (
    lower.includes("reject") ||
    lower === "failed_certification" ||
    lower.includes("fail")
  ) {
    return "rejected";
  }
  if (
    lower.includes("approved") ||
    lower.includes("certified") ||
    lower === "conditional_approval" ||
    lower === "production_ready"
  ) {
    return "approved";
  }
  if (
    lower.includes("pending") ||
    lower.includes("awaiting") ||
    lower.includes("preparing") ||
    lower.includes("review") ||
    lower.includes("draft") ||
    lower.includes("ready") ||
    lower.includes("required") ||
    lower.includes("expired") ||
    lower.includes("archived")
  ) {
    return "pending";
  }
  return "other";
}

export function createMultiProductCertificationService(
  deps: MultiProductCertificationServiceDeps,
): MultiProductCertificationService {
  const { now } = deps;

  return {
    async aggregate(
      _ctx: ServiceRequestContext,
      input: MultiProductCertificationInput,
    ): Promise<MultiProductCertificationAggregate> {
      let approvedCount = 0;
      let pendingCount = 0;
      let rejectedCount = 0;

      for (const record of input.records) {
        const kind = classifyCertificationStatus(record.status);
        if (kind === "approved") approvedCount += 1;
        else if (kind === "rejected") rejectedCount += 1;
        else if (kind === "pending") pendingCount += 1;
      }

      let overallLabel = "none";
      if (input.records.length === 0) {
        overallLabel = "no_records";
      } else if (rejectedCount > 0) {
        overallLabel = "has_rejected";
      } else if (pendingCount > 0) {
        overallLabel = "has_pending";
      } else if (approvedCount === input.records.length) {
        overallLabel = "all_approved";
      } else {
        overallLabel = "mixed";
      }

      return {
        scope: input.scope,
        productIds: input.productIds,
        records: input.records,
        approvedCount,
        pendingCount,
        rejectedCount,
        overallLabel,
        computedAt: now(),
        isNewCertificationEngine: false,
      };
    },
  };
}
