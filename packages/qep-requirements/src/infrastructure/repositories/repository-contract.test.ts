import { describe, expect, it } from "vitest";

import type { RequirementAuditRepository } from "../../domain/repositories/requirement-audit-repository";
import type { RequirementRepository } from "../../domain/repositories/requirement-repository";
import { createRequirement } from "../../domain/entities/requirement";
import { createRequirementId } from "../../domain/value-objects/requirement-id";
import { createQepRequirementsPersistenceForTest } from "../factories";
import {
  createInMemoryQepRequirementsRepositories,
  createEmptyQepRequirementsInMemoryStores,
} from "../in-memory/repositories";

const TENANT = "tenant_contract";
const USER = "user_contract";

function sampleRecord(id: string, key: string) {
  const base = createRequirement({
    id,
    key,
    title: `Title ${key}`,
    type: "business",
    priority: "medium",
    tenantId: TENANT,
    projectId: "project_contract",
  });
  return {
    ...base,
    createdAt: "2026-07-24T10:00:00.000Z",
    updatedAt: "2026-07-24T10:00:00.000Z",
    createdBy: USER,
    updatedBy: USER,
    revision: 1,
  };
}

describe("RequirementRepository contract", () => {
  const stores = createEmptyQepRequirementsInMemoryStores();
  const repos = createInMemoryQepRequirementsRepositories(stores);
  const repo: RequirementRepository = repos.requirements;
  const audits: RequirementAuditRepository = repos.audits;

  it("implements create/find/update/archive/list/search", async () => {
    const created = await repo.create(sampleRecord("req_contract_1", "REQ-C-1"));
    expect(await repo.findById(TENANT, createRequirementId("req_contract_1"))).toEqual(
      created,
    );
    expect(await repo.findByKey(TENANT, "REQ-C-1")).toEqual(created);

    const updated = await repo.update({
      ...created,
      title: "Updated title",
      updatedAt: "2026-07-24T10:05:00.000Z",
      updatedBy: USER,
    });
    expect(updated.revision).toBe(2);

    const listed = await repo.list(TENANT, { projectId: "project_contract" });
    expect(listed).toHaveLength(1);

    const searched = await repo.search(TENANT, {
      q: "Updated",
      projectId: "project_contract",
    });
    expect(searched).toHaveLength(1);

    const archived = await repo.archive(TENANT, createRequirementId("req_contract_1"), {
      archivedAt: "2026-07-24T10:10:00.000Z",
      archivedBy: USER,
      expectedRevision: 2,
    });
    expect(archived.status).toBe("archived");

    await audits.append({
      id: "audit_contract_1",
      tenantId: TENANT,
      requirementId: createRequirementId("req_contract_1"),
      action: "qep.requirement.created",
      actorUserId: USER,
      correlationId: "corr",
      detailsJson: {},
      createdAt: "2026-07-24T10:00:00.000Z",
    });
    const auditRows = await audits.listByRequirement(
      TENANT,
      createRequirementId("req_contract_1"),
    );
    expect(auditRows).toHaveLength(1);
  });
});

describe("QEP requirements persistence factories", () => {
  it("requires explicit memory opt-in for tests", () => {
    expect(() => createQepRequirementsPersistenceForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
  });
});
