/**
 * APZQEP-ENG-070A — Test Plans Workbench navigation (Document 017).
 * Registered with the Desktop Shell via modules/qep-test-plans/module.yaml.
 */
export const QEP_TEST_PLANS_NAVIGATION = {
  workspace: "qep",
  sidebar: {
    id: "qep-test-plans",
    label: "Test Plans",
    icon: "clipboard-list",
    href: "/workspace/qep/test-plans",
    order: 95,
    permission: "qep.plan.read",
  },
  additionalViews: [
    {
      id: "qep-test-plans-explorer",
      label: "Explorer",
      icon: "list",
      href: "/workspace/qep/test-plans/explorer",
      order: 96,
      permission: "qep.plan.read",
    },
    {
      id: "qep-test-plans-review",
      label: "Review",
      icon: "clipboard-check",
      href: "/workspace/qep/test-plans/review",
      order: 97,
      permission: "qep.plan.read",
    },
    {
      id: "qep-test-plans-search",
      label: "Search",
      icon: "search",
      href: "/workspace/qep/test-plans/search",
      order: 98,
      permission: "qep.plan.search",
    },
  ],
} as const;
