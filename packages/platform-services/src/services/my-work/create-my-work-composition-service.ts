import type {
  ComposeMyWorkInput,
  MyWorkComposition,
  MyWorkCompositionService,
  MyWorkProviderResult,
  Project,
  ServiceRequestContext,
  SupportTicket,
  Task,
  Timesheet,
} from "@apzhub/platform-service-contracts";

import { composeMyWorkQueues } from "./compose-my-work";
import {
  collectProjectsCards,
  collectQepCards,
  collectSupportCards,
  collectTimeCards,
  collectWorkflowCards,
  type MyWorkProviderDeps,
} from "./providers";

/**
 * Minimal gateway slice for My Work composition.
 * Avoids coupling the composer to the full PlatformServiceGateway type.
 */
export type MyWorkGatewaySlice = {
  readonly projects: {
    listProjects: (
      ctx: ServiceRequestContext,
      query?: {
        readonly filter?: { readonly status?: "active" | "archived" | "all" };
        readonly page?: { readonly perPage?: number };
      },
    ) => Promise<{ readonly items: readonly Project[] }>;
  };
  readonly tasks?: {
    listTasks: (
      ctx: ServiceRequestContext,
      projectId: string,
      query?: {
        readonly filter?: { readonly assigneeId?: string };
        readonly page?: { readonly perPage?: number };
      },
    ) => Promise<{ readonly items: readonly Task[] }>;
  };
  readonly support?: {
    listSupportRequests: (
      ctx: ServiceRequestContext,
      query?: {
        readonly filter?: { readonly assigneeId?: string };
        readonly page?: { readonly perPage?: number };
      },
    ) => Promise<{ readonly items: readonly SupportTicket[] }>;
  };
  readonly time?: {
    readonly timesheets: {
      list: (
        ctx: ServiceRequestContext,
        query?: { readonly page?: { readonly perPage?: number } },
      ) => Promise<{ readonly items: readonly Timesheet[] }>;
    };
  };
  readonly qep?: {
    readonly executions: {
      listAssigned: (ctx: ServiceRequestContext) => Promise<
        readonly {
          readonly id: string;
          readonly executionNumber?: string;
          readonly status: string;
          readonly updatedAt: string;
          readonly projectId?: string;
        }[]
      >;
      listReviewQueue: (ctx: ServiceRequestContext) => Promise<
        readonly {
          readonly id: string;
          readonly executionNumber?: string;
          readonly status: string;
          readonly updatedAt: string;
          readonly projectId?: string;
        }[]
      >;
    };
  };
  readonly workflow?: {
    readonly tasks: {
      listInbox: (
        ctx: ServiceRequestContext,
        input?: { readonly limit?: number },
      ) => Promise<
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
  };
};

function buildDeps(gateway: MyWorkGatewaySlice): MyWorkProviderDeps {
  return {
    listProjects: async (ctx) => {
      const page = await gateway.projects.listProjects(ctx, {
        filter: { status: "active" },
        page: { perPage: 25 },
      });
      return page.items;
    },
    listTasksForProject: async (ctx, projectId, assigneeId) => {
      if (!gateway.tasks) return [];
      const page = await gateway.tasks.listTasks(ctx, projectId, {
        filter: { assigneeId },
        page: { perPage: 50 },
      });
      return page.items;
    },
    listSupportRequests: gateway.support
      ? async (ctx, assigneeId) => {
          const page = await gateway.support!.listSupportRequests(ctx, {
            filter: { assigneeId },
            page: { perPage: 50 },
          });
          return page.items;
        }
      : undefined,
    listTimesheets: gateway.time
      ? async (ctx) => {
          const page = await gateway.time!.timesheets.list(ctx, {
            page: { perPage: 50 },
          });
          return page.items;
        }
      : undefined,
    listQepAssigned: gateway.qep
      ? (ctx) => gateway.qep!.executions.listAssigned(ctx)
      : undefined,
    listQepReviewQueue: gateway.qep
      ? (ctx) => gateway.qep!.executions.listReviewQueue(ctx)
      : undefined,
    listWorkflowInbox: gateway.workflow
      ? (ctx) => gateway.workflow!.tasks.listInbox(ctx, { limit: 50 })
      : undefined,
  };
}

export async function composeMyWorkFromGateway(
  ctx: ServiceRequestContext,
  gateway: MyWorkGatewaySlice,
  input?: ComposeMyWorkInput,
): Promise<MyWorkComposition> {
  const now = input?.now ?? new Date();
  const deps = buildDeps(gateway);

  const providerResults: MyWorkProviderResult[] = await Promise.all([
    collectProjectsCards(ctx, deps, now),
    collectSupportCards(ctx, deps, now),
    collectTimeCards(ctx, deps, now),
    collectQepCards(ctx, deps, now),
    collectWorkflowCards(ctx, deps, now),
  ]);

  const composition = composeMyWorkQueues(providerResults, {
    ...input,
    now,
  });

  return Object.freeze({
    ...composition,
    actorId: ctx.userId,
  });
}

export function createMyWorkCompositionService(
  gateway: MyWorkGatewaySlice,
): MyWorkCompositionService {
  return {
    compose(ctx, input) {
      return composeMyWorkFromGateway(ctx, gateway, input);
    },
  };
}
