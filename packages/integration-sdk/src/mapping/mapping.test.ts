import { describe, expect, it } from "vitest";

import {
  assertValidMappingDefinition,
  createArrayTransformer,
  createBidirectionalEnumMapper,
  createBooleanTransformer,
  createCollectionMapper,
  createCustomTransformer,
  createDateTransformer,
  createDefaultValueTransformerRegistry,
  createDefinition,
  createEnumMapper,
  createEnumValueTransformer,
  createFieldMapper,
  createIdentityMapper,
  createMappingError,
  createMappingMetrics,
  createMappingPipeline,
  createMappingProvider,
  createMappingRegistry,
  createMockMappingProvider,
  createNestedMapper,
  createNullableTransformer,
  createNumberTransformer,
  createRelationshipMapper,
  createStringTransformer,
  createUuidTransformer,
  definitionKey,
  extractNativeId,
  hasProvisionalIdFormat,
  isMappingError,
  mapUnknownToMappingError,
  mappingErrorToIntegrationError,
  mappingEnumUnknownError,
  mappingValidationError,
  MOCK_MAPPING_FIXTURES,
  toProvisionalId,
  validateMappingDefinition,
  validateMappingProvider,
  validationResultToError,
  type MappingContext,
  type MappingDefinition,
} from "./index";

const context: MappingContext = {
  tenantId: "tenant-1",
  correlationId: "corr-1",
  integrationId: "mock",
};

describe("IdentityMapper", () => {
  it("builds and extracts provisional IDs in wire format", () => {
    expect(toProvisionalId("task", "plane", "abc")).toBe("task_plane_abc");
    expect(extractNativeId("task_plane_abc", "task", "plane")).toBe("abc");
    expect(extractNativeId("raw-id", "task", "plane")).toBe("raw-id");
    expect(hasProvisionalIdFormat("task_plane_abc", "task", "plane")).toBe(true);

    const mapper = createIdentityMapper("zammad");
    expect(mapper.toProvisionalId("sreq", 42)).toBe("sreq_zammad_42");
    expect(mapper.extractNativeId("sreq_zammad_42", "sreq")).toBe("42");
    expect(mapper.integrationSlug).toBe("zammad");
  });
});

describe("EnumMapper", () => {
  it("maps known values and applies fallback policy", () => {
    const mapper = createEnumMapper({
      map: { low: "low", high: "high" },
      unknownPolicy: "fallback",
      fallback: "low",
    });
    expect(mapper.map("HIGH")).toBe("high");
    expect(mapper.map("mystery")).toBe("low");
    expect(mapper.has("low")).toBe(true);
    expect(mapper.reverse("high")).toBe("high");
  });

  it("fails on unknown when policy is fail", () => {
    const mapper = createEnumMapper({
      map: { open: "open" },
      unknownPolicy: "fail",
    });
    expect(() => mapper.map("closed")).toThrow();
    expect(() => mapper.mapOrThrow("closed", "c1")).toThrow();
  });

  it("passthrough returns raw string for unknown", () => {
    const mapper = createEnumMapper({
      map: { a: "a" },
      unknownPolicy: "passthrough",
    });
    expect(mapper.map("custom")).toBe("custom");
  });

  it("requires fallback when policy is fallback", () => {
    expect(() =>
      createEnumMapper({
        map: { a: "a" },
        unknownPolicy: "fallback",
      }),
    ).toThrow(/fallback/);
  });

  it("supports bidirectional maps", () => {
    const bi = createBidirectionalEnumMapper({
      toCanonical: { "1 low": "low", low: "low" },
      toProvider: { low: "1 low" },
      unknownPolicy: "fallback",
      fallback: "low",
    });
    expect(bi.toCanonical.map("1 low")).toBe("low");
    expect(bi.toProvider("low")).toBe("1 low");
  });
});

