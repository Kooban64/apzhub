import type { ActivityDescriptor } from "../types/activity-descriptor";

function freezeStringArray(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([...(values ?? [])]);
}

export function freezeActivityDescriptor(
  descriptor: ActivityDescriptor,
): ActivityDescriptor {
  return Object.freeze({
    ...descriptor,
    timelineScopes: Object.freeze([...descriptor.timelineScopes]),
    tags: freezeStringArray(descriptor.tags),
    permissionKeys: freezeStringArray(descriptor.permissionKeys),
  });
}

export function freezeActivityDescriptors(
  descriptors: readonly ActivityDescriptor[],
): readonly ActivityDescriptor[] {
  return Object.freeze(
    descriptors.map((descriptor) => freezeActivityDescriptor(descriptor)),
  );
}
