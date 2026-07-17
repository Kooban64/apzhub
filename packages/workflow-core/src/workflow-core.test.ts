import { describe, expect, it } from "vitest";

import {
  asWorkflowCategoryId,
  asWorkflowConnectionId,
  asWorkflowFolderId,
  asWorkflowId,
  asWorkflowParameterId,
  asWorkflowTemplateId,
  asWorkflowVariableId,
  type WorkflowGraphSnapshot,
} from "@apzhub/workflow-contracts";

import {
  assertWorkflowLifecycleTransition,
  canTransitionWorkflowLifecycle,
  createWorkflowFoundation,
  listAllowedWorkflowLifecycleTransitions,
  requireFound,
  validateWorkflow,
  validateWorkflowLifecycle,
  validateWorkflowParameters,
  validateWorkflowReferences,
  validateWorkflowStructural,
  validateWorkflowVersion,
  WORKFLOW_CORE_VERSION,
  WorkflowDomainError,
  type WorkflowFoundationRepos,
} from "./index";

function stubRepos(): WorkflowFoundationRepos {
  const noop = async () => {
    throw new Error("unused");
  };
  return {
    workflows: {
      create: noop,
      get: async () => null,
      update: noop,
      delete: noop,
      list: async () => [],
    },
    versions: {
      create: noop,
      get: async () => null,
      listByWorkflow: async () => [],
    },
    templates: {
      create: noop,
      get: async () => null,
      update: noop,
      delete: noop,
      list: async () => [],
    },
    categories: {
      create: noop,
      get: async () => null,
      list: async () => [],
    },
    folders: {
      create: noop,
      get: async () => null,
      list: async () => [],
    },
    audits: {
      append: noop,
      listByWorkflow: async () => [],
    },
  };
}

function validGraph(): WorkflowGraphSnapshot {
  return {
    nodes: [
      {
        id: "n1",
        nodeKind: "trigger",
        kind: "manual",
        config: { enabled: true },
      },
      {
        id: "n2",
        nodeKind: "action",
        kind: "notify",
        label: "Notify",
        config: { channel: "email", retries: 1 },
      },
    ],
    connections: [
      {
        id: asWorkflowConnectionId("c1"),
        sourceNodeId: "n1",
        targetNodeId: "n2",
      },
    ],
  };
}

