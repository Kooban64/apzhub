/** Shared enumeration catalogue — APZHUB-Law-Domain-Model.md §5. */

export const CLIENT_STATUSES = ["prospect", "active", "inactive", "archived"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const CLIENT_TYPES = ["individual", "organisation"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const MATTER_STATUSES = [
  "prospect",
  "open",
  "pending",
  "on_hold",
  "closed",
  "archived",
] as const;
export type MatterStatus = (typeof MATTER_STATUSES)[number];

export const MATTER_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type MatterPriority = (typeof MATTER_PRIORITIES)[number];

export const MATTER_TYPE_CODES = [
  "litigation",
  "transactional",
  "advisory",
  "regulatory",
  "family",
  "criminal",
  "other",
] as const;
export type MatterTypeCode = (typeof MATTER_TYPE_CODES)[number];

export const TASK_STATUSES = [
  "not_started",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "normal", "high", "critical"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const DOCUMENT_STATUSES = [
  "draft",
  "review",
  "approved",
  "filed",
  "superseded",
  "archived",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const DOCUMENT_TYPES = [
  "pleading",
  "contract",
  "correspondence",
  "evidence",
  "research",
  "invoice",
  "other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "void",
  "written_off",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "completed", "failed", "reversed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TRUST_TRANSACTION_TYPES = [
  "deposit",
  "withdrawal",
  "transfer_in",
  "transfer_out",
  "fee_transfer",
  "adjustment",
] as const;
export type TrustTransactionType = (typeof TRUST_TRANSACTION_TYPES)[number];

export const COMMUNICATION_TYPES = [
  "email",
  "phone",
  "meeting",
  "letter",
  "portal_message",
  "other",
] as const;
export type CommunicationType = (typeof COMMUNICATION_TYPES)[number];

export const COMMUNICATION_DIRECTIONS = ["inbound", "outbound", "internal"] as const;
export type CommunicationDirection = (typeof COMMUNICATION_DIRECTIONS)[number];

export const RELATIONSHIP_TYPES = [
  "spouse",
  "director",
  "employee",
  "opposing_party",
  "opposing_counsel",
  "witness",
  "billing_contact",
  "emergency_contact",
  "other",
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const CALENDAR_EVENT_TYPES = [
  "hearing",
  "deadline",
  "appointment",
  "reminder",
  "internal",
] as const;
export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

export const ADDRESS_TYPES = ["postal", "physical", "registered", "service"] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export const PHONE_TYPES = ["mobile", "office", "home", "fax"] as const;
export type PhoneType = (typeof PHONE_TYPES)[number];

export const CUSTOM_FIELD_TYPES = [
  "text",
  "number",
  "date",
  "boolean",
  "picklist",
] as const;
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

export const NOTE_VISIBILITY = ["internal", "team", "matter_team"] as const;
export type NoteVisibility = (typeof NOTE_VISIBILITY)[number];

export const BILLING_STATUSES = ["unbilled", "billed", "written_off"] as const;
export type BillingStatus = (typeof BILLING_STATUSES)[number];

export const APPROVAL_STATUSES = ["draft", "pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const KNOWLEDGE_ARTICLE_STATUSES = ["draft", "published", "archived"] as const;
export type KnowledgeArticleStatus = (typeof KNOWLEDGE_ARTICLE_STATUSES)[number];

export const DOMAIN_ENTITY_TYPES = [
  "client",
  "organisation",
  "contact",
  "relationship",
  "address",
  "communication",
  "email",
  "phone",
  "matter",
  "matter_type",
  "practice_area",
  "court",
  "judge",
  "advocate",
  "attorney",
  "candidate_attorney",
  "secretary",
  "paralegal",
  "document",
  "document_category",
  "folder",
  "attachment",
  "template",
  "precedent",
  "task",
  "workflow",
  "appointment",
  "calendar_event",
  "time_entry",
  "expense",
  "invoice",
  "trust_account",
  "trust_transaction",
  "disbursement",
  "payment",
  "user",
  "role",
  "permission",
  "audit_record",
  "knowledge_article",
  "custom_field",
  "tag",
  "note",
] as const;
export type DomainEntityType = (typeof DOMAIN_ENTITY_TYPES)[number];
