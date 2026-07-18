/**
 * Workflow Platform foundation composition (APZWORKFLOW-001).
 * Wires validators + lifecycle with explicit repository ports — NO silent memory.
 */

import {
  validateWorkflow,
  type ValidateWorkflowInput,
} from "../validation/validate-workflow";
import {
  assertWorkflowLifecycleTransition,
  canTransitionWorkflowLifecycle,
  listAllowedWorkflowLifecycleTransitions,
} from "../lifecycle/transitions";
import type { WorkflowFoundationRepos } from "../ports/repository-ports";
import { WorkflowDomainError } from "../ports/repository-ports";

export type CreateWorkflowFoundationInput = {
  readonly repos: WorkflowFoundationRepos;
};

export type WorkflowFoundation = {
  readonly repos: WorkflowFoundationRepos;
  readonly validate: typeof validateWorkflow;
  readonly canTransition: typeof canTransitionWorkflowLifecycle;
  readonly assertTransition: typeof assertWorkflowLifecycleTransition;
  readonly listAllowedTransitions: typeof listAllowedWorkflowLifecycleTransitions;
};

function assertRepos(repos: WorkflowFoundationRepos): void {
  const required: (keyof WorkflowFoundationRepos)[] = [
    "workflows",
    "versions",
    "templates",
    "categories",
    "folders",
    "audits",
  ];
  for (const key of required) {
    if (repos[key] == null) {
      throw new WorkflowDomainError(
        "missing_repository",
        `createWorkflowFoundation requires explicit repos.${key} — silent in-memory defaults are forbidden`,
        { key },
      );
    }
  }
}

/**
 * Compose workflow validation + lifecycle helpers with caller-supplied repos.
 */
export function createWorkflowFoundation(
  input: CreateWorkflowFoundationInput,
): WorkflowFoundation {
  if (!input?.repos) {
    throw new WorkflowDomainError(
      "missing_repos",
      "createWorkflowFoundation requires explicit repos — silent in-memory defaults are forbidden",
    );
  }
  assertRepos(input.repos);
  return {
    repos: input.repos,
    validate: validateWorkflow,
    canTransition: canTransitionWorkflowLifecycle,
    assertTransition: assertWorkflowLifecycleTransition,
    listAllowedTransitions: listAllowedWorkflowLifecycleTransitions,
  };
}

export type { ValidateWorkflowInput };
