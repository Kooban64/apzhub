/**
 * Sole UI authority for executable actions — ADR-0083 / PART-03 §2.3.
 */

import type { DomainPolicyConfig } from "../domain/test-execution/policies";
import { DomainPolicyDefaults } from "../domain/test-execution/policies";
import type { TestExecution } from "../domain/test-execution/test-execution";
import type { ExecutionStatus } from "../domain/test-execution/value-objects";
import type { ExecutionActionDescriptor } from "./dto/execution-dto";
import { EXECUTION_PERMISSIONS } from "./permissions";

type ActionRule = {
  readonly action: string;
  readonly label: string;
  readonly permission: string;
  readonly requiresConfirmation: boolean;
  readonly reasonRequired: boolean;
  readonly dangerous?: boolean;
  readonly statuses: readonly ExecutionStatus[];
  readonly role?: "executor" | "reviewer" | "owner" | "any";
  readonly policy?: (policy: DomainPolicyConfig) => boolean;
};

const ACTION_RULES: readonly ActionRule[] = [
  {
    action: "prepareExecution",
    label: "Prepare",
    permission: EXECUTION_PERMISSIONS.PREPARE,
    requiresConfirmation: false,
    reasonRequired: false,
    statuses: ["draft"],
    role: "any",
  },
  {
    action: "assignExecutor",
    label: "Assign",
    permission: EXECUTION_PERMISSIONS.ASSIGN,
    requiresConfirmation: false,
    reasonRequired: false,
    statuses: ["ready", "assigned"],
    role: "any",
  },
  {
    action: "startExecution",
    label: "Start",
    permission: EXECUTION_PERMISSIONS.EXECUTE,
    requiresConfirmation: false,
    reasonRequired: false,
    statuses: ["assigned"],
    role: "executor",
  },
  {
    action: "recordStepResult",
    label: "Record step result",
    permission: EXECUTION_PERMISSIONS.EXECUTE,
    requiresConfirmation: false,
    reasonRequired: false,
    statuses: ["in_progress"],
    role: "executor",
  },
  {
    action: "associateEvidence",
    label: "Associate evidence",
    permission: EXECUTION_PERMISSIONS.EXECUTE,
    requiresConfirmation: false,
    reasonRequired: false,
    statuses: [
      "draft",
      "ready",
      "assigned",
      "in_progress",
      "paused",
      "blocked",
      "completed",
      "submitted_for_review",
      "rejected",
    ],
    role: "executor",
  },
  {
    action: "recordObservation",
    label: "Record observation",
    permission: EXECUTION_PERMISSIONS.EXECUTE,
    requiresConfirmation: false,
    reasonRequired: false,
    statuses: [
      "draft",
      "ready",
      "assigned",
      "in_progress",
      "paused",
      "blocked",
      "completed",
      "submitted_for_review",
      "rejected",
    ],
    role: "executor",
  },
  {
    action: "pauseExecution",
    label: "Pause",
    permission: EXECUTION_PERMISSIONS.CONTROL,
    requiresConfirmation: false,
    reasonRequired: false,
    statuses: ["in_progress"],
    role: "any",
  },
  {
    action: "blockExecution",
    label: "Block",
    permission: EXECUTION_PERMISSIONS.CONTROL,
    requiresConfirmation: true,
    reasonRequired: true,
    statuses: ["in_progress"],
    role: "any",
  },
  {
    action: "resumeExecution",
    label: "Resume",
    permission: EXECUTION_PERMISSIONS.CONTROL,
    requiresConfirmation: false,
    reasonRequired: false,
    statuses: ["paused", "blocked"],
    role: "any",
  },
  {
    action: "completeExecution",
    label: "Complete",
    permission: EXECUTION_PERMISSIONS.EXECUTE,
    requiresConfirmation: true,
    reasonRequired: false,
    statuses: ["in_progress"],
    role: "executor",
  },
  {
    action: "submitForReview",
    label: "Submit for review",
    permission: EXECUTION_PERMISSIONS.EXECUTE,
    requiresConfirmation: false,
    reasonRequired: false,
    statuses: ["completed"],
    role: "executor",
    policy: (p) => p.reviewRequired,
  },
  {
    action: "acceptExecution",
    label: "Accept",
    permission: EXECUTION_PERMISSIONS.REVIEW,
    requiresConfirmation: true,
    reasonRequired: false,
    dangerous: true,
    statuses: ["submitted_for_review", "completed"],
    role: "reviewer",
  },
  {
    action: "rejectExecution",
    label: "Reject",
    permission: EXECUTION_PERMISSIONS.REVIEW,
    requiresConfirmation: true,
    reasonRequired: true,
    dangerous: true,
    statuses: ["submitted_for_review"],
    role: "reviewer",
  },
  {
    action: "cancelExecution",
    label: "Cancel",
    permission: EXECUTION_PERMISSIONS.CONTROL,
    requiresConfirmation: true,
    reasonRequired: false,
    dangerous: true,
    statuses: [
      "draft",
      "ready",
      "assigned",
      "in_progress",
      "paused",
      "blocked",
      "completed",
      "submitted_for_review",
      "rejected",
    ],
    role: "any",
  },
  {
    action: "supersedeExecution",
    label: "Supersede",
    permission: EXECUTION_PERMISSIONS.SUPERSEDE,
    requiresConfirmation: true,
    reasonRequired: false,
    dangerous: true,
    statuses: ["accepted", "rejected"],
    role: "any",
  },
];

