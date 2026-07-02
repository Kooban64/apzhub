import { describe, expect, it } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { createAuthWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import type { ActionDescriptor } from "../types";
import { filterActionRegistryDto } from "./filter-action-registry-dto";
import type { ActionRegistryDto } from "./map-action-registry-dto";

function action(
  overrides: Partial<ActionDescriptor> & Pick<ActionDescriptor, "id" | "label">,
): ActionDescriptor {
  return {
    handler: "service:test:run",
    handlerKind: "service",
    source: "manifest",
    ...overrides,
  };
}

function sampleDto(overrides: Partial<ActionRegistryDto> = {}): ActionRegistryDto {
  return {
    actions: [
      action({ id: "platform.home.open", label: "Open Home" }),
      action({
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        permission: "platform.theme.manage",
      }),
    ],
    toolbar: [
      {
        region: "header",
        items: [
          { commandId: "platform.home.open", label: "Home" },
          { commandId: "platform.theme.toggle", label: "Theme" },
        ],
      },
    ],
    ...overrides,
  };
}

describe("filterActionRegistryDto", () => {
  it("passes all actions with allow-all adapter", () => {
    const dto = sampleDto();
    const filtered = filterActionRegistryDto(
      dto,
      createAllowAllWorkbenchPermissionAdapter(),
    );

    expect(filtered.actions).toHaveLength(2);
    expect(filtered.toolbar[0]?.items).toHaveLength(2);
  });

  it("returns empty actions for empty input", () => {
    const filtered = filterActionRegistryDto(
      { actions: [], toolbar: [] },
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );

    expect(filtered.actions).toEqual([]);
    expect(filtered.toolbar).toEqual([]);
  });

  it("filters actions denied by permission adapter", () => {
    const dto = sampleDto();
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-1",
      permissions: ["platform.theme.manage"],
    });

    const filtered = filterActionRegistryDto(dto, adapter);

    expect(filtered.actions.map((item) => item.id)).toEqual([
      "platform.home.open",
      "platform.theme.toggle",
    ]);
  });

  it("removes permission-gated actions when user lacks permission", () => {
    const dto = sampleDto();
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-1",
      permissions: [],
    });

    const filtered = filterActionRegistryDto(dto, adapter);

    expect(filtered.actions.map((item) => item.id)).toEqual(["platform.home.open"]);
  });

  it("removes toolbar items referencing filtered-out actions", () => {
    const dto = sampleDto();
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-1",
      permissions: [],
    });

    const filtered = filterActionRegistryDto(dto, adapter);

    expect(filtered.toolbar[0]?.items.map((item) => item.commandId)).toEqual([
      "platform.home.open",
    ]);
  });

  it("delegates filtering to permissionAdapter.filter without evaluating permissions inline", () => {
    const dto = sampleDto();
    let filterInvoked = false;
    const adapter = {
      getContext: () => null,
      can: () => true,
      filter: <T extends { permission?: string }>(items: readonly T[]) => {
        filterInvoked = true;
        return items.filter((item) => item.permission !== "platform.theme.manage");
      },
    };

    const filtered = filterActionRegistryDto(dto, adapter);

    expect(filterInvoked).toBe(true);
    expect(filtered.actions.map((item) => item.id)).toEqual(["platform.home.open"]);
  });
});
