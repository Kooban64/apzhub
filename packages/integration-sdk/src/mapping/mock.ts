import { createEnumMapper } from "./enum-mapper";
import { createMappingProvider } from "./provider";
import type {
  MappingContext,
  MappingDefinition,
  MappingProvider,
} from "./types";

export interface MockMappingProviderOptions {
  readonly id?: string;
  readonly integrationSlug?: string;
  readonly definitions?: readonly MappingDefinition[];
  readonly failOnExecute?: boolean;
  readonly failMessage?: string;
}

const defaultSuccessDefinition: MappingDefinition = {
  id: "mock.task.default.read",
  entityType: "task",
  direction: "provider_to_canonical",
  profile: "default",
  map: (input: unknown) => {
    const record = (input ?? {}) as Record<string, unknown>;
    return {
      id: `task_mock_${String(record.id ?? "1")}`,
      title: String(record.title ?? record.name ?? "Untitled"),
      status: String(record.status ?? "open"),
    };
  },
};

const createDefinition: MappingDefinition = {
  id: "mock.task.create.write",
  entityType: "task",
  direction: "write",
  profile: "create",
  map: (input: unknown) => {
    const record = (input ?? {}) as Record<string, unknown>;
    return {
      name: record.title,
      priority: record.priority ?? "none",
    };
  },
};

const updateDefinition: MappingDefinition = {
  id: "mock.task.update.partial",
  entityType: "task",
  direction: "partial_update",
  profile: "update",
  map: (input: unknown) => {
    const record = (input ?? {}) as Record<string, unknown>;
    const body: Record<string, unknown> = {};
    if (record.title !== undefined) body.name = record.title;
    if (record.priority !== undefined) body.priority = record.priority;
    return body;
  },
};

const validationFailureDefinition: MappingDefinition = {
  id: "mock.task.invalid",
  entityType: "task",
  direction: "provider_to_canonical",
  profile: "detail",
  map: (_input, context: MappingContext) => {
    throw {
      category: "validation" as const,
      code: "integration.mapping.validation_failed",
      message: "Required field missing",
      retryable: false,
      correlationId: context.correlationId ?? "mock",
      details: { field: "title" },
    };
  },
};

const relationshipDefinition: MappingDefinition = {
  id: "mock.task.relationship",
  entityType: "task",
  direction: "relationship",
  profile: "default",
  map: (input: unknown) => {
    const record = (input ?? {}) as Record<string, unknown>;
    const assignees = Array.isArray(record.assignees) ? record.assignees : [];
    return {
      assigneeIds: assignees.map((id) => `user_mock_${String(id)}`),
    };
  },
};

const nestedDefinition: MappingDefinition = {
  id: "mock.project.nested",
  entityType: "project",
  direction: "nested",
  profile: "default",
  map: (input: unknown) => {
    const record = (input ?? {}) as Record<string, unknown>;
    const workspace = (record.workspace ?? {}) as Record<string, unknown>;
    return {
      id: `proj_mock_${String(record.id ?? "1")}`,
      workspace: {
        id: `ws_mock_${String(workspace.id ?? "1")}`,
        name: String(workspace.name ?? "Workspace"),
      },
    };
  },
};

const collectionDefinition: MappingDefinition = {
  id: "mock.task.collection",
  entityType: "task",
  direction: "collection",
  profile: "default",
  map: (input: unknown) => {
    const items = Array.isArray(input) ? input : [];
    return items.map((item, index) => {
      const record = (item ?? {}) as Record<string, unknown>;
      return {
        id: `task_mock_${String(record.id ?? index)}`,
        title: String(record.title ?? `Task ${index}`),
      };
    });
  },
};

const unknownEnumDefinition: MappingDefinition = {
  id: "mock.priority.enum",
  entityType: "priority",
  direction: "provider_to_canonical",
  profile: "default",
  map: (input: unknown) => {
    const mapper = createEnumMapper({
      map: { low: "low", high: "high" },
      unknownPolicy: "fail",
    });
    const record = (input ?? {}) as Record<string, unknown>;
    return { priority: mapper.map(String(record.priority ?? "")) };
  },
};

/** Success / failure / relationship / nested / collection fixtures. */
export const MOCK_MAPPING_FIXTURES = {
  success: defaultSuccessDefinition,
  create: createDefinition,
  update: updateDefinition,
  validationFailure: validationFailureDefinition,
  relationship: relationshipDefinition,
  nested: nestedDefinition,
  collection: collectionDefinition,
  unknownEnum: unknownEnumDefinition,
} as const;

export function createMockMappingProvider(
  options: MockMappingProviderOptions = {},
): MappingProvider {
  const definitions =
    options.definitions ??
    ([
      defaultSuccessDefinition,
      createDefinition,
      updateDefinition,
      validationFailureDefinition,
      relationshipDefinition,
      nestedDefinition,
      collectionDefinition,
      unknownEnumDefinition,
    ] as MappingDefinition[]);

  if (options.failOnExecute) {
    const failing: MappingDefinition = {
      id: "mock.fail",
      entityType: "task",
      direction: "provider_to_canonical",
      profile: "default",
      map: () => {
        throw new Error(options.failMessage ?? "mock mapping failure");
      },
    };
    return createMappingProvider({
      id: options.id ?? "mock-mapping-provider",
      integrationSlug: options.integrationSlug ?? "mock",
      definitions: [failing, ...definitions.filter((d) => d.profile !== "default")],
    });
  }

  return createMappingProvider({
    id: options.id ?? "mock-mapping-provider",
    integrationSlug: options.integrationSlug ?? "mock",
    definitions,
    capabilities: {
      supportsRelationships: true,
      supportsCollections: true,
      supportsNested: true,
      supportsPartialUpdate: true,
    },
  });
}