describe("workflow-core", () => {
  it("exports version 0.1.1", () => {
    expect(WORKFLOW_CORE_VERSION).toBe("0.1.1");
  });

  it("enforces fail-closed lifecycle transitions", () => {
    expect(canTransitionWorkflowLifecycle("draft", "active")).toBe(true);
    expect(canTransitionWorkflowLifecycle("draft", "draft")).toBe(true);
    expect(canTransitionWorkflowLifecycle("active", "draft")).toBe(false);
    expect(canTransitionWorkflowLifecycle("deprecated", "active")).toBe(false);
    expect(canTransitionWorkflowLifecycle("archived", "restored")).toBe(true);
    expect(listAllowedWorkflowLifecycleTransitions("active")).toEqual([
      "inactive",
      "archived",
      "deprecated",
    ]);
    expect(() =>
      assertWorkflowLifecycleTransition("active", "draft"),
    ).toThrow(WorkflowDomainError);
    assertWorkflowLifecycleTransition("draft", "active");
  });

  it("validates structural graph metadata", () => {
    expect(validateWorkflowStructural(undefined).length).toBeGreaterThan(0);
    expect(validateWorkflowStructural({ nodes: [], connections: [] })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "structural", severity: "error" }),
      ]),
    );
    const broken: WorkflowGraphSnapshot = {
      nodes: [
        {
          id: "dup",
          nodeKind: "action",
          kind: "x",
          config: { bad: { nested: true } as unknown as string },
        } as never,
        {
          id: "dup",
          nodeKind: "not-a-kind" as never,
          kind: "",
          config: null as never,
        },
      ],
      connections: [
        {
          id: asWorkflowConnectionId("conn_broken"),
          sourceNodeId: "missing",
          targetNodeId: "also-missing",
          config: { x: { y: 1 } as unknown as string },
        } as never,
      ],
    };
    const structural = validateWorkflowStructural(broken);
    expect(structural.some((i) => i.code === "structural")).toBe(true);

    const noTrigger = validateWorkflowStructural({
      nodes: [
        {
          id: "a1",
          nodeKind: "action",
          kind: "do",
          config: {},
        },
      ],
      connections: [],
    });
    expect(noTrigger.some((i) => i.severity === "warning")).toBe(true);

    const ok = validateWorkflowStructural(validGraph());
    expect(ok.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("validates references, parameters, version, and lifecycle", () => {
    expect(
      validateWorkflowReferences({
        categoryId: asWorkflowCategoryId("cat_1"),
        knownCategoryIds: new Set(),
      }).some((i) => i.code === "reference"),
    ).toBe(true);

    expect(
      validateWorkflowParameters({
        parameters: [
          {
            id: asWorkflowParameterId("p1"),
            key: "bad key",
            valueType: "string",
          },
        ],
      }).length,
    ).toBeGreaterThan(0);

    expect(
      validateWorkflowParameters({
        parameters: [
          {
            id: asWorkflowParameterId("p1"),
            key: "count",
            valueType: "number",
            defaultValue: "nope",
          },
        ],
        variables: [
          {
            id: asWorkflowVariableId("v1"),
            key: "count",
            valueType: "boolean",
            defaultValue: 1,
          },
          {
            id: asWorkflowVariableId("v2"),
            key: "count",
            valueType: "boolean",
          },
        ],
      }).length,
    ).toBeGreaterThan(0);

    expect(
      validateWorkflowVersion({ versionNumber: 0 }).some(
        (i) => i.code === "version",
      ),
    ).toBe(true);
    expect(
      validateWorkflowVersion({
        versionNumber: 2,
        existingVersionNumbers: [2],
      }).length,
    ).toBeGreaterThan(0);
    expect(
      validateWorkflowVersion({ status: "running" }).length,
    ).toBeGreaterThan(0);
    expect(
      validateWorkflowVersion({ status: "published" }).length,
    ).toBeGreaterThan(0);

    expect(
      validateWorkflowLifecycle({ lifecycle: "running" }).length,
    ).toBeGreaterThan(0);
    expect(
      validateWorkflowLifecycle({
        fromLifecycle: "active",
        toLifecycle: "draft",
      }).length,
    ).toBeGreaterThan(0);
  });

  it("composes validators into validateWorkflow", () => {
    const result = validateWorkflow({
      graph: validGraph(),
      parameters: [
        {
          id: asWorkflowParameterId("p1"),
          key: "name",
          valueType: "string",
          defaultValue: "x",
        },
      ],
      variables: [
        {
          id: asWorkflowVariableId("v1"),
          key: "flag",
          valueType: "boolean",
          defaultValue: false,
        },
      ],
      versionNumber: 1,
      status: "draft",
      lifecycle: "draft",
      categoryId: asWorkflowCategoryId("cat_ok"),
      knownCategoryIds: new Set(["cat_ok"]),
    });
    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);

    const invalid = validateWorkflow({ graph: undefined, lifecycle: "bogus" });
    expect(invalid.valid).toBe(false);
  });

  it("createWorkflowFoundation requires explicit repos", () => {
    expect(() => createWorkflowFoundation({} as never)).toThrow(
      /explicit repos/,
    );
    expect(() =>
      createWorkflowFoundation({
        repos: { ...stubRepos(), workflows: null as never },
      }),
    ).toThrow(/repos\.workflows/);

    const foundation = createWorkflowFoundation({ repos: stubRepos() });
    expect(foundation.canTransition("draft", "active")).toBe(true);
    expect(foundation.validate({ graph: validGraph() }).valid).toBe(true);
    expect(foundation.listAllowedTransitions("draft")).toContain("active");
    foundation.assertTransition("draft", "archived");
  });

  it("covers reference and structural edge paths", () => {
    expect(
      validateWorkflowReferences({
        categoryId: "" as never,
      }).some((i) => i.path === "categoryId"),
    ).toBe(true);
    expect(
      validateWorkflowReferences({
        folderId: "" as never,
      }).some((i) => i.path === "folderId"),
    ).toBe(true);
    expect(
      validateWorkflowReferences({
        templateId: "" as never,
      }).some((i) => i.path === "templateId"),
    ).toBe(true);
    expect(
      validateWorkflowReferences({
        folderId: asWorkflowFolderId("fold_missing"),
        knownFolderIds: new Set(),
      }).length,
    ).toBeGreaterThan(0);
    expect(
      validateWorkflowReferences({
        templateId: asWorkflowTemplateId("tpl_missing"),
        knownTemplateIds: new Set(),
      }).length,
    ).toBeGreaterThan(0);
    expect(
      validateWorkflowReferences({
        categoryId: asWorkflowCategoryId("cat_ok"),
        folderId: asWorkflowFolderId("fold_ok"),
        templateId: asWorkflowTemplateId("tpl_ok"),
        knownCategoryIds: new Set(["cat_ok"]),
        knownFolderIds: new Set(["fold_ok"]),
        knownTemplateIds: new Set(["tpl_ok"]),
      }),
    ).toEqual([]);

    expect(
      validateWorkflowStructural({
        nodes: [
          {
            id: "n1",
            nodeKind: "trigger",
            kind: "manual",
            config: {},
          },
        ],
        connections: null as never,
      }).some((i) => i.path === "graph.connections"),
    ).toBe(true);

    expect(
      validateWorkflowStructural({
        nodes: [
          {
            id: "",
            nodeKind: "trigger",
            kind: "manual",
            config: {},
          },
        ],
        connections: [{ id: "", sourceNodeId: "x", targetNodeId: "y" } as never],
      }).length,
    ).toBeGreaterThan(0);
  });

  it("covers parameter and variable edge paths", () => {
    expect(
      validateWorkflowParameters({
        parameters: [
          {
            id: asWorkflowParameterId("p1"),
            key: "ok",
            valueType: "json" as never,
          },
          {
            id: asWorkflowParameterId("p2"),
            key: "ok",
            valueType: "string",
          },
        ],
        variables: [
          {
            id: asWorkflowVariableId("v1"),
            key: "payload",
            valueType: "json",
            defaultValue: "{}",
          },
          {
            id: asWorkflowVariableId("v2"),
            key: "bad",
            valueType: "unknown" as never,
          },
          {
            id: asWorkflowVariableId("v3"),
            key: "",
            valueType: "string",
          },
        ],
      }).length,
    ).toBeGreaterThan(0);

    expect(
      validateWorkflowParameters({
        parameters: [
          {
            id: asWorkflowParameterId("p1"),
            key: "flag",
            valueType: "boolean",
            defaultValue: true,
          },
          {
            id: asWorkflowParameterId("p2"),
            key: "label",
            valueType: "string",
            defaultValue: "x",
          },
        ],
        variables: [
          {
            id: asWorkflowVariableId("v1"),
            key: "n",
            valueType: "number",
            defaultValue: 3,
          },
        ],
      }),
    ).toEqual([]);
  });

  it("requireFound throws WorkflowDomainError", () => {
    expect(() => requireFound(null, "workflow", "x")).toThrow(
      WorkflowDomainError,
    );
    expect(requireFound(asWorkflowId("wf_1"), "workflow", "wf_1")).toBe(
      "wf_1",
    );
  });
});
