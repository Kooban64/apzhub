/**
 * TimeSearchEntityMapper — canonical Platform models → SearchEntityDraft (R12-SEARCH-01).
 * Never emits Kimai IDs, originMetadata, rates, or financial payloads.
 */

import type {
  TimeActivity,
  TimeCustomer,
  TimeProject,
  TimeTag,
  Timesheet,
} from "@apzhub/platform-service-contracts";
import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TimeSearchPublicationContext } from "../context/time-search-publication-context";
import {
  assertPlatformEntityId,
  type TimeSearchEntityType,
} from "../types/entity-types";

export type TimeSearchMappableEntity =
  | { readonly entityType: "time_entry"; readonly entity: Timesheet }
  | { readonly entityType: "time_activity"; readonly entity: TimeActivity }
  | { readonly entityType: "time_customer"; readonly entity: TimeCustomer }
  | { readonly entityType: "time_project"; readonly entity: TimeProject }
  | { readonly entityType: "time_tag"; readonly entity: TimeTag };

function stripHtml(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return (
    text
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || undefined
  );
}

function navigationTarget(entityType: TimeSearchEntityType, id: string): string {
  switch (entityType) {
    case "time_entry":
      return `/workspace/time/timesheets/${id}`;
    case "time_activity":
      return `/workspace/time/activities/${id}`;
    case "time_customer":
      return `/workspace/time/customers/${id}`;
    case "time_project":
      return `/workspace/time/projects/${id}`;
    case "time_tag":
      return `/workspace/time/tags/${id}`;
  }
}

function metaString(value: string | number | boolean | undefined): string | undefined {
  if (value === undefined) return undefined;
  return String(value);
}

