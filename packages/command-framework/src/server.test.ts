import { describe, expect, it } from "vitest";

import {
  COMMAND_FRAMEWORK_SERVER_STATUS,
  createEmptyActionRegistryDto,
  mapActionRegistryDto,
} from "./server";
import { createDefaultActionRegistry } from "./registry";

describe("@apzhub/command-framework/server", () => {
  it("exports server filter status", () => {
    expect(COMMAND_FRAMEWORK_SERVER_STATUS).toBe("filter");
  });

  it("mapActionRegistryDto lists registered actions in sort order", () => {
    const registry = createDefaultActionRegistry();
    registry.register({
      id: "b.action",
      label: "B",
      handler: "service:b:run",
      handlerKind: "service",
      source: "manifest",
      order: 2,
    });
    registry.register({
      id: "a.action",
      label: "A",
      handler: "service:a:run",
      handlerKind: "service",
      source: "manifest",
      order: 1,
    });

    const dto = mapActionRegistryDto(registry);

    expect(dto.actions.map((action) => action.id)).toEqual(["a.action", "b.action"]);
    expect(dto.toolbar).toEqual([]);
  });

  it("createEmptyActionRegistryDto returns empty payload", () => {
    expect(createEmptyActionRegistryDto()).toEqual({ actions: [], toolbar: [] });
  });
});
