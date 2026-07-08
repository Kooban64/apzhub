import type { ActivityRegistry } from "../registry/activity-registry";
import type { ActivityMapperRegistry } from "./activity-mapper-registry";

export function syncActivityMapperRegistryFromDescriptors(
  registry: ActivityRegistry,
  templateRegistry: ActivityMapperRegistry,
  options: { clearExisting?: boolean } = {},
): void {
  if (options.clearExisting) {
    templateRegistry.clear();
  }

  for (const descriptor of registry.list()) {
    if (templateRegistry.has(descriptor.activityTypeId)) {
      continue;
    }

    templateRegistry.register({
      activityTypeId: descriptor.activityTypeId,
      titleTemplate: descriptor.label ?? descriptor.activityTypeId,
      descriptionTemplate: descriptor.description,
    });
  }
}
