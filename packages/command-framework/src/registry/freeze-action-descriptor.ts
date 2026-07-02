import type { ActionContextPredicate, ActionDescriptor } from "../types";

function freezeContextPredicate(
  predicate: ActionContextPredicate,
): ActionContextPredicate {
  return Object.freeze({
    ...(predicate.surfaces ? { surfaces: Object.freeze([...predicate.surfaces]) } : {}),
    ...(predicate.selectionKinds
      ? { selectionKinds: Object.freeze([...predicate.selectionKinds]) }
      : {}),
    ...(predicate.contextTypes
      ? { contextTypes: Object.freeze([...predicate.contextTypes]) }
      : {}),
  });
}

/**
 * Returns a deeply frozen copy suitable for registry storage.
 * Registered descriptors must be treated as immutable — use {@link DefaultActionRegistry.replace}.
 */
export function freezeActionDescriptor(descriptor: ActionDescriptor): ActionDescriptor {
  const frozen: ActionDescriptor = Object.freeze({
    id: descriptor.id,
    label: descriptor.label,
    handler: descriptor.handler,
    handlerKind: descriptor.handlerKind,
    source: descriptor.source,
    ...(descriptor.permission !== undefined
      ? { permission: descriptor.permission }
      : {}),
    ...(descriptor.shortcut !== undefined ? { shortcut: descriptor.shortcut } : {}),
    ...(descriptor.description !== undefined
      ? { description: descriptor.description }
      : {}),
    ...(descriptor.palette !== undefined ? { palette: descriptor.palette } : {}),
    ...(descriptor.disabled !== undefined ? { disabled: descriptor.disabled } : {}),
    ...(descriptor.icon !== undefined ? { icon: descriptor.icon } : {}),
    ...(descriptor.group !== undefined ? { group: descriptor.group } : {}),
    ...(descriptor.order !== undefined ? { order: descriptor.order } : {}),
    ...(descriptor.capabilityId !== undefined
      ? { capabilityId: descriptor.capabilityId }
      : {}),
    ...(descriptor.version !== undefined ? { version: descriptor.version } : {}),
    ...(descriptor.contextWhen
      ? { contextWhen: freezeContextPredicate(descriptor.contextWhen) }
      : {}),
  });

  return frozen;
}
