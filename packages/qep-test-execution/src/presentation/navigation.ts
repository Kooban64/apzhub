/**
 * APZQEP-ENG-100E — Test Execution Workbench navigation (Document 017).
 * Registered with the Desktop Shell via modules/qep-test-execution/module.yaml.
 */
export const QEP_TEST_EXECUTION_NAVIGATION = {
  workspace: "qep",
  sidebar: {
    id: "qep-test-execution",
    label: "Test Execution",
    icon: "play",
    href: "/workspace/qep/test-execution",
    order: 100,
    permission: "qep.execution.read",
  },
  additionalViews: [
    {
      id: "qep-test-execution-explorer",
      label: "Explorer",
      icon: "list",
      href: "/workspace/qep/test-execution/explorer",
      order: 101,
      permission: "qep.execution.read",
    },
    {
      id: "qep-test-execution-assigned",
      label: "Assigned",
      icon: "user-check",
      href: "/workspace/qep/test-execution/assigned",
      order: 102,
      permission: "qep.execution.read",
    },
    {
      id: "qep-test-execution-review",
      label: "Review",
      icon: "clipboard-check",
      href: "/workspace/qep/test-execution/review",
      order: 103,
      permission: "qep.execution.review",
    },
  ],
} as const;
