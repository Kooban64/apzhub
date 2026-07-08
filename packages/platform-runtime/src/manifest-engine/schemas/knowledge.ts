import { z } from "zod";

/** Globally unique knowledge source id — lowercase dot notation (ADR-0028). */
export const knowledgeSourceIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9.-]*$/, "Knowledge source id must use lowercase dot notation");

export const KNOWLEDGE_SOURCE_KINDS = [
  "registry-projection",
  "metadata-index",
  "session-store",
  "connector-api",
  "event-index",
  "semantic-index",
  "ai-provider",
] as const;

export const KNOWLEDGE_SOURCE_TIERS = ["T0", "T1", "T2", "T3", "T4"] as const;

export const KNOWLEDGE_DOCUMENT_KINDS = [
  "command",
  "navigation",
  "capability",
  "workspace",
  "preference",
  "notification",
  "activity",
  "document",
  "project",
  "person",
  "custom",
] as const;

/** Canonical manifest entry — `knowledge.sources[]` (DF-004). */
export const knowledgeSourceManifestSchema = z
  .object({
    id: knowledgeSourceIdSchema,
    label: z.string().min(1),
    kind: z.enum(KNOWLEDGE_SOURCE_KINDS),
    tier: z.enum(KNOWLEDGE_SOURCE_TIERS),
    priority: z.number().int().min(0),
    status: z.enum(["active", "planned", "disabled"]).optional(),
    permission: z.string().optional(),
    provides: z.array(z.enum(KNOWLEDGE_DOCUMENT_KINDS)).min(1),
    version: z.string().min(1).optional(),
  })
  .strict();

export const knowledgeBlockSchema = z
  .object({
    sources: z.array(knowledgeSourceManifestSchema).optional(),
  })
  .strict();

/** Optional envelope extension per ADR-0028. */
export const optionalKnowledgeFields = {
  knowledge: knowledgeBlockSchema.optional(),
};

export type KnowledgeSourceManifest = z.infer<typeof knowledgeSourceManifestSchema>;
export type KnowledgeBlockManifest = z.infer<typeof knowledgeBlockSchema>;

export function collectKnowledgeSourceManifests(
  knowledge: KnowledgeBlockManifest,
): readonly KnowledgeSourceManifest[] {
  return knowledge.sources ?? [];
}

export function hasKnowledgeSources(manifest: unknown): manifest is {
  knowledge: KnowledgeBlockManifest & { sources?: KnowledgeSourceManifest[] };
} {
  if (typeof manifest !== "object" || manifest === null || !("knowledge" in manifest)) {
    return false;
  }

  const knowledge = (manifest as { knowledge?: KnowledgeBlockManifest }).knowledge;
  if (!knowledge) {
    return false;
  }

  return collectKnowledgeSourceManifests(knowledge).length > 0;
}
