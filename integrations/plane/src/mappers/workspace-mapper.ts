import type { Workspace } from "../models/canonical";
import type { PlaneWorkspaceResponse } from "../internal/plane-api-types";
import { type MapperContext, toWorkspaceId } from "./mapper-context";

export function mapPlaneWorkspace(record: PlaneWorkspaceResponse, ctx: MapperContext): Workspace {
  const now = new Date().toISOString();
  return {
    id: toWorkspaceId(record.id),
    tenantId: ctx.tenantId,
    name: record.name,
    slug: record.slug,
    url: record.url,
    createdAt: record.created_at ?? now,
    updatedAt: record.updated_at ?? now,
  };
}
