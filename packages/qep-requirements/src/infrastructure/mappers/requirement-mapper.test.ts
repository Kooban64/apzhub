import { describe, expect, it } from "vitest";

import {
  persistedRequirementToRow,
  rowToPersistedRequirement,
  matchesRequirementSearch,
} from "./requirement-mapper";
import { createRequirement } from "../../domain/entities/requirement";
import { qepRequirement } from "@apzhub/config";

describe("requirement-mapper", () => {
  it("round-trips persisted requirements through drizzle row shape", () => {
    const row: typeof qepRequirement.$inferSelect = {
      id: "req_mapper_001",
      tenantId: "tenant_alpha",
      projectId: "project_1",
      key: "REQ-MAP",
      title: "Mapped",
      description: "Desc",
      type: "functional",
      status: "draft",
      priority: "medium",
      category: null,
      ownerJson: { userId: "owner_1", displayName: "Owner" },
      approvalState: "not_submitted",
      versionMajor: 1,
      versionMinor: 0,
      versionPatch: 0,
      acceptanceCriteriaJson: { items: ["AC1"] },
      attributesJson: { tags: ["tag"], custom: { env: "dev" } },
      referencesJson: [{ system: "jira", externalId: "J-1" }],
      baselineJson: null,
      createdAt: new Date("2026-07-24T10:00:00.000Z"),
      updatedAt: new Date("2026-07-24T10:00:00.000Z"),
      createdBy: "user_1",
      updatedBy: "user_1",
      archivedAt: null,
      archivedBy: null,
      revision: 1,
    };

    const persisted = rowToPersistedRequirement(row);
    expect(persisted.owner?.userId).toBe("owner_1");
    expect(persisted.acceptanceCriteria?.items).toEqual(["AC1"]);

    const rowPayload = persistedRequirementToRow(persisted);
    const roundTrip = rowToPersistedRequirement(
      rowPayload as typeof qepRequirement.$inferSelect,
    );
    expect(roundTrip.key).toBe("REQ-MAP");
    expect(roundTrip.attributes.custom.env).toBe("dev");
  });

  it("matches search text against key, title, and description", () => {
    const base = createRequirement({
      id: "req_search_1",
      key: "REQ-SEARCH",
      title: "Alpha title",
      description: "Beta description",
      type: "business",
      priority: "low",
      tenantId: "tenant",
      projectId: "project",
    });
    const record = {
      ...base,
      createdAt: "2026-07-24T10:00:00.000Z",
      updatedAt: "2026-07-24T10:00:00.000Z",
      createdBy: "user",
      updatedBy: "user",
      revision: 1,
    };
    expect(matchesRequirementSearch(record, "alpha")).toBe(true);
    expect(matchesRequirementSearch(record, "beta")).toBe(true);
    expect(matchesRequirementSearch(record, "missing")).toBe(false);
  });
});
