/**
 * Fire-and-forget Product Learning client (APZHUB-CONTEXT-LEARNING-001).
 * Never blocks the Project Context UX.
 */

import type { ContextLearningEventName } from "@apzhub/platform-service-contracts";

const SESSION_KEY = "apzhub.context.learning.session";

export function getAnonymousLearningSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = `cls_${crypto.randomUUID().replace(/-/g, "")}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `cls_${Date.now().toString(36)}`;
  }
}

export function targetProductFromHref(href: string): string {
  if (href.startsWith("/workspace/support")) return "support";
  if (href.startsWith("/workspace/workflow")) return "workflow";
  if (href.startsWith("/workspace/documents")) return "documents";
  if (href.startsWith("/workspace/law")) return "law";
  if (href.startsWith("/workspace/knowledge")) return "knowledge";
  if (href.startsWith("/workspace/projects")) return "projects";
  return "other";
}

export function recordContextLearningEvent(
  eventName: ContextLearningEventName,
  properties: Readonly<Record<string, unknown>> = {},
): void {
  if (typeof window === "undefined") return;
  const payload = {
    eventName,
    properties: {
      sessionId: getAnonymousLearningSessionId(),
      focusType: "project",
      ...properties,
    },
    occurredAt: new Date().toISOString(),
  };

  void fetch("/api/v1/context/learning/events", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Learning must never break the product surface.
  });
}
