import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import {
  createIntegrationError,
  IntegrationSdkError,
} from "@apzhub/integration-sdk/errors";

import type { KimaiRestClient } from "../internal/kimai-rest-client";
import {
  mapKimaiActivity,
  mapKimaiCustomer,
  mapKimaiProject,
  mapKimaiTag,
  mapKimaiTimesheet,
  normalizeTagRecords,
} from "../mappers/domain-mappers";
import {
  fromPlatformTimeId,
  KIMAI_ID_PREFIX,
  toKimaiDateTime,
} from "../mappers/id-helpers";
import type {
  KimaiDomainActivity,
  KimaiDomainCustomer,
  KimaiDomainListQuery,
  KimaiDomainPageResult,
  KimaiDomainProject,
  KimaiDomainTag,
  KimaiDomainTimesheet,
} from "../models/domain";

function pageResult<T>(
  items: readonly T[],
  query?: KimaiDomainListQuery,
): KimaiDomainPageResult<T> {
  const page = query?.page ?? 1;
  const perPage = query?.perPage ?? 50;
  return {
    items,
    totalCount: items.length,
    page,
    perPage,
    hasNextPage: items.length >= perPage,
  };
}

function listQuery(query?: KimaiDomainListQuery) {
  return {
    page: query?.page ?? 1,
    size: query?.perPage ?? 50,
    term: query?.search,
    visible: 1,
  };
}

export interface KimaiDomainWriteInputs {
  readonly createTimesheet: {
    readonly description?: string;
    readonly startedAt?: string;
    readonly activityId?: string;
    readonly customerId?: string;
    readonly projectId?: string;
    readonly tagIds?: readonly string[];
    readonly billable?: boolean;
  };
  readonly updateTimesheet: {
    readonly description?: string;
    readonly activityId?: string | null;
    readonly customerId?: string | null;
    readonly projectId?: string | null;
    readonly tagIds?: readonly string[];
    readonly billable?: boolean;
    readonly endedAt?: string;
  };
  readonly createActivity: {
    readonly name: string;
    readonly description?: string;
    readonly projectId?: string;
  };
  readonly updateActivity: {
    readonly name?: string;
    readonly description?: string;
    readonly projectId?: string | null;
  };
  readonly createCustomer: { readonly name: string; readonly number?: string };
  readonly updateCustomer: { readonly name?: string; readonly number?: string };
  readonly createProject: { readonly name: string; readonly customerId?: string };
  readonly updateProject: {
    readonly name?: string;
    readonly customerId?: string | null;
  };
  readonly createTag: { readonly name: string; readonly color?: string };
  readonly updateTag: { readonly name?: string; readonly color?: string };
}

function optionalEngineId(
  prefix: (typeof KIMAI_ID_PREFIX)[keyof typeof KIMAI_ID_PREFIX],
  platformId: string | null | undefined,
  correlationId: string,
): number | null | undefined {
  if (platformId === undefined) return undefined;
  if (platformId === null) return null;
  return fromPlatformTimeId(prefix, platformId, correlationId);
}

function tagNamesFromIds(
  tagIds: readonly string[] | undefined,
  correlationId: string,
): string[] | undefined {
  if (!tagIds) return undefined;
  return tagIds.map((id) => {
    if (id.startsWith(`${KIMAI_ID_PREFIX.tag}_`)) {
      const raw = id.slice(`${KIMAI_ID_PREFIX.tag}_`.length);
      if (/^\d+$/.test(raw)) {
        // Engine expects tag names on write; numeric-only ids are remapped by caller via get.
        return raw;
      }
      return raw;
    }
    throw new IntegrationSdkError(
      createIntegrationError({
        category: "validation",
        code: "INVALID_IDENTIFIER",
        message: `Expected tag id with prefix '${KIMAI_ID_PREFIX.tag}_'`,
        correlationId,
        details: { platformId: id },
      }),
    );
  });
}

