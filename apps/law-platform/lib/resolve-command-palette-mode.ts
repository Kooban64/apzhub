export type CommandPaletteMode = "commands" | "knowledge";

/** Law workspace defaults to knowledge mode; `?paletteMode=commands` forces command mode for E2E (LAW-007-02). */
export function resolveCommandPaletteMode(
  paletteMode: string | null | undefined,
  pathname?: string,
): CommandPaletteMode {
  if (paletteMode === "commands") {
    return "commands";
  }

  if (paletteMode === "knowledge") {
    return "knowledge";
  }

  if (pathname?.startsWith("/workspace/law")) {
    return "knowledge";
  }

  return "commands";
}
