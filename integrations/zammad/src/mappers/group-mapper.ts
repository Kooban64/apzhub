import type { SupportGroup } from "../models/canonical";
import type { ZammadGroupRecord } from "../internal/zammad-api-types";
import { type MapperContext, toSupportGroupId } from "./mapper-context";

export function mapZammadGroup(
  record: ZammadGroupRecord,
  ctx: MapperContext,
): SupportGroup {
  return {
    id: toSupportGroupId(record.id),
    tenantId: ctx.tenantId,
    name: record.name,
    note: record.note,
    active: record.active !== false,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapGroupToZammadBody(input: {
  readonly name?: string;
  readonly note?: string;
  readonly active?: boolean;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.note !== undefined) body.note = input.note;
  if (input.active !== undefined) body.active = input.active;
  return body;
}
