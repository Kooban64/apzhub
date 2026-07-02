import { chordFromKeyboardEvent, normaliseChord } from "./normalise-chord";
import { ShortcutRegistryValidationError } from "./shortcut-registry-errors";
import type {
  KeyboardEventLike,
  ShortcutConflict,
  ShortcutRegistration,
  ShortcutRegistry,
  ShortcutRegistryDiagnostics,
} from "./types";

export class DefaultShortcutRegistry implements ShortcutRegistry {
  private readonly byChord = new Map<string, ShortcutRegistration[]>();
  private registrationCount = 0;

  register(registration: ShortcutRegistration): void {
    if (!registration.commandId.trim()) {
      throw new ShortcutRegistryValidationError("commandId is required", "commandId");
    }

    const chord = normaliseChord(registration.chord);
    if (!chord) {
      throw new ShortcutRegistryValidationError(
        `Invalid shortcut chord "${registration.chord}"`,
        "chord",
      );
    }

    const entry: ShortcutRegistration = {
      commandId: registration.commandId,
      chord,
      source: registration.source,
    };

    const existing = this.byChord.get(chord) ?? [];
    if (existing.some((item) => item.commandId === entry.commandId)) {
      return;
    }

    existing.push(entry);
    this.byChord.set(chord, existing);
    this.registrationCount += 1;
  }

  registerMany(registrations: readonly ShortcutRegistration[]): void {
    for (const registration of registrations) {
      this.register(registration);
    }
  }

  lookup(chord: string): string | null {
    const normalised = normaliseChord(chord);
    if (!normalised) {
      return null;
    }

    return this.byChord.get(normalised)?.[0]?.commandId ?? null;
  }

  resolve(event: KeyboardEventLike): string | null {
    const chord = chordFromKeyboardEvent(event);
    if (!chord) {
      return null;
    }

    return this.lookup(chord);
  }

  getConflicts(): readonly ShortcutConflict[] {
    const conflicts: ShortcutConflict[] = [];

    for (const [chord, registrations] of this.byChord.entries()) {
      const commandIds = [
        ...new Set(registrations.map((registration) => registration.commandId)),
      ];
      if (commandIds.length > 1) {
        conflicts.push({
          chord,
          commandIds,
          registrations: Object.freeze([...registrations]),
        });
      }
    }

    return Object.freeze(conflicts);
  }

  getDiagnostics(): ShortcutRegistryDiagnostics {
    const conflicts = this.getConflicts();

    return {
      status: this.registrationCount === 0 ? "empty" : "ready",
      registrationCount: this.registrationCount,
      uniqueChordCount: this.byChord.size,
      conflictCount: conflicts.length,
      conflictChords: Object.freeze(conflicts.map((conflict) => conflict.chord)),
    };
  }

  clear(): void {
    this.byChord.clear();
    this.registrationCount = 0;
  }
}

export function createDefaultShortcutRegistry(): DefaultShortcutRegistry {
  return new DefaultShortcutRegistry();
}
