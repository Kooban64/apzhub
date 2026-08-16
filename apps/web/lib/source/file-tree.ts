/** Shared Source file-path tree helpers (Phase-2 explorer). */

export type SourceFileTreeNode = {
  readonly name: string;
  readonly path: string;
  readonly children: readonly SourceFileTreeNode[];
};

type MutableNode = {
  name: string;
  path: string;
  children: Map<string, MutableNode>;
};

/**
 * Build a sorted directory tree from flat repo-relative paths.
 * Empty / absolute-looking segments are ignored.
 */
export function buildSourceFileTree(
  paths: readonly string[],
): readonly SourceFileTreeNode[] {
  const root: MutableNode = { name: "", path: "", children: new Map() };

  for (const raw of paths) {
    const normalized = raw.replace(/\\/g, "/").replace(/^\/+/, "").trim();
    if (!normalized || normalized.includes("..")) continue;
    const parts = normalized.split("/").filter(Boolean);
    let cursor = root;
    let walk = "";
    for (const part of parts) {
      walk = walk ? `${walk}/${part}` : part;
      let next = cursor.children.get(part);
      if (!next) {
        next = { name: part, path: walk, children: new Map() };
        cursor.children.set(part, next);
      }
      cursor = next;
    }
  }

  const freeze = (node: MutableNode): SourceFileTreeNode => ({
    name: node.name,
    path: node.path,
    children: [...node.children.values()]
      .sort((a, b) => {
        const aDir = a.children.size > 0 ? 0 : 1;
        const bDir = b.children.size > 0 ? 0 : 1;
        if (aDir !== bDir) return aDir - bDir;
        return a.name.localeCompare(b.name);
      })
      .map(freeze),
  });

  return freeze(root).children;
}

export function flattenSourceFileTree(
  nodes: readonly SourceFileTreeNode[],
  depth = 0,
): readonly { readonly node: SourceFileTreeNode; readonly depth: number }[] {
  const out: { node: SourceFileTreeNode; depth: number }[] = [];
  for (const node of nodes) {
    out.push({ node, depth });
    out.push(...flattenSourceFileTree(node.children, depth + 1));
  }
  return out;
}
