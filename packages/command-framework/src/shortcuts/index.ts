export type {
  KeyboardEventLike,
  ShortcutConflict,
  ShortcutRegistration,
  ShortcutRegistry,
  ShortcutRegistryDiagnostics,
} from "./types";
export { normaliseChord, chordFromKeyboardEvent } from "./normalise-chord";
export { ShortcutRegistryValidationError } from "./shortcut-registry-errors";
export {
  DefaultShortcutRegistry,
  createDefaultShortcutRegistry,
} from "./default-shortcut-registry";
export {
  bootstrapShortcutRegistry,
  registerShortcutsFromActions,
  type BootstrapShortcutRegistryResult,
  type RegisterShortcutsFromActionsResult,
} from "./register-shortcuts-from-actions";
