import type {
  WorkbenchNavItemDto,
  WorkbenchRegistryDto,
} from "@apzhub/workbench-framework/server";
import { createEmptyWorkbenchRegistryDto } from "@apzhub/workbench-framework/server";

import type { KnowledgeRegistry } from "../../registry/knowledge-registry";
import {
  WorkbenchNavigationKnowledgeProvider,
  createWorkbenchNavigationKnowledgeProvider,
} from "./workbench-navigation-knowledge-provider";

export function navItem(
  overrides: Partial<WorkbenchNavItemDto> &
    Pick<WorkbenchNavItemDto, "id" | "label" | "workspace">,
): WorkbenchNavItemDto {
  return {
    capabilityKind: "module",
    level: "sidebar",
    order: 10,
    ...overrides,
  };
}

export const WORKBENCH_REGISTRY_DTO_FIXTURE = Object.freeze({
  sample: {
    schemaVersion: "1.0",
    navItems: [
      navItem({
        id: "platform-home",
        capabilityId: "platform-home",
        level: "activity-bar",
        workspace: "home",
        label: "Home",
        icon: "home",
        route: "/workspace/home",
        order: 10,
      }),
      navItem({
        id: "platform-administration",
        capabilityId: "platform-administration",
        level: "activity-bar",
        workspace: "administration",
        label: "Administration",
        icon: "settings",
        route: "/workspace/administration",
        order: 20,
        permission: "platform.nav.administration.view",
      }),
      navItem({
        id: "platform-home-overview",
        capabilityId: "platform-home",
        level: "sidebar",
        workspace: "home",
        label: "Overview",
        parent: "platform-home",
        route: "/workspace/home/overview",
        order: 10,
      }),
      navItem({
        id: "platform-home-settings",
        capabilityId: "platform-home",
        level: "sidebar",
        workspace: "home",
        label: "Settings",
        parent: "platform-home",
        route: "/workspace/home/settings",
        order: 20,
      }),
      navItem({
        id: "platform-administration-users",
        capabilityId: "platform-administration",
        level: "sidebar",
        workspace: "administration",
        label: "Users",
        parent: "platform-administration",
        route: "/workspace/administration/users",
        order: 10,
        permission: "platform.nav.administration.view",
      }),
      navItem({
        id: "platform-home-hidden",
        workspace: "home",
        label: "Hidden Item",
        level: "sidebar",
        hidden: true,
        order: 99,
      }),
    ],
    views: [
      {
        viewId: "platform-home-overview",
        capabilityId: "platform-home",
        capabilityKind: "module",
        title: "Overview",
        workspace: "home",
        route: "/workspace/home/overview",
        default: true,
        icon: "overview",
      },
      {
        viewId: "platform-administration-users",
        capabilityId: "platform-administration",
        capabilityKind: "module",
        title: "Users",
        workspace: "administration",
        route: "/workspace/administration/users",
        permission: "platform.nav.administration.view",
      },
    ],
  } satisfies WorkbenchRegistryDto,
  empty: createEmptyWorkbenchRegistryDto(),
});

export function registerWorkbenchNavigationKnowledgeProvider(
  registry: KnowledgeRegistry,
  registryDto: WorkbenchRegistryDto,
): WorkbenchNavigationKnowledgeProvider {
  const provider = createWorkbenchNavigationKnowledgeProvider(registryDto);
  registry.registerProvider(provider);
  return provider;
}