export class TimeSearchEntityMapper {
  map(
    context: TimeSearchPublicationContext,
    input: TimeSearchMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "time_entry":
        return this.mapTimeEntry(context, input.entity);
      case "time_activity":
        return this.mapTimeActivity(context, input.entity);
      case "time_customer":
        return this.mapTimeCustomer(context, input.entity);
      case "time_project":
        return this.mapTimeProject(context, input.entity);
      case "time_tag":
        return this.mapTimeTag(context, input.entity);
    }
  }

  mapTimeEntry(
    context: TimeSearchPublicationContext,
    entry: Timesheet,
  ): SearchEntityDraft {
    assertPlatformEntityId(entry.id, "time_entry.id");
    this.assertTenant(entry.tenantId, context);
    if (entry.activityId)
      assertPlatformEntityId(entry.activityId, "time_entry.activityId");
    if (entry.customerId)
      assertPlatformEntityId(entry.customerId, "time_entry.customerId");
    if (entry.projectId)
      assertPlatformEntityId(entry.projectId, "time_entry.projectId");
    for (const tagId of entry.tagIds) {
      assertPlatformEntityId(tagId, "time_entry.tagIds");
    }

    const title =
      stripHtml(entry.description)?.slice(0, 120) || `Time entry ${entry.status}`;

    return {
      entityId: entry.id,
      entityType: "time_entry",
      title,
      summary: stripHtml(entry.description),
      organisationId: context.organisationId,
      classification:
        entry.status === "archived"
          ? "restricted"
          : (context.classification ?? "internal"),
      permissions: [...context.permissions],
      metadata: {
        status: entry.status,
        durationMinutes: metaString(entry.durationMinutes)!,
        startedAt: entry.startedAt,
        ...(entry.endedAt ? { endedAt: entry.endedAt } : {}),
        ...(entry.activityId ? { activityId: entry.activityId } : {}),
        ...(entry.customerId ? { customerId: entry.customerId } : {}),
        ...(entry.projectId ? { projectId: entry.projectId } : {}),
        ...(entry.tagIds.length > 0 ? { tagIds: entry.tagIds.join(",") } : {}),
        userId: entry.userId,
      },
      keywords: [
        title,
        entry.status,
        ...(entry.activityId ? [entry.activityId] : []),
        ...(entry.projectId ? [entry.projectId] : []),
      ],
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      navigationTarget: navigationTarget("time_entry", entry.id),
      sourceId: "time:time_entry",
      ownerUserId: entry.userId,
    };
  }

  mapTimeActivity(
    context: TimeSearchPublicationContext,
    activity: TimeActivity,
  ): SearchEntityDraft {
    assertPlatformEntityId(activity.id, "time_activity.id");
    this.assertTenant(activity.tenantId, context);
    if (activity.projectId) {
      assertPlatformEntityId(activity.projectId, "time_activity.projectId");
    }
    return {
      entityId: activity.id,
      entityType: "time_activity",
      title: activity.name,
      summary: stripHtml(activity.description),
      organisationId: context.organisationId,
      classification:
        activity.status === "archived"
          ? "restricted"
          : (context.classification ?? "internal"),
      permissions: [...context.permissions],
      metadata: {
        status: activity.status,
        ...(activity.projectId ? { projectId: activity.projectId } : {}),
      },
      keywords: [activity.name, activity.status],
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      navigationTarget: navigationTarget("time_activity", activity.id),
      sourceId: "time:time_activity",
      ownerUserId: context.actorUserId,
    };
  }

  mapTimeCustomer(
    context: TimeSearchPublicationContext,
    customer: TimeCustomer,
  ): SearchEntityDraft {
    assertPlatformEntityId(customer.id, "time_customer.id");
    this.assertTenant(customer.tenantId, context);
    return {
      entityId: customer.id,
      entityType: "time_customer",
      title: customer.name,
      summary: customer.number,
      organisationId: context.organisationId,
      classification:
        customer.status === "archived"
          ? "restricted"
          : (context.classification ?? "internal"),
      permissions: [...context.permissions],
      metadata: {
        status: customer.status,
        ...(customer.number ? { number: customer.number } : {}),
      },
      keywords: [
        customer.name,
        customer.status,
        ...(customer.number ? [customer.number] : []),
      ],
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      navigationTarget: navigationTarget("time_customer", customer.id),
      sourceId: "time:time_customer",
      ownerUserId: context.actorUserId,
    };
  }

  mapTimeProject(
    context: TimeSearchPublicationContext,
    project: TimeProject,
  ): SearchEntityDraft {
    assertPlatformEntityId(project.id, "time_project.id");
    this.assertTenant(project.tenantId, context);
    if (project.customerId) {
      assertPlatformEntityId(project.customerId, "time_project.customerId");
    }
    return {
      entityId: project.id,
      entityType: "time_project",
      title: project.name,
      organisationId: context.organisationId,
      classification:
        project.status === "archived"
          ? "restricted"
          : (context.classification ?? "internal"),
      permissions: [...context.permissions],
      metadata: {
        status: project.status,
        ...(project.customerId ? { customerId: project.customerId } : {}),
      },
      keywords: [project.name, project.status],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      navigationTarget: navigationTarget("time_project", project.id),
      sourceId: "time:time_project",
      ownerUserId: context.actorUserId,
    };
  }

  mapTimeTag(context: TimeSearchPublicationContext, tag: TimeTag): SearchEntityDraft {
    assertPlatformEntityId(tag.id, "time_tag.id");
    this.assertTenant(tag.tenantId, context);
    return {
      entityId: tag.id,
      entityType: "time_tag",
      title: tag.name,
      organisationId: context.organisationId,
      classification:
        tag.status === "archived"
          ? "restricted"
          : (context.classification ?? "internal"),
      permissions: [...context.permissions],
      metadata: {
        status: tag.status,
        ...(tag.color ? { color: tag.color } : {}),
      },
      keywords: [tag.name, tag.status],
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      navigationTarget: navigationTarget("time_tag", tag.id),
      sourceId: "time:time_tag",
      ownerUserId: context.actorUserId,
    };
  }

  private assertTenant(
    entityTenantId: string,
    context: TimeSearchPublicationContext,
  ): void {
    if (entityTenantId !== context.tenantId) {
      throw new Error("tenant mismatch between Time entity and publication context");
    }
  }
}
