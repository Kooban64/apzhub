import type { ActionSource } from "../types";

/** Keyboard event shape for shortcut resolution — no DOM dependency required. */
export interface KeyboardEventLike {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
}

/** Shortcut binding registered against an action id. */
export interface ShortcutRegistration {
  readonly commandId: string;
  readonly chord: string;
  readonly source: ActionSource;
}

/** Duplicate chord binding — reported via diagnostics; registry does not execute. */
export interface ShortcutConflict {
  readonly chord: string;
  readonly commandIds: readonly string[];
  readonly registrations: readonly ShortcutRegistration[];
}

export interface ShortcutRegistryDiagnostics {
  readonly status: "ready" | "empty";
  readonly registrationCount: number;
  readonly uniqueChordCount: number;
  readonly conflictCount: number;
  readonly conflictChords: readonly string[];
}

export interface ShortcutRegistry {
  register(registration: ShortcutRegistration): void;
  registerMany(registrations: readonly ShortcutRegistration[]): void;
  lookup(chord: string): string | null;
  resolve(event: KeyboardEventLike): string | null;
  getConflicts(): readonly ShortcutConflict[];
  getDiagnostics(): ShortcutRegistryDiagnostics;
  clear(): void;
}
