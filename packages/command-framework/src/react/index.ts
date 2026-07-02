/** React subpath status — AF-010 client hydration. */
export const ACTION_FRAMEWORK_REACT_STATUS = "hydration" as const;

export type {
  CommandRegistryContextValue,
  CommandRegistryProviderProps,
} from "./command-registry-context";
export {
  CommandRegistryProvider,
  useCommandRegistryContext,
} from "./command-registry-context";

export type { UseCommandRegistryResult } from "./use-command-registry";
export { useActionRegistry, useCommandRegistry } from "./use-command-registry";

export type { UseShortcutRegistryResult } from "./use-shortcut-registry";
export { useShortcutRegistry } from "./use-shortcut-registry";

export type {
  ActionFrameworkContext,
  CreateActionFrameworkContextOptions,
} from "../di";
export { createActionFrameworkContext } from "../di";

export type {
  ShortcutConflict,
  ShortcutRegistry,
  ShortcutRegistryDiagnostics,
} from "../shortcuts";
export type {
  ActionRegistryDto,
  ActionToolbarItemDto,
  ActionToolbarRegionDto,
} from "../server/map-action-registry-dto";
export { createEmptyActionRegistryDto } from "../server/map-action-registry-dto";

export {
  createCommandRegistryFromDto,
  type ClientActionRegistryDiagnostics,
  type CreateCommandRegistryFromDtoOptions,
  type CreateCommandRegistryFromDtoResult,
  type ReadOnlyActionRegistry,
  type ClientRegistrySynchronisationState,
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
} from "../client";
