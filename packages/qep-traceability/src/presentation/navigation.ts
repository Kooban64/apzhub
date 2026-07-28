/** APZQEP-ENG-030C — Traceability Workbench navigation contributions (ARCH-008). */

export const QEP_TRACEABILITY_NAVIGATION = {
  workspace: "qep",
  sidebar: {
    id: "qep-traceability",
    label: "Traceability",
    icon: "git-merge",
    href: "/workspace/qep/traceability",
    order: 100,
    permission: "qep.traceability.trace_links.view",
  },
  additionalViews: [
    {
      id: "qep-traceability-trace-links",
      label: "Trace Links",
      icon: "link-2",
      href: "/workspace/qep/traceability/trace-links",
      order: 101,
      parent: "qep-traceability",
      permission: "qep.traceability.trace_links.view",
    },
    {
      id: "qep-traceability-matrix",
      label: "Trace Matrix",
      icon: "grid-3x3",
      href: "/workspace/qep/traceability/matrix",
      order: 102,
      parent: "qep-traceability",
      permission: "qep.traceability.trace_links.view",
    },
    {
      id: "qep-traceability-taxonomy",
      label: "Trace Taxonomy",
      icon: "tags",
      href: "/workspace/qep/traceability/taxonomy",
      order: 103,
      parent: "qep-traceability",
      permission: "qep.traceability.taxonomy.view",
    },
  ],
} as const;
