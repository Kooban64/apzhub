/**
 * My Work composition HTTP handler (APZHUB-CAPABILITY-001-ENG-001).
 * Projection only — never mutates product Systems of Record.
 */

import type { NextRequest } from "next/server";

import {
  composeMyWorkFromGateway,
  type MyWorkGatewaySlice,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonDataResponse } from "../response";

function trySlice<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

async function buildMyWorkGatewaySlice(): Promise<MyWorkGatewaySlice> {
  const gateway = await getPlatformServiceGateway();
  const bootstrap = await getPlatformApiGatewayBootstrap();

  const slice: MyWorkGatewaySlice = {
    projects: {
      listProjects: (ctx, query) => gateway.projects.listProjects(ctx, query),
    },
  };

  const tasks = trySlice(() => gateway.tasks);
  if (tasks) {
    Object.assign(slice, {
      tasks: {
        listTasks: (
          ctx: Parameters<typeof tasks.listTasks>[0],
          projectId: Parameters<typeof tasks.listTasks>[1],
          query: Parameters<typeof tasks.listTasks>[2],
        ) => tasks.listTasks(ctx, projectId, query),
      },
    });
  }

  const support = trySlice(() => gateway.support);
  if (support) {
    Object.assign(slice, {
      support: {
        listSupportRequests: (
          ctx: Parameters<typeof support.listSupportRequests>[0],
          query: Parameters<typeof support.listSupportRequests>[1],
        ) => support.listSupportRequests(ctx, query),
      },
    });
  }

  if (bootstrap.timeEnabled) {
    const time = trySlice(() => gateway.time);
    if (time) {
      Object.assign(slice, {
        time: {
          timesheets: {
            list: (
              ctx: Parameters<typeof time.timesheets.list>[0],
              query: Parameters<typeof time.timesheets.list>[1],
            ) => time.timesheets.list(ctx, query),
          },
        },
      });
    }
  }

  if (bootstrap.qepEnabled) {
    const qep = trySlice(() => gateway.qep);
    if (qep?.executions) {
      Object.assign(slice, {
        qep: {
          executions: {
            listAssigned: (ctx: Parameters<typeof qep.executions.listAssigned>[0]) =>
              qep.executions.listAssigned(ctx),
            listReviewQueue: (
              ctx: Parameters<typeof qep.executions.listReviewQueue>[0],
            ) => qep.executions.listReviewQueue(ctx),
          },
        },
      });
    }
  }

  const workflow = trySlice(() => gateway.workflow);
  if (workflow?.tasks?.listInbox) {
    Object.assign(slice, {
      workflow: {
        tasks: {
          listInbox: (
            ctx: Parameters<typeof workflow.tasks.listInbox>[0],
            input: Parameters<typeof workflow.tasks.listInbox>[1],
          ) => workflow.tasks.listInbox(ctx, input),
        },
      },
    });
  }

  return slice;
}

export async function handleGetMyWork(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const slice = await buildMyWorkGatewaySlice();
  const displayName =
    context.session.user.name?.trim() ||
    context.session.user.email?.trim() ||
    undefined;

  const composition = await composeMyWorkFromGateway(context.serviceContext, slice, {
    displayName,
  });

  return jsonDataResponse(composition, context.tracing);
}
