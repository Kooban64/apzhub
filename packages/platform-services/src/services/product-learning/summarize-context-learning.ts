import type {
  ContextLearningSummary,
  ProductLearningEvent,
} from "@apzhub/platform-service-contracts";

const CONTEXT_SECTIONS = [
  "workflow",
  "support",
  "documents",
  "law",
  "knowledge",
] as const;

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/**
 * Pure aggregator — Product Board learning summary from anonymous events.
 */
export function summarizeContextLearning(
  events: readonly ProductLearningEvent[],
  now = new Date(),
): ContextLearningSummary {
  const sectionViews: Record<string, number> = {
    workflow: 0,
    support: 0,
    documents: 0,
    law: 0,
    knowledge: 0,
  };
  const linkFollowThrough: Record<string, number> = {};
  let panelOpened = 0;
  let panelCollapsed = 0;
  let visibleTotal = 0;
  let visibleCount = 0;
  let helpful = 0;
  let notHelpful = 0;
  let loadTotal = 0;
  let loadCount = 0;
  let missingProviderResponses = 0;

  for (const event of events) {
    if (event.featureKey !== "enterprise-context") continue;
    const props = event.properties;

    switch (event.eventName) {
      case "context.panel_opened":
        panelOpened += 1;
        break;
      case "context.panel_collapsed": {
        panelCollapsed += 1;
        const visibleMs = asNumber(props.visibleMs);
        if (visibleMs !== null) {
          visibleTotal += visibleMs;
          visibleCount += 1;
        }
        break;
      }
      case "context.section_viewed": {
        const sectionId = asString(props.sectionId);
        if (sectionId && sectionId in sectionViews) {
          sectionViews[sectionId] = (sectionViews[sectionId] ?? 0) + 1;
        }
        break;
      }
      case "context.link_followed": {
        const target = asString(props.targetProduct) ?? "unknown";
        linkFollowThrough[target] = (linkFollowThrough[target] ?? 0) + 1;
        break;
      }
      case "context.feedback": {
        const rating = asString(props.rating);
        if (rating === "helpful") helpful += 1;
        if (rating === "not_helpful") notHelpful += 1;
        break;
      }
      case "context.load_timed": {
        const totalMs = asNumber(props.totalMs);
        if (totalMs !== null) {
          loadTotal += totalMs;
          loadCount += 1;
        }
        const missing = asNumber(props.missingProviderCount);
        if (missing !== null) missingProviderResponses += missing;
        break;
      }
      default:
        break;
    }
  }

  let mostUsedSection: string | null = null;
  let leastUsedSection: string | null = null;
  let max = -1;
  let min = Number.POSITIVE_INFINITY;
  for (const section of CONTEXT_SECTIONS) {
    const count = sectionViews[section] ?? 0;
    if (count > max) {
      max = count;
      mostUsedSection = section;
    }
    if (count < min) {
      min = count;
      leastUsedSection = section;
    }
  }
  if (max <= 0) {
    mostUsedSection = null;
    leastUsedSection = null;
  }

  const feedbackTotal = helpful + notHelpful;

  return Object.freeze({
    featureKey: "enterprise-context",
    generatedAt: now.toISOString(),
    panelOpened,
    panelCollapsed,
    averageVisibleMs: visibleCount > 0 ? Math.round(visibleTotal / visibleCount) : null,
    sectionViews: Object.freeze({ ...sectionViews }),
    mostUsedSection,
    leastUsedSection,
    linkFollowThrough: Object.freeze({ ...linkFollowThrough }),
    helpful,
    notHelpful,
    helpfulRatio:
      feedbackTotal > 0 ? Number((helpful / feedbackTotal).toFixed(3)) : null,
    averageLoadMs: loadCount > 0 ? Math.round(loadTotal / loadCount) : null,
    missingProviderResponses,
    eventCount: events.length,
  });
}
