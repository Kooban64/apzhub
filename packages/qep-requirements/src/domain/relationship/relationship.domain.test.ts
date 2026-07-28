import { describe, expect, it } from "vitest";

import {
  activateRequirementsRelationship,
  assertBaselineInteractionRules,
  assertCyclePolicy,
  assertNoDuplicateActiveRelationship,
  assertSupersessionUniqueness,
  changeRelationshipClassification,
  changeRelationshipCriticality,
  changeRelationshipEndpoints,
  changeRelationshipRationale,
  changeRelationshipScope,
  changeRelationshipSemanticProfile,
  changeRelationshipStrength,
  createRelationshipEndpoint,
  createRelationshipId,
  createRelationshipLifecycleState,
  createRelationshipScope,
  createRelationshipStrength,
  createRelationshipType,
  createRequirementsRelationship,
  deprecateRequirementsRelationship,
  getRelationshipSemanticProfile,
  getRelationshipTaxonomyDefinition,
  NORMATIVE_RELATIONSHIP_TAXONOMY,
  retireRequirementsRelationship,
  toRelationshipEdgeFact,
  validateRelationshipForActivation,
  type RelationshipEdgeFact,
} from ".";

const tenant = "tenant_1";
const at = "2026-07-26T10:00:00.000Z";
const by = "user_1";

function draft(
  overrides: Partial<Parameters<typeof createRequirementsRelationship>[0]> = {},
) {
  return createRequirementsRelationship({
    id: "rrl_1",
    tenantId: tenant,
    type: "refines",
    source: { mode: "requirement", requirementId: "req_source" },
    target: { mode: "requirement", requirementId: "req_target" },
    createdAt: at,
    createdBy: by,
    correlationId: "corr_rel_1",
    ...overrides,
  });
}

function endpointFacts(...ids: string[]) {
  return ids.map((requirementId) => ({
    tenantId: tenant,
    requirementId,
    exists: true,
  }));
}

function activationContext(
  relationship = draft(),
  existingEdges: readonly RelationshipEdgeFact[] = [],
) {
  return {
    existingEdges,
    endpointFacts: endpointFacts(
      relationship.direction.source.requirementId,
      relationship.direction.target.requirementId,
    ),
    pinFacts: [],
    scopeFacts: [],
  };
}

describe("RequirementsRelationship value objects", () => {
  it("accepts branded relationship ids and rejects others", () => {
    expect(createRelationshipId("rrl_abc")).toBe("rrl_abc");
    expect(() => createRelationshipId("req_1")).toThrow();
  });

  it("accepts only approved taxonomy types", () => {
    for (const type of NORMATIVE_RELATIONSHIP_TAXONOMY.map((entry) => entry.type)) {
      expect(createRelationshipType(type)).toBe(type);
    }
    expect(() => createRelationshipType("implements")).toThrow();
  });

  it("accepts lifecycle states and forbids unknown states", () => {
    expect(createRelationshipLifecycleState("draft")).toBe("draft");
    expect(() => createRelationshipLifecycleState("deleted")).toThrow();
  });

  it("validates strength, scope, and baseline scope reference form", () => {
    expect(createRelationshipStrength("mandatory")).toBe("mandatory");
    expect(() => createRelationshipStrength("deprecated")).toThrow();
    expect(createRelationshipScope({ kind: "product" })).toEqual({ kind: "product" });
    expect(
      createRelationshipScope({ kind: "baseline", referenceId: "rbl_1" }).referenceId,
    ).toBe("rbl_1");
    expect(() =>
      createRelationshipScope({ kind: "baseline", referenceId: "req_1" }),
    ).toThrow();
    expect(() => createRelationshipScope({ kind: "project" })).toThrow();
  });

  it("rejects self-referential and cross-tenant endpoints", () => {
    expect(() =>
      createRelationshipEndpoint({
        mode: "requirement",
        requirementId: "req_1",
        tenantId: "",
      }),
    ).toThrow();
    const a = createRelationshipEndpoint({
      mode: "requirement",
      requirementId: "req_1",
      tenantId: tenant,
    });
    expect(() =>
      createRequirementsRelationship({
        id: "rrl_self",
        tenantId: tenant,
        type: "refines",
        source: { mode: "requirement", requirementId: "req_1" },
        target: { mode: "requirement", requirementId: "req_1" },
        createdAt: at,
        createdBy: by,
        correlationId: "corr_self",
      }),
    ).toThrow();
    void a;
  });

  it("requires content version pin for pinned endpoints", () => {
    expect(() =>
      createRelationshipEndpoint({
        mode: "content_version_pinned",
        requirementId: "req_1",
        tenantId: tenant,
      }),
    ).toThrow();
    expect(
      createRelationshipEndpoint({
        mode: "content_version_pinned",
        requirementId: "req_1",
        contentVersionId: "rcv_1",
        tenantId: tenant,
      }).contentVersionId,
    ).toBe("rcv_1");
  });
});

