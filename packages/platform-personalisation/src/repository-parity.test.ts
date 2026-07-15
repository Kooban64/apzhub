import { describe, expect, it } from "vitest";

import { createInMemoryPersonalisationService } from "./index";

describe("Personalisation repository parity (in-memory contract)", () => {
  it("seeds preferences, favorites, recent items, and workbench layout consistently", async () => {
    const { service, repositories } = createInMemoryPersonalisationService();
    const userId = "user-parity";

    const preferences = await service.getUserPreferences(userId);
    expect(preferences.appearance.theme).toBe("system");
    expect(await repositories.preferences.count()).toBeGreaterThan(0);

    const favorite = await service.favorites.addFavorite({
      userId,
      itemType: "workspace",
      itemKey: "home",
      label: "Home",
    });
    expect(favorite.favoriteId).toMatch(/^fav-/);
    expect((await repositories.favorites.listByUser(userId)).length).toBe(1);

    const recent = await service.recentItems.trackRecentItem({
      userId,
      itemType: "workspace",
      itemKey: "administration",
      label: "Administration",
    });
    expect(recent.itemKey).toBe("administration");
    expect((await repositories.recentItems.listByUser(userId)).length).toBe(1);

    const layout = await service.workbenchLayout.saveLayout(userId, {
      schemaVersion: "1.0",
      activeWorkspace: "home",
    });
    expect(layout.userId).toBe(userId);
    expect(await repositories.workbenchLayouts.count()).toBe(1);

    const patched = await service.patchUserPreferences(userId, {
      appearance: { theme: "dark" },
    });
    expect(patched.appearance.theme).toBe("dark");
  });
});
