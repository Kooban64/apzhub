"use client";

import { useEffect } from "react";

import {
  isEditableShortcutTarget,
  isMacPlatform,
} from "../desktop-shell/palette-shortcut";

export const GLOBAL_QUICK_ACTIONS_SHORTCUT = Object.freeze({
  mac: "Meta+Shift+A",
  windowsLinux: "Ctrl+Shift+A",
});

export function isGlobalQuickActionsShortcut(event: {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
}): boolean {
  if (event.key.toLowerCase() !== "a" || !event.shiftKey || event.altKey) {
    return false;
  }
  if (isMacPlatform()) {
    return event.metaKey && !event.ctrlKey;
  }
  return event.ctrlKey && !event.metaKey;
}

export function useGlobalQuickActionsShortcut(options: {
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
      if (!isGlobalQuickActionsShortcut(event)) {
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