export class KimaiTimesheetDomainService {
  constructor(private readonly client: KimaiRestClient) {}

  async list(
    context: IntegrationRequestContext,
    query?: KimaiDomainListQuery,
  ): Promise<KimaiDomainPageResult<KimaiDomainTimesheet>> {
    const records = await this.client.listTimesheets(context, listQuery(query));
    return pageResult(
      records.map((record) => mapKimaiTimesheet(record, "unknown")),
      query,
    );
  }

  async get(
    context: IntegrationRequestContext,
    timesheetId: string,
  ): Promise<KimaiDomainTimesheet> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.timesheet,
      timesheetId,
      context.correlationId,
    );
    const record = await this.client.getTimesheet(context, engineId);
    return mapKimaiTimesheet(record, "unknown");
  }

  async create(
    context: IntegrationRequestContext,
    input: KimaiDomainWriteInputs["createTimesheet"],
  ): Promise<KimaiDomainTimesheet> {
    const begin = toKimaiDateTime(input.startedAt ?? new Date().toISOString());
    const record = await this.client.createTimesheet(context, {
      begin,
      description: input.description ?? null,
      activity: optionalEngineId(
        KIMAI_ID_PREFIX.activity,
        input.activityId,
        context.correlationId,
      ),
      project: optionalEngineId(
        KIMAI_ID_PREFIX.project,
        input.projectId,
        context.correlationId,
      ),
      tags: tagNamesFromIds(input.tagIds, context.correlationId),
      billable: input.billable ?? true,
    });
    return mapKimaiTimesheet(record, "unknown");
  }

  async update(
    context: IntegrationRequestContext,
    timesheetId: string,
    input: KimaiDomainWriteInputs["updateTimesheet"],
  ): Promise<KimaiDomainTimesheet> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.timesheet,
      timesheetId,
      context.correlationId,
    );
    const record = await this.client.updateTimesheet(context, engineId, {
      description: input.description,
      activity: optionalEngineId(
        KIMAI_ID_PREFIX.activity,
        input.activityId,
        context.correlationId,
      ),
      project: optionalEngineId(
        KIMAI_ID_PREFIX.project,
        input.projectId,
        context.correlationId,
      ),
      tags: tagNamesFromIds(input.tagIds, context.correlationId),
      billable: input.billable,
      end: input.endedAt ? toKimaiDateTime(input.endedAt) : undefined,
    });
    return mapKimaiTimesheet(record, "unknown");
  }

  async stop(
    context: IntegrationRequestContext,
    timesheetId: string,
  ): Promise<KimaiDomainTimesheet> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.timesheet,
      timesheetId,
      context.correlationId,
    );
    const record = await this.client.stopTimesheet(context, engineId);
    return mapKimaiTimesheet(record, "unknown");
  }

  async archive(
    context: IntegrationRequestContext,
    timesheetId: string,
  ): Promise<KimaiDomainTimesheet> {
    const current = await this.get(context, timesheetId);
    await this.client.deleteTimesheet(
      context,
      fromPlatformTimeId(KIMAI_ID_PREFIX.timesheet, timesheetId, context.correlationId),
    );
    return { ...current, status: "archived", updatedAt: new Date().toISOString() };
  }
}

export class KimaiActivityDomainService {
  constructor(private readonly client: KimaiRestClient) {}

  async list(
    context: IntegrationRequestContext,
    query?: KimaiDomainListQuery,
  ): Promise<KimaiDomainPageResult<KimaiDomainActivity>> {
    const records = await this.client.listActivities(context, listQuery(query));
    return pageResult(records.map(mapKimaiActivity), query);
  }

