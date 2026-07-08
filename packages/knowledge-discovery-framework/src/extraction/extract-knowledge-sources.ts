import {
  collectKnowledgeSourceManifests,
  hasKnowledgeSources,
  knowledgeSourceManifestSchema,
  type KnowledgeBlockManifest,
} from "@apzhub/platform-runtime/manifest-engine";
import { z } from "zod";

import type { KnowledgeRegistrationIssue } from "../types/knowledge-diagnostics";
import type { KnowledgeSource } from "../types/knowledge-source";
import { mapKnowledgeManifestToSource } from "./map-knowledge-manifest";
import type {
  KnowledgeCapabilityRecord,
  KnowledgeSourceExtractionResult,
} from "./types";

const ACTIVE_LIFECYCLE_STATES = new Set(["active", "healthy"]);

function knowledgeBlockFromManifest(
  manifest: unknown,
): KnowledgeBlockManifest | undefined {
  if (typeof manifest !== "object" || manifest === null || !("knowledge" in manifest)) {
    return undefined;
  }

  return (manifest as { knowledge?: KnowledgeBlockManifest }).knowledge;
}

/**
 * Discover knowledge source descriptors declared in capability manifests.
 * Returns no sources when any validation or duplicate-id error is present (atomic extraction).
 */
export function extractKnowledgeSourcesFromCapabilities(
  records: readonly KnowledgeCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): KnowledgeSourceExtractionResult {
  const activeOnly = options.activeOnly ?? true;
  const sortedRecords = [...records].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  let skippedInactive = 0;
  let skippedWithoutKnowledge = 0;
  const errors: KnowledgeRegistrationIssue[] = [];
  const pending: KnowledgeSource[] = [];
  const seenSourceIds = new Map<string, string>();
  const capabilityIds: string[] = [];

  for (const record of sortedRecords) {
    if (activeOnly && !ACTIVE_LIFECYCLE_STATES.has(record.lifecycleState)) {
      skippedInactive += 1;
      continue;
    }

    if (!hasKnowledgeSources(record.manifest)) {
      skippedWithoutKnowledge += 1;
      continue;
    }

    const knowledge = knowledgeBlockFromManifest(record.manifest);
    if (!knowledge) {
      skippedWithoutKnowledge += 1;
      continue;
    }

    capabilityIds.push(record.id);
    const manifestSources = collectKnowledgeSourceManifests(knowledge);

    for (const rawSource of manifestSources) {
      try {
        const manifestSource = knowledgeSourceManifestSchema.parse(rawSource);
        const source = mapKnowledgeManifestToSource(manifestSource, record);
        const previousCapability = seenSourceIds.get(source.id);

        if (previousCapability) {
          errors.push({
            code: "DUPLICATE_ID",
            sourceId: source.id,
            capabilityId: record.id,
            message: `Duplicate knowledge source id "${source.id}" declared by "${previousCapability}" and "${record.id}"`,
          });
          continue;
        }

        seenSourceIds.set(source.id, record.id);
        pending.push(source);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const firstIssue = error.errors[0];
          errors.push({
            code: "VALIDATION",
            sourceId: typeof rawSource.id === "string" ? rawSource.id : undefined,
            capabilityId: record.id,
            message: firstIssue?.message ?? "Invalid knowledge source manifest",
            field: firstIssue?.path.join("."),
          });
          continue;
        }

        throw error;
      }
    }
  }

  const diagnostics = {
    scannedCapabilities: records.length,
    extractedCount: errors.length === 0 ? pending.length : 0,
    skippedInactive,
    skippedWithoutKnowledge,
    capabilityIds: Object.freeze([...capabilityIds].sort()),
  };

  if (errors.length > 0) {
    return {
      ok: false,
      sources: [],
      diagnostics,
      errors: Object.freeze([...errors]),
    };
  }

  return {
    ok: true,
    sources: Object.freeze([...pending]),
    diagnostics,
    errors: [],
  };
}
