/** Pure editor-tab helpers for Shared Source Phase E6. */

export type SourceEditorTab = {
  readonly path: string;
  readonly draft: string;
  readonly baseline: string;
};

export function isTabDirty(tab: SourceEditorTab): boolean {
  return tab.draft !== tab.baseline;
}

export function openOrFocusTab(
  tabs: readonly SourceEditorTab[],
  path: string,
  content?: string,
): { readonly tabs: readonly SourceEditorTab[]; readonly activePath: string } {
  const existing = tabs.find((tab) => tab.path === path);
  if (existing) {
    return { tabs, activePath: path };
  }
  const seed = content ?? "";
  return {
    tabs: [...tabs, { path, draft: seed, baseline: seed }],
    activePath: path,
  };
}

export function closeTab(
  tabs: readonly SourceEditorTab[],
  path: string,
  activePath: string | null,
): {
  readonly tabs: readonly SourceEditorTab[];
  readonly activePath: string | null;
} {
  const next = tabs.filter((tab) => tab.path !== path);
  if (activePath !== path) {
    return { tabs: next, activePath };
  }
  const closedIndex = tabs.findIndex((tab) => tab.path === path);
  const fallback =
    next[Math.min(closedIndex, next.length - 1)]?.path ??
    next[next.length - 1]?.path ??
    null;
  return { tabs: next, activePath: fallback };
}

export function updateTabDraft(
  tabs: readonly SourceEditorTab[],
  path: string,
  draft: string,
): readonly SourceEditorTab[] {
  return tabs.map((tab) => (tab.path === path ? { ...tab, draft } : tab));
}

export function markTabClean(
  tabs: readonly SourceEditorTab[],
  path: string,
  content: string,
): readonly SourceEditorTab[] {
  return tabs.map((tab) =>
    tab.path === path ? { ...tab, draft: content, baseline: content } : tab,
  );
}

export function cycleTabPath(
  tabs: readonly SourceEditorTab[],
  activePath: string | null,
  direction: 1 | -1,
): string | null {
  if (tabs.length === 0) return null;
  if (!activePath) return tabs[0]?.path ?? null;
  const index = tabs.findIndex((tab) => tab.path === activePath);
  if (index < 0) return tabs[0]?.path ?? null;
  const next = (index + direction + tabs.length) % tabs.length;
  return tabs[next]?.path ?? null;
}

export function moveTreeFocus(
  entryCount: number,
  current: number,
  direction: 1 | -1,
): number {
  if (entryCount <= 0) return 0;
  return (current + direction + entryCount) % entryCount;
}

export function tabBasename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}