describe("RequirementsRelationship lifecycle", () => {
  it("creates only in draft and emits created event", () => {
    const relationship = draft();
    expect(relationship.lifecycleState).toBe("draft");
    expect(relationship.domainEvents[0]?.type).toBe(
      "qep.requirements_relationship.created",
    );
    expect(relationship.history).toHaveLength(1);
  });

  it("transitions draft → active → deprecated → retired only", () => {
    let relationship = draft();
    relationship = activateRequirementsRelationship(
      relationship,
      "2026-07-26T11:00:00.000Z",
      by,
      activationContext(relationship),
    );
    expect(relationship.lifecycleState).toBe("active");
    relationship = deprecateRequirementsRelationship(
      relationship,
      "2026-07-26T12:00:00.000Z",
      by,
    );
    expect(relationship.lifecycleState).toBe("deprecated");
    relationship = retireRequirementsRelationship(
      relationship,
      "2026-07-26T13:00:00.000Z",
      by,
    );
    expect(relationship.lifecycleState).toBe("retired");
    expect(relationship.history.map((entry) => entry.kind)).toEqual([
      "created",
      "activated",
      "deprecated",
      "retired",
    ]);
  });

  it("rejects reverse transitions, restore, and delete semantics", () => {
    const active = activateRequirementsRelationship(
      draft(),
      "2026-07-26T11:00:00.000Z",
      by,
      activationContext(),
    );
    expect(() =>
      activateRequirementsRelationship(
        active,
        "2026-07-26T12:00:00.000Z",
        by,
        activationContext(),
      ),
    ).toThrow();
    const retired = retireRequirementsRelationship(
      deprecateRequirementsRelationship(active, "2026-07-26T12:00:00.000Z", by),
      "2026-07-26T13:00:00.000Z",
      by,
    );
    expect(() =>
      changeRelationshipStrength(
        retired,
        "recommended",
        "2026-07-26T14:00:00.000Z",
        by,
      ),
    ).toThrow();
  });

  it("preserves immutable history length across transitions", () => {
    const created = draft();
    const active = activateRequirementsRelationship(
      created,
      "2026-07-26T11:00:00.000Z",
      by,
      activationContext(created),
    );
    expect(active.history.length).toBeGreaterThan(created.history.length);
    expect(active.history[0]).toEqual(created.history[0]);
  });
});

describe("taxonomy and rationale", () => {
  it("loads normative taxonomy behaviour matrix", () => {
    expect(getRelationshipTaxonomyDefinition("conflicts_with").symmetric).toBe(true);
    expect(getRelationshipTaxonomyDefinition("relates_to").rationalePolicy).toBe(
      "mandatory",
    );
    expect(getRelationshipTaxonomyDefinition("relates_to").defaultStrength).toBe(
      "informational",
    );
  });

  it("requires rationale for relates_to on activation", () => {
    const relationship = draft({ type: "relates_to", id: "rrl_relates" });
    expect(() =>
      activateRequirementsRelationship(
        relationship,
        "2026-07-26T11:00:00.000Z",
        by,
        activationContext(relationship),
      ),
    ).toThrow(/rationale/i);
  });

  it("activates relates_to when rationale is present", () => {
    const relationship = draft({
      type: "relates_to",
      id: "rrl_relates_ok",
      rationale: "Shared glossary term",
    });
    const active = activateRequirementsRelationship(
      relationship,
      "2026-07-26T11:00:00.000Z",
      by,
      activationContext(relationship),
    );
    expect(active.lifecycleState).toBe("active");
  });
});

