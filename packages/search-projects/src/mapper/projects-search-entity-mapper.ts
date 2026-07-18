/**
 * ProjectsSearchEntityMapper — canonical Platform models → SearchEntityDraft (APZSEARCH-010).
 * Never emits Plane IDs or provider metadata.
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
import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { ProjectsSearchPublicationContext } from "../context/projects-search-publication-context";
import {
  assertPlatformEntityId,
  type ProjectsSearchEntityType,
} from "../types/entity-types";

export type ProjectsSearchMappableEntity =
  | { readonly entityType: "workspace"; readonly entity: Workspace }
  | { readonly entityType: "project"; readonly entity: Project }
  | { readonly entityType: "task"; readonly entity: Task }
  | { readonly entityType: "sprint"; readonly entity: Sprint }
  | { readonly entityType: "milestone"; readonly entity: Milestone }
  | { readonly entityType: "module"; readonly entity: ProjectModule }
  | { readonly entityType: "team"; readonly entity: Team };

function stripHtml(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return (
    text
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || undefined
  );
}

function navigationTarget(
  entityType: ProjectsSearchEntityType,
  id: string,
  projectId?: string,
): string {
  switch (entityType) {
    case "workspace":
      return `/workspace/projects/workspaces/${id}`;
    case "project":
      return `/workspace/projects/${id}`;
    case "team":
      return `/workspace/projects/teams/${id}`;
    case "task":
      return `/workspace/projects/${projectId}/tasks/${id}`;
    case "sprint":
      return `/workspace/projects/${projectId}/sprints/${id}`;
    case "milestone":
      return `/workspace/projects/${projectId}/milestones/${id}`;
    case "module":
      return `/workspace/projects/${projectId}/modules/${id}`;
  }
}

export class ProjectsSearchEntityMapper {
  map(
    context: ProjectsSearchPublicationContext,
    input: ProjectsSearchMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "workspace":
        return this.mapWorkspace(context, input.entity);
      case "project":
        return this.mapProject(context, input.entity);
      case "task":
        return this.mapTask(context, input.entity);
      case "sprint":
        return this.mapSprint(context, input.entity);
      case "milestone":
        return this.mapMilestone(context, input.entity);
      case "module":
        return this.mapModule(context, input.entity);
      case "team":
        return this.mapTeam(context, input.entity);
    }
  }

  mapWorkspace(
    context: ProjectsSearchPublicationContext,
    workspace: Workspace,
  ): SearchEntityDraft {
    assertPlatformEntityId(workspace.id, "workspace.id");
    this.assertTenant(workspace.tenantId, context);
    return {
      entityId: workspace.id,
      entityType: "workspace",
      title: workspace.name,
      summary: workspace.slug,
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {
        slug: workspace.slug,
        ...(workspace.url ? { urlHost: safeHost(workspace.url) } : {}),
      },
      keywords: [workspace.name, workspace.slug],
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      navigationTarget: navigationTarget("workspace", workspace.id),
      sourceId: "projects:workspace",
      ownerUserId: context.actorUserId,
    };
  }

  mapProject(
    context: ProjectsSearchPublicationContext,
    project: Project,
  ): SearchEntityDraft {
    assertPlatformEntityId(project.id, "project.id");
    assertPlatformEntityId(project.workspaceId, "project.workspaceId");
    this.assertTenant(project.tenantId, context);
    return {
      entityId: project.id,
      entityType: "project",
      title: project.name,
      summary: stripHtml(project.description) ?? project.identifier,
      organisationId: context.organisationId,
      classification:
        project.status === "archived"
          ? "restricted"
          : (context.classification ?? "internal"),
      permissions: [...context.permissions],
      metadata: {
        status: project.status,
        identifier: project.identifier,
        workspaceId: project.workspaceId,
        ...(project.leadId ? { leadId: project.leadId } : {}),
      },
      keywords: [project.name, project.identifier, project.status],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      navigationTarget: navigationTarget("project", project.id),
      sourceId: "projects:project",
      ownerUserId: project.leadId ?? context.actorUserId,
    };
  }

  mapTask(context: ProjectsSearchPublicationContext, task: Task): SearchEntityDraft {
    assertPlatformEntityId(task.id, "task.id");
    assertPlatformEntityId(task.projectId, "task.projectId");
    return {
      entityId: task.id,
      entityType: "task",
      title: task.title,
      summary: stripHtml(task.description),
      organisationId: context.organisationId,
      classification: task.archivedAt
        ? "restricted"
        : (context.classification ?? "internal"),
      permissions: [...context.permissions],
      metadata: {
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        ...(task.sprintId ? { sprintId: task.sprintId } : {}),
        ...(task.milestoneId ? { milestoneId: task.milestoneId } : {}),
        ...(task.projectModuleId ? { moduleId: task.projectModuleId } : {}),
        ...(task.assigneeId ? { assigneeId: task.assigneeId } : {}),
        ...(task.dueDate ? { dueDate: task.dueDate } : {}),
      },
      keywords: [task.title, task.status, task.priority],
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      navigationTarget: navigationTarget("task", task.id, task.projectId),
      sourceId: "projects:task",
      ownerUserId: task.assigneeId ?? context.actorUserId,
    };
  }

  mapSprint(
    context: ProjectsSearchPublicationContext,
    sprint: Sprint,
  ): SearchEntityDraft {
    assertPlatformEntityId(sprint.id, "sprint.id");
    assertPlatformEntityId(sprint.projectId, "sprint.projectId");
    return {
      entityId: sprint.id,
      entityType: "sprint",
      title: sprint.name,
      summary: sprint.goal,
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {
        status: sprint.status,
        projectId: sprint.projectId,
        ...(sprint.startDate ? { startDate: sprint.startDate } : {}),
        ...(sprint.endDate ? { endDate: sprint.endDate } : {}),
      },
      keywords: [sprint.name, sprint.status],
      createdAt: sprint.createdAt,
      updatedAt: sprint.updatedAt,
      navigationTarget: navigationTarget("sprint", sprint.id, sprint.projectId),
      sourceId: "projects:sprint",
      ownerUserId: context.actorUserId,
    };
  }

  mapMilestone(
    context: ProjectsSearchPublicationContext,
    milestone: Milestone,
  ): SearchEntityDraft {
    assertPlatformEntityId(milestone.id, "milestone.id");
    assertPlatformEntityId(milestone.projectId, "milestone.projectId");
    return {
      entityId: milestone.id,
      entityType: "milestone",
      title: milestone.name,
      summary: stripHtml(milestone.description),
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {
        status: milestone.status,
        projectId: milestone.projectId,
        ...(milestone.targetDate ? { targetDate: milestone.targetDate } : {}),
      },
      keywords: [milestone.name, milestone.status],
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
      navigationTarget: navigationTarget(
        "milestone",
        milestone.id,
        milestone.projectId,
      ),
      sourceId: "projects:milestone",
      ownerUserId: context.actorUserId,
    };
  }

  mapModule(
    context: ProjectsSearchPublicationContext,
    module: ProjectModule,
  ): SearchEntityDraft {
    assertPlatformEntityId(module.id, "module.id");
    assertPlatformEntityId(module.projectId, "module.projectId");
    return {
      entityId: module.id,
      entityType: "module",
      title: module.name,
      summary: stripHtml(module.description),
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {
        status: module.status,
        projectId: module.projectId,
        ...(module.startDate ? { startDate: module.startDate } : {}),
        ...(module.targetDate ? { targetDate: module.targetDate } : {}),
      },
      keywords: [module.name, module.status],
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      navigationTarget: navigationTarget("module", module.id, module.projectId),
      sourceId: "projects:module",
      ownerUserId: context.actorUserId,
    };
  }

  mapTeam(context: ProjectsSearchPublicationContext, team: Team): SearchEntityDraft {
    assertPlatformEntityId(team.id, "team.id");
    this.assertTenant(team.tenantId, context);
    return {
      entityId: team.id,
      entityType: "team",
      title: team.name,
      summary: stripHtml(team.description),
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {},
      keywords: [team.name],
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      navigationTarget: navigationTarget("team", team.id),
      sourceId: "projects:team",
      ownerUserId: context.actorUserId,
    };
  }

  private assertTenant(
    entityTenantId: string,
    context: ProjectsSearchPublicationContext,
  ): void {
    if (entityTenantId !== context.tenantId) {
      throw new Error(
        "tenant mismatch between Projects entity and publication context",
      );
    }
  }
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}
