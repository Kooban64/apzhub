/**
 * Product Learning contracts — APZHUB-CONTEXT-LEARNING-001.
 * Anonymous interaction telemetry for Product Board decisions.
 */

export const PRODUCT_LEARNING_FEATURE_KEYS = ["enterprise-context"] as const;
export type ProductLearningFeatureKey = (typeof PRODUCT_LEARNING_FEATURE_KEYS)[number];

export const CONTEXT_LEARNING_EVENT_NAMES = [
  "context.panel_opened",
  "context.panel_collapsed",
  "context.section_viewed",
  "context.link_followed",
  "context.feedback",
  "context.load_timed",
] as const;

export type ContextLearningEventName = (typeof CONTEXT_LEARNING_EVENT_NAMES)[number];

export type ContextFeedbackRating = "helpful" | "not_helpful";

export interface ProductLearningEvent {
  readonly id: string;
  readonly tenantId: string;
  readonly featureKey: ProductLearningFeatureKey;
  readonly eventName: ContextLearningEventName;
  /** Anonymous properties only — never SoR payloads or user ids. */
  readonly properties: Readonly<Record<string, unknown>>;
  readonly occurredAt: string;
  readonly correlationId?: string;
}

export interface RecordProductLearningEventInput {
  readonly featureKey: ProductLearningFeatureKey;
  readonly eventName: ContextLearningEventName;
  readonly properties?: Readonly<Record<string, unknown>>;
  readonly occurredAt?: string;
  readonly correlationId?: string;
}

export interface ContextLearningSummary {
  readonly featureKey: "enterprise-context";
  readonly generatedAt: string;
  readonly panelOpened: number;
  readonly panelCollapsed: number;
  readonly averageVisibleMs: number | null;
  readonly sectionViews: Readonly<Record<string, number>>;
  readonly mostUsedSection: string | null;
  readonly leastUsedSection: string | null;
  readonly linkFollowThrough: Readonly<Record<string, number>>;
  readonly helpful: number;
  readonly notHelpful: number;
  readonly helpfulRatio: number | null;
  readonly averageLoadMs: number | null;
  readonly missingProviderResponses: number;
  readonly eventCount: number;
}