describe("activation validation", () => {
  it("rejects missing endpoint existence", () => {
    const relationship = draft();
    expect(() =>
      activateRequirementsRelationship(relationship, "2026-07-26T11:00:00.000Z", by, {
        existingEdges: [],
        endpointFacts: [
          { tenantId: tenant, requirementId: "req_source", exists: true },
        ],
        pinFacts: [],
        scopeFacts: [],
      }),
    ).toThrow(/does not exist/i);
  });

  it("rejects invalid content version pins", () => {
    const relationship = draft({
      id: "rrl_pin",
      source: {
        mode: "content_version_pinned",
        requirementId: "req_source",
        contentVersionId: "rcv_1",
      },
      target: {
        mode: "content_version_pinned",
        requirementId: "req_target",
        contentVersionId: "rcv_2",
      },
    });
    expect(() =>
      activateRequirementsRelationship(relationship, "2026-07-26T11:00:00.000Z", by, {
        existingEdges: [],
        endpointFacts: endpointFacts("req_source", "req_target"),
        pinFacts: [
          {
            tenantId: tenant,
            requirementId: "req_source",
            contentVersionId: "rcv_1",
            valid: true,
          },
          {
            tenantId: tenant,
            requirementId: "req_target",
            contentVersionId: "rcv_2",
            valid: false,
          },
        ],
        scopeFacts: [],
      }),
    ).toThrow(/pin/i);
  });

  it("rejects missing baseline scope reference", () => {
    const relationship = draft({
      id: "rrl_scope",
      scope: { kind: "baseline", referenceId: "rbl_missing" },
    });
    expect(() =>
      activateRequirementsRelationship(relationship, "2026-07-26T11:00:00.000Z", by, {
        existingEdges: [],
        endpointFacts: endpointFacts("req_source", "req_target"),
        pinFacts: [],
        scopeFacts: [
          {
            tenantId: tenant,
            scope: { kind: "baseline", referenceId: "rbl_missing" },
            exists: false,
          },
        ],
      }),
    ).toThrow(/scope/i);
  });

  it("rejects claimed baseline membership mutation", () => {
    expect(() =>
      assertBaselineInteractionRules({ claimsBaselineMembershipMutation: true }),
    ).toThrow();
    expect(() =>
      validateRelationshipForActivation({
        tenantId: tenant,
        relationshipId: "rrl_1",
        type: "refines",
        source: createRelationshipEndpoint({
          mode: "requirement",
          requirementId: "req_a",
          tenantId: tenant,
        }),
        target: createRelationshipEndpoint({
          mode: "requirement",
          requirementId: "req_b",
          tenantId: tenant,
        }),
        scope: { kind: "product" },
        strength: "mandatory",
        classification: "structural",
        existingEdges: [],
        endpointFacts: endpointFacts("req_a", "req_b"),
        pinFacts: [],
        scopeFacts: [],
        claimsBaselineMembershipMutation: true,
      }),
    ).toThrow();
  });
});

