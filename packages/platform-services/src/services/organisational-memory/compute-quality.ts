import type {
  KnowledgeObject,
  KnowledgeQualityIssue,
  KnowledgeQualityReport,
} from "@apzhub/platform-service-contracts";

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Rule-based knowledge quality — no AI.
 */
export function computeKnowledgeQuality(
  objects: readonly KnowledgeObject[],
  now: Date = new Date(),
): KnowledgeQualityReport {
  const nowMs = now.getTime();
  const issues: KnowledgeQualityIssue[] = [];
  const byTitle = new Map<string, KnowledgeObject[]>();

  for (const object of objects) {
    const key = normalizeTitle(object.title);
    const group = byTitle.get(key) ?? [];
    group.push(object);
    byTitle.set(key, group);

    if (!object.owner.trim()) {
      issues.push({
        objectId: object.id,
        title: object.title,
        code: "missing_owner",
        message: "Knowledge object has no owner.",
        severity: "error",
      });
    }

    if (object.status === "approved" && !object.reviewDate) {
      issues.push({
        objectId: object.id,
        title: object.title,
        code: "missing_review_date",
        message: "Approved knowledge should have a review date.",
        severity: "warning",
      });
    }

    if (object.expiresAt && Date.parse(object.expiresAt) < nowMs) {
      issues.push({
        objectId: object.id,
        title: object.title,
        code: "expired",
        message: "Knowledge object has expired.",
        severity: "error",
      });
    } else if (object.reviewDate && Date.parse(object.reviewDate) < nowMs) {
      issues.push({
        objectId: object.id,
        title: object.title,
        code: "stale_review",
        message: "Review date has passed — content may be stale.",
        severity: "warning",
      });
    }
  }

  let duplicateGroups = 0;
  for (const group of byTitle.values()) {
    if (group.length < 2) continue;
    duplicateGroups += 1;
    for (const object of group) {
      issues.push({
        objectId: object.id,
        title: object.title,
        code: "duplicate_title",
        message: `Duplicate title shared by ${group.length} knowledge objects.`,
        severity: "warning",
      });
    }
  }

  const staleCount = issues.filter(
    (issue) => issue.code === "expired" || issue.code === "stale_review",
  ).length;

  return Object.freeze({
    totalObjects: objects.length,
    approvedCount: objects.filter((o) => o.status === "approved").length,
    draftCount: objects.filter((o) => o.status === "draft").length,
    reviewCount: objects.filter((o) => o.status === "review").length,
    archivedCount: objects.filter((o) => o.status === "archived").length,
    staleCount,
    duplicateGroups,
    issues: Object.freeze(issues),
    computedAt: now.toISOString(),
  });
}
