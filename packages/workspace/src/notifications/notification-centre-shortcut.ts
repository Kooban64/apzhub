"use client";

import { useEffect } from "react";

import {
  isEditableShortcutTarget,
  isMacPlatform,
} from "../desktop-shell/palette-shortcut";

export const NOTIFICATION_CENTRE_SHORTCUT = Object.freeze({
  mac: "Meta+Shift+N",
  windowsLinux: "Ctrl+Shift+N",
});

export function isNotificationCentreShortcut(event: {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
}): boolean {
  if (event.key.toLowerCase() !== "n" || !event.shiftKey || event.altKey) {
    return false;
  }
  if (isMacPlatform()) {
    return event.metaKey && !event.ctrlKey;
  }
  return event.ctrlKey && !event.metaKey;
}

export function useNotificationCentreShortcut(options: {
  readonly enabled: boolean;
  readonly onOpen: () => void;
}): void {
  const { enabled, onOpen } = options;
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isNotificationCentreShortcut(event)) {
        return;
      }
      if (isEditableShortcutTarget(event.target)) {
        return;
      }
      event.preventDefault();
      onOpen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onOpen]);
}
