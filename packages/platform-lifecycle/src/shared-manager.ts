import { PlatformLifecycleManager } from "./platform-lifecycle-manager";

let sharedManager: PlatformLifecycleManager | null = null;

export function getSharedPlatformLifecycleManager(): PlatformLifecycleManager {
  if (!sharedManager) {
    sharedManager = new PlatformLifecycleManager();
  }
  return sharedManager;
}

/** @internal Resets singleton for tests. */
export function resetSharedPlatformLifecycleManagerForTests(): void {
  sharedManager = null;
}
