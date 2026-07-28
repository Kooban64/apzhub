import { describe, expect, it } from "vitest";

import {
  createAcceptanceCriteria,
  createRequirement,
  createRequirementCollection,
  createRequirementId,
  createRequirementPriority,
  createRequirementRelationship,
  createRequirementStatus,
  createRequirementType,
  createRequirementVersion,
  findRequirementById,
  formatRequirementVersion,
} from "./index";
import { QepInvariantViolation } from "../shared/errors";

describe("QEP Requirements domain objects", () => {
  it("constructs a valid Requirement aggregate", () => {
    const requirement = createRequirement({
      id: "req_login_001",
      key: "REQ-001",
      title: "Users must authenticate",
      type: "functional",
      priority: "high",
      tenantId: "tenant_1",
      projectId: "project_1",
      acceptanceCriteriaItems: ["User can sign in with valid credentials"],
    });

    expect(requirement.id).toBe("req_login_001");
    expect(requirement.status).toBe("draft");
    expect(requirement.approvalState).toBe("not_submitted");
    expect(requirement.acceptanceCriteria?.items).toHaveLength(1);
    expect(formatRequirementVersion(requirement.version)).toBe("1.0.0");
  });

  it("rejects invalid identifiers and enums", () => {
    expect(() => createRequirementId("bad")).toThrow(QepInvariantViolation);
    expect(() => createRequirementType("unknown")).toThrow(QepInvariantViolation);
    expect(() => createRequirementStatus("flying")).toThrow(QepInvariantViolation);
    expect(() => createRequirementPriority("urgent")).toThrow(QepInvariantViolation);
    expect(() => createAcceptanceCriteria([])).toThrow(QepInvariantViolation);
  });

  it("validates relationships and collections", () => {
    const a = createRequirementId("req_a");
    const b = createRequirementId("req_b");
    const rel = createRequirementRelationship({
      kind: "depends_on",
      fromId: a,
      toId: b,
    });
    expect(rel.kind).toBe("depends_on");
    expect(() =>
      createRequirementRelationship({ kind: "related", fromId: a, toId: a }),
    ).toThrow(QepInvariantViolation);

    const r1 = createRequirement({
      id: "req_a",
      key: "A",
      title: "A",
      type: "business",
      priority: "low",
      tenantId: "t1",
      projectId: "p1",
    });
    const r2 = createRequirement({
      id: "req_b",
      key: "B",
      title: "B",
      type: "business",
      priority: "low",
      tenantId: "t1",
      projectId: "p1",
    });
    const collection = createRequirementCollection([r1, r2]);
    expect(findRequirementById(collection, a)?.key).toBe("A");
    expect(() => createRequirementCollection([r1, r1])).toThrow(QepInvariantViolation);
    expect(createRequirementVersion(2, 1, 3)).toEqual({
      major: 2,
      minor: 1,
      patch: 3,
    });
  });
});
