import type { ActionDescriptor, ActionSource } from "../types";

/** Platform actions are registered from the built-in catalogue (`source: "builtin"`). */
export function isPlatformAction(descriptor: ActionDescriptor): boolean {
  return descriptor.source === "builtin";
}

/** Capability actions are registered from manifests (`source: "manifest"`). */
export function isCapabilityAction(descriptor: ActionDescriptor): boolean {
  return descriptor.source === "manifest";
}

export function actionOriginLabel(source: ActionSource): "platform" | "capability" {
  return source === "builtin" ? "platform" : "capability";
}
