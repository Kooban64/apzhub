/**
 * Flagship F2 — pure inference helpers for Quality Graph edges.
 * Never executes tests; never auto-certifies.
 */

export type InferredPlatformRef = {
  readonly kind: "requirement" | "defect" | "execution_plan" | "evidence";
  readonly platformRef: string;
  readonly reason: string;
};

export type SuitePathMatchInput = {
  readonly suiteId: string;
  readonly name: string;
  readonly tags: readonly string[];
  readonly component?: string;
  readonly application?: string;
  readonly folderPath?: string;
  readonly customMetadata?: Readonly<Record<string, unknown>>;
};

export type SuitePathMatch = {
  readonly suiteId: string;
  readonly name: string;
  readonly matchedPaths: readonly string[];
  readonly matchReasons: readonly string[];
};

const REQUIREMENT_REF =
  /\b(?:REQ|req|requirement)[-_:/]?([A-Za-z0-9][A-Za-z0-9._-]{1,64})\b/g;
const DEFECT_REF =
  /\b(?:DEF|def|defect|bug)[-_:/]?([A-Za-z0-9][A-Za-z0-9._-]{1,64})\b/g;
const PLATFORM_ID_REF = /\b((?:req|def|eplan|ev)-[A-Za-z0-9][A-Za-z0-9._-]{2,80})\b/gi;

/** Extract requirement / defect platform refs from commit/PR titles. */
export function inferPlatformRefsFromText(
  text: string,
): readonly InferredPlatformRef[] {
  const found = new Map<string, InferredPlatformRef>();
  const push = (ref: InferredPlatformRef) => {
    const key = `${ref.kind}:${ref.platformRef}`;
    if (!found.has(key)) found.set(key, ref);
  };

  for (const match of text.matchAll(REQUIREMENT_REF)) {
    const id = match[1];
    if (!id) continue;
    const platformRef = (
      id.toLowerCase().startsWith("req-") ? id : `req-${id}`
    ).toLowerCase();
    push({
      kind: "requirement",
      platformRef,
      reason: `Commit/PR text references requirement ${platformRef}`,
    });
  }
  for (const match of text.matchAll(DEFECT_REF)) {
    const id = match[1];
    if (!id) continue;
    const platformRef = (
      id.toLowerCase().startsWith("def-") ? id : `def-${id}`
    ).toLowerCase();
    push({
      kind: "defect",
      platformRef,
      reason: `Commit/PR text references defect ${platformRef}`,
    });
  }
  for (const match of text.matchAll(PLATFORM_ID_REF)) {
    const id = match[1];
    if (!id) continue;
    const lower = id.toLowerCase();
    if (lower.startsWith("req-")) {
      push({
        kind: "requirement",
        platformRef: lower,
        reason: `Commit/PR text references ${lower}`,
      });
    } else if (lower.startsWith("def-")) {
      push({
        kind: "defect",
        platformRef: lower,
        reason: `Commit/PR text references ${lower}`,
      });
    } else if (lower.startsWith("eplan-")) {
      push({
        kind: "execution_plan",
        platformRef: lower,
        reason: `Commit/PR text references ${lower}`,
      });
    } else if (lower.startsWith("ev-")) {
      push({
        kind: "evidence",
        platformRef: lower,
        reason: `Commit/PR text references ${lower}`,
      });
    }
  }

  return [...found.values()];
}

function pathPrefixesFromSuite(suite: SuitePathMatchInput): string[] {
  const prefixes: string[] = [];
  for (const tag of suite.tags) {
    if (tag.startsWith("path:")) {
      prefixes.push(tag.slice("path:".length).replace(/^\/+/, ""));
    }
  }
  const meta = suite.customMetadata ?? {};
  const metaPrefixes = meta.pathPrefixes;
  if (Array.isArray(metaPrefixes)) {
    for (const prefix of metaPrefixes) {
      if (typeof prefix === "string" && prefix.trim()) {
        prefixes.push(prefix.trim().replace(/^\/+/, ""));
      }
    }
  }
  if (typeof meta.pathPrefix === "string" && meta.pathPrefix.trim()) {
    prefixes.push(meta.pathPrefix.trim().replace(/^\/+/, ""));
  }
  if (suite.component?.trim()) {
    prefixes.push(suite.component.trim().replace(/^\/+/, ""));
  }
  if (suite.folderPath && suite.folderPath !== "/") {
    prefixes.push(suite.folderPath.replace(/^\/+/, ""));
  }
  return [...new Set(prefixes.filter((p) => p.length > 0))];
}

/** Match changed files to suites via path: tags, pathPrefixes metadata, or component. */
export function matchSuitesToChangedPaths(
  suites: readonly SuitePathMatchInput[],
  changedPaths: readonly string[],
): readonly SuitePathMatch[] {
  if (changedPaths.length === 0) return [];
  const normalizedPaths = changedPaths.map((p) => p.replace(/^\/+/, ""));
  const matches: SuitePathMatch[] = [];

  for (const suite of suites) {
    const prefixes = pathPrefixesFromSuite(suite);
    if (prefixes.length === 0) continue;
    const matchedPaths: string[] = [];
    const reasons: string[] = [];
    for (const path of normalizedPaths) {
      for (const prefix of prefixes) {
        if (path === prefix || path.startsWith(`${prefix}/`)) {
          matchedPaths.push(path);
          reasons.push(`path ${path} under ${prefix}`);
          break;
        }
      }
    }
    if (matchedPaths.length > 0) {
      matches.push({
        suiteId: suite.suiteId,
        name: suite.name,
        matchedPaths: [...new Set(matchedPaths)],
        matchReasons: [...new Set(reasons)],
      });
    }
  }

  return matches;
}

/** Top-level package/path segments for impact node grouping. */
export function impactedPathRoots(changedPaths: readonly string[]): readonly string[] {
  const roots = new Set<string>();
  for (const path of changedPaths) {
    const parts = path.replace(/^\/+/, "").split("/").filter(Boolean);
    if (parts.length === 0) continue;
    if (parts[0] === "packages" || parts[0] === "apps" || parts[0] === "modules") {
      roots.add(parts.slice(0, Math.min(2, parts.length)).join("/"));
    } else {
      roots.add(parts[0]!);
    }
  }
  return [...roots];
}
