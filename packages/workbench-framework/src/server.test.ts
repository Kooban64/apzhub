import { describe, expect, it } from "vitest";

import type { NavigationItem, ViewDescriptor } from "./interfaces/types";
import {
  createAuthPermissionContextFromUser,
  createEmptyWorkbenchRegistryDto,
  mapContributionsToRegistryDto,
  mapNavigationItemsToRegistryDto,
  mapRegistryDtoToContributions,
  mapRegistryDtoToViewDescriptors,
  mapViewDescriptorsToDto,
  mapWorkbenchRegistryDto,
} from "./server";

const homeView: ViewDescriptor = {
  viewId: "platform-home",
  capabilityId: "platform-home",
  capabilityKind: "module",
  title: "Home",
  workspace: "home",
  route: "/workspace/home",
  default: true,
};

describe("navigation DTO mapping", () => {
  it("maps registry DTO entries to navigation contributions", () => {
    const dto = {
      ...createEmptyWorkbenchRegistryDto(),
      navItems: [
        {
          id: "platform-home",
          capabilityId: "platform-home",
          capabilityKind: "module",
          level: "activity-bar" as const,
          workspace: "home",
          label: "Home",
          order: 10,
        },
      ],
    };

    const contributions = mapRegistryDtoToContributions(dto);
    expect(contributions).toHaveLength(1);
    expect(contributions[0]?.id).toBe("platform-home");
    expect(contributions[0]?.hidden).toBe(false);
  });

  it("maps registry DTO entries to view descriptors", () => {
    const dto = mapWorkbenchRegistryDto([], [homeView]);
    const descriptors = mapRegistryDtoToViewDescriptors(dto);

    expect(descriptors).toHaveLength(1);
    expect(descriptors[0]?.viewId).toBe("platform-home");
    expect(descriptors[0]?.route).toBe("/workspace/home");
  });

  it("maps contributions and navigation items through registry helpers", () => {
    const contribution = {
      id: "platform-home",
      capabilityId: "platform-home",
      capabilityKind: "module" as const,
      level: "activity-bar" as const,
      workspace: "home",
      label: "Home",
      order: 10,
      hidden: false,
    };

    const navigationItem: NavigationItem = {
      ...contribution,
      visible: true,
      revealed: true,
      children: [],
    };

    const fromContributions = mapContributionsToRegistryDto([contribution], [homeView]);
    const fromNavigationItems = mapNavigationItemsToRegistryDto(
      [navigationItem],
      [homeView],
    );

    expect(fromContributions.navItems[0]?.id).toBe("platform-home");
    expect(fromNavigationItems.views[0]?.viewId).toBe("platform-home");
    expect(mapViewDescriptorsToDto([homeView])[0]?.title).toBe("Home");
  });

  it("createAuthPermissionContextFromUser returns null without a user", () => {
    expect(createAuthPermissionContextFromUser(null)).toBeNull();
    expect(createAuthPermissionContextFromUser(undefined)).toBeNull();
  });

  it("createAuthPermissionContextFromUser maps roles and permissions", () => {
    expect(
      createAuthPermissionContextFromUser(
        { id: "user-1" },
        { roles: ["admin"], permissions: ["platform.nav.home.view"] },
      ),
    ).toEqual({
      userId: "user-1",
      roles: ["admin"],
      permissions: ["platform.nav.home.view"],
    });
  });
});
