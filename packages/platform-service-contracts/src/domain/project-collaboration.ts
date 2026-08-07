/**
 * W007 / PX-04 — Communication & Collaboration (object-anchored).
 * Projects SoR for conversations · meeting outcomes · notices · digests.
 * Notifications: publish events only — Attention Engine delivers (021).
 */

export const CONVERSATION_ANCHOR_TYPES = [
  "project",
  "commitment",
  "milestone",
  "decision",
  "risk",
  "exception",
  "checkpoint",
  "dependency",
  "waiting",
  "programme",
  "initiative",
] as const;
export type ConversationAnchorType = (typeof CONVERSATION_ANCHOR_TYPES)[number];

export const CONVERSATION_TYPES = [
  "discussion",
  "decision",
  "clarification",
  "escalation",
  "review",
  "resolution",
] as const;
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export const CONVERSATION_STATUSES = ["open", "resolved", "locked"] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const DECISION_CONVERSATION_OUTCOMES = [
  "approved",
  "rejected",
  "deferred",
  "superseded",
  "cancelled",
] as const;
export type DecisionConversationOutcome =
  (typeof DECISION_CONVERSATION_OUTCOMES)[number];

export const MESSAGE_TYPES = ["comment", "status_note", "system"] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export const ANNOUNCEMENT_PRIORITIES = ["info", "important", "critical"] as const;
export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];

export const DIGEST_KINDS = ["daily", "weekly", "milestone", "exception"] as const;
export type DigestKind = (typeof DIGEST_KINDS)[number];

export type Conversation = {
  readonly id: string;
  readonly projectId: string;
  readonly programmeId?: string;
  readonly anchorType: ConversationAnchorType;
  readonly anchorId: string;
  readonly conversationType: ConversationType;
  readonly title?: string;
  readonly status: ConversationStatus;
  readonly decisionOutcome?: DecisionConversationOutcome;
  readonly watcherPrincipalIds: readonly string[];
  readonly unreadCount: number;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly lastMessageAt?: string;
  readonly resolvedAt?: string;
  readonly updatedAt: string;
};

export type ConversationMessage = {
  readonly id: string;
  readonly conversationId: string;
  readonly body: string;
  readonly authorPrincipalId: string;
  readonly messageType: MessageType;
  readonly linkedObjectRefs: readonly { type: string; id: string }[];
  readonly mentionPrincipalIds: readonly string[];
  readonly createdAt: string;
  readonly editedAt?: string;
};

export type MeetingOutcome = {
  readonly id: string;
  readonly scopeType: "project" | "programme" | "initiative";
  readonly scopeId: string;
  readonly heldAt: string;
  readonly title: string;
  readonly summary: string;
  readonly attendeePrincipalIds: readonly string[];
  readonly decisionsRecorded: readonly string[];
  readonly commitmentsCaptured: readonly string[];
  readonly risksRaised: readonly string[];
  readonly actionsCaptured: readonly string[];
  readonly linkedObjectRefs: readonly { type: string; id: string }[];
  readonly recordingRef?: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProjectNotice = {
  readonly id: string;
  readonly scopeType: "project" | "programme" | "initiative";
  readonly scopeId: string;
  readonly title: string;
  readonly body: string;
  readonly status: "active" | "withdrawn";
  readonly pinned: boolean;
  readonly version: number;
  readonly authorPrincipalId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type Announcement = {
  readonly id: string;
  readonly scopeType: "project" | "programme" | "initiative";
  readonly scopeId: string;
  readonly title: string;
  readonly body: string;
  readonly priority: AnnouncementPriority;
  readonly audience: "core" | "assignees" | "stakeholders" | "custom";
  readonly validFrom: string;
  readonly validTo?: string;
  readonly acknowledgeRequired: boolean;
  readonly status: "active" | "expired" | "withdrawn";
  readonly authorPrincipalId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CommunicationTimelineEntry = {
  readonly id: string;
  readonly at: string;
  readonly source:
    | "conversation"
    | "message"
    | "meeting_outcome"
    | "notice"
    | "announcement"
    | "operational_change"
    | "decision_outcome";
  readonly kind: string;
  readonly summary: string;
  readonly objectType?: string;
  readonly objectId?: string;
  readonly conversationId?: string;
  readonly principalId?: string;
};

export type DigestProjection = {
  readonly kind: DigestKind;
  readonly scopeType: "project" | "programme" | "initiative";
  readonly scopeId: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly summaryLines: readonly string[];
  readonly openConversationCount: number;
  readonly meetingOutcomeCount: number;
  readonly exceptionHighlightCount: number;
  readonly milestoneHighlightCount: number;
  readonly publishedEventIntent: "projects.digest_ready";
  readonly computedAt: string;
};

export type ContextualSearchHit = {
  readonly conversationId: string;
  readonly messageId?: string;
  readonly projectId: string;
  readonly anchorType: ConversationAnchorType;
  readonly anchorId: string;
  readonly title: string;
  readonly snippet: string;
  readonly deepLink: string;
};

export type CreateConversationInput = {
  readonly projectId: string;
  readonly programmeId?: string;
  readonly anchorType: ConversationAnchorType;
  readonly anchorId: string;
  readonly conversationType?: ConversationType;
  readonly title?: string;
  readonly watcherPrincipalIds?: readonly string[];
};

export type PostMessageInput = {
  readonly body: string;
  readonly messageType?: MessageType;
  readonly linkedObjectRefs?: readonly { type: string; id: string }[];
  readonly mentionPrincipalIds?: readonly string[];
};

export type ResolveConversationInput = {
  readonly status?: Exclude<ConversationStatus, "open">;
  readonly decisionOutcome?: DecisionConversationOutcome;
  readonly summary?: string;
};

export type CreateMeetingOutcomeInput = {
  readonly scopeType: "project" | "programme" | "initiative";
  readonly scopeId: string;
  readonly heldAt: string;
  readonly title: string;
  readonly summary: string;
  readonly attendeePrincipalIds?: readonly string[];
  readonly decisionsRecorded?: readonly string[];
  readonly commitmentsCaptured?: readonly string[];
  readonly risksRaised?: readonly string[];
  readonly actionsCaptured?: readonly string[];
  readonly linkedObjectRefs?: readonly { type: string; id: string }[];
  readonly recordingRef?: string;
};

export type CreateNoticeInput = {
  readonly scopeType: "project" | "programme" | "initiative";
  readonly scopeId: string;
  readonly title: string;
  readonly body: string;
  readonly pinned?: boolean;
};

export type CreateAnnouncementInput = {
  readonly scopeType: "project" | "programme" | "initiative";
  readonly scopeId: string;
  readonly title: string;
  readonly body: string;
  readonly priority?: AnnouncementPriority;
  readonly audience?: Announcement["audience"];
  readonly validFrom?: string;
  readonly validTo?: string;
  readonly acknowledgeRequired?: boolean;
};
