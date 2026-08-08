import type { ActivityDocument } from "@apzhub/activity-timeline-framework/server";

const PRODUCT_HOME: Record<string, string> = {
  platform: "/workspace/home",
  projects: "/workspace/projects",
  support: "/workspace/support",
  workflow: "/workspace/workflows",
  knowledge: "/workspace/knowledge",
  documents: "/workspace/knowledge",
  time: "/workspace/time",
  analytics: "/workspace/analytics",
  qep: "/workspace/qep",
  observe: "/workspace/observability",
  notifications: "/workspace/notifications/inbox",
  search: "/workspace/home",
  administration: "/workspace/administration",
};

const LABELS: Record<string, string> = {
  platform: "Platform",
  projects: "Projects",
  support: "Support",
  workflow: "Workflow",
  knowledge: "Knowledge",
  documents: "Knowledge",
  time: "Time",
  analytics: "Analytics",
  qep: "QEP",
  observe: "Observe",
  notifications: "Notifications",
  search: "Search",
  administration: "Administration",
};

/** Derive product id from activity type / publisher (no schema break). */
export function deriveActivityProduct(doc: ActivityDocument): string {
  const fromPayload = doc.metadata.payloadSummary?.productId;
  if (typeof fromPayload === "string" && fromPayload.trim()) {
    return fromPayload.trim().toLowerCase();
  }
  const typePrefix = doc.activityTypeId.split(".")[0]?.toLowerCase();
  if (typePrefix && typePrefix !== "capability") {
    return typePrefix;
  }
  const publisher = doc.metadata.publisher.toLowerCase();
  if (publisher.includes("support")) return "support";
  if (publisher.includes("project")) return "projects";
  if (publisher.includes("qep")) return "qep";
  return "platform";
}

export function activityProductLabel(productId: string): string {
  return LABELS[productId] ?? productId;
}

export function resolveActivityDeepLink(doc: ActivityDocument): string {
  const productId = deriveActivityProduct(doc);
  const home = PRODUCT_HOME[productId] ?? "/workspace/home";
  const summary = doc.metadata.payloadSummary;
  const href =
    (typeof summary?.href === "string" && summary.href) ||
    (typeof summary?.navigationTarget === "string" && summary.navigationTarget) ||
    (typeof summary?.sourceObjectRef === "string" && summary.sourceObjectRef) ||
    "";
  if (!href) {
    return home;
  }
  if (/^https?:\/\//i.test(href)) {
    return home;
  }
  if (href.startsWith("/workspace/")) {
    return href;
  }
  if (href.startsWith("/")) {
    return `/workspace${href}`;
  }
  return home;
}
