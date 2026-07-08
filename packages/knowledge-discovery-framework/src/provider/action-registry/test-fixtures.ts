import type { ActionDescriptor } from "@apzhub/command-framework";
import type { ActionRegistryDto } from "@apzhub/command-framework/server";

import type { KnowledgeRegistry } from "../../registry/knowledge-registry";
import {
  ActionRegistryKnowledgeProvider,
  createActionRegistryKnowledgeProvider,
} from "./action-registry-knowledge-provider";

export function actionDescriptor(
  overrides: Partial<ActionDescriptor> & Pick<ActionDescriptor, "id" | "label">,
): ActionDescriptor {
  return {
    handler: "service:test:run",
    handlerKind: "service",
    source: "manifest",
    ...overrides,
  };
}

export const ACTION_REGISTRY_DTO_FIXTURE = Object.freeze({
  sample: {
    actions: [
      actionDescriptor({
        id: "platform.home.open",
        label: "Open Home",
        source: "builtin",
        order: 10,
        palette: true,
      }),
      actionDescriptor({
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        description: "Switch between light and dark themes",
        source: "builtin",
        group: "Appearance",
        shortcut: "Ctrl+Shift+T",
        order: 20,
        palette: true,
        permission: "platform.theme.manage",
        icon: "theme",
        contextWhen: {
          surfaces: ["header", "command-palette"],
        },
      }),
      actionDescriptor({
        id: "example.module.run",
        label: "Run Example",
        description: "Execute example capability action",
        source: "manifest",
        capabilityId: "example-module",
        order: 30,
        contextWhen: {
          surfaces: ["context-menu"],
          selectionKinds: ["single"],
        },
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
  } satisfies ActionRegistryDto,
  empty: {
    actions: [],
    toolbar: [],
  } satisfies ActionRegistryDto,
});

export function registerActionRegistryKnowledgeProvider(
  registry: KnowledgeRegistry,
  actionDto: ActionRegistryDto,
): ActionRegistryKnowledgeProvider {
  const provider = createActionRegistryKnowledgeProvider(actionDto);
  registry.registerProvider(provider);
  return provider;
}
