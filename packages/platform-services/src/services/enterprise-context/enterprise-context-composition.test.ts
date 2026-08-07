import { describe, expect, it } from "vitest";

import type { ContextSlice } from "@apzhub/platform-service-contracts";

import { composeEnterpriseContext } from "./compose-enterprise-context";
import { composeEnterpriseContextFromGateway } from "./create-enterprise-context-service";
import { matchesProjectFocus } from "./relevance";

describe("matchesProjectFocus", () => {
  it("matches id, identifier, and name needles", () => {
    const focus = {
      type: "project" as const,
      id: "proj_1",
      identifier: "ALPHA",
      name: "Delivery Alpha",
    };
    expect(matchesProjectFocus(focus, ["tag:proj_1"])).toBe(true);
    expect(matchesProjectFocus(focus, ["project:ALPHA"])).toBe(true);
    expect(matchesProjectFocus(focus, ["About Delivery Alpha launch"])).toBe(true);
    expect(matchesProjectFocus(focus, ["unrelated"])).toBe(false);
  });
});

describe("composeEnterpriseContext", () => {
  it("orders slices and marks partial on unavailable providers", () => {
    const slices: ContextSlice[] = [
      {
        providerId: "knowledge",
        sectionId: "knowledge",
        productLabel: "APZ Knowledge",
        fragments: [
          {
            id: "k1",
            providerId: "knowledge",
            productLabel: "APZ Knowledge",
            sectionHint: "lessons",
            title: "Lesson",
            fragmentClass: "entity",
          },
        ],
      },
      {
        providerId: "workflow",
        sectionId: "workflow",
        productLabel: "APZ Workflow",
        fragments: [],
        absenceReason: "unavailable",
        error: "down",
      },
    ];

    const composition = composeEnterpriseContext(
      slices,
      { type: "project", id: "proj_1", identifier: "ALPHA" },
      { now: new Date("2026-08-06T12:00:00.000Z") },
    );

    expect(composition.compositionOnly).toBe(true);
    expect(composition.ownsBusinessState).toBe(false);
    expect(composition.question).toBe("What do I need to know before I continue?");
    expect(composition.partial).toBe(true);
    expect(composition.slices.map((s) => s.sectionId)).toEqual([
      "projects",
      "workflow",
      "support",
      "documents",
      "law",
      "knowledge",
    ]);
    expect(composition.slices[1]?.error).toBe("down");
    expect(composition.slices[5]?.fragments).toHaveLength(1);
  });
});