describe("duplicate and symmetric rules", () => {
  it("rejects duplicate active directed edges", () => {
    const first = activateRequirementsRelationship(
      draft({ id: "rrl_a" }),
      "2026-07-26T11:00:00.000Z",
      by,
      activationContext(draft({ id: "rrl_a" })),
    );
    const second = draft({ id: "rrl_b" });
    expect(() =>
      activateRequirementsRelationship(second, "2026-07-26T12:00:00.000Z", by, {
        ...activationContext(second),
        existingEdges: [toRelationshipEdgeFact(first)],
      }),
    ).toThrow(/duplicate/i);
  });

  it("canonicalises conflicts_with endpoint order", () => {
    const relationship = draft({
      id: "rrl_conflict",
      type: "conflicts_with",
      rationale: "Known conflict",
      source: { mode: "requirement", requirementId: "req_z" },
      target: { mode: "requirement", requirementId: "req_a" },
    });
    expect(relationship.direction.source.requirementId).toBe("req_a");
    expect(relationship.direction.target.requirementId).toBe("req_z");
  });

  it("treats reversed conflicts_with as the same duplicate key", () => {
    const first = activateRequirementsRelationship(
      draft({
        id: "rrl_c1",
        type: "conflicts_with",
        rationale: "Conflict A",
        source: { mode: "requirement", requirementId: "req_a" },
        target: { mode: "requirement", requirementId: "req_b" },
      }),
      "2026-07-26T11:00:00.000Z",
      by,
      {
        existingEdges: [],
        endpointFacts: endpointFacts("req_a", "req_b"),
        pinFacts: [],
        scopeFacts: [],
      },
    );
    const reversed = draft({
      id: "rrl_c2",
      type: "conflicts_with",
      rationale: "Conflict B",
      source: { mode: "requirement", requirementId: "req_b" },
      target: { mode: "requirement", requirementId: "req_a" },
    });
    expect(() =>
      assertNoDuplicateActiveRelationship(
        {
          relationshipId: reversed.id,
          type: reversed.type,
          source: reversed.direction.source,
          target: reversed.direction.target,
          scope: reversed.scope,
        },
        [toRelationshipEdgeFact(first)],
      ),
    ).toThrow(/duplicate/i);
  });
});

describe("cycle and supersession policies", () => {
  it("detects forbidden cycles for refines", () => {
    const edge: RelationshipEdgeFact = {
      relationshipId: "rrl_existing",
      type: "refines",
      source: createRelationshipEndpoint({
        mode: "requirement",
        requirementId: "req_b",
        tenantId: tenant,
      }),
      target: createRelationshipEndpoint({
        mode: "requirement",
        requirementId: "req_a",
        tenantId: tenant,
      }),
      scope: { kind: "product" },
      lifecycleState: "active",
    };
    expect(() =>
      assertCyclePolicy(
        {
          type: "refines",
          source: createRelationshipEndpoint({
            mode: "requirement",
            requirementId: "req_a",
            tenantId: tenant,
          }),
          target: createRelationshipEndpoint({
            mode: "requirement",
            requirementId: "req_b",
            tenantId: tenant,
          }),
        },
        [edge],
      ),
    ).toThrow(/cycle/i);
  });

  it("permits cycles for relates_to", () => {
    expect(() =>
      assertCyclePolicy(
        {
          type: "relates_to",
          source: createRelationshipEndpoint({
            mode: "requirement",
            requirementId: "req_a",
            tenantId: tenant,
          }),
          target: createRelationshipEndpoint({
            mode: "requirement",
            requirementId: "req_b",
            tenantId: tenant,
          }),
        },
        [
          {
            relationshipId: "rrl_r",
            type: "relates_to",
            source: createRelationshipEndpoint({
              mode: "requirement",
              requirementId: "req_b",
              tenantId: tenant,
            }),
            target: createRelationshipEndpoint({
              mode: "requirement",
              requirementId: "req_a",
              tenantId: tenant,
            }),
            scope: { kind: "product" },
            lifecycleState: "active",
          },
        ],
      ),
    ).not.toThrow();
  });

  it("enforces supersession uniqueness in scope", () => {
    const existing: RelationshipEdgeFact = {
      relationshipId: "rrl_sup_1",
      type: "supersedes",
      source: createRelationshipEndpoint({
        mode: "requirement",
        requirementId: "req_new_1",
        tenantId: tenant,
      }),
      target: createRelationshipEndpoint({
        mode: "requirement",
        requirementId: "req_old",
        tenantId: tenant,
      }),
      scope: { kind: "product" },
      lifecycleState: "active",
    };
    expect(() =>
      assertSupersessionUniqueness(
        {
          relationshipId: "rrl_sup_2",
          type: "supersedes",
          source: createRelationshipEndpoint({
            mode: "requirement",
            requirementId: "req_new_2",
            tenantId: tenant,
          }),
          target: createRelationshipEndpoint({
            mode: "requirement",
            requirementId: "req_old",
            tenantId: tenant,
          }),
          scope: { kind: "product" },
        },
        [existing],
      ),
    ).toThrow(/superseded/i);
  });

  it("emits superseded event on supersedes activation", () => {
    const relationship = draft({
      id: "rrl_sup",
      type: "supersedes",
      rationale: "Replaces predecessor",
      source: { mode: "requirement", requirementId: "req_new" },
      target: { mode: "requirement", requirementId: "req_old" },
    });
    const active = activateRequirementsRelationship(
      relationship,
      "2026-07-26T11:00:00.000Z",
      by,
      {
        existingEdges: [],
        endpointFacts: endpointFacts("req_new", "req_old"),
        pinFacts: [],
        scopeFacts: [],
      },
    );
    expect(
      active.domainEvents.some(
        (event) => event.type === "qep.requirements_relationship.superseded",
      ),
    ).toBe(true);
  });
});

