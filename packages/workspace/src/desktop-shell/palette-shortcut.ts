import { useEffect } from "react";

export const COMMAND_PALETTE_SHORTCUT = Object.freeze({
  mac: "Meta+Shift+P",
  windowsLinux: "Ctrl+Shift+P",
});

export function isMacPlatform(
  userAgent: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
): boolean {
  return /Mac|iPhone|iPad|iPod/.test(userAgent);
}

export interface CommandPaletteShortcutEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
}

export function isCommandPaletteShortcut(event: CommandPaletteShortcutEvent): boolean {
  if (event.key.toLowerCase() !== "p" || !event.shiftKey || event.altKey) {
    return false;
  }

  if (isMacPlatform()) {
    return event.metaKey && !event.ctrlKey;
  }

  return event.ctrlKey && !event.metaKey;
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName;
  if (tagName !== "INPUT" && tagName !== "TEXTAREA" && tagName !== "SELECT") {
    return false;
  }

  if (target.closest('[data-testid="command-palette"]')) {
    return false;
  }

  if (target.getAttribute("role") === "combobox") {
    return false;
  }

  return true;
}

export function shouldIgnoreCommandPaletteShortcut(
  event: Pick<KeyboardEvent, "target">,
  options: { readonly paletteOpen?: boolean } = {},
): boolean {
  if (options.paletteOpen) {
    return false;
  }

  return isEditableShortcutTarget(event.target);
}

export interface UseCommandPaletteShortcutOptions {
  readonly enabled: boolean;
  readonly paletteOpen?: boolean;
  readonly onOpen: () => void;
}

/** Global palette shortcut — shell concern, separate from ShortcutRegistry (AF-014). */
export function useCommandPaletteShortcut({
  enabled,
  paletteOpen = false,
  onOpen,
}: UseCommandPaletteShortcutOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isCommandPaletteShortcut(event)) {
        return;
      }

      if (shouldIgnoreCommandPaletteShortcut(event, { paletteOpen })) {
        return;
      }

      event.preventDefault();
      onOpen();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onOpen, paletteOpen]);
}
