/**
 * Provider-neutral source identity normalization (QO-012).
 * Never inspects repositories. Never calls SCM providers.
 */

import type {
  NormalizedSourceChangeInput,
  SourceIdentity,
  SourceIdentityKind,
} from "../contracts/source-change";
import { SOURCE_IDENTITY_KINDS } from "../contracts/source-change";
import { OrchestrationError } from "../contracts/errors";

export function isSourceIdentityKind(value: string): value is SourceIdentityKind {
  return (SOURCE_IDENTITY_KINDS as readonly string[]).includes(value);
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

/**
 * Normalize inbound source change identities into immutable SourceIdentity records.
 * Rejects empty refs; does not interpret provider semantics.
 */
export function normalizeSourceIdentities(
  changes: readonly NormalizedSourceChangeInput[],
): {
  readonly identities: readonly SourceIdentity[];
  readonly sourceChangeRefs: readonly string[];
  readonly kindDistribution: Readonly<Record<string, number>>;
} {
  if (!changes.length) {
    throw new OrchestrationError(
      "validation",
      "INVALID_SOURCE_CHANGES",
      "At least one normalized source change is required",
    );
  }

  const identities: SourceIdentity[] = [];
  const sourceChangeRefs: string[] = [];
  const kindDistribution: Record<string, number> = {};

  for (const change of changes) {
    const changeRef = change.changeRef.trim();
    if (!changeRef) {
      throw new OrchestrationError(
        "validation",
        "INVALID_SOURCE_CHANGE_REF",
        "source changeRef is required",
      );
    }
    if (!change.identities?.length) {
      throw new OrchestrationError(
        "validation",
        "INVALID_SOURCE_IDENTITIES",
        `source change ${changeRef} requires at least one identity`,
        { changeRef },
      );
    }
    sourceChangeRefs.push(changeRef);

    for (const raw of change.identities) {
      if (!isSourceIdentityKind(raw.kind)) {
        throw new OrchestrationError(
          "validation",
          "INVALID_SOURCE_IDENTITY_KIND",
          `Unknown source identity kind: ${raw.kind}`,
          { kind: raw.kind },
        );
      }
      const reference = raw.reference.trim();
      if (!reference) {
        throw new OrchestrationError(
          "validation",
          "INVALID_SOURCE_IDENTITY",
          "identity reference is required",
          { kind: raw.kind },
        );
      }
      identities.push(
        Object.freeze({
          identityId: createId("sid"),
          kind: raw.kind,
          reference,
          displayLabel: raw.displayLabel?.trim() || undefined,
          metadata: Object.freeze({
            ...(change.metadata ?? {}),
            ...(raw.metadata ?? {}),
            changeRef,
          }),
        }),
      );
      kindDistribution[raw.kind] = (kindDistribution[raw.kind] ?? 0) + 1;
    }
  }

  return {
    identities: Object.freeze(identities),
    sourceChangeRefs: Object.freeze([...new Set(sourceChangeRefs)]),
    kindDistribution,
  };
}

/** Derive primary package-level refs from identities when not explicitly provided. */
export function derivePrimaryRefs(identities: readonly SourceIdentity[]): {
  readonly repositoryRef?: string;
  readonly branchRef?: string;
  readonly commitRef?: string;
  readonly pullOrMergeRequestRef?: string;
  readonly tagOrReleaseRef?: string;
} {
  const first = (kind: SourceIdentityKind | SourceIdentityKind[]) => {
    const kinds = Array.isArray(kind) ? kind : [kind];
    return identities.find((i) => kinds.includes(i.kind))?.reference;
  };
  return {
    repositoryRef: first("repository"),
    branchRef: first("branch"),
    commitRef: first("commit"),
    pullOrMergeRequestRef: first(["pull_request", "merge_request"]),
    tagOrReleaseRef: first(["tag", "release"]),
  };
}
