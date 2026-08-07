/** APZ Knowledge workspace routes — Memory Companion (N-03). */

import { isMemoryTypeKey, type MemoryTypeKey } from "./memory-types";

export const KNOWLEDGE_BASE = "/workspace/knowledge";

export type KnowledgeRouteResolution =
  | { readonly kind: "home" }
  | { readonly kind: "memory" }
  | { readonly kind: "memory-type"; readonly type: MemoryTypeKey }
  | { readonly kind: "memory-detail"; readonly memoryId: string }
  | { readonly kind: "lessons" }
  | { readonly kind: "library" }
  | { readonly kind: "decision-knowledge" }
  | { readonly kind: "quality" }
  | { readonly kind: "companion" }
  | { readonly kind: "help" }
  | { readonly kind: "settings" }
  | { readonly kind: "diagnostics" }
  | { readonly kind: "unknown" };

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isKnowledgeRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === KNOWLEDGE_BASE || normalized.startsWith(`${KNOWLEDGE_BASE}/`);
}

export function resolveKnowledgeRoute(pathname: string): KnowledgeRouteResolution {
  const normalized = normalizePath(pathname);
  if (!isKnowledgeRoute(normalized)) {
    return { kind: "unknown" };
  }

  if (normalized === KNOWLEDGE_BASE || normalized === `${KNOWLEDGE_BASE}/home`) {
    return { kind: "home" };
  }

  const exact: Record<string, KnowledgeRouteResolution> = {
    [`${KNOWLEDGE_BASE}/memory`]: { kind: "memory" },
    [`${KNOWLEDGE_BASE}/lessons`]: { kind: "lessons" },
    [`${KNOWLEDGE_BASE}/library`]: { kind: "library" },
    [`${KNOWLEDGE_BASE}/decision-knowledge`]: { kind: "decision-knowledge" },
    [`${KNOWLEDGE_BASE}/quality`]: { kind: "quality" },
    [`${KNOWLEDGE_BASE}/companion`]: { kind: "companion" },
    [`${KNOWLEDGE_BASE}/help`]: { kind: "help" },
    [`${KNOWLEDGE_BASE}/settings`]: { kind: "settings" },
    [`${KNOWLEDGE_BASE}/diagnostics`]: { kind: "diagnostics" },
  };

  const exactHit = exact[normalized];
  if (exactHit) {
    return exactHit;
  }

  const memoryTypePrefix = `${KNOWLEDGE_BASE}/memory/`;
  if (normalized.startsWith(memoryTypePrefix)) {
    const rest = normalized.slice(memoryTypePrefix.length);
    const [segment, maybeId] = rest.split("/");
    if (segment && isMemoryTypeKey(segment) && !maybeId) {
      return { kind: "memory-type", type: segment };
    }
  }

  const objectPrefix = `${KNOWLEDGE_BASE}/objects/`;
  if (normalized.startsWith(objectPrefix)) {
    const memoryId = normalized.slice(objectPrefix.length);
    if (memoryId && !memoryId.includes("/")) {
      return { kind: "memory-detail", memoryId };
    }
  }

  return { kind: "unknown" };
}

export function knowledgeHomePath(): string {
  return KNOWLEDGE_BASE;
}

export function knowledgeMemoryPath(): string {
  return `${KNOWLEDGE_BASE}/memory`;
}

export function knowledgeMemoryTypePath(type: MemoryTypeKey): string {
  return `${KNOWLEDGE_BASE}/memory/${type}`;
}

export function knowledgeMemoryObjectPath(memoryId: string): string {
  return `${KNOWLEDGE_BASE}/objects/${memoryId}`;
}

export function knowledgeCompanionPath(): string {
  return `${KNOWLEDGE_BASE}/companion`;
}

export function knowledgeHelpPath(): string {
  return `${KNOWLEDGE_BASE}/help`;
}

export function knowledgeSettingsPath(): string {
  return `${KNOWLEDGE_BASE}/settings`;
}

export function knowledgeDiagnosticsPath(): string {
  return `${KNOWLEDGE_BASE}/diagnostics`;
}

export function knowledgeLessonsPath(): string {
  return `${KNOWLEDGE_BASE}/lessons`;
}

export function knowledgeLibraryPath(): string {
  return `${KNOWLEDGE_BASE}/library`;
}

export function knowledgeDecisionKnowledgePath(): string {
  return `${KNOWLEDGE_BASE}/decision-knowledge`;
}

export function knowledgeQualityPath(): string {
  return `${KNOWLEDGE_BASE}/quality`;
}
