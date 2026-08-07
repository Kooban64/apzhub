import type { AnalyticsSuiteKey } from "./routes";

export type AnalyticsCuratedSuite = {
  readonly key: AnalyticsSuiteKey;
  readonly title: string;
  readonly description: string;
  readonly tag: string;
  readonly categoryKey: string;
};

/**
 * Insight answer surfaces (presentation). Not product identity.
 * Labels describe the decision domain of the answer, not "dashboards".
 */
export const ANALYTICS_CURATED_SUITES: readonly AnalyticsCuratedSuite[] = [
  {
    key: "executive",
    title: "Enterprise health answers",
    description:
      "Insight answers for sponsors and leaders reviewing enterprise health.",
    tag: "executive",
    categoryKey: "executive",
  },
  {
    key: "operational",
    title: "Operational attention answers",
    description: "Insight answers for day-to-day attention and intervention.",
    tag: "operational",
    categoryKey: "operational",
  },
  {
    key: "projects",
    title: "Project delivery answers",
    description: "Insight answers about delivery health and project risk.",
    tag: "projects",
    categoryKey: "projects",
  },
  {
    key: "time",
    title: "Effort answers",
    description: "Insight answers about where effort is spent.",
    tag: "time",
    categoryKey: "time",
  },
  {
    key: "support",
    title: "Service answers",
    description: "Insight answers about service health and SLAs.",
    tag: "support",
    categoryKey: "support",
  },
  {
    key: "platform-health",
    title: "Capability health answers",
    description: "Insight answers about platform and capability health.",
    tag: "platform-health",
    categoryKey: "platform-health",
  },
  {
    key: "repository-metrics",
    title: "Quality answers",
    description: "Insight answers about selected quality indicators.",
    tag: "repository-metrics",
    categoryKey: "repository-metrics",
  },
] as const;

export function getCuratedSuite(
  key: AnalyticsSuiteKey,
): AnalyticsCuratedSuite | undefined {
  return ANALYTICS_CURATED_SUITES.find((suite) => suite.key === key);
}
