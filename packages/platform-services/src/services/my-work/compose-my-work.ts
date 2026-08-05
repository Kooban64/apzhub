import type {
  ComposeMyWorkInput,
  MyWorkComposition,
  MyWorkProviderResult,
  MyWorkQueueId,
  WorkCard,
} from "@apzhub/platform-service-contracts";

function uniqueById(cards: readonly WorkCard[]): WorkCard[] {
  const seen = new Set<string>();
  const out: WorkCard[] = [];
  for (const card of cards) {
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    out.push(card);
  }
  return out;
}

function sortByUpdatedDesc(a: WorkCard, b: WorkCard): number {
  const at = a.updatedAt ? Date.parse(a.updatedAt) : 0;
  const bt = b.updatedAt ? Date.parse(b.updatedAt) : 0;
  return bt - at;
}

function inQueue(card: WorkCard, queue: MyWorkQueueId): boolean {
  return card.queueHints.includes(queue);
}

/**
 * Pure composer: provider results → ENG-001 queues.
 * Request-scoped projection only — never persists.
 */
export function composeMyWorkQueues(
  providers: readonly MyWorkProviderResult[],
  input?: ComposeMyWorkInput,
): MyWorkComposition {
  const all = uniqueById(providers.flatMap((p) => p.cards));
  const partial = providers.some((p) => Boolean(p.error));

  return Object.freeze({
    composedAt: (input?.now ?? new Date()).toISOString(),
    actorId: undefined,
    displayName: input?.displayName,
    compositionOnly: true as const,
    ownsBusinessState: false as const,
    queues: Object.freeze({
      needsMyAttention: Object.freeze(
        all.filter((c) => inQueue(c, "needsMyAttention")).sort(sortByUpdatedDesc),
      ),
      dueToday: Object.freeze(
        all.filter((c) => inQueue(c, "dueToday")).sort(sortByUpdatedDesc),
      ),
      waitingForOthers: Object.freeze(
        all.filter((c) => inQueue(c, "waitingForOthers")).sort(sortByUpdatedDesc),
      ),
      recentlyCompleted: Object.freeze(
        all
          .filter((c) => inQueue(c, "recentlyCompleted"))
          .sort(sortByUpdatedDesc)
          .slice(0, 25),
      ),
    }),
    providers: Object.freeze([...providers]),
    partial,
  });
}