  async get(
    context: IntegrationRequestContext,
    activityId: string,
  ): Promise<KimaiDomainActivity> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.activity,
      activityId,
      context.correlationId,
    );
    return mapKimaiActivity(await this.client.getActivity(context, engineId));
  }

  async create(
    context: IntegrationRequestContext,
    input: KimaiDomainWriteInputs["createActivity"],
  ): Promise<KimaiDomainActivity> {
    const record = await this.client.createActivity(context, {
      name: input.name,
      comment: input.description ?? null,
      project: optionalEngineId(
        KIMAI_ID_PREFIX.project,
        input.projectId,
        context.correlationId,
      ),
      visible: true,
    });
    return mapKimaiActivity(record);
  }

  async update(
    context: IntegrationRequestContext,
    activityId: string,
    input: KimaiDomainWriteInputs["updateActivity"],
  ): Promise<KimaiDomainActivity> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.activity,
      activityId,
      context.correlationId,
    );
    const record = await this.client.updateActivity(context, engineId, {
      name: input.name,
      comment: input.description,
      project: optionalEngineId(
        KIMAI_ID_PREFIX.project,
        input.projectId,
        context.correlationId,
      ),
    });
    return mapKimaiActivity(record);
  }

  async archive(
    context: IntegrationRequestContext,
    activityId: string,
  ): Promise<KimaiDomainActivity> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.activity,
      activityId,
      context.correlationId,
    );
    const record = await this.client.updateActivity(context, engineId, {
      visible: false,
    });
    return mapKimaiActivity(record);
  }
}

export class KimaiCustomerDomainService {
  constructor(private readonly client: KimaiRestClient) {}

  async list(
    context: IntegrationRequestContext,
    query?: KimaiDomainListQuery,
  ): Promise<KimaiDomainPageResult<KimaiDomainCustomer>> {
    const records = await this.client.listCustomers(context, listQuery(query));
    return pageResult(records.map(mapKimaiCustomer), query);
  }

  async get(
    context: IntegrationRequestContext,
    customerId: string,
  ): Promise<KimaiDomainCustomer> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.customer,
      customerId,
      context.correlationId,
    );
    return mapKimaiCustomer(await this.client.getCustomer(context, engineId));
  }

  async create(
    context: IntegrationRequestContext,
    input: KimaiDomainWriteInputs["createCustomer"],
  ): Promise<KimaiDomainCustomer> {
    const record = await this.client.createCustomer(context, {
      name: input.name,
      number: input.number ?? null,
      visible: true,
    });
    return mapKimaiCustomer(record);
  }

  async update(
    context: IntegrationRequestContext,
    customerId: string,
    input: KimaiDomainWriteInputs["updateCustomer"],
  ): Promise<KimaiDomainCustomer> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.customer,
      customerId,
      context.correlationId,
    );
    const record = await this.client.updateCustomer(context, engineId, {
      name: input.name,
      number: input.number,
    });
    return mapKimaiCustomer(record);
  }

  async archive(
    context: IntegrationRequestContext,
    customerId: string,
  ): Promise<KimaiDomainCustomer> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.customer,
      customerId,
      context.correlationId,
    );
    return mapKimaiCustomer(
      await this.client.updateCustomer(context, engineId, { visible: false }),
    );
  }
}

export class KimaiProjectDomainService {
  constructor(private readonly client: KimaiRestClient) {}

  async list(
    context: IntegrationRequestContext,
    query?: KimaiDomainListQuery,
  ): Promise<KimaiDomainPageResult<KimaiDomainProject>> {
    const records = await this.client.listProjects(context, listQuery(query));
    return pageResult(records.map(mapKimaiProject), query);
  }

