import type { ActionRegistryListOptions } from "../registry/action-registry";
import type { ActionDescriptor } from "../types";
import type { ClientActionRegistryDiagnostics } from "./client-action-registry-diagnostics";

/**
 * Read-only action index for browser consumers.
 *
 * The server remains authoritative — clients must not register, replace, or remove actions.
 */
export interface ReadOnlyActionRegistry {
  has(id: string): boolean;
  get(id: string): ActionDescriptor | undefined;
  list(options?: ActionRegistryListOptions): readonly ActionDescriptor[];
  getDiagnostics(): ClientActionRegistryDiagnostics;
}
