import type { ClientKnowledgeRegistryDiagnostics } from "../client-knowledge-registry-diagnostics";
import type { KnowledgeQueryClient } from "../query/knowledge-query-client";
import { DefaultKnowledgeService } from "./default-knowledge-service";
import type { KnowledgeService } from "./knowledge-service";

export interface CreateKnowledgeServiceOptions {
  readonly queryClient: KnowledgeQueryClient;
  readonly registryReady?: boolean;
  readonly registryDiagnostics?: ClientKnowledgeRegistryDiagnostics;
}

export function createKnowledgeService(
  options: CreateKnowledgeServiceOptions,
): KnowledgeService {
  return new DefaultKnowledgeService(options);
}
