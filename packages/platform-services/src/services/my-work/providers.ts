import type {
  MyWorkProviderResult,
  MyWorkQueueId,
  Project,
  ServiceRequestContext,
  SupportTicket,
  Task,
  Timesheet,
  WorkCard,
} from "@apzhub/platform-service-contracts";

import { isRecentlyCompleted, isSameUtcDay, projectLifecycle } from "./lifecycle";

export type MyWorkProviderDeps = {
  readonly listProjects: (ctx: ServiceRequestContext) => Promise<readonly Project[]>;
  readonly listTasksForProject: (
    ctx: ServiceRequestContext,
    projectId: string,
    assigneeId: string,
  ) => Promise<readonly Task[]>;
  readonly listSupportRequests?: (
    ctx: ServiceRequestContext,
    assigneeId: string,
  ) => Promise<readonly SupportTicket[]>;
  readonly listTimesheets?: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly Timesheet[]>;
  readonly listQepAssigned?: (ctx: ServiceRequestContext) => Promise<
    readonly {
      readonly id: string;
      readonly executionNumber?: string;
      readonly status: string;
      readonly updatedAt: string;
      readonly projectId?: string;
    }[]
  >;
  readonly listQepReviewQueue?: (ctx: ServiceRequestContext) => Promise<
    readonly {
      readonly id: string;
      readonly executionNumber?: string;
      readonly status: string;
      readonly updatedAt: string;
      readonly projectId?: string;
    }[]
  >;
  readonly listWorkflowInbox?: (ctx: ServiceRequestContext) => Promise<
    readonly {
      readonly id: string;
      readonly title: string;
      readonly status: string;
      readonly kind?: string;
      readonly dueAt?: string;
      readonly updatedAt: string;
      readonly completedAt?: string;
    }[]
  >;
};

function hints(...queueIds: MyWorkQueueId[]): readonly MyWorkQueueId[] {
  return Object.freeze(queueIds);
}

