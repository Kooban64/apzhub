import type { QuickActionProductId } from "./types";

/** Canonical create / start entry points — APZHUB paths only. */
export const QUICK_ACTION_HREFS = Object.freeze({
  "qa-new-project": "/workspace/projects/new",
  "qa-new-ticket": "/workspace/support/requests/new",
  "qa-log-time": "/workspace/time/timesheets/new",
  "qa-start-workflow": "/workspace/workflow",
  "qa-upload-document": "/workspace/documents",
  "qa-create-knowledge": "/workspace/knowledge/library",
  "qa-run-test": "/workspace/qep/test-plans/new",
} as const);

export type QuickActionId = keyof typeof QUICK_ACTION_HREFS;

export const PRODUCT_HOME: Record<QuickActionProductId, string> = {
  projects: "/workspace/projects",
  support: "/workspace/support",
  time: "/workspace/time",
  workflow: "/workspace/workflow",
  documents: "/workspace/documents",
  knowledge: "/workspace/knowledge",
  qep: "/workspace/qep",
};

export function resolveQuickActionHref(actionId: string): string {
  if (actionId in QUICK_ACTION_HREFS) {
    return QUICK_ACTION_HREFS[actionId as QuickActionId];
  }
  return "/workspace/home";
}
