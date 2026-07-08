import { describe, expect, it } from "vitest";

import {
  createDefaultActionRegistry,
  type ReadOnlyActionRegistry,
} from "@apzhub/command-framework";
import { createDefaultWorkbenchCommandBridge } from "@apzhub/command-framework";

import { createManifestAwareWorkbenchCommandBridge } from "./create-manifest-aware-workbench-bridge";

describe("createManifestAwareWorkbenchCommandBridge", () => {
  it("maps manifest action ids to workbench bridge handlers with default payloads", () => {
    const registry = createDefaultActionRegistry();
    registry.register({
      id: "legal.open.clients",
      label: "Open Clients",
      handler: "workbench-bridge:workbench.view.open",
      handlerKind: "workbench-bridge",
      source: "manifest",
      capabilityId: "legal-clients",
    });

    const bridge = createManifestAwareWorkbenchCommandBridge(
      registry as unknown as ReadOnlyActionRegistry,
      createDefaultWorkbenchCommandBridge(),
    );

    expect(bridge.supports("legal.open.clients")).toBe(true);
    expect(bridge.toAction("legal.open.clients")).toMatchObject({
      id: "workbench.view.open",
      viewId: "legal-clients",
      workspace: "law",
    });
  });
});
