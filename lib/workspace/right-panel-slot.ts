import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

let slot: ReactNode = null;
const listeners = new Set<() => void>();

export function setWorkspaceRightPanelSlot(node: ReactNode) {
  slot = node;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return slot;
}

export function useWorkspaceRightPanelSlot(): ReactNode {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
