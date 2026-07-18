/**
 * Synchronous publication hooks for Projects lifecycle events (APZSEARCH-010).
 * No listeners, webhooks, polling, or Event Bus — call sites invoke explicitly.
 */

import type {
  Milestone,
  Project,
  ProjectModule,
  Sprint,
  Task,
  Team,
  Workspace,
} from "@apzhub/platform-service-contracts";
import type { SearchPublicationResult } from "@apzhub/search-integration";

import type { ProjectsSearchPublicationContext } from "../context/projects-search-publication-context";
import type { ProjectsSearchPublisher } from "../publisher/projects-search-publisher";

export type ProjectsSearchLifecycleHooks = {
  onWorkspaceUpserted(
    context: ProjectsSearchPublicationContext,
    workspace: Workspace,
  ): SearchPublicationResult;
  onWorkspaceRemoved(
    context: ProjectsSearchPublicationContext,
    workspaceId: string,
  ): SearchPublicationResult;
  onProjectUpserted(
    context: ProjectsSearchPublicationContext,
    project: Project,
  ): SearchPublicationResult;
  onProjectRemoved(
    context: ProjectsSearchPublicationContext,
    projectId: string,
  ): SearchPublicationResult;
  onTaskUpserted(
    context: ProjectsSearchPublicationContext,
    task: Task,
  ): SearchPublicationResult;
  onTaskRemoved(
    context: ProjectsSearchPublicationContext,
    taskId: string,
  ): SearchPublicationResult;
  onSprintUpserted(
    context: ProjectsSearchPublicationContext,
    sprint: Sprint,
  ): SearchPublicationResult;
  onSprintRemoved(
    context: ProjectsSearchPublicationContext,
    sprintId: string,
  ): SearchPublicationResult;
  onMilestoneUpserted(
    context: ProjectsSearchPublicationContext,
    milestone: Milestone,
  ): SearchPublicationResult;
  onMilestoneRemoved(
    context: ProjectsSearchPublicationContext,
    milestoneId: string,
  ): SearchPublicationResult;
  onModuleUpserted(
    context: ProjectsSearchPublicationContext,
    module: ProjectModule,
  ): SearchPublicationResult;
  onModuleRemoved(
    context: ProjectsSearchPublicationContext,
    moduleId: string,
  ): SearchPublicationResult;
  onTeamUpserted(
    context: ProjectsSearchPublicationContext,
    team: Team,
  ): SearchPublicationResult;
  onTeamRemoved(
    context: ProjectsSearchPublicationContext,
    teamId: string,
  ): SearchPublicationResult;
};

/**
 * Creates explicit hooks that call publish-or-update based on existence in the sink.
 * No background subscription.
 */
export function createProjectsSearchLifecycleHooks(
  publisher: ProjectsSearchPublisher,
): ProjectsSearchLifecycleHooks {
  const upsert = (
    context: ProjectsSearchPublicationContext,
    input: Parameters<ProjectsSearchPublisher["publish"]>[1],
  ): SearchPublicationResult => {
    const entityId = (input.entity as { id: string }).id;
    const prior = publisher.getIntegrationPublisher().getSink().get(entityId);
    if (prior && prior.lifecycleState !== "removed") {
      return publisher.update(context, input);
    }
    return publisher.publish(context, input);
  };

  return {
    onWorkspaceUpserted: (c, e) => upsert(c, { entityType: "workspace", entity: e }),
    onWorkspaceRemoved: (c, id) => publisher.remove(c, "workspace", id),
    onProjectUpserted: (c, e) => upsert(c, { entityType: "project", entity: e }),
    onProjectRemoved: (c, id) => publisher.remove(c, "project", id),
    onTaskUpserted: (c, e) => upsert(c, { entityType: "task", entity: e }),
    onTaskRemoved: (c, id) => publisher.remove(c, "task", id),
    onSprintUpserted: (c, e) => upsert(c, { entityType: "sprint", entity: e }),
    onSprintRemoved: (c, id) => publisher.remove(c, "sprint", id),
    onMilestoneUpserted: (c, e) => upsert(c, { entityType: "milestone", entity: e }),
    onMilestoneRemoved: (c, id) => publisher.remove(c, "milestone", id),
    onModuleUpserted: (c, e) => upsert(c, { entityType: "module", entity: e }),
    onModuleRemoved: (c, id) => publisher.remove(c, "module", id),
    onTeamUpserted: (c, e) => upsert(c, { entityType: "team", entity: e }),
    onTeamRemoved: (c, id) => publisher.remove(c, "team", id),
  };
}
