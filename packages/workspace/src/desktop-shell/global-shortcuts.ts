import { useEffect } from "react";

import { useCommandRegistry } from "@apzhub/command-framework/react";

import { isCommandPaletteShortcut, isEditableShortcutTarget } from "./palette-shortcut";

export interface GlobalShortcutEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
  readonly target: EventTarget | null;
  readonly preventDefault: () => void;
}

function isPaletteInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest('[data-testid="command-palette"]'));
}

/** Returns true when global shortcut handling should be skipped. */
export function shouldIgnoreGlobalShortcut(
  event: Pick<GlobalShortcutEvent, "target">,
  options: { readonly modalOpen?: boolean } = {},
): boolean {
  if (options.modalOpen) {
    return true;
  }

  if (isPaletteInputTarget(event.target)) {
    return true;
  }

  return isEditableShortcutTarget(event.target);
}

export interface UseGlobalShortcutsOptions {
  readonly enabled: boolean;
  readonly modalOpen?: boolean;
  readonly onExecuted?: (commandId: string) => void;
}

/**
 * Global shell keydown listener — resolves shortcuts and executes via Action Framework.
 *
 * Execution path: ShortcutRegistry → useCommandRegistry().execute → ActionExecutor → bridge.
 * Palette open chord remains a dedicated shell concern (palette-shortcut.ts).
 */
export function useGlobalShortcuts({
  enabled,
  modalOpen = false,
  onExecuted,
}: UseGlobalShortcutsOptions): void {
  const { shortcuts, execute } = useCommandRegistry();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreGlobalShortcut(event, { modalOpen })) {
        return;
      }

      if (isCommandPaletteShortcut(event)) {
        return;
      }

      const actionId = shortcuts.resolve(event);
      if (!actionId) {
        return;
      }

      event.preventDefault();
      void execute(actionId).then(() => {
        onExecuted?.(actionId);
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, execute, modalOpen, onExecuted, shortcuts]);
}
