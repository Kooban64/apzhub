import type { Project, ProjectStatus } from "../models/canonical";
import type { PlaneProjectRecord } from "../internal/plane-api-types";
import { type MapperContext, toProjectId, toUserId, toWorkspaceId } from "./mapper-context";

function mapProjectStatus(record: PlaneProjectRecord): ProjectStatus {
  if (record.archived_at) {
    return "archived";
  }
  return "active";
}

export function mapPlaneProject(record: PlaneProjectRecord, ctx: MapperContext): Project {
  return {
    id: toProjectId(record.id),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId ? toWorkspaceId(ctx.workspaceId) : toWorkspaceId(record.workspace ?? "unknown"),
    name: record.name,
    identifier: record.identifier,
    description: record.description,
    status: mapProjectStatus(record),
    leadId: record.project_lead ? toUserId(record.project_lead) : undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapProjectToPlaneBody(
  input: {
    readonly name?: string;
    readonly identifier?: string;
    readonly description?: string;
    readonly leadId?: string | null;
    readonly archived?: boolean;
  },
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.name !== undefined) body.name = input.name;
  if (input.identifier !== undefined) body.identifier = input.identifier;
  if (input.description !== undefined) body.description = input.description;
  if (input.leadId !== undefined) {
    body.project_lead = input.leadId;
  }
  if (input.archived === true) {
    body.archived_at = new Date().toISOString();
  }
  if (input.archived === false) {
    body.archived_at = null;
  }

  return body;
}