async function safeProvider(
  providerId: string,
  run: () => Promise<readonly WorkCard[]>,
): Promise<MyWorkProviderResult> {
  try {
    const cards = await run();
    return Object.freeze({ providerId, cards: Object.freeze([...cards]) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "provider_failed";
    return Object.freeze({
      providerId,
      cards: Object.freeze([]),
      error: message,
    });
  }
}

export async function collectProjectsCards(
  ctx: ServiceRequestContext,
  deps: MyWorkProviderDeps,
  now: Date,
): Promise<MyWorkProviderResult> {
  const userId = ctx.userId;
  if (!userId) {
    return Object.freeze({
      providerId: "projects",
      cards: Object.freeze([]),
      error: "missing_user",
    });
  }

  return safeProvider("projects", async () => {
    const projects = await deps.listProjects(ctx);
    const cards: WorkCard[] = [];
    const limited = projects.slice(0, 25);

    for (const project of limited) {
      const tasks = await deps.listTasksForProject(ctx, project.id, userId);
      for (const task of tasks.slice(0, 50)) {
        const lifecycle = projectLifecycle("projects", task.status);
        const queueHints: MyWorkQueueId[] = [];

        if (lifecycle === "done" || lifecycle === "closed") {
          if (isRecentlyCompleted(task.updatedAt, now)) {
            queueHints.push("recentlyCompleted");
          }
        } else if (lifecycle === "blocked") {
          queueHints.push("waitingForOthers");
          queueHints.push("needsMyAttention");
        } else {
          queueHints.push("needsMyAttention");
          if (isSameUtcDay(task.dueDate, now)) {
            queueHints.push("dueToday");
          }
          if (task.priority === "high" || task.priority === "urgent") {
            if (!queueHints.includes("needsMyAttention")) {
              queueHints.push("needsMyAttention");
            }
          }
        }

        if (queueHints.length === 0) continue;

        cards.push(
          Object.freeze({
            id: `projects:task:${task.id}`,
            product: "projects",
            kind: "task",
            sourceId: task.id,
            title: task.title,
            lifecycle,
            href: `/workspace/projects/${task.projectId}/tasks/${task.id}`,
            dueAt: task.dueDate,
            priority: task.priority,
            updatedAt: task.updatedAt,
            nativeStatus: task.status,
            queueHints: hints(...queueHints),
            productLabel: "APZ Projects",
          }),
        );
      }
    }

    return cards;
  });
}

export async function collectSupportCards(
  ctx: ServiceRequestContext,
  deps: MyWorkProviderDeps,
  now: Date,
): Promise<MyWorkProviderResult> {
  if (!deps.listSupportRequests || !ctx.userId) {
    return Object.freeze({ providerId: "support", cards: Object.freeze([]) });
  }

  return safeProvider("support", async () => {
    const tickets = await deps.listSupportRequests!(ctx, ctx.userId!);
    const cards: WorkCard[] = [];

    for (const ticket of tickets.slice(0, 50)) {
      const lifecycle = projectLifecycle("support", ticket.status);
      const queueHints: MyWorkQueueId[] = [];

      if (lifecycle === "closed") {
        if (isRecentlyCompleted(ticket.updatedAt, now)) {
          queueHints.push("recentlyCompleted");
        }
      } else if (lifecycle === "waiting") {
        queueHints.push("waitingForOthers");
      } else {
        queueHints.push("needsMyAttention");
        if (ticket.priority === "urgent" || ticket.priority === "high") {
          queueHints.push("needsMyAttention");
        }
      }

      if (queueHints.length === 0) continue;

      cards.push(
        Object.freeze({
          id: `support:request:${ticket.id}`,
          product: "support",
          kind: "support_request",
          sourceId: ticket.id,
          title: ticket.title,
          lifecycle,
          href: `/workspace/support/requests/${ticket.id}`,
          priority: ticket.priority,
          updatedAt: ticket.updatedAt,
          nativeStatus: ticket.status,
          queueHints: hints(...queueHints),
          productLabel: "APZ Support",
        }),
      );
    }

    return cards;
  });
}

export async function collectTimeCards(
  ctx: ServiceRequestContext,
  deps: MyWorkProviderDeps,
  now: Date,
): Promise<MyWorkProviderResult> {
  if (!deps.listTimesheets) {
    return Object.freeze({ providerId: "time", cards: Object.freeze([]) });
  }

  return safeProvider("time", async () => {
    const sheets = await deps.listTimesheets!(ctx);
    const cards: WorkCard[] = [];
    const mine = ctx.userId ? sheets.filter((s) => s.userId === ctx.userId) : sheets;

    const running = mine.find((s) => s.status === "running");
    if (running) {
      cards.push(
        Object.freeze({
          id: `time:timesheet:${running.id}`,
          product: "time",
          kind: "timesheet",
          sourceId: running.id,
          title: running.description?.trim() || "Running timer needs attention",
          lifecycle: projectLifecycle("time", running.status),
          href: "/workspace/time",
          updatedAt: running.updatedAt,
          nativeStatus: running.status,
          queueHints: hints("needsMyAttention"),
          productLabel: "APZ Time",
        }),
      );
    }

    const hasEntryToday = mine.some(
      (s) => isSameUtcDay(s.startedAt, now) || isSameUtcDay(s.updatedAt, now),
    );
    if (!hasEntryToday && !running) {
      cards.push(
        Object.freeze({
          id: "time:obligation:submit-today",
          product: "time",
          kind: "timesheet",
          sourceId: "submit-today",
          title: "Submit today's timesheet",
          lifecycle: "ready" as const,
          href: "/workspace/time",
          dueAt: now.toISOString(),
          queueHints: hints("dueToday", "needsMyAttention"),
          productLabel: "APZ Time",
        }),
      );
    }

    for (const sheet of mine.filter((s) => s.status === "stopped").slice(0, 10)) {
      if (!isRecentlyCompleted(sheet.updatedAt, now)) continue;
      cards.push(
        Object.freeze({
          id: `time:timesheet:${sheet.id}:done`,
          product: "time",
          kind: "timesheet",
          sourceId: sheet.id,
          title: sheet.description?.trim() || "Timesheet entry completed",
          lifecycle: "done",
          href: "/workspace/time",
          updatedAt: sheet.updatedAt,
          nativeStatus: sheet.status,
          queueHints: hints("recentlyCompleted"),
          productLabel: "APZ Time",
        }),
      );
    }

    return cards;
  });
}

export async function collectQepCards(
  ctx: ServiceRequestContext,
  deps: MyWorkProviderDeps,
  now: Date,
): Promise<MyWorkProviderResult> {
  if (!deps.listQepAssigned && !deps.listQepReviewQueue) {
    return Object.freeze({ providerId: "qep", cards: Object.freeze([]) });
  }

  return safeProvider("qep", async () => {
    const cards: WorkCard[] = [];
    const assigned = deps.listQepAssigned ? await deps.listQepAssigned(ctx) : [];
    const review = deps.listQepReviewQueue ? await deps.listQepReviewQueue(ctx) : [];

    for (const exec of assigned.slice(0, 40)) {
      const lifecycle = projectLifecycle("qep", exec.status);
      const title = exec.executionNumber
        ? `Verify quality execution ${exec.executionNumber}`
        : `Verify quality execution ${exec.id}`;
      const queueHints: MyWorkQueueId[] =
        lifecycle === "done" || lifecycle === "closed"
          ? isRecentlyCompleted(exec.updatedAt, now)
            ? ["recentlyCompleted"]
            : []
          : ["needsMyAttention"];

      if (queueHints.length === 0) continue;

      cards.push(
        Object.freeze({
          id: `qep:execution:${exec.id}`,
          product: "qep",
          kind: "quality_execution",
          sourceId: exec.id,
          title,
          lifecycle,
          href: `/workspace/qep/test-execution/executions/${exec.id}`,
          updatedAt: exec.updatedAt,
          nativeStatus: exec.status,
          queueHints: hints(...queueHints),
          productLabel: "APZQEP",
        }),
      );
    }

    for (const exec of review.slice(0, 40)) {
      cards.push(
        Object.freeze({
          id: `qep:execution-review:${exec.id}`,
          product: "qep",
          kind: "quality_execution",
          sourceId: exec.id,
          title: exec.executionNumber
            ? `Review quality execution ${exec.executionNumber}`
            : `Review quality execution ${exec.id}`,
          lifecycle: projectLifecycle("qep", exec.status || "submitted_for_review"),
          href: `/workspace/qep/test-execution/executions/${exec.id}`,
          updatedAt: exec.updatedAt,
          nativeStatus: exec.status,
          queueHints: hints("needsMyAttention"),
          productLabel: "APZQEP",
        }),
      );
    }

    return cards;
  });
}

export async function collectWorkflowCards(
  ctx: ServiceRequestContext,
  deps: MyWorkProviderDeps,
  now: Date,
): Promise<MyWorkProviderResult> {
  if (!deps.listWorkflowInbox) {
    return Object.freeze({ providerId: "workflow", cards: Object.freeze([]) });
  }

  return safeProvider("workflow", async () => {
    const tasks = await deps.listWorkflowInbox!(ctx);
    const cards: WorkCard[] = [];

    for (const task of tasks.slice(0, 50)) {
      const lifecycle = projectLifecycle("workflow", task.status);
      const queueHints: MyWorkQueueId[] = [];

      if (lifecycle === "done" || lifecycle === "closed") {
        if (isRecentlyCompleted(task.completedAt ?? task.updatedAt, now)) {
          queueHints.push("recentlyCompleted");
        }
      } else {
        queueHints.push("needsMyAttention");
        if (isSameUtcDay(task.dueAt, now)) {
          queueHints.push("dueToday");
        }
      }

      if (queueHints.length === 0) continue;

      const prefix = task.kind === "approval" ? "Approve" : "Complete workflow task";

      cards.push(
        Object.freeze({
          id: `workflow:task:${task.id}`,
          product: "workflow",
          kind: "workflow_task",
          sourceId: task.id,
          title: task.title?.trim() || `${prefix}`,
          lifecycle,
          href: `/workspace/workflow/tasks/${task.id}`,
          dueAt: task.dueAt,
          updatedAt: task.updatedAt,
          nativeStatus: task.status,
          queueHints: hints(...queueHints),
          productLabel: "Workflow",
        }),
      );
    }

    return cards;
  });
}
