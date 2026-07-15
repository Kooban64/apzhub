import type { SupportTicket } from "../models/canonical";
import type { ZammadTicketRecord } from "../internal/zammad-api-types";
import {
  type MapperContext,
  toSupportGroupId,
  toSupportOrganizationId,
  toSupportTicketId,
  toSupportUserId,
  extractSupportGroupZammadId,
  extractSupportOrganizationZammadId,
  extractSupportUserZammadId,
} from "./mapper-context";
import {
  mapPriorityToZammad,
  mapStatusToZammadState,
  mapZammadPriorityToCanonical,
  mapZammadStateToStatus,
} from "./state-priority-mapper";

export function mapZammadTicket(
  record: ZammadTicketRecord,
  ctx: MapperContext,
): SupportTicket {
  const status = mapZammadStateToStatus(
    typeof record.state === "string" ? record.state : undefined,
    record.state_id,
  );
  const priority = mapZammadPriorityToCanonical(
    typeof record.priority === "string" ? record.priority : undefined,
    record.priority_id,
  );

  return {
    id: toSupportTicketId(record.id),
    tenantId: ctx.tenantId,
    displayId: record.number !== undefined ? String(record.number) : undefined,
    title: record.title,
    groupId: toSupportGroupId(record.group_id),
    requesterId: toSupportUserId(record.customer_id),
    assigneeId:
      record.owner_id !== undefined && record.owner_id !== null && record.owner_id !== 1
        ? toSupportUserId(record.owner_id)
        : undefined,
    organizationId:
      record.organization_id !== undefined && record.organization_id !== null
        ? toSupportOrganizationId(record.organization_id)
        : undefined,
    status,
    priority,
    tags: record.tags,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    closedAt: status === "closed" ? record.updated_at : undefined,
  };
}

export function mapSupportTicketToZammadBody(input: {
  readonly title?: string;
  readonly groupId?: string;
  readonly requesterId?: string;
  readonly assigneeId?: string | null;
  readonly organizationId?: string | null;
  readonly status?: SupportTicket["status"];
  readonly priority?: SupportTicket["priority"];
  readonly tags?: readonly string[];
  /** Minimal article required by Zammad create — adapter-internal only. */
  readonly includeCreateArticle?: boolean;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.title !== undefined) body.title = input.title;
  if (input.groupId !== undefined) {
    body.group_id = Number(extractSupportGroupZammadId(input.groupId));
  }
  if (input.requesterId !== undefined) {
    body.customer_id = Number(extractSupportUserZammadId(input.requesterId));
  }
  if (input.assigneeId !== undefined) {
    body.owner_id =
      input.assigneeId === null
        ? 1
        : Number(extractSupportUserZammadId(input.assigneeId));
  }
  if (input.organizationId !== undefined) {
    body.organization_id =
      input.organizationId === null
        ? null
        : Number(extractSupportOrganizationZammadId(input.organizationId));
  }
  if (input.status !== undefined) {
    body.state = mapStatusToZammadState(input.status);
  }
  if (input.priority !== undefined) {
    body.priority = mapPriorityToZammad(input.priority);
  }
  if (input.tags !== undefined) {
    body.tags = input.tags;
  }
  if (input.includeCreateArticle) {
    body.article = {
      subject: input.title ?? "Support request",
      body: "(created via APZHUB)",
      type: "note",
      internal: true,
    };
  }

  return body;
}
