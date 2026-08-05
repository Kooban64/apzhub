/**
 * Unified Work Experience Composition Layer contracts
 * (APZHUB-CAPABILITY-001-ENG-001).
 *
 * Projection only — never a System of Record for business entities.
 */

import type { ServiceRequestContext } from "../common/context";

/** Shared lifecycle projection — products keep native statuses. */
export const WORK_LIFECYCLE_STATES = [
  "identified",
  "ready",
  "active",
  "waiting",
  "blocked",
  "in_review",
  "done",
  "closed",
] as const;

export type WorkLifecycleState = (typeof WORK_LIFECYCLE_STATES)[number];

/** ENG-001 My Work queues (Owner mockup). */
export const MY_WORK_QUEUE_IDS = [
  "needsMyAttention",
  "dueToday",
  "waitingForOthers",
  "recentlyCompleted",
] as const;

export type MyWorkQueueId = (typeof MY_WORK_QUEUE_IDS)[number];

export const MY_WORK_PRODUCTS = [
  "projects",
  "support",
  "time",
  "qep",
  "workflow",
] as const;

export type MyWorkProduct = (typeof MY_WORK_PRODUCTS)[number];

export const MY_WORK_KINDS = [
  "task",
  "support_request",
  "timesheet",
  "quality_execution",
  "workflow_task",
] as const;

export type MyWorkKind = (typeof MY_WORK_KINDS)[number];

/**
 * Work card — references only. Never copies authoritative business state.
 */
export interface WorkCard {
  readonly id: string;
  readonly product: MyWorkProduct;
  readonly kind: MyWorkKind;
  readonly sourceId: string;
  readonly title: string;
  readonly lifecycle: WorkLifecycleState;
  readonly href: string;
  readonly dueAt?: string;
  readonly priority?: string;
  readonly updatedAt?: string;
  readonly nativeStatus?: string;
  readonly queueHints: readonly MyWorkQueueId[];
  /** Secondary metadata for UI — never primary label. */
  readonly productLabel: string;
}

export interface MyWorkProviderResult {
  readonly providerId: string;
  readonly cards: readonly WorkCard[];
  readonly error?: string;
}

export interface MyWorkComposition {
  readonly composedAt: string;
  readonly actorId?: string;
  readonly displayName?: string;
  readonly compositionOnly: true;
  readonly ownsBusinessState: false;
  readonly queues: {
    readonly needsMyAttention: readonly WorkCard[];
    readonly dueToday: readonly WorkCard[];
    readonly waitingForOthers: readonly WorkCard[];
    readonly recentlyCompleted: readonly WorkCard[];
  };
  readonly providers: readonly MyWorkProviderResult[];
  readonly partial: boolean;
}

export interface ComposeMyWorkInput {
  readonly displayName?: string;
  readonly now?: Date;
}

/** Portfolio composition service — orchestrates product providers. */
export interface MyWorkCompositionService {
  compose(
    ctx: ServiceRequestContext,
    input?: ComposeMyWorkInput,
  ): Promise<MyWorkComposition>;
}
