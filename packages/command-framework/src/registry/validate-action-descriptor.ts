import type { ActionHandlerKind, ActionDescriptor, ActionSource } from "../types";
import { ActionRegistryValidationError } from "./registry-errors";

const HANDLER_KINDS: readonly ActionHandlerKind[] = [
  "workbench-bridge",
  "service",
  "event",
];

const SOURCES: readonly ActionSource[] = ["builtin", "manifest"];

const ID_PATTERN = /^[a-z0-9][a-z0-9.-]*$/;

/** Validates descriptor shape before registration. */
export function validateActionDescriptor(descriptor: ActionDescriptor): void {
  if (!descriptor.id?.trim()) {
    throw new ActionRegistryValidationError("Action id is required", "id");
  }

  if (!ID_PATTERN.test(descriptor.id)) {
    throw new ActionRegistryValidationError(
      `Action id "${descriptor.id}" must use lowercase dot notation`,
      "id",
    );
  }

  if (!descriptor.label?.trim()) {
    throw new ActionRegistryValidationError("Action label is required", "label");
  }

  if (!descriptor.handler?.trim()) {
    throw new ActionRegistryValidationError("Action handler is required", "handler");
  }

  if (!HANDLER_KINDS.includes(descriptor.handlerKind)) {
    throw new ActionRegistryValidationError(
      `Invalid handlerKind "${String(descriptor.handlerKind)}"`,
      "handlerKind",
    );
  }

  if (!SOURCES.includes(descriptor.source)) {
    throw new ActionRegistryValidationError(
      `Invalid source "${String(descriptor.source)}"`,
      "source",
    );
  }

  if (descriptor.order !== undefined && !Number.isFinite(descriptor.order)) {
    throw new ActionRegistryValidationError(
      "Action order must be a finite number",
      "order",
    );
  }
}
