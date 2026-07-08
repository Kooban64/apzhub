/** Seed assignees for Task Management UX validation (LAW-005-01). */
export interface SeedTaskAssignee {
  readonly assigneeUserId: string;
  readonly displayName: string;
}

export const SEED_TASK_ASSIGNEES: readonly SeedTaskAssignee[] = [
  {
    assigneeUserId: "a1000001-0001-4000-8000-000000000001",
    displayName: "Sarah Mitchell",
  },
  {
    assigneeUserId: "a1000001-0001-4000-8000-000000000002",
    displayName: "James Okafor",
  },
  { assigneeUserId: "a1000001-0001-4000-8000-000000000003", displayName: "Emily Chen" },
  {
    assigneeUserId: "a1000001-0001-4000-8000-000000000004",
    displayName: "Marcus Reid",
  },
  {
    assigneeUserId: "a1000001-0001-4000-8000-000000000005",
    displayName: "Priya Sharma",
  },
  { assigneeUserId: "user-legal-workbench", displayName: "Legal Workbench User" },
];

export function getAssigneeDisplayName(assigneeUserId: string): string {
  return (
    SEED_TASK_ASSIGNEES.find((assignee) => assignee.assigneeUserId === assigneeUserId)
      ?.displayName ?? assigneeUserId
  );
}
