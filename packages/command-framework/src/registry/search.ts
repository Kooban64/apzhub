import type { ActionDescriptor } from "../types";
import { sortActionDescriptors } from "./filter-action-descriptors";

export interface ActionSearchScorable {
  readonly id: string;
  readonly label: string;
}

/**
 * Score an action against a palette query.
 * Higher scores rank earlier — prefix matches beat substring matches; subsequence fuzzy is weakest.
 */
export function scoreActionSearchMatch(
  label: string,
  id: string,
  query: string,
): number {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return 1;
  }

  const normalizedLabel = label.toLowerCase();
  const normalizedId = id.toLowerCase();

  if (normalizedLabel === normalizedQuery) {
    return 1_000;
  }
  if (normalizedId === normalizedQuery) {
    return 950;
  }
  if (normalizedLabel.startsWith(normalizedQuery)) {
    return 800;
  }
  if (normalizedId.startsWith(normalizedQuery)) {
    return 750;
  }
  if (normalizedLabel.includes(normalizedQuery)) {
    return 500;
  }
  if (normalizedId.includes(normalizedQuery)) {
    return 450;
  }

  const labelWords = normalizedLabel.split(/[\s.-]+/);
  if (labelWords.some((word) => word.startsWith(normalizedQuery))) {
    return 400;
  }

  if (isSubsequenceMatch(normalizedLabel, normalizedQuery)) {
    return 200 + normalizedQuery.length;
  }
  if (isSubsequenceMatch(normalizedId, normalizedQuery)) {
    return 150 + normalizedQuery.length;
  }

  return 0;
}

function isSubsequenceMatch(text: string, query: string): boolean {
  let queryIndex = 0;

  for (let index = 0; index < text.length && queryIndex < query.length; index += 1) {
    if (text[index] === query[queryIndex]) {
      queryIndex += 1;
    }
  }

  return queryIndex === query.length;
}

/** Rank action descriptors by fuzzy search relevance, preserving stable tie-break order. */
export function searchActionDescriptors(
  descriptors: readonly ActionDescriptor[],
  query: string,
): readonly ActionDescriptor[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return sortActionDescriptors(descriptors);
  }

  const ranked = descriptors
    .map((descriptor, index) => ({
      descriptor,
      index,
      score: scoreActionSearchMatch(descriptor.label, descriptor.id, normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return left.index - right.index;
    });

  return Object.freeze(ranked.map((entry) => entry.descriptor));
}

/** Rank generic command rows for palette presentation layers. */
export function searchScorableItems<T extends ActionSearchScorable>(
  items: readonly T[],
  query: string,
): readonly T[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return items;
  }

  const ranked = items
    .map((item, index) => ({
      item,
      index,
      score: scoreActionSearchMatch(item.label, item.id, normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return left.index - right.index;
    });

  return Object.freeze(ranked.map((entry) => entry.item));
}
