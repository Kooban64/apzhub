import type { EventDescriptor } from "./event-descriptor";

function freezeStringArray(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([...(values ?? [])]);
}

export function freezeEventDescriptor(descriptor: EventDescriptor): EventDescriptor {
  return Object.freeze({
    ...descriptor,
    tags: freezeStringArray(descriptor.tags),
    subscribers: freezeStringArray(descriptor.subscribers),
  });
}

export function freezeEventDescriptors(
  descriptors: readonly EventDescriptor[],
): readonly EventDescriptor[] {
  return Object.freeze(
    descriptors.map((descriptor) => freezeEventDescriptor(descriptor)),
  );
}
