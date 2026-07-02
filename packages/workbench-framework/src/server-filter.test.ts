import { describe, expect, it } from "vitest";

import { createEmptyWorkbenchRegistryDto, filterWorkbenchRegistryDto } from "./server";
import { createAuthWorkbenchPermissionAdapter } from "./permission/auth-permission-adapter";

describe("filterWorkbenchRegistryDto", () => {
  it("removes nav and view entries the user cannot access", () => {
    const dto = {
      ...createEmptyWorkbenchRegistryDto(),
      navItems: [
        {
          id: "platform-home",
          level: "activity-bar" as const,
          workspace: "home",
          label: "Home",
          order: 10,
        },
        {
          id: "platform-administration",
          level: "activity-bar" as const,
          workspace: "administration",
          label: "Administration",
          order: 20,
          permission: "platform.nav.administration.view",
        },
      ],
      views: [
        {
          viewId: "platform-home",
          title: "Home",
          workspace: "home",
        },
        {
          viewId: "platform-administration",
          title: "Administration",
          workspace: "administration",
          permission: "platform.nav.administration.view",
        },
      ],
    };

    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-1",
      permissions: [],
    });

    const filtered = filterWorkbenchRegistryDto(dto, adapter);

    expect(filtered.navItems.map((item) => item.id)).toEqual(["platform-home"]);
    expect(filtered.views.map((view) => view.viewId)).toEqual(["platform-home"]);
  });
});
