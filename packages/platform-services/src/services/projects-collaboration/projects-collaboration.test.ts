import { beforeEach, describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createProjectsCollaborationService,
  getMemoryProjectsCollaborationStore,
  resetProjectsCollaborationStoreForTests,
} from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "t1",
    userId: "user_1",
    correlationId: "corr_1",
  } as ServiceRequestContext;
}

describe("Projects Collaboration (PX-04 / W007)", () => {
  beforeEach(() => {
    resetProjectsCollaborationStoreForTests();
  });

  it("requires operational anchors — no orphan conversations", async () => {
    const svc = createProjectsCollaborationService(
      getMemoryProjectsCollaborationStore(),
    );
    await expect(
      svc.createConversation(ctx(), {
        projectId: "prj_1",
        anchorType: "commitment",
        anchorId: "",
      }),
    ).rejects.toThrow(/anchorId_required/);
  });

  it("posts messages and publishes mention events only", async () => {
    const store = getMemoryProjectsCollaborationStore();
    const svc = createProjectsCollaborationService(store);
    const conversation = await svc.createConversation(ctx(), {
      projectId: "prj_1",
      anchorType: "commitment",
      anchorId: "cmt_1",
    });
    const message = await svc.postMessage(ctx(), conversation.id, {
      body: "Need unblock @user_2",
      mentionPrincipalIds: ["user_2"],
    });
    expect(message.mentionPrincipalIds).toEqual(["user_2"]);
    const events = await store.listPublishedEvents("t1");
    expect(events.some((e) => e.type === "projects.mention_created")).toBe(true);
  });

  it("requires decision outcome on decision conversations", async () => {
    const svc = createProjectsCollaborationService(
      getMemoryProjectsCollaborationStore(),
    );
    const conversation = await svc.createConversation(ctx(), {
      projectId: "prj_1",
      anchorType: "decision",
      anchorId: "dec_1",
    });
    expect(conversation.conversationType).toBe("decision");
    await expect(
      svc.resolveConversation(ctx(), conversation.id, { status: "resolved" }),
    ).rejects.toThrow(/decision_outcome_required/);
    const resolved = await svc.resolveConversation(ctx(), conversation.id, {
      decisionOutcome: "approved",
      summary: "Approved in steering",
    });
    expect(resolved.decisionOutcome).toBe("approved");
    expect(resolved.status).toBe("resolved");
  });

  it("records meeting outcomes and emits digest-ready events", async () => {
    const store = getMemoryProjectsCollaborationStore();
    const svc = createProjectsCollaborationService(store);
    const outcome = await svc.createMeetingOutcome(ctx(), {
      scopeType: "project",
      scopeId: "prj_1",
      heldAt: new Date().toISOString(),
      title: "Steering",
      summary: "Agreed go-live gate",
      commitmentsCaptured: ["cmt_new"],
      decisionsRecorded: ["dec_1"],
    });
    expect(outcome.commitmentsCaptured).toContain("cmt_new");
    const digest = await svc.buildDigest(ctx(), {
      kind: "weekly",
      scopeType: "project",
      scopeId: "prj_1",
    });
    expect(digest.publishedEventIntent).toBe("projects.digest_ready");
    expect(digest.meetingOutcomeCount).toBeGreaterThanOrEqual(1);
    const events = await store.listPublishedEvents("t1");
    expect(events.some((e) => e.type === "projects.meeting_outcome_recorded")).toBe(
      true,
    );
    expect(events.some((e) => e.type === "projects.digest_ready")).toBe(true);
  });

  it("contextual search returns conversation in owning object context", async () => {
    const svc = createProjectsCollaborationService(
      getMemoryProjectsCollaborationStore(),
    );
    const conversation = await svc.createConversation(ctx(), {
      projectId: "prj_1",
      anchorType: "risk",
      anchorId: "risk_1",
      title: "Vendor concentration",
    });
    await svc.postMessage(ctx(), conversation.id, {
      body: "Mitigation needs CAB approval",
    });
    const hits = await svc.contextualSearch(ctx(), "prj_1", "CAB");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.anchorType).toBe("risk");
    expect(hits[0]?.deepLink).toContain("panel=discussion");
    expect(hits[0]?.deepLink).toContain("risk:risk_1");
  });

  it("unified timeline composes conversations and meeting outcomes", async () => {
    const svc = createProjectsCollaborationService(
      getMemoryProjectsCollaborationStore(),
      {
        loadOperationalHistory: async () => [
          {
            id: "oh_1",
            at: "2026-01-01T00:00:00.000Z",
            kind: "status_changed",
            summary: "Commitment started",
            objectType: "commitment",
            objectId: "cmt_1",
          },
        ],
      },
    );
    await svc.createConversation(ctx(), {
      projectId: "prj_1",
      anchorType: "commitment",
      anchorId: "cmt_1",
    });
    await svc.createMeetingOutcome(ctx(), {
      scopeType: "project",
      scopeId: "prj_1",
      heldAt: "2026-02-01T00:00:00.000Z",
      title: "Weekly",
      summary: "Tracked",
    });
    const timeline = await svc.getUnifiedTimeline(ctx(), "prj_1");
    const sources = new Set(timeline.map((e) => e.source));
    expect(sources.has("conversation")).toBe(true);
    expect(sources.has("meeting_outcome")).toBe(true);
    expect(sources.has("operational_change")).toBe(true);
  });
});