  async get(
    context: IntegrationRequestContext,
    projectId: string,
  ): Promise<KimaiDomainProject> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.project,
      projectId,
      context.correlationId,
    );
    return mapKimaiProject(await this.client.getProject(context, engineId));
  }

  async create(
    context: IntegrationRequestContext,
    input: KimaiDomainWriteInputs["createProject"],
  ): Promise<KimaiDomainProject> {
    const record = await this.client.createProject(context, {
      name: input.name,
      customer: optionalEngineId(
        KIMAI_ID_PREFIX.customer,
        input.customerId,
        context.correlationId,
      ),
      visible: true,
    });
    return mapKimaiProject(record);
  }

  async update(
    context: IntegrationRequestContext,
    projectId: string,
    input: KimaiDomainWriteInputs["updateProject"],
  ): Promise<KimaiDomainProject> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.project,
      projectId,
      context.correlationId,
    );
    const record = await this.client.updateProject(context, engineId, {
      name: input.name,
      customer: optionalEngineId(
        KIMAI_ID_PREFIX.customer,
        input.customerId,
        context.correlationId,
      ),
    });
    return mapKimaiProject(record);
  }

  async archive(
    context: IntegrationRequestContext,
    projectId: string,
  ): Promise<KimaiDomainProject> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.project,
      projectId,
      context.correlationId,
    );
    return mapKimaiProject(
      await this.client.updateProject(context, engineId, { visible: false }),
    );
  }
}

export class KimaiTagDomainService {
  constructor(private readonly client: KimaiRestClient) {}

  async list(
    context: IntegrationRequestContext,
    query?: KimaiDomainListQuery,
  ): Promise<KimaiDomainPageResult<KimaiDomainTag>> {
    const raw = await this.client.listTags(context, listQuery(query));
    const records = normalizeTagRecords(raw);
    let items = records.map(mapKimaiTag);
    if (query?.search) {
      const needle = query.search.toLowerCase();
      items = items.filter((tag) => tag.name.toLowerCase().includes(needle));
    }
    return pageResult(items, query);
  }

  async get(
    context: IntegrationRequestContext,
    tagId: string,
  ): Promise<KimaiDomainTag> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.tag,
      tagId,
      context.correlationId,
    );
    return mapKimaiTag(await this.client.getTag(context, engineId));
  }

  async create(
    context: IntegrationRequestContext,
    input: KimaiDomainWriteInputs["createTag"],
  ): Promise<KimaiDomainTag> {
    const created = await this.client.createTag(context, {
      name: input.name,
      color: input.color ?? null,
    });
    if (typeof created === "string") {
      const listed = await this.list(context, { search: created, perPage: 100 });
      const match = listed.items.find((tag) => tag.name === created);
      if (match) return match;
      return {
        id: `${KIMAI_ID_PREFIX.tag}_1`,
        engineId: 1,
        name: created,
        color: input.color,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return mapKimaiTag(created);
  }

  async update(
    context: IntegrationRequestContext,
    tagId: string,
    input: KimaiDomainWriteInputs["updateTag"],
  ): Promise<KimaiDomainTag> {
    const engineId = fromPlatformTimeId(
      KIMAI_ID_PREFIX.tag,
      tagId,
      context.correlationId,
    );
    return mapKimaiTag(
      await this.client.updateTag(context, engineId, {
        name: input.name,
        color: input.color,
      }),
    );
  }

  async archive(
    context: IntegrationRequestContext,
    tagId: string,
  ): Promise<KimaiDomainTag> {
    const current = await this.get(context, tagId);
    await this.client.deleteTag(
      context,
      fromPlatformTimeId(KIMAI_ID_PREFIX.tag, tagId, context.correlationId),
    );
    return { ...current, status: "archived", updatedAt: new Date().toISOString() };
  }
}

export interface KimaiCoreServices {
  readonly timesheets: KimaiTimesheetDomainService;
  readonly activities: KimaiActivityDomainService;
  readonly customers: KimaiCustomerDomainService;
  readonly projects: KimaiProjectDomainService;
  readonly tags: KimaiTagDomainService;
  readonly restClient: KimaiRestClient;
}

export function createKimaiCoreServices(client: KimaiRestClient): KimaiCoreServices {
  return {
    timesheets: new KimaiTimesheetDomainService(client),
    activities: new KimaiActivityDomainService(client),
    customers: new KimaiCustomerDomainService(client),
    projects: new KimaiProjectDomainService(client),
    tags: new KimaiTagDomainService(client),
    restClient: client,
  };
}
