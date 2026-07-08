import type { KnowledgeArticleStatus } from "./enums";

/** Platform projection — not a persisted legal entity (domain model §1.7). */
export interface NotificationProjection {
  readonly notificationIntent: string;
  readonly eventId: string;
  readonly recipientUserId: string;
  readonly title: string;
  readonly body: string;
}

/** Platform projection — not a persisted legal entity (domain model §1.7). */
export interface ActivityProjection {
  readonly activityTypeId: string;
  readonly sourceEventId: string;
  readonly actorUserId: string;
  readonly summary: string;
  readonly occurredAt: string;
}

export interface KnowledgeArticle {
  readonly knowledgeArticleId: string;
  readonly articleCode: string;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly practiceAreaIds: readonly string[];
  readonly precedentIds: readonly string[];
  readonly matterTypeIds: readonly string[];
  readonly status: KnowledgeArticleStatus;
  readonly publishedAt?: string;
  readonly authorUserId: string;
}

export interface KnowledgeSearchCriteria {
  readonly query?: string;
  readonly practiceAreaId?: string;
  readonly status?: KnowledgeArticleStatus | "all";
}
