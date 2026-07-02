import type { NavigationContribution, ViewDescriptor } from "../interfaces/types";
import type { WorkbenchRegistryDto } from "../server";
import {
  mapRegistryDtoToContributions,
  mapRegistryDtoToViewDescriptors,
} from "../server";

export interface RegistryHydrationResult {
  readonly contributions: readonly NavigationContribution[];
  readonly viewDescriptors: readonly ViewDescriptor[];
  readonly registry: WorkbenchRegistryDto;
}

/** Hydrates Navigation Engine and View Engine input from a server-serialised registry DTO. */
export function hydrateNavigationContributionsFromRegistry(
  registry: WorkbenchRegistryDto,
): RegistryHydrationResult {
  const contributions = mapRegistryDtoToContributions(registry);
  const viewDescriptors = mapRegistryDtoToViewDescriptors(registry);
  return { contributions, viewDescriptors, registry };
}

/** @deprecated alias — use hydrateNavigationContributionsFromRegistry */
export function hydrateWorkbenchFromRegistry(
  registry: WorkbenchRegistryDto,
): RegistryHydrationResult {
  return hydrateNavigationContributionsFromRegistry(registry);
}
