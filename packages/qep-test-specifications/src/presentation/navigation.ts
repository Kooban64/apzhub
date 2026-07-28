/** APZQEP-ENG-050C — Test Specifications Workbench navigation (OES-ARCH-012). */

export const QEP_TEST_SPECIFICATIONS_NAVIGATION = {
  workspace: "qep",
  sidebar: {
    id: "qep-test-specifications",
    label: "Test Specifications",
    icon: "file-text",
    href: "/workspace/qep/test-specifications",
    order: 90,
    permission: "qep.specification.read",
  },
  additionalViews: [
    {
      id: "qep-test-specifications-dashboard",
      label: "Dashboard",
      icon: "layout-dashboard",
      href: "/workspace/qep/test-specifications",
      order: 91,
      parent: "qep-test-specifications",
      permission: "qep.specification.read",
    },
    {
      id: "qep-test-specifications-explorer",
      label: "Explorer",
      icon: "list",
      href: "/workspace/qep/test-specifications/explorer",
      order: 92,
      parent: "qep-test-specifications",
      permission: "qep.specification.read",
    },
    {
      id: "qep-test-specifications-review",
      label: "Review",
      icon: "clipboard-check",
      href: "/workspace/qep/test-specifications/review",
      order: 93,
      parent: "qep-test-specifications",
      permission: "qep.specification.read",
    },
    {
      id: "qep-test-specifications-search",
      label: "Search",
      icon: "search",
      href: "/workspace/qep/test-specifications/search",
      order: 94,
      parent: "qep-test-specifications",
      permission: "qep.specification.search",
    },
  ],
} as const;
