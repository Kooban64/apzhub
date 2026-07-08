import { describe, expect, it } from "vitest";

import {
  mapNavItemToKnowledgeDocument,
  mapWorkbenchRegistryDtoToKnowledgeDocuments,
  navItem,
  PLATFORM_NAVIGATION_SOURCE_ID,
  WORKBENCH_REGISTRY_DTO_FIXTURE,
} from "./index";

describe("mapNavItemToKnowledgeDocument", () => {
  it("maps workspace, activity bar, sidebar, route, icon, and parent metadata", () => {
    const document = mapNavItemToKnowledgeDocument(
      navItem({
        id: "platform-home-overview",
        capabilityId: "platform-home",
        level: "sidebar",
        workspace: "home",
        label: "Overview",
        parent: "platform-home",
        route: "/workspace/home/overview",
        icon: "overview",
        order: 10,
      }),
    );

    expect(document).toMatchObject({
      documentId: `${PLATFORM_NAVIGATION_SOURCE_ID}:platform-home-overview`,
      sourceId: PLATFORM_NAVIGATION_SOURCE_ID,
      kind: "navigation",
      title: "Overview",
      category: "home",
      icon: "overview",
      navigation: {
        type: "workbench-route",
        target: "/workspace/home/overview",
        workspaceId: "home",
      },
    });
    expect(document.actionRef).toBeUndefined();
    expect(document.metadata).toMatchObject({
      navItemId: "platform-home-overview",
      level: "sidebar",
      workspace: "home",
      parent: "platform-home",
      route: "/workspace/home/overview",
      order: 10,
      capabilityId: "platform-home",
    });
  });

  it("maps activity bar items as workspace kind documents", () => {
    const document = mapNavItemToKnowledgeDocument(
      navItem({
        id: "platform-home",
        level: "activity-bar",
        workspace: "home",
        label: "Home",
      }),
    );

    expect(document.kind).toBe("workspace");
  });
});

describe("mapWorkbenchRegistryDtoToKnowledgeDocuments", () => {
  it("preserves parent/child ordering and workspace hierarchy", () => {
    const { documents, skippedHiddenCount } =
      mapWorkbenchRegistryDtoToKnowledgeDocuments(
        WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
      );

    expect(skippedHiddenCount).toBe(1);
    expect(
      documents.map(
        (document) => document.metadata?.navItemId ?? document.metadata?.viewId,
      ),
    ).toEqual([
      "platform-administration",
      "platform-administration-users",
      "platform-home",
      "platform-home-overview",
      "platform-home-settings",
      "platform-administration-users",
      "platform-home-overview",
    ]);

    const overview = documents.find(
      (document) => document.metadata?.navItemId === "platform-home-overview",
    );
    const home = documents.find(
      (document) => document.metadata?.navItemId === "platform-home",
    );
    expect(overview?.metadata?.parent).toBe("platform-home");
    expect(documents.indexOf(overview!)).toBeGreaterThan(documents.indexOf(home!));
  });

  it("returns empty projection for empty navigation DTO", () => {
    const { documents, skippedHiddenCount } =
      mapWorkbenchRegistryDtoToKnowledgeDocuments(WORKBENCH_REGISTRY_DTO_FIXTURE.empty);

    expect(documents).toEqual([]);
    expect(skippedHiddenCount).toBe(0);
  });
});