describe("composeEnterpriseContextFromGateway", () => {
  it("composes attributed fragments and never owns business state", async () => {
    const composition = await composeEnterpriseContextFromGateway(
      {
        userId: "user_1",
        tenantId: "tenant_1",
        correlationId: "corr_1",
        requestId: "req_1",
        permissions: [],
      },
      {
        projects: {
          getProject: async () =>
            ({
              id: "proj_1",
              name: "Delivery Alpha",
              identifier: "ALPHA",
              status: "active",
            }) as never,
        },
        workflow: {
          tasks: {
            listInbox: async () => [
              {
                id: "wtk_1",
                title: "Approve ALPHA release gate",
                status: "open",
                kind: "approval",
                updatedAt: "2026-08-06T10:00:00.000Z",
                formValues: { projectId: "proj_1" },
              },
              {
                id: "wtk_2",
                title: "Unrelated task",
                status: "open",
                kind: "human",
                updatedAt: "2026-08-06T10:00:00.000Z",
              },
            ],
          },
        },
        support: {
          listSupportRequests: async () => ({
            items: [
              {
                id: "sup_1",
                title: "Outage affecting Delivery Alpha",
                status: "open",
                priority: "urgent",
                tags: ["project:ALPHA", "escalated"],
                groupId: "g1",
                requesterId: "u1",
                tenantId: "tenant_1",
                createdAt: "2026-08-01T00:00:00.000Z",
                updatedAt: "2026-08-06T09:00:00.000Z",
              } as never,
            ],
          }),
        },
        documentSearchMetadata: {
          find: async () => [
            {
              documentId: "doc_1",
              title: "ALPHA charter",
              status: "approved",
              updatedAt: "2026-08-05T00:00:00.000Z",
              tagNames: ["ALPHA"],
            },
            {
              documentId: "doc_2",
              title: "Other",
              status: "draft",
              updatedAt: "2026-08-05T00:00:00.000Z",
              tagNames: [],
            },
          ],
        },
      },
      {
        focusType: "project",
        focusId: "proj_1",
        now: new Date("2026-08-06T12:00:00.000Z"),
      },
    );

    expect(composition.focus.identifier).toBe("ALPHA");
    expect(composition.ownsBusinessState).toBe(false);
    expect(composition.compositionOnly).toBe(true);

    const bySection = Object.fromEntries(
      composition.slices.map((s) => [s.sectionId, s]),
    );

    expect(
      bySection.workflow?.fragments.some((f) => f.sectionHint === "approvals"),
    ).toBe(true);
    expect(bySection.support?.fragments[0]?.productLabel).toBe("APZ Support");
    expect(bySection.support?.fragments[0]?.href).toContain("/workspace/support/");
    expect(
      bySection.documents?.fragments.some((f) => f.sourceEntityRef === "doc_1"),
    ).toBe(true);
    expect(bySection.law?.fragments.length).toBeGreaterThan(0);
    expect(bySection.knowledge?.fragments.length).toBeGreaterThan(0);

    for (const slice of composition.slices) {
      for (const fragment of slice.fragments) {
        expect(fragment.productLabel.startsWith("APZ")).toBe(true);
        expect(fragment.productLabel.toLowerCase()).not.toContain("plane");
        expect(fragment.productLabel.toLowerCase()).not.toContain("zammad");
      }
    }
  });

  it("degrades a single provider without inventing content", async () => {
    const composition = await composeEnterpriseContextFromGateway(
      {
        userId: "user_1",
        tenantId: "tenant_1",
        correlationId: "corr_1",
        requestId: "req_1",
        permissions: [],
      },
      {
        support: {
          listSupportRequests: async () => {
            throw new Error("support_down");
          },
        },
      },
      { focusType: "project", focusId: "proj_x" },
    );

    const support = composition.slices.find((s) => s.sectionId === "support");
    expect(support?.absenceReason).toBe("unavailable");
    expect(support?.fragments).toHaveLength(0);
    expect(composition.partial).toBe(true);
    expect(
      composition.slices.find((s) => s.sectionId === "law")?.fragments.length,
    ).toBeGreaterThan(0);
  });

  it("composes workflow, support, and knowledge focus types consistently", async () => {
    const gateway = {
      projects: {
        getProject: async () =>
          ({
            id: "proj_1",
            name: "Delivery Alpha",
            identifier: "ALPHA",
            status: "active",
          }) as never,
        listProjects: async () => ({
          items: [
            {
              id: "proj_1",
              name: "Delivery Alpha",
              identifier: "ALPHA",
              status: "active",
            } as never,
          ],
        }),
      },
      workflow: {
        tasks: {
          listInbox: async () => [
            {
              id: "wtk_1",
              title: "Approve ALPHA release gate",
              status: "open",
              kind: "approval",
              updatedAt: "2026-08-06T10:00:00.000Z",
              formValues: { projectId: "proj_1" },
            },
          ],
        },
      },
      support: {
        listSupportRequests: async () => ({
          items: [
            {
              id: "sup_1",
              title: "Outage affecting Delivery Alpha",
              status: "open",
              priority: "urgent",
              tags: ["project:ALPHA"],
              groupId: "g1",
              requesterId: "u1",
              tenantId: "tenant_1",
              createdAt: "2026-08-01T00:00:00.000Z",
              updatedAt: "2026-08-06T09:00:00.000Z",
            } as never,
          ],
        }),
      },
    };

    for (const focusType of ["workflow", "support", "knowledge"] as const) {
      const composition = await composeEnterpriseContextFromGateway(
        {
          userId: "user_1",
          tenantId: "tenant_1",
          correlationId: "corr_1",
          requestId: "req_1",
          permissions: [],
        },
        gateway,
        {
          focusType,
          focusId: focusType === "support" ? "sup_1" : "focus_1",
          focusName: "Delivery Alpha",
          focusIdentifier: "ALPHA",
        },
      );

      expect(composition.focus.type).toBe(focusType);
      expect(composition.compositionOnly).toBe(true);
      expect(composition.ownsBusinessState).toBe(false);
      expect(composition.slices.map((s) => s.sectionId)).toEqual([
        "projects",
        "workflow",
        "support",
        "documents",
        "law",
        "knowledge",
      ]);
      for (const slice of composition.slices) {
        for (const fragment of slice.fragments) {
          expect(fragment.productLabel.startsWith("APZ")).toBe(true);
        }
      }
    }
  });

  it("keeps partial composition when documents provider is unavailable", async () => {
    const composition = await composeEnterpriseContextFromGateway(
      {
        userId: "user_1",
        tenantId: "tenant_1",
        correlationId: "corr_1",
        requestId: "req_1",
        permissions: [],
      },
      {
        documentSearchMetadata: {
          find: async () => {
            throw new Error("documents_down");
          },
        },
      },
      { focusType: "workflow", focusId: "journey_1", focusName: "Onboard" },
    );

    const documents = composition.slices.find((s) => s.sectionId === "documents");
    expect(documents?.absenceReason).toBe("unavailable");
    expect(documents?.fragments).toHaveLength(0);
    expect(composition.partial).toBe(true);
    expect(
      composition.slices.find((s) => s.sectionId === "knowledge")?.fragments.length,
    ).toBeGreaterThan(0);
  });
});
