import type { KnowledgeSource } from "../types/knowledge-source";
import type { ClientKnowledgeRegistryDiagnostics } from "./client-knowledge-registry-diagnostics";

/**
 * Read-only knowledge source index for browser consumers.
 *
 * The server remains authoritative — clients must not register, replace, or remove sources.
 */
export interface ReadOnlyKnowledgeRegistry {
  has(sourceId: string): boolean;
  get(sourceId: string): KnowledgeSource | undefined;
  list(): readonly KnowledgeSource[];
  getDiagnostics(): ClientKnowledgeRegistryDiagnostics;
}
