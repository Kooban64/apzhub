import { describe, expect, it } from "vitest";

import type { WorkCard } from "@apzhub/platform-service-contracts";

import { composeMyWorkQueues } from "./compose-my-work";
import { projectLifecycle } from "./lifecycle";
import { composeMyWorkFromGateway } from "./create-my-work-composition-service";

const baseCard = (
  overrides: Partial<WorkCard> & Pick<WorkCard, "id" | "queueHints">,
): WorkCard =>
  Object.freeze({
    product: "projects",
    kind: "task",
    sourceId: overrides.id,
    title: "Sample",
    lifecycle: "active",
    href: "/workspace/projects/p1/tasks/t1",
    productLabel: "APZ Projects",
    ...overrides,
  });

describe("projectLifecycle", () => {
  it("maps product statuses without owning them", () => {
    expect(projectLifecycle("projects", "blocked")).toBe("blocked");
    expect(projectLifecycle("support", "pending")).toBe("waiting");
    expect(projectLifecycle("time", "running")).toBe("active");
    expect(projectLifecycle("qep", "submitted_for_review")).toBe("in_review");
    expect(projectLifecycle("workflow", "approved")).toBe("done");
  });
});

describe("composeMyWorkQueues", () => {
  it("bins cards by queueHints and marks partial on provider errors", () => {
    const composition = composeMyWorkQueues(
      [
        {
          providerId: "projects",
          cards: [
            baseCard({
              id: "a",
              queueHints: ["needsMyAttention", "dueToday"],
              title: "Complete Sprint task",
            }),
            baseCard({
              id: "b",
              queueHints: ["waitingForOthers"],
              title: "Waiting",
              lifecycle: "waiting",
            }),
            baseCard({
              id: "c",
              queueHints: ["recentlyCompleted"],
              title: "Done",
              lifecycle: "done",
            }),
          ],
        },
        {
          providerId: "support",
          cards: [],
          error: "unavailable",
        },
      ],
      { displayName: "Kooban" },
    );

    expect(composition.compositionOnly).toBe(true);
    expect(composition.ownsBusinessState).toBe(false);
    expect(composition.partial).toBe(true);
    expect(composition.displayName).toBe("Kooban");
    expect(composition.queues.needsMyAttention).toHaveLength(1);
    expect(composition.queues.dueToday).toHaveLength(1);
    expect(composition.queues.waitingForOthers).toHaveLength(1);
    expect(composition.queues.recentlyCompleted).toHaveLength(1);
  });
});

describe("composeMyWorkFromGateway", () => {
  it("composes references from providers and degrades on failure", async () => {
    const now = new Date("2026-08-05T12:00:00.000Z");
    const composition = await composeMyWorkFromGateway(
      {
        userId: "user_1",
        tenantId: "tenant_1",
        correlationId: "corr_1",
        requestId: "req_1",
        permissions: [],
      },
      {
        projects: {
          listProjects: async () => ({
            items: [
              {
                id: "proj_1",
                name: "ABC",
                status: "active",
              } as never,
            ],
          }),
        },
        tasks: {
          listTasks: async () => ({
            items: [
              {
                id: "task_1",
                projectId: "proj_1",
                title: "Complete Sprint task",
                status: "in_progress",
                statusId: "s1",
                priority: "high",
                labelIds: [],
                dueDate: "2026-08-05T15:00:00.000Z",
                createdAt: "2026-08-01T00:00:00.000Z",
                updatedAt: "2026-08-05T10:00:00.000Z",
              } as never,
            ],
          }),
        },
        support: {
          listSupportRequests: async () => {
            throw new Error("support_down");
          },
        },
        time: {
          timesheets: {
            list: async () => ({ items: [] }),
          },
        },
      },
      { displayName: "Kooban", now },
    );

    expect(
      composition.queues.needsMyAttention.some((c) => c.sourceId === "task_1"),
    ).toBe(true);
    expect(composition.queues.dueToday.some((c) => c.sourceId === "task_1")).toBe(true);
    expect(
      composition.queues.needsMyAttention.some((c) => c.id.includes("submit-today")),
    ).toBe(true);
    expect(composition.partial).toBe(true);
    expect(composition.providers.find((p) => p.providerId === "support")?.error).toBe(
      "support_down",
    );
    for (const card of composition.queues.needsMyAttention) {
      expect(card.href.startsWith("/workspace/")).toBe(true);
    }
  });
});