describe("ValueTransformers", () => {
  it("transforms dates, uuids, booleans, numbers, strings, arrays, nullable, custom", () => {
    const date = createDateTransformer();
    expect(date.transform("2024-01-01T00:00:00.000Z")).toBe("2024-01-01T00:00:00.000Z");
    expect(date.transform(null)).toBeUndefined();

    const uuid = createUuidTransformer();
    expect(uuid.transform("550e8400-e29b-41d4-a716-446655440000")).toBe(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(() => uuid.transform("not-a-uuid")).toThrow();

    const bool = createBooleanTransformer();
    expect(bool.transform("yes")).toBe(true);
    expect(bool.transform(0)).toBe(false);

    const num = createNumberTransformer();
    expect(num.transform("42")).toBe(42);
    expect(num.transform("")).toBeUndefined();

    const str = createStringTransformer();
    expect(str.transform("  hi  ")).toBe("hi");

    const arr = createArrayTransformer(createNumberTransformer());
    expect(arr.transform(["1", "2"])).toEqual([1, 2]);

    const nullable = createNullableTransformer(createStringTransformer());
    expect(nullable.transform(null)).toBeNull();
    expect(nullable.transform("x")).toBe("x");

    const custom = createCustomTransformer("double", (n: number) => n * 2);
    expect(custom.transform(3)).toBe(6);

    const registry = createDefaultValueTransformerRegistry();
    expect(registry.has("date")).toBe(true);
    expect(registry.require("boolean").kind).toBe("boolean");
    expect(() => registry.require("missing")).toThrow();
  });
});

describe("FieldMapper / Relationship / Collection / Nested", () => {
  it("maps fields with transformers and required validation", () => {
    const transformers = createDefaultValueTransformerRegistry();
    const mapper = createFieldMapper({
      fieldMaps: [
        { source: "name", target: "title", required: true, transformer: "string" },
        { source: "meta.count", target: "count", transformer: "number" },
      ],
      transformers,
    });
    expect(mapper.map({ name: " Task ", meta: { count: "3" } }, context)).toEqual({
      title: "Task",
      count: 3,
    });
    expect(() => mapper.map({}, context)).toThrow(/Required field/);
  });

  it("maps relationships to provisional IDs", () => {
    const rel = createRelationshipMapper("plane");
    const ids = rel.mapIds(
      { assignees: ["a", "b"] },
      {
        relationName: "assignees",
        sourceField: "assignees",
        targetEntityType: "user",
        idPrefix: "user",
        many: true,
      },
      context,
    );
    expect(ids).toEqual(["user_plane_a", "user_plane_b"]);
    expect(
      rel.mapToNative("user_plane_a", {
        relationName: "assignee",
        sourceField: "assignee",
        targetEntityType: "user",
        idPrefix: "user",
      }),
    ).toBe("a");
  });

  it("maps collections and nested structures", async () => {
    const collection = createCollectionMapper();
    const mapped = collection.map(
      [{ id: "1" }, null, { id: "2" }],
      {
        mapItem: (item) => ({ id: (item as { id: string }).id }),
        skipNullish: true,
      },
      context,
    );
    expect(mapped).toEqual([{ id: "1" }, { id: "2" }]);

    const nested = createNestedMapper();
    const definition: MappingDefinition = {
      id: "nested.ws",
      entityType: "workspace",
      direction: "nested",
      profile: "default",
      map: (input) => ({ name: (input as { name: string }).name }),
    };
    const result = await nested.mapNested(
      { workspace: { name: "Main" } },
      { path: "workspace", definition },
      context,
    );
    expect(result).toEqual({ name: "Main" });
  });
});

describe("Validation", () => {
  it("rejects invalid definitions and duplicate providers", () => {
    const invalid: MappingDefinition = {
      id: "",
      entityType: "",
      direction: "provider_to_canonical",
      profile: "default",
    };
    const result = validateMappingDefinition(invalid);
    expect(result.valid).toBe(false);
    expect(() => assertValidMappingDefinition(invalid)).toThrow();

    const provider = createMockMappingProvider({ id: "p1" });
    expect(validateMappingProvider(provider).valid).toBe(true);

    const registry = createMappingRegistry();
    registry.register(provider);
    expect(() => registry.register(provider)).toThrow(/already registered/);
    registry.register(provider, { force: true });
    expect(registry.has("p1")).toBe(true);
  });

  it("builds definition keys", () => {
    expect(definitionKey("task", "default", "write")).toBe("task::default::write");
  });
});

describe("MappingRegistry / Pipeline / Diagnostics / Metrics", () => {
  it("registers, looks up, executes profiles, and reports diagnostics", async () => {
    const metrics = createMappingMetrics();
    const registry = createMappingRegistry({ metrics });
    const provider = createMockMappingProvider({ id: "mock-1" });
    registry.register(provider);

    expect(registry.get("mock-1")?.id).toBe("mock-1");
    expect(registry.require("mock-1").id).toBe("mock-1");
    expect(registry.list()).toHaveLength(1);
    expect(registry.findByEntityType("task").length).toBeGreaterThan(0);
    expect(() => registry.require("missing")).toThrow();

    const pipeline = createMappingPipeline({ registry });
    const success = await pipeline.execute({
      providerId: "mock-1",
      entityType: "task",
      direction: "provider_to_canonical",
      profile: "default",
      input: { id: "9", title: "Hello" },
      context,
    });
    expect(success.ok).toBe(true);
    expect(success.value).toMatchObject({ id: "task_mock_9", title: "Hello" });

    const createBody = pipeline.executeSync({
      providerId: "mock-1",
      entityType: "task",
      direction: "write",
      profile: "create",
      input: { title: "New" },
      context,
    });
    expect(createBody.ok).toBe(true);
    expect(createBody.value).toMatchObject({ name: "New" });

    const updateBody = await pipeline.execute({
      providerId: "mock-1",
      entityType: "task",
      direction: "partial_update",
      profile: "update",
      input: { title: "Patched" },
      context,
    });
    expect(updateBody.ok).toBe(true);
    expect(updateBody.value).toEqual({ name: "Patched" });

    const missing = await pipeline.execute({
      providerId: "mock-1",
      entityType: "task",
      direction: "provider_to_canonical",
      profile: "analytics",
      input: {},
      context,
    });
    expect(missing.ok).toBe(false);
    expect(missing.error?.code).toBe("integration.mapping.definition_not_found");

    const diagnostics = registry.getDiagnostics();
    expect(diagnostics.providerCount).toBe(1);
    expect(diagnostics.supportedEntityTypes).toContain("task");
    expect(diagnostics.executionCount).toBeGreaterThan(0);
    expect(diagnostics.failureCount).toBeGreaterThan(0);

    const snapshot = metrics.getSnapshot();
    expect(snapshot.executionsTotal).toBeGreaterThan(0);
    expect(snapshot.byProfile.default).toBeGreaterThan(0);
    expect(snapshot.byDirection.provider_to_canonical).toBeGreaterThan(0);
  });

  it("records validation failure and unknown enum via fixtures", async () => {
    const registry = createMappingRegistry();
    registry.register(createMockMappingProvider({ id: "mock-2" }));
    const pipeline = createMappingPipeline({ registry });

    const validation = await pipeline.execute({
      providerId: "mock-2",
      entityType: "task",
      direction: "provider_to_canonical",
      profile: "detail",
      input: {},
      context,
    });
    expect(validation.ok).toBe(false);
    expect(validation.error?.category).toBe("validation");

    const unknownEnum = await pipeline.execute({
      providerId: "mock-2",
      entityType: "priority",
      direction: "provider_to_canonical",
      profile: "default",
      input: { priority: "mystery" },
      context,
    });
    expect(unknownEnum.ok).toBe(false);
    expect(unknownEnum.error?.code).toBe("integration.mapping.unknown_enum_value");

    const relationships = await pipeline.execute({
      providerId: "mock-2",
      entityType: "task",
      direction: "relationship",
      input: { assignees: ["u1"] },
      context,
    });
    expect(relationships.ok).toBe(true);
    expect(relationships.value).toEqual({ assigneeIds: ["user_mock_u1"] });

    const nested = await pipeline.execute({
      providerId: "mock-2",
      entityType: "project",
      direction: "nested",
      input: { id: "p1", workspace: { id: "w1", name: "W" } },
      context,
    });
    expect(nested.ok).toBe(true);

    const collection = await pipeline.execute({
      providerId: "mock-2",
      entityType: "task",
      direction: "collection",
      input: [{ id: "1", title: "A" }],
      context,
    });
    expect(collection.ok).toBe(true);
    expect(collection.value).toEqual([{ id: "task_mock_1", title: "A" }]);
  });
});

describe("Errors", () => {
  it("converts MappingError to IntegrationError and sanitizes unknowns", () => {
    const err = createMappingError("integration.mapping.test", "safe message", {
      correlationId: "c1",
    });
    expect(isMappingError(err)).toBe(true);
    const integration = mappingErrorToIntegrationError(err);
    expect(integration.category).toBe("mapping");
    expect(integration.message).toBe("safe message");

    const fromVendor = mapUnknownToMappingError(
      new Error("plane internal stacktrace"),
      "c2",
    );
    expect(fromVendor.message).toBe("Mapping execution failed");

    const fromMapping = mapUnknownToMappingError(
      mappingEnumUnknownError({ correlationId: "c3" }, "x"),
      "c3",
    );
    expect(fromMapping.code).toBe("integration.mapping.unknown_enum_value");

    expect(mappingValidationError({ correlationId: "c4" }, "bad").category).toBe(
      "validation",
    );
  });
});

describe("createMappingProvider / createDefinition / mocks", () => {
  it("builds providers from definitions and exposes fixtures", () => {
    const def = createDefinition({
      id: "custom",
      entityType: "label",
      direction: "provider_to_canonical",
      map: (input) => ({ id: String((input as { id: string }).id) }),
    });
    const provider = createMappingProvider({
      id: "labels",
      integrationSlug: "mock",
      definitions: [def],
    });
    expect(provider.getDefinition("label", "default", "provider_to_canonical")).toBe(
      def,
    );
    expect(MOCK_MAPPING_FIXTURES.success.entityType).toBe("task");

    const failProvider = createMockMappingProvider({
      id: "failing",
      failOnExecute: true,
    });
    const registry = createMappingRegistry({ validateOnRegister: false });
    registry.register(failProvider);
    const pipeline = createMappingPipeline({ registry });
    const result = pipeline.executeSync({
      providerId: "failing",
      entityType: "task",
      direction: "provider_to_canonical",
      input: {},
      context,
    });
    expect(result.ok).toBe(false);
  });

  it("executes field-map-only definitions via pipeline", async () => {
    const transformers = createDefaultValueTransformerRegistry();
    const provider = createMappingProvider({
      id: "fields",
      integrationSlug: "mock",
      definitions: [
        {
          id: "fields.default",
          entityType: "item",
          direction: "provider_to_canonical",
          profile: "default",
          fieldMaps: [{ source: "n", target: "name", transformer: "string" }],
        },
      ],
    });
    const registry = createMappingRegistry();
    registry.register(provider);
    const pipeline = createMappingPipeline({ registry, transformers });
    const result = await pipeline.execute({
      providerId: "fields",
      entityType: "item",
      direction: "provider_to_canonical",
      input: { n: "  X  " },
      context,
    });
    expect(result.ok).toBe(true);
    expect(result.value).toEqual({ name: "X" });
  });
});

describe("Coverage edges — transformers / mappers / registry / pipeline", () => {
  it("covers remaining transformer branches", () => {
    const date = createDateTransformer();
    expect(date.transform(new Date("not-a-date"))).toBeUndefined();
    expect(date.transform(new Date("2024-06-01T12:00:00.000Z"))).toBe(
      "2024-06-01T12:00:00.000Z",
    );
    expect(date.transform(1_704_067_200_000)).toBeTruthy();
    expect(date.transform("")).toBeUndefined();

    const uuidLoose = createUuidTransformer("uuid-loose", { strict: false });
    expect(uuidLoose.transform("not-uuid")).toBe("not-uuid");
    expect(uuidLoose.transform(null)).toBeUndefined();
    expect(uuidLoose.transform("")).toBeUndefined();

    const bool = createBooleanTransformer();
    expect(bool.transform(true)).toBe(true);
    expect(bool.transform("FALSE")).toBe(false);
    expect(bool.transform(undefined)).toBeUndefined();
    expect(() => bool.transform({ x: 1 })).toThrow();

    const num = createNumberTransformer();
    expect(num.transform(Number.NaN)).toBeUndefined();
    expect(num.transform(null)).toBeUndefined();
    expect(() => num.transform("nope")).toThrow();

    const str = createStringTransformer("s", { trim: false, emptyAsUndefined: false });
    expect(str.transform("  ")).toBe("  ");
    expect(str.transform(null)).toBeUndefined();

    const arr = createArrayTransformer(createStringTransformer());
    expect(arr.transform(null)).toEqual([]);
    expect(() => arr.transform("x" as unknown as string[])).toThrow();

    const registry = createDefaultValueTransformerRegistry();
    expect(registry.list().length).toBeGreaterThan(0);
    expect(() => registry.register(createDateTransformer())).toThrow(
      /already registered/,
    );
  });

  it("covers field mapper nested paths, defaults, and omitUndefined", () => {
    const transformers = createDefaultValueTransformerRegistry();
    const mapper = createFieldMapper({
      fieldMaps: [
        { source: "a", target: "nested.value", defaultValue: "fallback" },
        { source: "missing", target: "kept", defaultValue: undefined },
        { source: "x", target: "y" },
      ],
      transformers,
      omitUndefined: false,
    });
    expect(mapper.map({ x: undefined }, context)).toMatchObject({
      nested: { value: "fallback" },
    });

    const omit = createFieldMapper({
      fieldMaps: [{ source: "gone", target: "out", transformer: "string" }],
      transformers,
      omitUndefined: true,
    });
    expect(omit.map({}, context)).toEqual({});
  });

  it("covers relationship, collection, and nested edge cases", async () => {
    const rel = createRelationshipMapper("plane");
    expect(
      rel.mapIds(
        { owner: { id: "u1" } },
        {
          relationName: "owner",
          sourceField: "owner",
          targetEntityType: "user",
          idPrefix: "user",
        },
        context,
      ),
    ).toBe("user_plane_u1");
    expect(
      rel.mapIds(
        { owner: null },
        {
          relationName: "owner",
          sourceField: "owner",
          targetEntityType: "user",
        },
        context,
      ),
    ).toBeUndefined();
    expect(() =>
      rel.mapIds(
        { owners: "x" },
        {
          relationName: "owners",
          sourceField: "owners",
          targetEntityType: "user",
          many: true,
        },
        context,
      ),
    ).toThrow();
    expect(
      rel.mapToProvisional(9, {
        relationName: "x",
        sourceField: "x",
        targetEntityType: "user",
        idPrefix: "user",
      }),
    ).toBe("user_plane_9");
    expect(
      rel.mapToProvisional(null, {
        relationName: "x",
        sourceField: "x",
        targetEntityType: "user",
      }),
    ).toBeUndefined();
    expect(
      rel.mapToProvisional(1, {
        relationName: "x",
        sourceField: "x",
        targetEntityType: "user",
      }),
    ).toBe("1");
    expect(
      rel.mapToNative(undefined, {
        relationName: "x",
        sourceField: "x",
        targetEntityType: "user",
        idPrefix: "user",
      }),
    ).toBeUndefined();
    expect(
      rel.mapToNative("raw", {
        relationName: "x",
        sourceField: "x",
        targetEntityType: "user",
      }),
    ).toBe("raw");

    const collection = createCollectionMapper();
    expect(() =>
      collection.map("nope" as unknown as unknown[], { mapItem: (i) => i }, context),
    ).toThrow();
    expect(
      collection.map(
        [1, 2, 3],
        {
          mapItem: (item) => item,
          filter: (item) => (item as number) > 1,
        },
        context,
      ),
    ).toEqual([2, 3]);
    expect(collection.map(null, { mapItem: (i) => i }, context)).toEqual([]);

    const nested = createNestedMapper();
    expect(nested.readNestedValue({ a: { b: 1 } }, "a.b")).toBe(1);
    expect(nested.readNestedValue(null, "a")).toBeUndefined();
    expect(
      await nested.mapNested(
        {},
        { path: "missing", definition: MOCK_MAPPING_FIXTURES.success },
        context,
      ),
    ).toBeUndefined();
    try {
      await nested.mapNested(
        { a: 1 },
        {
          path: "a",
          definition: {
            id: "no-map",
            entityType: "x",
            direction: "nested",
            profile: "default",
          },
        },
        context,
      );
      expect.fail("expected throw");
    } catch (error) {
      expect(error).toMatchObject({ code: "integration.mapping.validation_failed" });
    }

    const { executeNestedDefinition } = await import("./collection-mapper");
    try {
      await executeNestedDefinition(
        {
          id: "no-map",
          entityType: "x",
          direction: "nested",
          profile: "default",
        },
        {},
        context,
      );
      expect.fail("expected throw");
    } catch (error) {
      expect(error).toBeTruthy();
    }
    expect(
      await executeNestedDefinition(
        MOCK_MAPPING_FIXTURES.success,
        { id: "1", title: "T" },
        context,
      ),
    ).toMatchObject({ title: "T" });
  });

  it("covers enum keys/values/reverse failures and identity helpers", () => {
    const mapper = createEnumMapper({
      map: { a: "alpha", A: "alpha", b: "beta" },
      unknownPolicy: "fail",
    });
    expect(mapper.keys()).toContain("a");
    expect(mapper.values()).toEqual(expect.arrayContaining(["alpha", "beta"]));
    expect(mapper.reverse("alpha")).toBeTruthy();

    const bi = createBidirectionalEnumMapper({
      toCanonical: { x: "x" },
      toProvider: { x: "X" },
      unknownPolicy: "fail",
    });
    expect(() => bi.toProvider("missing" as "x")).toThrow();

    const ids = createIdentityMapper("plane");
    expect(ids.hasProvisionalFormat("task_plane_1", "task")).toBe(true);
    expect(ids.hasProvisionalFormat("task_1", "task")).toBe(false);
  });

  it("covers validation provider failures and registry clear/metrics reset", () => {
    const badProvider = {
      id: "",
      integrationSlug: "",
      capabilities: {
        entityTypes: [],
        profiles: [],
        directions: ["not_a_direction" as never],
        supportsRelationships: false,
        supportsCollections: false,
        supportsNested: false,
        supportsPartialUpdate: false,
      },
      getDefinition: () => undefined,
      listDefinitions: () => [
        {
          id: "dup",
          entityType: "t",
          profile: "default",
          direction: "provider_to_canonical" as const,
          map: () => ({}),
        },
        {
          id: "dup2",
          entityType: "t",
          profile: "default",
          direction: "provider_to_canonical" as const,
          map: () => ({}),
        },
        {
          id: "bad-fields",
          entityType: "t2",
          profile: "default",
          direction: "provider_to_canonical" as const,
          fieldMaps: [
            { source: "", target: "" },
            { source: "a", target: "b" },
            { source: "a", target: "b" },
          ],
        },
      ],
    };
    const result = validateMappingProvider(badProvider);
    expect(result.valid).toBe(false);
    expect(validationResultToError(result, "c")?.category).toBe("validation");
    expect(validationResultToError({ valid: true, errors: [] }, "c")).toBeUndefined();

    const metrics = createMappingMetrics();
    metrics.recordExecution({
      providerId: "p",
      entityType: "t",
      profile: "default",
      direction: "write",
      success: true,
      durationMs: 5,
    });
    metrics.reset();
    expect(metrics.getSnapshot().executionsTotal).toBe(0);

    const registry = createMappingRegistry({ validateOnRegister: false });
    registry.register(createMockMappingProvider({ id: "tmp" }));
    registry.clear();
    expect(registry.list()).toHaveLength(0);

    expect(() =>
      createMappingRegistry().register({
        id: "invalid",
        integrationSlug: "x",
        capabilities: {
          entityTypes: [],
          profiles: ["default"],
          directions: ["write"],
          supportsRelationships: false,
          supportsCollections: false,
          supportsNested: false,
          supportsPartialUpdate: false,
        },
        getDefinition: () => undefined,
        listDefinitions: () => [],
      }),
    ).toThrow();
  });

  it("covers pipeline sync field maps, missing provider, and async rejection", async () => {
    const transformers = createDefaultValueTransformerRegistry();
    const registry = createMappingRegistry();
    registry.register(
      createMappingProvider({
        id: "sync-fields",
        integrationSlug: "mock",
        definitions: [
          {
            id: "sf",
            entityType: "item",
            direction: "provider_to_canonical",
            profile: "default",
            fieldMaps: [{ source: "n", target: "name", transformer: "string" }],
          },
          createDefinition({
            id: "async-only",
            entityType: "async_item",
            direction: "provider_to_canonical",
            map: async (input) => input,
          }),
        ],
      }),
    );
    const pipeline = createMappingPipeline({ registry, transformers });

    const syncFields = pipeline.executeSync({
      providerId: "sync-fields",
      entityType: "item",
      direction: "provider_to_canonical",
      input: { n: "Z" },
      context,
    });
    expect(syncFields.ok).toBe(true);

    const asyncSync = pipeline.executeSync({
      providerId: "sync-fields",
      entityType: "async_item",
      direction: "provider_to_canonical",
      input: { ok: true },
      context,
    });
    expect(asyncSync.ok).toBe(false);

    const missingProvider = await pipeline.execute({
      providerId: "nope",
      entityType: "item",
      direction: "provider_to_canonical",
      input: {},
      context,
    });
    expect(missingProvider.ok).toBe(false);

    const emptyDefProvider = createMappingProvider({
      id: "empty-def",
      integrationSlug: "mock",
      definitions: [
        {
          id: "empty",
          entityType: "blank",
          direction: "provider_to_canonical",
          profile: "default",
          fieldMaps: [],
          map: undefined,
        },
      ],
    });
    // bypass validation to register intentionally incomplete definition
    const rawRegistry = createMappingRegistry({ validateOnRegister: false });
    rawRegistry.register(emptyDefProvider);
    const rawPipeline = createMappingPipeline({
      registry: rawRegistry,
      validateBeforeExecute: false,
    });
    const emptyResult = await rawPipeline.execute({
      providerId: "empty-def",
      entityType: "blank",
      direction: "provider_to_canonical",
      input: {},
      context,
    });
    expect(emptyResult.ok).toBe(false);

    const emptySync = rawPipeline.executeSync({
      providerId: "empty-def",
      entityType: "blank",
      direction: "provider_to_canonical",
      input: {},
      context,
    });
    expect(emptySync.ok).toBe(false);
  });

  it("covers remaining transformer and enum/relationship branches", () => {
    const enumTx = createEnumValueTransformer(
      "prio",
      (value) => String(value) as "low",
    );
    expect(enumTx.transform("low")).toBe("low");

    const registry = createDefaultValueTransformerRegistry();
    expect(registry.get("missing")).toBeUndefined();
    expect(registry.get("date")?.kind).toBe("date");

    const fallback = createEnumMapper({
      map: { a: "a" },
      unknownPolicy: "fallback",
      fallback: "a",
    });
    expect(fallback.map(null)).toBe("a");
    expect(fallback.map(undefined)).toBe("a");
    expect(fallback.mapOrThrow("a")).toBe("a");

    const field = createFieldMapper({
      fieldMaps: [{ source: "a.b", target: "out" }],
    });
    expect(field.map({ a: null }, context)).toEqual({});

    const rel = createRelationshipMapper();
    expect(
      rel.mapIds(
        null,
        { relationName: "r", sourceField: "x", targetEntityType: "t" },
        context,
      ),
    ).toBeUndefined();
    expect(
      rel.mapIds(
        { ids: ["1"] },
        { relationName: "r", sourceField: "ids", targetEntityType: "t", many: true },
        context,
      ),
    ).toEqual(["1"]);
    expect(
      rel.mapIds(
        { id: "1" },
        { relationName: "r", sourceField: "id", targetEntityType: "t" },
        context,
      ),
    ).toBe("1");
  });

  it("covers mapping error helpers and unknown sanitization", () => {
    expect(
      mappingErrorToIntegrationError(
        mappingValidationError({ correlationId: "c" }, "v"),
      ).category,
    ).toBe("validation");
    expect(mapUnknownToMappingError("string-error", "c").message).toBe(
      "Mapping execution failed",
    );
    expect(mapUnknownToMappingError(new Error("safe plain"), "c").message).toContain(
      "safe",
    );
    expect(isMappingError(null)).toBe(false);
    expect(isMappingError({ category: "mapping" })).toBe(false);
  });
});
