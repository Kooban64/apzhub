import type { KnowledgeSource } from "../types/knowledge-source";

function freezeKnowledgeSource(source: KnowledgeSource): KnowledgeSource {
  return Object.freeze({
    ...source,
    provides: Object.freeze([...source.provides]),
  });
}

export function freezeKnowledgeSources(
  sources: readonly KnowledgeSource[],
): readonly KnowledgeSource[] {
  return Object.freeze(sources.map((source) => freezeKnowledgeSource(source)));
}

export { freezeKnowledgeSource };
