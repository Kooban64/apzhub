"use client";

import { useEffect } from "react";

import {
  isEditableShortcutTarget,
  isMacPlatform,
} from "../desktop-shell/palette-shortcut";

export const GLOBAL_SEARCH_SHORTCUT = Object.freeze({
  mac: "Meta+K",
  windowsLinux: "Ctrl+K",
});

export function isGlobalSearchShortcut(event: {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
}): boolean {
  if (event.key.toLowerCase() !== "k" || event.shiftKey || event.altKey) {
    return false;
  }
  if (isMacPlatform()) {
    return event.metaKey && !event.ctrlKey;
  }
  return event.ctrlKey && !event.metaKey;
}

export function useGlobalSearchShortcut(options: {
  readonly enabled: boolean;
  readonly open: boolean;
  readonly onOpen: () => void;
}): void {
  const { enabled, open, onOpen } = options;
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGlobalSearchShortcut(event)) {
        return;
      }
      if (!open && isEditableShortcutTarget(event.target)) {
        return;
      }
      event.preventDefault();
      onOpen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onOpen, open]);
}
