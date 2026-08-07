import type {
  Announcement,
  Conversation,
  ConversationMessage,
  MeetingOutcome,
  ProjectNotice,
} from "@apzhub/platform-service-contracts";

type Bucket = {
  conversations: Map<string, Conversation>;
  messages: Map<string, ConversationMessage[]>;
  meetingOutcomes: Map<string, MeetingOutcome>;
  notices: Map<string, ProjectNotice>;
  announcements: Map<string, Announcement>;
  publishedEvents: { type: string; payload: Record<string, unknown>; at: string }[];
};

const tenants = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    b = {
      conversations: new Map(),
      messages: new Map(),
      meetingOutcomes: new Map(),
      notices: new Map(),
      announcements: new Map(),
      publishedEvents: [],
    };
    tenants.set(tenantId, b);
  }
  return b;
}

export type ProjectsCollaborationStore = {
  readonly listConversations: (
    tenantId: string,
    projectId: string,
    filter?: {
      anchorType?: string;
      anchorId?: string;
      conversationType?: string;
      status?: string;
    },
  ) => Promise<readonly Conversation[]>;
  readonly getConversation: (
    tenantId: string,
    id: string,
  ) => Promise<Conversation | null>;
  readonly upsertConversation: (
    tenantId: string,
    row: Conversation,
  ) => Promise<Conversation>;
  readonly listMessages: (
    tenantId: string,
    conversationId: string,
  ) => Promise<readonly ConversationMessage[]>;
  readonly addMessage: (
    tenantId: string,
    row: ConversationMessage,
  ) => Promise<ConversationMessage>;
  readonly listMeetingOutcomes: (
    tenantId: string,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly MeetingOutcome[]>;
  readonly upsertMeetingOutcome: (
    tenantId: string,
    row: MeetingOutcome,
  ) => Promise<MeetingOutcome>;
  readonly listNotices: (
    tenantId: string,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly ProjectNotice[]>;
  readonly upsertNotice: (
    tenantId: string,
    row: ProjectNotice,
  ) => Promise<ProjectNotice>;
  readonly listAnnouncements: (
    tenantId: string,
    scopeType: string,
    scopeId: string,
  ) => Promise<readonly Announcement[]>;
  readonly upsertAnnouncement: (
    tenantId: string,
    row: Announcement,
  ) => Promise<Announcement>;
  readonly publishEvent: (
    tenantId: string,
    type: string,
    payload: Record<string, unknown>,
  ) => Promise<void>;
  readonly listPublishedEvents: (
    tenantId: string,
  ) => Promise<
    readonly { type: string; payload: Record<string, unknown>; at: string }[]
  >;
};

let override: ProjectsCollaborationStore | null = null;

export function setProjectsCollaborationStoreForTests(
  store: ProjectsCollaborationStore | null,
): void {
  override = store;
}

export function resetProjectsCollaborationStoreForTests(): void {
  tenants.clear();
  override = null;
}

export function getMemoryProjectsCollaborationStore(): ProjectsCollaborationStore {
  return {
    async listConversations(tenantId, projectId, filter) {
      return Object.freeze(
        [...bucket(tenantId).conversations.values()].filter((c) => {
          if (c.projectId !== projectId) return false;
          if (filter?.anchorType && c.anchorType !== filter.anchorType) return false;
          if (filter?.anchorId && c.anchorId !== filter.anchorId) return false;
          if (
            filter?.conversationType &&
            c.conversationType !== filter.conversationType
          ) {
            return false;
          }
          if (filter?.status && c.status !== filter.status) return false;
          return true;
        }),
      );
    },
    async getConversation(tenantId, id) {
      return bucket(tenantId).conversations.get(id) ?? null;
    },
    async upsertConversation(tenantId, row) {
      const frozen = Object.freeze({
        ...row,
        watcherPrincipalIds: Object.freeze([...row.watcherPrincipalIds]),
      });
      bucket(tenantId).conversations.set(row.id, frozen);
      return frozen;
    },
    async listMessages(tenantId, conversationId) {
      return Object.freeze([...(bucket(tenantId).messages.get(conversationId) ?? [])]);
    },
    async addMessage(tenantId, row) {
      const b = bucket(tenantId);
      const list = [...(b.messages.get(row.conversationId) ?? [])];
      const frozen = Object.freeze({
        ...row,
        linkedObjectRefs: Object.freeze([...row.linkedObjectRefs]),
        mentionPrincipalIds: Object.freeze([...row.mentionPrincipalIds]),
      });
      list.push(frozen);
      b.messages.set(row.conversationId, list);
      return frozen;
    },
    async listMeetingOutcomes(tenantId, scopeType, scopeId) {
      return Object.freeze(
        [...bucket(tenantId).meetingOutcomes.values()].filter(
          (m) => m.scopeType === scopeType && m.scopeId === scopeId,
        ),
      );
    },
    async upsertMeetingOutcome(tenantId, row) {
      const frozen = Object.freeze({
        ...row,
        attendeePrincipalIds: Object.freeze([...row.attendeePrincipalIds]),
        decisionsRecorded: Object.freeze([...row.decisionsRecorded]),
        commitmentsCaptured: Object.freeze([...row.commitmentsCaptured]),
        risksRaised: Object.freeze([...row.risksRaised]),
        actionsCaptured: Object.freeze([...row.actionsCaptured]),
        linkedObjectRefs: Object.freeze([...row.linkedObjectRefs]),
      });
      bucket(tenantId).meetingOutcomes.set(row.id, frozen);
      return frozen;
    },
    async listNotices(tenantId, scopeType, scopeId) {
      return Object.freeze(
        [...bucket(tenantId).notices.values()].filter(
          (n) => n.scopeType === scopeType && n.scopeId === scopeId,
        ),
      );
    },
    async upsertNotice(tenantId, row) {
      const frozen = Object.freeze({ ...row });
      bucket(tenantId).notices.set(row.id, frozen);
      return frozen;
    },
    async listAnnouncements(tenantId, scopeType, scopeId) {
      return Object.freeze(
        [...bucket(tenantId).announcements.values()].filter(
          (a) => a.scopeType === scopeType && a.scopeId === scopeId,
        ),
      );
    },
    async upsertAnnouncement(tenantId, row) {
      const frozen = Object.freeze({ ...row });
      bucket(tenantId).announcements.set(row.id, frozen);
      return frozen;
    },
    async publishEvent(tenantId, type, payload) {
      bucket(tenantId).publishedEvents.push({
        type,
        payload,
        at: new Date().toISOString(),
      });
    },
    async listPublishedEvents(tenantId) {
      return Object.freeze([...bucket(tenantId).publishedEvents]);
    },
  };
}

export function resolveProjectsCollaborationStore(): ProjectsCollaborationStore {
  if (override) return override;
  return getMemoryProjectsCollaborationStore();
}
