import { describe, expect, it } from "vitest";

import { createRequirement } from "../../domain/entities/requirement";
import type { PersistedRequirement } from "../../domain/persisted-requirement";
import { MIGRATION_ACTOR, MIGRATION_REASON } from "../../domain/content-version";
import { createRequirementId } from "../../domain/value-objects/requirement-id";
import {
  createEmptyQepRequirementsInMemoryStores,
  createInMemoryQepRequirementsRepositories,
} from "../in-memory/repositories";
import { backfillRequirementContentVersions } from "./backfill-requirement-content-versions";

function sampleRequirement(id: string): PersistedRequirement {
  const requirement = createRequirement({
    id: createRequirementId(id),
    key: `KEY-${id}`,
    title: "Backfill me",
    type: "functional",
    status: "draft",
    priority: "medium",
    tenantId: "tenant_a",
    projectId: "project_a",
  });
  return {
    ...requirement,
    createdAt: "2026-07-25T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z",
    createdBy: "user_1",
    updatedBy: "user_1",
    revision: 3,
  };
}

describe("backfillRequirementContentVersions", () => {
  it("creates version 1 once and is idempotent", async () => {
    const stores = createEmptyQepRequirementsInMemoryStores();
    const repos = createInMemoryQepRequirementsRepositories(stores);
    await repos.requirements.create(sampleRequirement("req_backfill_1"));

    const first = await backfillRequirementContentVersions({
      tenantId: "tenant_a",
      requirements: repos.requirements,
      contentVersions: repos.contentVersions,
    });
    expect(first).toEqual({ examined: 1, appended: 1 });

    const latest = await repos.contentVersions.getLatest(
      "tenant_a",
      createRequirementId("req_backfill_1"),
    );
    expect(latest?.versionNumber).toBe(1);
    expect(latest?.changeReason).toBe(MIGRATION_REASON);
    expect(latest?.actorUserId).toBe(MIGRATION_ACTOR);
    expect(latest?.sourceRevision).toBe(3);

    const second = await backfillRequirementContentVersions({
      tenantId: "tenant_a",
      requirements: repos.requirements,
      contentVersions: repos.contentVersions,
    });
    expect(second).toEqual({ examined: 1, appended: 0 });
  });
});
