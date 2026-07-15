import type { SupportOrganization } from "../models/canonical";
import type { ZammadOrganizationRecord } from "../internal/zammad-api-types";
import { type MapperContext, toSupportOrganizationId } from "./mapper-context";

export function mapZammadOrganization(
  record: ZammadOrganizationRecord,
  ctx: MapperContext,
): SupportOrganization {
  return {
    id: toSupportOrganizationId(record.id),
    tenantId: ctx.tenantId,
    name: record.name,
    note: record.note,
    domain: record.domain,
    shared: record.shared,
    active: record.active !== false,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapOrganizationToZammadBody(input: {
  readonly name?: string;
  readonly note?: string;
  readonly domain?: string;
  readonly shared?: boolean;
  readonly active?: boolean;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.note !== undefined) body.note = input.note;
  if (input.domain !== undefined) body.domain = input.domain;
  if (input.shared !== undefined) body.shared = input.shared;
  if (input.active !== undefined) body.active = input.active;
  return body;
}
