import type { EventProcessor, ProcessorRegistry } from "@apzhub/platform-processing";

import type { ProjectionEngine } from "../projection/engine";
import { createKnowledgeIndexEvidenceProcessors } from "./evidence-processors";
import { QEP_KNOWLEDGE_INDEX_VERSION } from "../version";

export const KNOWLEDGE_INDEX_BUNDLE_ID = "qep-knowledge-index" as const;

export type KnowledgeIndexProcessorBundle = {
  readonly bundleId: typeof KNOWLEDGE_INDEX_BUNDLE_ID;
  readonly product: string;
  readonly version: string;
  readonly processors: readonly EventProcessor[];
  registerOnto(platformRegistry: ProcessorRegistry): void;
};

export function createKnowledgeIndexProcessorBundle(
  engine: ProjectionEngine,
): KnowledgeIndexProcessorBundle {
  const processors = createKnowledgeIndexEvidenceProcessors(engine);
  return {
    bundleId: KNOWLEDGE_INDEX_BUNDLE_ID,
    product: "APZQEP Quality Knowledge Index",
    version: QEP_KNOWLEDGE_INDEX_VERSION,
    processors,
    registerOnto(platformRegistry) {
      for (const processor of processors) {
        platformRegistry.register(processor);
      }
    },
  };
}
