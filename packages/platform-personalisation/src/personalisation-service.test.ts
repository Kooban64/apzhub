import { describe, expect, it } from "vitest";

import { createInMemoryPersonalisationService, resetSharedPersonalisationService } from "./index";

describe("PersonalisationService", () => {
  it("provisions default preferences on first access", async () => {
    resetSharedPersonalisationService();
    const { service } = createInMemoryPersonalisationService();
    const prefs = await service.getUserPreferences("user-1");

    expect(prefs.regional.language).toBe("en");
    expect(prefs.workbench.landingPage).toBe("/workspace/home");
  });

  it("returns diagnostics counts", async () => {
    const { service } = createInMemoryPersonalisationService();
    await service.getUserPreferences("user-diag");
    await service.favorites.addFavorite({
      userId: "user-diag",
      itemType: "workspace",
      itemKey: "home",
      label: "Home",
    });

    const diagnostics = await service.getDiagnostics();
    expect(diagnostics.preferenceCount).toBeGreaterThan(0);
    expect(diagnostics.favoriteCount).toBe(1);
    expect(diagnostics.storageBackend).toBe("memory");
  });
});
