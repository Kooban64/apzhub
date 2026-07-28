/**
 * Time Platform Services → Search Publication Orchestration (Platform-1.3-ENG-001).
 * Composition-root wrapper — does not modify @apzhub/platform-services.
 */

import type {
  ServiceRequestContext,
  TimeActivity,
  TimeCustomer,
  TimePlatformGateway,
  TimeProject,
  TimeTag,
  Timesheet,
} from "@apzhub/platform-service-contracts";
import type { TimePlatformServicesBundle } from "@apzhub/platform-services";
import {
  enqueueProductPublicationSafely,
  type PublicationDispatcher,
} from "@apzhub/search-orchestrator";
import {
  TimeSearchEntityMapper,
  createTimeSearchPublicationContext,
} from "@apzhub/search-time";

import {
  getSearchPublicationRuntime,
  markSearchCompositionRegistered,
  scheduleSearchPublicationDrain,
} from "../publication-runtime";

function toHookContext(ctx: ServiceRequestContext) {
  return {
    tenantId: ctx.tenantId,
    organisationId: ctx.organisationId,
    correlationId: ctx.correlationId ?? "corr_missing",
    actorUserId: ctx.userId,
  };
}

function enqueueTimeUpsert(
  dispatcher: PublicationDispatcher,
  ctx: ServiceRequestContext,
  entityType:
    "time_entry" | "time_activity" | "time_customer" | "time_project" | "time_tag",
  entity: Timesheet | TimeActivity | TimeCustomer | TimeProject | TimeTag,
  operation: "publish" | "update",
  mapper: TimeSearchEntityMapper,
): void {
  const publicationContext = createTimeSearchPublicationContext({
    serviceContext: ctx,
  });
  const draft = mapper.map(publicationContext, {
    entityType,
    entity: entity as never,
  });
  void enqueueProductPublicationSafely(dispatcher, toHookContext(ctx), {
    entityId: draft.entityId,
    entityType,
    productId: "time",
    operation,
    payload: draft,
  }).then(() => scheduleSearchPublicationDrain());
}

function enqueueTimeArchive(
  dispatcher: PublicationDispatcher,
  ctx: ServiceRequestContext,
  entityType: string,
  entityId: string,
): void {
  void enqueueProductPublicationSafely(dispatcher, toHookContext(ctx), {
    entityId,
    entityType,
    productId: "time",
    operation: "lifecycle",
    payload: { entityId, state: "archived", reason: "archive" },
  }).then(() => scheduleSearchPublicationDrain());
}

/**
 * Wrap Time gateway surface so successful mutations enqueue journal publications.
 */
export function withTimeSearchPublicationOrchestration(
  gateway: TimePlatformGateway,
  dispatcher: PublicationDispatcher,
  mapper: TimeSearchEntityMapper = new TimeSearchEntityMapper(),
): TimePlatformGateway {
  return {
    ...gateway,
    activities: {
      ...gateway.activities,
      async create(ctx, input) {
        const entity = await gateway.activities.create(ctx, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_activity", entity, "publish", mapper);
        return entity;
      },
      async update(ctx, id, input) {
        const entity = await gateway.activities.update(ctx, id, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_activity", entity, "update", mapper);
        return entity;
      },
      async archive(ctx, id) {
        const entity = await gateway.activities.archive(ctx, id);
        enqueueTimeArchive(dispatcher, ctx, "time_activity", entity.id);
        return entity;
      },
    },
    customers: {
      ...gateway.customers,
      async create(ctx, input) {
        const entity = await gateway.customers.create(ctx, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_customer", entity, "publish", mapper);
        return entity;
      },
      async update(ctx, id, input) {
        const entity = await gateway.customers.update(ctx, id, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_customer", entity, "update", mapper);
        return entity;
      },
      async archive(ctx, id) {
        const entity = await gateway.customers.archive(ctx, id);
        enqueueTimeArchive(dispatcher, ctx, "time_customer", entity.id);
        return entity;
      },
    },
    projects: {
      ...gateway.projects,
      async create(ctx, input) {
        const entity = await gateway.projects.create(ctx, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_project", entity, "publish", mapper);
        return entity;
      },
      async update(ctx, id, input) {
        const entity = await gateway.projects.update(ctx, id, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_project", entity, "update", mapper);
        return entity;
      },
      async archive(ctx, id) {
        const entity = await gateway.projects.archive(ctx, id);
        enqueueTimeArchive(dispatcher, ctx, "time_project", entity.id);
        return entity;
      },
    },
    timesheets: {
      ...gateway.timesheets,
      async create(ctx, input) {
        const entity = await gateway.timesheets.create(ctx, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_entry", entity, "publish", mapper);
        return entity;
      },
      async update(ctx, id, input) {
        const entity = await gateway.timesheets.update(ctx, id, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_entry", entity, "update", mapper);
        return entity;
      },
      async stop(ctx, id) {
        const entity = await gateway.timesheets.stop(ctx, id);
        enqueueTimeUpsert(dispatcher, ctx, "time_entry", entity, "update", mapper);
        return entity;
      },
      async archive(ctx, id) {
        const entity = await gateway.timesheets.archive(ctx, id);
        enqueueTimeArchive(dispatcher, ctx, "time_entry", entity.id);
        return entity;
      },
    },
    tags: {
      ...gateway.tags,
      async create(ctx, input) {
        const entity = await gateway.tags.create(ctx, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_tag", entity, "publish", mapper);
        return entity;
      },
      async update(ctx, id, input) {
        const entity = await gateway.tags.update(ctx, id, input);
        enqueueTimeUpsert(dispatcher, ctx, "time_tag", entity, "update", mapper);
        return entity;
      },
      async archive(ctx, id) {
        const entity = await gateway.tags.archive(ctx, id);
        enqueueTimeArchive(dispatcher, ctx, "time_tag", entity.id);
        return entity;
      },
    },
  };
}

/**
 * Wire Time bundle at gateway composition root for live Search drain.
 */
export function wireTimeBundleSearchPublication(
  bundle: TimePlatformServicesBundle,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): TimePlatformServicesBundle {
  const runtime = getSearchPublicationRuntime(env);
  const gatewaySurface = withTimeSearchPublicationOrchestration(
    bundle.gatewaySurface,
    runtime.dispatcher,
  );
  markSearchCompositionRegistered("time");
  return {
    ...bundle,
    gatewaySurface,
    wrapWithPipeline: (pipeline) => {
      const wrapped = bundle.wrapWithPipeline(pipeline);
      // Pipeline wraps services; re-apply publication on the pipeline gateway.
      return withTimeSearchPublicationOrchestration(wrapped, runtime.dispatcher);
    },
  };
}
