/**
 * Enterprise Context composition contracts (APZHUB-CONTEXT-001 / CONTEXT-002).
 * Projection only — never a System of Record.
 */

import type { ServiceRequestContext } from "../common/context";

export const CONTEXT_FOCUS_TYPES = [
  "project",
  "workflow",
  "support",
  "knowledge",
] as const;
export type ContextFocusType = (typeof CONTEXT_FOCUS_TYPES)[number];

export const CONTEXT_PROVIDER_IDS = [
  "projects",
  "workflow",
  "support",
  "documents",
  "law",
  "knowledge",
] as const;
export type ContextProviderId = (typeof CONTEXT_PROVIDER_IDS)[number];

export const CONTEXT_SECTION_IDS = [
  "projects",
  "workflow",
  "support",
  "documents",
  "law",
  "knowledge",
] as const;
export type ContextSectionId = (typeof CONTEXT_SECTION_IDS)[number];

export const CONTEXT_ABSENCE_REASONS = ["none", "denied", "unavailable"] as const;
export type ContextAbsenceReason = (typeof CONTEXT_ABSENCE_REASONS)[number];

/** Fragment class — entity = SoR reference; guidance = honest next-step without fabricated SoR rows. */
export const CONTEXT_FRAGMENT_CLASSES = ["entity", "guidance"] as const;
export type ContextFragmentClass = (typeof CONTEXT_FRAGMENT_CLASSES)[number];

/**
 * Attributed context fragment — references only.
 * Never copies authoritative business payloads as a new SoR.
 */
export interface ContextFragment {
  readonly id: string;
  readonly providerId: ContextProviderId;
  readonly productLabel: string;
  /** Sub-bucket within the section (stage, approvals, open, obligations, …). */
  readonly sectionHint: string;
  readonly title: string;
  readonly summary?: string;
  /** Deep link into the owning product — never an engine URL. */
  readonly href?: string;
  readonly sourceEntityRef?: string;
  readonly fragmentClass: ContextFragmentClass;
  readonly severity?: "info" | "attention" | "critical";
  readonly updatedAt?: string;
}

export interface ContextSlice {
  readonly providerId: ContextProviderId;
  readonly sectionId: ContextSectionId;
  readonly productLabel: string;
  readonly fragments: readonly ContextFragment[];
  readonly absenceReason?: ContextAbsenceReason;
  readonly error?: string;
}

export interface ContextFocus {
  readonly type: ContextFocusType;
  readonly id: string;
  readonly name?: string;
  readonly identifier?: string;
}

/** Operational timing for Product Learning — not business SoR. */
export interface ContextProviderTiming {
  readonly providerId: ContextProviderId;
  readonly durationMs: number;
  readonly status: "ok" | "empty" | "unavailable" | "denied";
}

export interface ContextOperationalTiming {
  readonly totalMs: number;
  readonly providers: readonly ContextProviderTiming[];
}

export interface EnterpriseContextComposition {
  readonly focus: ContextFocus;
  readonly composedAt: string;
  readonly actorId?: string;
  readonly compositionOnly: true;
  readonly ownsBusinessState: false;
  readonly question: "What do I need to know before I continue?";
  readonly slices: readonly ContextSlice[];
  readonly partial: boolean;
  readonly operational?: ContextOperationalTiming;
}

export interface ComposeEnterpriseContextInput {
  readonly focusType: ContextFocusType;
  readonly focusId: string;
  readonly projectName?: string;
  readonly projectIdentifier?: string;
  readonly focusName?: string;
  readonly focusIdentifier?: string;
  readonly now?: Date;
}

/** Platform composition service — orchestrates provider contributions. */
export interface EnterpriseContextCompositionService {
  compose(
    ctx: ServiceRequestContext,
    input: ComposeEnterpriseContextInput,
  ): Promise<EnterpriseContextComposition>;
}