function hasPermission(
  permissions: readonly string[] | undefined,
  required: string,
): boolean {
  if (!permissions || permissions.length === 0) {
    return true;
  }
  if (
    permissions.includes(EXECUTION_PERMISSIONS.WILDCARD) ||
    permissions.includes(EXECUTION_PERMISSIONS.ADMIN)
  ) {
    return true;
  }
  return permissions.includes(required);
}

function matchesRole(
  execution: AvailableActionsExecutionView,
  actorId: string | undefined,
  role: ActionRule["role"],
  policy: DomainPolicyConfig,
  permissions: readonly string[] | undefined,
): boolean {
  if (!role || role === "any") {
    return true;
  }
  if (
    permissions?.includes(EXECUTION_PERMISSIONS.ADMIN) ||
    permissions?.includes(EXECUTION_PERMISSIONS.WILDCARD)
  ) {
    return true;
  }
  if (!actorId) {
    return true;
  }
  const { assignment } = execution;
  if (role === "owner") {
    return assignment.ownerId === actorId;
  }
  if (role === "executor") {
    return (
      assignment.executorId === actorId ||
      assignment.agentIdentity === actorId ||
      assignment.ownerId === actorId
    );
  }
  if (role === "reviewer") {
    if (
      policy.reviewerMustDifferFromExecutor &&
      assignment.executorId &&
      assignment.executorId === actorId
    ) {
      return false;
    }
    return (
      !assignment.reviewerId ||
      assignment.reviewerId === actorId ||
      assignment.ownerId === actorId
    );
  }
  return true;
}

export type AvailableActionsExecutionView = {
  readonly status: ExecutionStatus;
  readonly assignment: Pick<
    TestExecution["assignment"],
    "ownerId" | "executorId" | "reviewerId" | "agentIdentity"
  >;
  readonly supersededById?: string;
};

export type AvailableActionsInput = {
  readonly execution: AvailableActionsExecutionView;
  readonly permissions?: readonly string[];
  readonly actorId?: string;
  readonly policy?: DomainPolicyConfig;
};

export function computeAvailableActions(
  input: AvailableActionsInput,
): readonly ExecutionActionDescriptor[] {
  const policy = input.policy ?? DomainPolicyDefaults;
  const actions: ExecutionActionDescriptor[] = [];

  for (const rule of ACTION_RULES) {
    if (!rule.statuses.includes(input.execution.status)) {
      continue;
    }
    if (rule.action === "acceptExecution") {
      if (input.execution.status === "completed" && !policy.fastPathAccept) {
        continue;
      }
      if (
        input.execution.status === "submitted_for_review" ||
        (input.execution.status === "completed" && policy.fastPathAccept)
      ) {
        // allowed
      } else {
        continue;
      }
    }
    if (rule.policy && !rule.policy(policy)) {
      continue;
    }
    if (!hasPermission(input.permissions, rule.permission)) {
      continue;
    }
    if (
      !matchesRole(input.execution, input.actorId, rule.role, policy, input.permissions)
    ) {
      continue;
    }
    if (rule.action === "supersedeExecution" && input.execution.supersededById) {
      continue;
    }
    actions.push({
      action: rule.action,
      label: rule.label,
      requiresConfirmation: rule.requiresConfirmation,
      reasonRequired: rule.reasonRequired,
      ...(rule.dangerous ? { dangerous: true } : {}),
    });
  }

  return actions;
}
