import type { ClientActivityType } from "./client-activity-type";
import type { ClientActivityRegistryDiagnostics } from "./client-activity-registry-diagnostics";

/**
 * Read-only activity type index for browser consumers.
 *
 * The server remains authoritative — clients must not register types or run mappers.
 */
export interface ReadOnlyActivityRegistry {
  has(activityTypeId: string): boolean;
  get(activityTypeId: string): ClientActivityType | undefined;
  list(): readonly ClientActivityType[];
  getDiagnostics(): ClientActivityRegistryDiagnostics;
}
