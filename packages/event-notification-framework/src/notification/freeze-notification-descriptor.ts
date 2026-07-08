import type { NotificationDescriptor } from "./notification-descriptor";

function freezeStringArray(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([...(values ?? [])]);
}

export function freezeNotificationDescriptor(
  descriptor: NotificationDescriptor,
): NotificationDescriptor {
  return Object.freeze({
    ...descriptor,
    tags: freezeStringArray(descriptor.tags),
  });
}

export function freezeNotificationDescriptors(
  descriptors: readonly NotificationDescriptor[],
): readonly NotificationDescriptor[] {
  return Object.freeze(
    descriptors.map((descriptor) => freezeNotificationDescriptor(descriptor)),
  );
}
