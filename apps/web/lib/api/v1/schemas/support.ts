import { z } from "zod";

import { globalIdWithPrefix, paginationQuerySchema } from "./common";

// ---------------------------------------------------------------------------
// ID path param schemas
// ---------------------------------------------------------------------------

export const supportRequestIdParamSchema = globalIdWithPrefix("sreq");
export const articleIdParamSchema = globalIdWithPrefix("sart");
export const organizationIdParamSchema = globalIdWithPrefix("sorg");
export const groupIdParamSchema = globalIdWithPrefix("sgrp");
export const supportUserIdParamSchema = globalIdWithPrefix("suser");

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

const supportTicketStatusValues = ["new", "open", "pending", "closed", "merged", "unknown"] as const;
const supportTicketPriorityValues = ["low", "normal", "high", "urgent"] as const;
const supportUserRoleValues = ["agent", "customer", "admin", "unknown"] as const;
const supportSearchKindValues = [
  "support_request",
  "organization",
  "group",
  "user",
  "article",
] as const;
const supportSearchSortValues = ["score", "updatedAt", "title"] as const;

// ---------------------------------------------------------------------------
// Support Request list query
// ---------------------------------------------------------------------------

export const supportRequestListQuerySchema = paginationQuerySchema
  .extend({
    sort: z.enum(["title", "displayId", "status", "priority", "createdAt", "updatedAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    status: z.enum(supportTicketStatusValues).optional(),
    priority: z.enum(supportTicketPriorityValues).optional(),
    /** HTTP alias for requesterId. */
    customerId: globalIdWithPrefix("suser").optional(),
    requesterId: globalIdWithPrefix("suser").optional(),
    /** HTTP alias for assigneeId. */
    ownerId: globalIdWithPrefix("suser").optional(),
    assigneeId: globalIdWithPrefix("suser").optional(),
    organizationId: globalIdWithPrefix("sorg").optional(),
    groupId: globalIdWithPrefix("sgrp").optional(),
    search: z.string().min(1).max(200).optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Create / Update support request bodies
// ---------------------------------------------------------------------------

export const createSupportRequestBodySchema = z
  .object({
    title: z.string().min(1).max(500),
    groupId: globalIdWithPrefix("sgrp"),
    requesterId: globalIdWithPrefix("suser"),
    assigneeId: globalIdWithPrefix("suser").optional(),
    organizationId: globalIdWithPrefix("sorg").optional(),
    status: z.enum(supportTicketStatusValues).optional(),
    priority: z.enum(supportTicketPriorityValues).optional(),
    tags: z.array(z.string().min(1).max(100)).max(50).optional(),
  })
  .strict();

export const updateSupportRequestBodySchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    groupId: globalIdWithPrefix("sgrp").optional(),
    requesterId: globalIdWithPrefix("suser").optional(),
    assigneeId: globalIdWithPrefix("suser").nullable().optional(),
    organizationId: globalIdWithPrefix("sorg").nullable().optional(),
    status: z.enum(supportTicketStatusValues).optional(),
    priority: z.enum(supportTicketPriorityValues).optional(),
    tags: z.array(z.string().min(1).max(100)).max(50).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

// ---------------------------------------------------------------------------
// State / priority / assignment commands
// ---------------------------------------------------------------------------

export const changeSupportStateBodySchema = z
  .object({
    status: z.enum(supportTicketStatusValues),
  })
  .strict();

export const changeSupportPriorityBodySchema = z
  .object({
    priority: z.enum(supportTicketPriorityValues),
  })
  .strict();

/** POST owner — assigneeId required. */
export const assignSupportOwnerBodySchema = z
  .object({
    assigneeId: globalIdWithPrefix("suser"),
  })
  .strict();

/**
 * POST customer — accepts either requesterId or customerId alias.
 * Maps to updateSupportRequest({ requesterId }) — no dedicated assignCustomer method.
 */
export const assignSupportCustomerBodySchema = z
  .object({
    requesterId: globalIdWithPrefix("suser").optional(),
    customerId: globalIdWithPrefix("suser").optional(),
  })
  .strict()
  .refine((value) => Boolean(value.requesterId ?? value.customerId), {
    message: "requesterId or customerId is required.",
  });

// ---------------------------------------------------------------------------
// Article create bodies
// ---------------------------------------------------------------------------

const bodyFormatValues = ["text/plain", "text/html", "unknown"] as const;

/**
 * Internal note — visibility is always "internal"; channel always "note".
 * Strict schema rejects any attempt to pass visibility.
 */
export const createInternalNoteBodySchema = z
  .object({
    body: z.string().min(1).max(100_000),
    bodyFormat: z.enum(bodyFormatValues).optional(),
    subject: z.string().max(500).optional(),
  })
  .strict();

/** Customer reply — channel must be public (not note/unknown); visibility always "public". */
export const createCustomerReplyBodySchema = z
  .object({
    body: z.string().min(1).max(100_000),
    bodyFormat: z.enum(bodyFormatValues).optional(),
    subject: z.string().max(500).optional(),
    channel: z.enum(["email", "phone", "web", "chat", "sms", "fax"]).optional(),
    to: z.array(z.string().max(500)).max(50).optional(),
    cc: z.array(z.string().max(500)).max(50).optional(),
    bcc: z.array(z.string().max(500)).max(50).optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Organization schemas
// ---------------------------------------------------------------------------

export const organizationListQuerySchema = paginationQuerySchema
  .extend({
    sort: z.enum(["name", "createdAt", "updatedAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().min(1).max(200).optional(),
    active: z.enum(["true", "false"]).optional(),
  })
  .strict();

export const createOrganizationBodySchema = z
  .object({
    name: z.string().min(1).max(255),
    note: z.string().max(5000).optional(),
    domain: z.string().max(255).optional(),
    shared: z.boolean().optional(),
  })
  .strict();

export const updateOrganizationBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    note: z.string().max(5000).optional(),
    domain: z.string().max(255).optional(),
    shared: z.boolean().optional(),
    active: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

// ---------------------------------------------------------------------------
// Group schemas
// ---------------------------------------------------------------------------

export const groupListQuerySchema = paginationQuerySchema
  .extend({
    sort: z.enum(["name", "createdAt", "updatedAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().min(1).max(200).optional(),
    active: z.enum(["true", "false"]).optional(),
  })
  .strict();

export const createGroupBodySchema = z
  .object({
    name: z.string().min(1).max(255),
    note: z.string().max(5000).optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const updateGroupBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    note: z.string().max(5000).optional(),
    active: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

// ---------------------------------------------------------------------------
// User / lookup / search schemas
// ---------------------------------------------------------------------------

export const supportUserListQuerySchema = paginationQuerySchema
  .extend({
    sort: z
      .enum(["displayName", "email", "login", "createdAt", "updatedAt"])
      .optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().min(1).max(200).optional(),
    email: z.string().min(1).max(255).optional(),
    login: z.string().min(1).max(255).optional(),
    active: z.enum(["true", "false"]).optional(),
    role: z.enum(supportUserRoleValues).optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Search schemas
// ---------------------------------------------------------------------------

export const supportSearchQuerySchema = paginationQuerySchema
  .extend({
    q: z.string().min(1).max(500).optional(),
    query: z.string().min(1).max(500).optional(),
    kinds: z
      .string()
      .min(1)
      .max(200)
      .refine(
        (value) =>
          value
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .every((part) =>
              (supportSearchKindValues as readonly string[]).includes(part),
            ),
        {
          message:
            "kinds must be a comma-separated list of support_request, organization, group, user, article",
        },
      )
      .optional(),
    organizationId: globalIdWithPrefix("sorg").optional(),
    groupId: globalIdWithPrefix("sgrp").optional(),
    supportRequestId: globalIdWithPrefix("sreq").optional(),
    sort: z.enum(supportSearchSortValues).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.q ?? value.query), {
    message: "q or query is required for support search.",
  });

// ---------------------------------------------------------------------------
// History schemas
// ---------------------------------------------------------------------------

export const historyListQuerySchema = paginationQuerySchema
  .extend({
    sort: z.enum(["occurredAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    occurredAfter: z.string().min(1).max(64).optional(),
    occurredBefore: z.string().min(1).max(64).optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Exported inferred types
// ---------------------------------------------------------------------------

export type SupportRequestListQuery = z.infer<typeof supportRequestListQuerySchema>;
export type CreateSupportRequestBody = z.infer<typeof createSupportRequestBodySchema>;
export type UpdateSupportRequestBody = z.infer<typeof updateSupportRequestBodySchema>;
export type CreateInternalNoteBody = z.infer<typeof createInternalNoteBodySchema>;
export type CreateCustomerReplyBody = z.infer<typeof createCustomerReplyBodySchema>;
