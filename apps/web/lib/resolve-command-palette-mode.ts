export type CommandPaletteMode = "commands" | "knowledge";

/** Test-only palette mode switch — `?paletteMode=knowledge` enables Knowledge Service queries in E2E. */
export function resolveCommandPaletteMode(
  paletteMode: string | null | undefined,
): CommandPaletteMode {
  return paletteMode === "knowledge" ? "knowledge" : "commands";
}
