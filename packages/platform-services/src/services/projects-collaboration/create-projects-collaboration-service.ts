/**
 * W007 / PX-04 — Projects Collaboration Platform Service.
 */

import { randomUUID } from "node:crypto";

import type {
  Announcement,
  CommunicationTimelineEntry,
  ContextualSearchHit,
  Conversation,
  ConversationAnchorType,
  ConversationMessage,
  ConversationType,
  CreateAnnouncementInput,
  CreateConversationInput,
  CreateMeetingOutcomeInput,
  CreateNoticeInput,
  DigestKind,
  DigestProjection,
  MeetingOutcome,
  PostMessageInput,
  ProjectNotice,
  ResolveConversationInput,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

import {
  resolveProjectsCollaborationStore,
  type ProjectsCollaborationStore,
} from "./memory-store";

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

function tenant(ctx: ServiceRequestContext) {
  return ctx.tenantId ?? "default";
}

function now() {
  return new Date().toISOString();
}

function requireText(value: string | undefined, field: string): string {
  const t = value?.trim() ?? "";
  if (!t) throw new Error(`${field}_required`);
  return t;
}

function defaultConversationType(
  anchorType: ConversationAnchorType,
  explicit?: ConversationType,
): ConversationType {
  if (explicit) return explicit;
  if (anchorType === "decision") return "decision";
  if (anchorType === "exception" || anchorType === "waiting") return "escalation";
  if (anchorType === "checkpoint") return "review";
  return "discussion";
}

export type OperationalHistoryLoader = (
  ctx: ServiceRequestContext,
  projectId: string,
  objectType?: string,
  objectId?: string,
) => Promise<
  readonly {
    id: string;
    at: string;
    kind: string;
    summary: string;
    objectType?: string;
    objectId?: string;
    actorUserId?: string;
  }[]
>;

export type ProjectsCollaborationService = {
  readonly listConversations: (
    ctx: ServiceRequestContext,
    projectId: string,
    filter?: {
      anchorType?: string;
      anchorId?: string;
      conversationType?: string;
      status?: string;
    },
  ) => Promise<readonly Conversation[]>;
  readonly getConversation: (
    ctx: ServiceRequestContext,
    conversationId: string,
  ) => Promise<Conversation | null>;
  readonly createConversation: (
    ctx: ServiceRequestContext,
    input: CreateConversationInput,
  ) => Promise<Conversation>;
  readonly listMessages: (
    ctx: ServiceRequestContext,
    conversationId: string,
  ) => Promise<readonly ConversationMessage[]>;
  readonly postMessage: (
    ctx: ServiceRequestContext,
    conversationId: string,
    input: PostMessageInput,
  ) => Promise<ConversationMessage>;
  readonly resolveConversation: (
    ctx: ServiceRequestContext,
    conversationId: string,
    input: ResolveConversationInput,
  ) => Promise<Conversation>;
  readonly listMeetingOutcomes: (
    ctx: ServiceRequestContext,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly MeetingOutcome[]>;
  readonly createMeetingOutcome: (
    ctx: ServiceRequestContext,
    input: CreateMeetingOutcomeInput,
  ) => Promise<MeetingOutcome>;
  readonly listNotices: (
    ctx: ServiceRequestContext,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly ProjectNotice[]>;
  readonly createNotice: (
    ctx: ServiceRequestContext,
    input: CreateNoticeInput,
  ) => Promise<ProjectNotice>;
  readonly listAnnouncements: (
    ctx: ServiceRequestContext,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly Announcement[]>;
  readonly createAnnouncement: (
    ctx: ServiceRequestContext,
    input: CreateAnnouncementInput,
  ) => Promise<Announcement>;
  readonly getUnifiedTimeline: (
    ctx: ServiceRequestContext,
    projectId: string,
    opts?: {
      objectType?: string;
      objectId?: string;
      unresolvedOnly?: boolean;
    },
  ) => Promise<readonly CommunicationTimelineEntry[]>;
  readonly buildDigest: (
    ctx: ServiceRequestContext,
    input: {
      kind: DigestKind;
      scopeType: "project" | "programme" | "initiative";
      scopeId: string;
      projectId?: string;
    },
  ) => Promise<DigestProjection>;
  readonly contextualSearch: (
    ctx: ServiceRequestContext,
    projectId: string,
    query: string,
  ) => Promise<readonly ContextualSearchHit[]>;
};

export function createProjectsCollaborationService(
  store: ProjectsCollaborationStore = resolveProjectsCollaborationStore(),
  options: { readonly loadOperationalHistory?: OperationalHistoryLoader } = {},
): ProjectsCollaborationService {
  return {
    listConversations(ctx, projectId, filter) {
      return store.listConversations(tenant(ctx), projectId, filter);
    },

    getConversation(ctx, conversationId) {
      return store.getConversation(tenant(ctx), conversationId);
    },

    async createConversation(ctx, input) {
      const ts = now();
      const anchorType = input.anchorType;
      const anchorId = requireText(input.anchorId, "anchorId");
      const projectId = requireText(input.projectId, "projectId");
      if (!anchorType) throw new Error("anchorType_required");
      const conversationType = defaultConversationType(
        anchorType,
        input.conversationType,
      );
      const row: Conversation = Object.freeze({
        id: id("conv"),
        projectId,
        programmeId: input.programmeId,
        anchorType,
        anchorId,
        conversationType,
        title: input.title?.trim() || `${conversationType} · ${anchorType}:${anchorId}`,
        status: "open",
        watcherPrincipalIds: Object.freeze([
          ...(input.watcherPrincipalIds ?? []),
          ctx.userId ?? "system",
        ]),
        unreadCount: 0,
        createdBy: ctx.userId ?? "system",
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertConversation(tenant(ctx), row);
    },

    listMessages(ctx, conversationId) {
      return store.listMessages(tenant(ctx), conversationId);
    },

    async postMessage(ctx, conversationId, input) {
      const conversation = await store.getConversation(tenant(ctx), conversationId);
      if (!conversation) throw new Error("conversation_not_found");
      if (conversation.status === "locked") throw new Error("conversation_locked");
      const body = requireText(input.body, "body");
      const ts = now();
      const mentions = Object.freeze([...(input.mentionPrincipalIds ?? [])]);
      const message: ConversationMessage = Object.freeze({
        id: id("cmsg"),
        conversationId,
        body,
        authorPrincipalId: ctx.userId ?? "system",
        messageType: input.messageType ?? "comment",
        linkedObjectRefs: Object.freeze([...(input.linkedObjectRefs ?? [])]),
        mentionPrincipalIds: mentions,
        createdAt: ts,
      });
      await store.addMessage(tenant(ctx), message);
      await store.upsertConversation(tenant(ctx), {
        ...conversation,
        lastMessageAt: ts,
        updatedAt: ts,
        unreadCount: conversation.unreadCount + 1,
      });
      if (mentions.length > 0) {
        await store.publishEvent(tenant(ctx), "projects.mention_created", {
          conversationId,
          messageId: message.id,
          mentionPrincipalIds: [...mentions],
          projectId: conversation.projectId,
          anchorType: conversation.anchorType,
          anchorId: conversation.anchorId,
        });
      }
      if (conversation.watcherPrincipalIds.length > 0) {
        await store.publishEvent(tenant(ctx), "projects.conversation_message_created", {
          conversationId,
          messageId: message.id,
          projectId: conversation.projectId,
          watched: true,
        });
      }
      return message;
    },

    async resolveConversation(ctx, conversationId, input) {
      const conversation = await store.getConversation(tenant(ctx), conversationId);
      if (!conversation) throw new Error("conversation_not_found");
      const isDecision =
        conversation.conversationType === "decision" ||
        conversation.anchorType === "decision";
      if (isDecision && !input.decisionOutcome) {
        throw new Error("decision_outcome_required");
      }
      const ts = now();
      const next: Conversation = Object.freeze({
        ...conversation,
        status: input.status ?? "resolved",
        decisionOutcome: input.decisionOutcome ?? conversation.decisionOutcome,
        resolvedAt: ts,
        updatedAt: ts,
        unreadCount: 0,
      });
      const saved = await store.upsertConversation(tenant(ctx), next);
      if (input.summary?.trim()) {
        await store.addMessage(tenant(ctx), {
          id: id("cmsg"),
          conversationId,
          body: input.summary.trim(),
          authorPrincipalId: ctx.userId ?? "system",
          messageType: "system",
          linkedObjectRefs: Object.freeze([]),
          mentionPrincipalIds: Object.freeze([]),
          createdAt: ts,
        });
      }
      if (isDecision && input.decisionOutcome) {
        await store.publishEvent(
          tenant(ctx),
          "projects.decision_conversation_resolved",
          {
            conversationId,
            outcome: input.decisionOutcome,
            projectId: conversation.projectId,
            anchorId: conversation.anchorId,
          },
        );
      }
      return saved;
    },

    listMeetingOutcomes(ctx, scopeType, scopeId) {
      return store.listMeetingOutcomes(tenant(ctx), scopeType, scopeId);
    },

    async createMeetingOutcome(ctx, input) {
      const ts = now();
      const row: MeetingOutcome = Object.freeze({
        id: id("mout"),
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        heldAt: requireText(input.heldAt, "heldAt"),
        title: requireText(input.title, "title"),
        summary: requireText(input.summary, "summary"),
        attendeePrincipalIds: Object.freeze([...(input.attendeePrincipalIds ?? [])]),
        decisionsRecorded: Object.freeze([...(input.decisionsRecorded ?? [])]),
        commitmentsCaptured: Object.freeze([...(input.commitmentsCaptured ?? [])]),
        risksRaised: Object.freeze([...(input.risksRaised ?? [])]),
        actionsCaptured: Object.freeze([...(input.actionsCaptured ?? [])]),
        linkedObjectRefs: Object.freeze([...(input.linkedObjectRefs ?? [])]),
        recordingRef: input.recordingRef,
        createdBy: ctx.userId ?? "system",
        createdAt: ts,
        updatedAt: ts,
      });
      const saved = await store.upsertMeetingOutcome(tenant(ctx), row);
      await store.publishEvent(tenant(ctx), "projects.meeting_outcome_recorded", {
        meetingOutcomeId: saved.id,
        scopeType: saved.scopeType,
        scopeId: saved.scopeId,
        commitmentsCaptured: [...saved.commitmentsCaptured],
        decisionsRecorded: [...saved.decisionsRecorded],
      });
      return saved;
    },

    listNotices(ctx, scopeType, scopeId) {
      return store.listNotices(tenant(ctx), scopeType, scopeId);
    },

    async createNotice(ctx, input) {
      const ts = now();
      const row: ProjectNotice = Object.freeze({
        id: id("pnote"),
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        title: requireText(input.title, "title"),
        body: requireText(input.body, "body"),
        status: "active",
        pinned: Boolean(input.pinned),
        version: 1,
        authorPrincipalId: ctx.userId ?? "system",
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertNotice(tenant(ctx), row);
    },

    listAnnouncements(ctx, scopeType, scopeId) {
      return store.listAnnouncements(tenant(ctx), scopeType, scopeId);
    },

    async createAnnouncement(ctx, input) {
      const ts = now();
      const row: Announcement = Object.freeze({
        id: id("ann"),
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        title: requireText(input.title, "title"),
        body: requireText(input.body, "body"),
        priority: input.priority ?? "info",
        audience: input.audience ?? "core",
        validFrom: input.validFrom ?? ts,
        validTo: input.validTo,
        acknowledgeRequired: Boolean(input.acknowledgeRequired),
        status: "active",
        authorPrincipalId: ctx.userId ?? "system",
        createdAt: ts,
        updatedAt: ts,
      });
      const saved = await store.upsertAnnouncement(tenant(ctx), row);
      await store.publishEvent(tenant(ctx), "projects.announcement_published", {
        announcementId: saved.id,
        priority: saved.priority,
        acknowledgeRequired: saved.acknowledgeRequired,
      });
      return saved;
    },

    async getUnifiedTimeline(ctx, projectId, opts) {
      const entries: CommunicationTimelineEntry[] = [];
      const conversations = await store.listConversations(tenant(ctx), projectId, {
        anchorType: opts?.objectType,
        anchorId: opts?.objectId,
      });
      for (const c of conversations) {
        if (opts?.unresolvedOnly && c.status !== "open") continue;
        entries.push({
          id: `conv:${c.id}`,
          at: c.lastMessageAt ?? c.createdAt,
          source: "conversation",
          kind: c.conversationType,
          summary: c.title ?? `${c.conversationType} conversation`,
          objectType: c.anchorType,
          objectId: c.anchorId,
          conversationId: c.id,
          principalId: c.createdBy,
        });
        if (c.decisionOutcome) {
          entries.push({
            id: `decout:${c.id}`,
            at: c.resolvedAt ?? c.updatedAt,
            source: "decision_outcome",
            kind: c.decisionOutcome,
            summary: `Decision conversation ${c.decisionOutcome}`,
            objectType: c.anchorType,
            objectId: c.anchorId,
            conversationId: c.id,
          });
        }
        const messages = await store.listMessages(tenant(ctx), c.id);
        for (const m of messages) {
          entries.push({
            id: `msg:${m.id}`,
            at: m.createdAt,
            source: "message",
            kind: m.messageType,
            summary: m.body.slice(0, 160),
            objectType: c.anchorType,
            objectId: c.anchorId,
            conversationId: c.id,
            principalId: m.authorPrincipalId,
          });
        }
      }

      const outcomes = await store.listMeetingOutcomes(
        tenant(ctx),
        "project",
        projectId,
      );
      for (const o of outcomes) {
        entries.push({
          id: `mout:${o.id}`,
          at: o.heldAt,
          source: "meeting_outcome",
          kind: "meeting_outcome_recorded",
          summary: o.title,
          objectType: "project",
          objectId: projectId,
          principalId: o.createdBy,
        });
      }

      const notices = await store.listNotices(tenant(ctx), "project", projectId);
      for (const n of notices.filter((x) => x.status === "active")) {
        entries.push({
          id: `notice:${n.id}`,
          at: n.updatedAt,
          source: "notice",
          kind: n.pinned ? "pinned_notice" : "notice",
          summary: n.title,
          objectType: "project",
          objectId: projectId,
          principalId: n.authorPrincipalId,
        });
      }

      if (options.loadOperationalHistory) {
        const ops = await options.loadOperationalHistory(
          ctx,
          projectId,
          opts?.objectType,
          opts?.objectId,
        );
        for (const e of ops) {
          entries.push({
            id: `ops:${e.id}`,
            at: e.at,
            source: "operational_change",
            kind: e.kind,
            summary: e.summary,
            objectType: e.objectType,
            objectId: e.objectId,
            principalId: e.actorUserId,
          });
        }
      }

      return Object.freeze(entries.sort((a, b) => b.at.localeCompare(a.at)));
    },

    async buildDigest(ctx, input) {
      const projectId =
        input.scopeType === "project" ? input.scopeId : (input.projectId ?? "");
      const conversations = projectId
        ? await store.listConversations(tenant(ctx), projectId)
        : [];
      const open = conversations.filter((c) => c.status === "open");
      const outcomes = await store.listMeetingOutcomes(
        tenant(ctx),
        input.scopeType,
        input.scopeId,
      );
      const periodEnd = now();
      const days = input.kind === "daily" ? 1 : input.kind === "weekly" ? 7 : 14;
      const periodStart = new Date(Date.now() - days * 86400000).toISOString();
      const recentOutcomes = outcomes.filter((o) => o.heldAt >= periodStart);
      const summaryLines = [
        `${open.length} open operational conversation(s)`,
        `${recentOutcomes.length} meeting outcome(s) in period`,
        input.kind === "exception"
          ? "Exception digest emphasises escalations and waits"
          : input.kind === "milestone"
            ? "Milestone digest emphasises trajectory evidence"
            : "Activity digest for subscribed principals",
      ];
      const digest: DigestProjection = Object.freeze({
        kind: input.kind,
        scopeType: input.scopeType,
        scopeId: input.scopeId,
        periodStart,
        periodEnd,
        summaryLines: Object.freeze(summaryLines),
        openConversationCount: open.length,
        meetingOutcomeCount: recentOutcomes.length,
        exceptionHighlightCount: open.filter(
          (c) => c.conversationType === "escalation" || c.anchorType === "exception",
        ).length,
        milestoneHighlightCount: open.filter((c) => c.anchorType === "milestone")
          .length,
        publishedEventIntent: "projects.digest_ready",
        computedAt: periodEnd,
      });
      await store.publishEvent(tenant(ctx), "projects.digest_ready", {
        kind: digest.kind,
        scopeType: digest.scopeType,
        scopeId: digest.scopeId,
        summaryLines: [...digest.summaryLines],
      });
      return digest;
    },

    async contextualSearch(ctx, projectId, query) {
      const q = requireText(query, "query").toLowerCase();
      const hits: ContextualSearchHit[] = [];
      const conversations = await store.listConversations(tenant(ctx), projectId);
      for (const c of conversations) {
        const title = (c.title ?? "").toLowerCase();
        const messages = await store.listMessages(tenant(ctx), c.id);
        let matchedMessage: ConversationMessage | undefined;
        if (title.includes(q)) {
          matchedMessage = messages[messages.length - 1];
        } else {
          matchedMessage = messages.find((m) => m.body.toLowerCase().includes(q));
        }
        if (!title.includes(q) && !matchedMessage) continue;
        hits.push({
          conversationId: c.id,
          messageId: matchedMessage?.id,
          projectId,
          anchorType: c.anchorType,
          anchorId: c.anchorId,
          title: c.title ?? `${c.anchorType}:${c.anchorId}`,
          snippet: (matchedMessage?.body ?? c.title ?? "").slice(0, 180),
          deepLink: `/workspace/projects/${projectId}/delivery?obj=${c.anchorType}:${c.anchorId}&panel=discussion`,
        });
      }
      return Object.freeze(hits);
    },
  };
}

export {
  getMemoryProjectsCollaborationStore,
  resetProjectsCollaborationStoreForTests,
  setProjectsCollaborationStoreForTests,
  resolveProjectsCollaborationStore,
} from "./memory-store";
