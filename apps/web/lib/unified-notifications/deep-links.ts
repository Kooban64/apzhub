const PRODUCT_HOME: Record<string, string> = {
  projects: "/workspace/projects",
  support: "/workspace/support",
  workflow: "/workspace/workflows",
  workflows: "/workspace/workflows",
  documents: "/workspace/knowledge",
  knowledge: "/workspace/knowledge",
  time: "/workspace/time",
  analytics: "/workspace/analytics",
  reporting: "/workspace/analytics",
  qep: "/workspace/qep",
  observe: "/workspace/observe",
  platform: "/workspace/home",
  administration: "/workspace/administration",
  unknown: "/workspace/home",
};

/** Product paths only — never provider origins. */
export function resolveNotificationDeepLink(input: {
  readonly sourceProduct: string;
  readonly sourceObjectRef?: string;
}): string | undefined {
  const product = input.sourceProduct.trim().toLowerCase();
  const home = PRODUCT_HOME[product] ?? "/workspace/home";
  const ref = input.sourceObjectRef?.trim();
  if (!ref) {
    return home;
  }
  if (/^https?:\/\//i.test(ref)) {
    return home;
  }
  if (ref.startsWith("/workspace/")) {
    return ref;
  }
  if (ref.startsWith("/")) {
    return `/workspace${ref}`;
  }
  // Opaque object ids → product home (safe default)
  return home;
}

export function productLabel(sourceProduct: string): string {
  const key = sourceProduct.trim().toLowerCase();
  const labels: Record<string, string> = {
    projects: "Projects",
    support: "Support",
    workflow: "Workflow",
    workflows: "Workflow",
    documents: "Knowledge",
    knowledge: "Knowledge",
    time: "Time",
    analytics: "Analytics",
    reporting: "Analytics",
    qep: "QEP",
    observe: "Observe",
    platform: "Platform",
    administration: "Administration",
    unknown: "Other",
  };
  return labels[key] ?? sourceProduct;
}