describe("semantic profile and attribute changes", () => {
  it("builds a complete semantic profile", () => {
    const relationship = draft({ rationale: "Because" });
    const profile = getRelationshipSemanticProfile(relationship);
    expect(profile.type).toBe("refines");
    expect(profile.sourceEndpointMode).toBe("requirement");
    expect(profile.lifecycleState).toBe("draft");
  });

  it("allows profile changes on draft and active only", () => {
    let relationship = draft();
    relationship = changeRelationshipStrength(
      relationship,
      "recommended",
      "2026-07-26T10:30:00.000Z",
      by,
    );
    relationship = changeRelationshipCriticality(
      relationship,
      "high",
      "2026-07-26T10:31:00.000Z",
      by,
    );
    relationship = changeRelationshipClassification(
      relationship,
      "safety",
      "2026-07-26T10:32:00.000Z",
      by,
    );
    relationship = changeRelationshipScope(
      relationship,
      { kind: "project", referenceId: "prj_1" },
      "2026-07-26T10:33:00.000Z",
      by,
    );
    relationship = changeRelationshipRationale(
      relationship,
      "Updated rationale",
      "2026-07-26T10:34:00.000Z",
      by,
    );
    relationship = changeRelationshipSemanticProfile(
      relationship,
      { strength: "informational", criticality: "low" },
      "2026-07-26T10:35:00.000Z",
      by,
    );
    expect(relationship.strength).toBe("informational");
    expect(relationship.criticality).toBe("low");

    const active = activateRequirementsRelationship(
      relationship,
      "2026-07-26T11:00:00.000Z",
      by,
      {
        existingEdges: [],
        endpointFacts: endpointFacts("req_source", "req_target"),
        pinFacts: [],
        scopeFacts: [
          {
            tenantId: tenant,
            scope: { kind: "project", referenceId: "prj_1" },
            exists: true,
          },
        ],
      },
    );
    const deprecated = deprecateRequirementsRelationship(
      active,
      "2026-07-26T12:00:00.000Z",
      by,
    );
    expect(() =>
      changeRelationshipStrength(
        deprecated,
        "mandatory",
        "2026-07-26T12:30:00.000Z",
        by,
      ),
    ).toThrow();
  });

  it("allows endpoint changes only while draft", () => {
    const relationship = draft();
    const changed = changeRelationshipEndpoints(
      relationship,
      { mode: "requirement", requirementId: "req_x" },
      { mode: "requirement", requirementId: "req_y" },
      "2026-07-26T10:40:00.000Z",
      by,
    );
    expect(changed.direction.source.requirementId).toBe("req_x");
    const active = activateRequirementsRelationship(
      changed,
      "2026-07-26T11:00:00.000Z",
      by,
      {
        existingEdges: [],
        endpointFacts: endpointFacts("req_x", "req_y"),
        pinFacts: [],
        scopeFacts: [],
      },
    );
    expect(() =>
      changeRelationshipEndpoints(
        active,
        { mode: "requirement", requirementId: "req_1" },
        { mode: "requirement", requirementId: "req_2" },
        "2026-07-26T11:30:00.000Z",
        by,
      ),
    ).toThrow(/draft/i);
  });
});
