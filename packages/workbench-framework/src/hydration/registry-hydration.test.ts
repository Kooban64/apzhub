import { describe, expect, it } from "vitest";

import type { NavigationContribution, ViewDescriptor } from "../interfaces/types";
import { mapWorkbenchRegistryDto } from "../server";
import { hydrateNavigationContributionsFromRegistry } from "./registry-hydration";

const contributions: NavigationContribution[] = [
  {
    id: "platform-home",
    capabilityId: "platform-home",
    capabilityKind: "module",
    level: "activity-bar",
    workspace: "home",
    label: "Home",
    order: 10,
    permission: "platform.nav.home.view",
    hidden: false,
  },
];

const views: ViewDescriptor[] = [
  {
    viewId: "platform-home",
    capabilityId: "platform-home",
    capabilityKind: "module",
    title: "Home",
    workspace: "home",
    route: "/workspace/home",
    default: true,
  },
];

describe("registry hydration", () => {
  it("hydrates navigation contributions and view descriptors from server registry dto", () => {
    const registry = mapWorkbenchRegistryDto(contributions, views);
    const result = hydrateNavigationContributionsFromRegistry(registry);

    expect(result.contributions).toHaveLength(1);
    expect(result.viewDescriptors).toHaveLength(1);
    expect(result.contributions[0]?.id).toBe("platform-home");
    expect(result.viewDescriptors[0]?.viewId).toBe("platform-home");
    expect(result.registry.schemaVersion).toBe("1.0");
  });
});
