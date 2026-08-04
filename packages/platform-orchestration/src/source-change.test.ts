import { describe, expect, it } from "vitest";

import { SOURCE_CHANGE_EVENT_TYPES, createPlatformOrchestration } from "./index";

describe("APZQEP-165 QO-012 Enterprise Source Change Coordination", () => {
  it("creates a Source Change Package from normalized identities", async () => {
    const platform = await createPlatformOrchestration();
    expect(platform.contracts.get("orchestration.source_change.v1")?.kind).toBe(
      "source_change",
    );
    expect(platform.container.has("orchestration.source.change")).toBe(true);

    const pkg = platform.sourceChange.createSourceChangePackage({
      qualityFlowRef: "qf_1",
      decisionPackageRef: "dp_1",
      automationCoordinationPackageRef: "acp_1",
      tenantId: "tenant_a",
      projectId: "proj_a",
      actorId: "actor_sc",
      sourceChanges: [
        {
          changeRef: "chg_pr_42",
          identities: [
            { kind: "repository", reference: "repo:acme/widget" },
            { kind: "branch", reference: "branch:feature/x" },
            { kind: "commit", reference: "commit:abc123" },
            { kind: "pull_request", reference: "pr:42" },
          ],
        },
      ],
    });

    expect(pkg.scmOperations).toBe(false);
    expect(pkg.advisory).toBe(true);
    expect(pkg.qualityFlowRef).toBe("qf_1");
    expect(pkg.decisionPackageRef).toBe("dp_1");
    expect(pkg.automationCoordinationPackageRef).toBe("acp_1");
    expect(pkg.repositoryRef).toBe("repo:acme/widget");
    expect(pkg.branchRef).toBe("branch:feature/x");
    expect(pkg.commitRef).toBe("commit:abc123");
    expect(pkg.pullOrMergeRequestRef).toBe("pr:42");
    expect(pkg.identities).toHaveLength(4);
    expect(pkg.association.sourceChangeRefs).toContain("chg_pr_42");

    expect(platform.sourceChange.querySourceChanges(pkg.sourceChangePackageId)).toEqual(
      ["chg_pr_42"],
    );
    expect(
      platform.sourceChange.getSourceIdentities(pkg.sourceChangePackageId),
    ).toHaveLength(4);
    expect(
      platform.sourceChange.getCoordinationHistory(pkg.sourceChangePackageId).length,
    ).toBeGreaterThan(0);

    expect(
      platform.events.queryEvents({
        eventType: SOURCE_CHANGE_EVENT_TYPES.packageCreated,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: SOURCE_CHANGE_EVENT_TYPES.identityNormalized,
      }).length,
    ).toBe(4);
    expect(
      platform.events.queryEvents({
        eventType: SOURCE_CHANGE_EVENT_TYPES.changeAssociated,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("supports manual and configuration change identities without SCM providers", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.sourceChange.createSourceChangePackage({
      qualityFlowRef: "qf_manual",
      tenantId: "t1",
      sourceChanges: [
        {
          changeRef: "chg_manual_1",
          identities: [
            {
              kind: "manual_change_declaration",
              reference: "manual:release-notes-update",
            },
            {
              kind: "configuration_change",
              reference: "config:feature-flags/v3",
            },
          ],
        },
      ],
    });

    expect(pkg.identities.map((i) => i.kind).sort()).toEqual([
      "configuration_change",
      "manual_change_declaration",
    ]);
    expect(pkg.repositoryRef).toBeUndefined();
    expect(JSON.stringify(pkg).toLowerCase()).not.toMatch(
      /github|gitlab|bitbucket|azure.?devops|gitea|forgejo|perforce/,
    );
  });

  it("supports superseding packages and publishes updated events", async () => {
    const platform = await createPlatformOrchestration();
    const first = platform.sourceChange.createSourceChangePackage({
      qualityFlowRef: "qf_s",
      decisionPackageRef: "dp_s",
      tenantId: "t1",
      sourceChanges: [
        {
          changeRef: "chg_1",
          identities: [{ kind: "commit", reference: "commit:111" }],
        },
      ],
    });
    const second = platform.sourceChange.createSourceChangePackage({
      qualityFlowRef: "qf_s",
      decisionPackageRef: "dp_s",
      tenantId: "t1",
      supersedesPackageId: first.sourceChangePackageId,
      sourceChanges: [
        {
          changeRef: "chg_2",
          identities: [
            { kind: "commit", reference: "commit:222" },
            { kind: "tag", reference: "tag:v1.2.0" },
          ],
        },
      ],
    });

    expect(second.supersedesPackageId).toBe(first.sourceChangePackageId);
    expect(second.tagOrReleaseRef).toBe("tag:v1.2.0");
    expect(
      platform.events.queryEvents({
        eventType: SOURCE_CHANGE_EVENT_TYPES.packageUpdated,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("rejects empty changes and unknown identity kinds", async () => {
    const platform = await createPlatformOrchestration();
    expect(() =>
      platform.sourceChange.createSourceChangePackage({
        qualityFlowRef: "qf_x",
        tenantId: "t1",
        sourceChanges: [],
      }),
    ).toThrow(/at least one/i);

    expect(() =>
      platform.sourceChange.createSourceChangePackage({
        qualityFlowRef: "qf_x",
        tenantId: "t1",
        sourceChanges: [
          {
            changeRef: "chg_bad",
            identities: [
              {
                kind: "github_pull_request" as never,
                reference: "x",
              },
            ],
          },
        ],
      }),
    ).toThrow(/Unknown source identity kind/i);
  });

  it("never exposes SCM execution APIs", async () => {
    const platform = await createPlatformOrchestration();
    const sc = platform.sourceChange as unknown as Record<string, unknown>;
    expect(typeof sc.cloneRepository).toBe("undefined");
    expect(typeof sc.compareCommits).toBe("undefined");
    expect(typeof sc.invokeGitHub).toBe("undefined");
    expect(typeof sc.evaluatePolicy).toBe("undefined");
    expect(platform.sourceChange.diagnostics().ready).toBe(true);

    const pkg = platform.sourceChange.createSourceChangePackage({
      qualityFlowRef: "qf_arch",
      tenantId: "t1",
      sourceChanges: [
        {
          changeRef: "chg_a",
          identities: [{ kind: "external_change_reference", reference: "ext:1" }],
        },
      ],
    });
    expect(platform.sourceChange.diagnostics().packageCount).toBe(1);
    expect(pkg.scmOperations).toBe(false);
  });
});
