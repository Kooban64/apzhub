import type { ShellMode } from "@/types/shell-config";

import { getChromeForMode } from "./chrome-defaults";

export { getChromeForMode } from "./chrome-defaults";

/** Route-level helper: infer shell mode from URL (used by shared shell layout until routes are split). */
export function getShellModeFromPathname(pathname: string): ShellMode {
  return pathname.startsWith("/admin") ? "admin" : "workspace";
}

export function getChromeForPathname(pathname: string) {
  return getChromeForMode(getShellModeFromPathname(pathname));
}
