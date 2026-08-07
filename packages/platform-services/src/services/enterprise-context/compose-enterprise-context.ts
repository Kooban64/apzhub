import type {
  ComposeEnterpriseContextInput,
  ContextFocus,
  ContextSectionId,
  ContextSlice,
  EnterpriseContextComposition,
} from "@apzhub/platform-service-contracts";

/** Consistent section order across all Enterprise Context consumers (CONTEXT-002). */
const SECTION_ORDER: readonly ContextSectionId[] = [
  "projects",
  "workflow",
  "support",
  "documents",
  "law",
  "knowledge",
] as const;

const PRODUCT_LABEL: Record<ContextSectionId, string> = {
  projects: "APZ Projects",
  workflow: "APZ Workflow",
  support: "APZ Support",
  documents: "APZ Documents",
  law: "APZ Law",
  knowledge: "APZ Knowledge",
};

/**
 * Pure composer: provider slices → Enterprise Context composition.
 * Request-scoped projection only — never persists.
 */
export function composeEnterpriseContext(
  slices: readonly ContextSlice[],
  focus: ContextFocus,
  input?: Pick<ComposeEnterpriseContextInput, "now">,
): EnterpriseContextComposition {
  const byId = new Map(slices.map((slice) => [slice.sectionId, slice]));
  const ordered: ContextSlice[] = SECTION_ORDER.map((sectionId) => {
    const slice = byId.get(sectionId);
    if (slice) return slice;
    return Object.freeze({
      providerId: sectionId,
      sectionId,
      productLabel: PRODUCT_LABEL[sectionId],
      fragments: Object.freeze([]),
      absenceReason: "unavailable" as const,
    });
  });

  const partial = ordered.some(
    (slice) => Boolean(slice.error) || slice.absenceReason === "unavailable",
  );

  return Object.freeze({
    focus: Object.freeze({ ...focus }),
    composedAt: (input?.now ?? new Date()).toISOString(),
    compositionOnly: true as const,
    ownsBusinessState: false as const,
    question: "What do I need to know before I continue?" as const,
    slices: Object.freeze(ordered),
    partial,
  });
}
