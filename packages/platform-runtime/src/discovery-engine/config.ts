/** Supported manifest filenames mapped to capability kind hints. */
export const MANIFEST_FILENAME_KIND_MAP = {
  "component.yaml": "component",
  "module.yaml": "module",
  "service.yaml": "service",
  "integration.yaml": "integration",
  "event.yaml": "event",
  "theme.yaml": "theme",
  "worker.yaml": "worker",
} as const;

export type ManifestFileName = keyof typeof MANIFEST_FILENAME_KIND_MAP;

export const DEFAULT_MANIFEST_FILE_NAMES = Object.keys(
  MANIFEST_FILENAME_KIND_MAP,
) as ManifestFileName[];

export const DEFAULT_IGNORE_DIR_NAMES = [
  "node_modules",
  ".next",
  "dist",
  "storybook-static",
  ".git",
  "coverage",
] as const;

/** Monorepo-relative discovery roots per platform-registry architecture. */
export const DEFAULT_DISCOVERY_ROOTS = [
  "packages/ui/src",
  "packages/theme",
  "packages/workbench-framework/manifests",
  "services",
  "integrations",
  "events",
] as const;

export interface DiscoveryConfig {
  /** Absolute path to repository / workspace root. */
  readonly workspaceRoot: string;
  /** Paths relative to `workspaceRoot` to scan recursively. */
  readonly roots?: readonly string[];
  readonly manifestFileNames?: readonly string[];
  readonly ignoreDirNames?: readonly string[];
}

export interface ResolvedDiscoveryConfig {
  readonly workspaceRoot: string;
  readonly roots: readonly string[];
  readonly manifestFileNames: ReadonlySet<string>;
  readonly ignoreDirNames: ReadonlySet<string>;
}

export function resolveDiscoveryConfig(
  config: DiscoveryConfig,
): ResolvedDiscoveryConfig {
  return {
    workspaceRoot: config.workspaceRoot,
    roots: config.roots ?? [...DEFAULT_DISCOVERY_ROOTS],
    manifestFileNames: new Set(config.manifestFileNames ?? DEFAULT_MANIFEST_FILE_NAMES),
    ignoreDirNames: new Set(config.ignoreDirNames ?? DEFAULT_IGNORE_DIR_NAMES),
  };
}

export function resolveDiscoveryRootPaths(config: ResolvedDiscoveryConfig): string[] {
  return [...config.roots]
    .map((root) => {
      const trimmed = root.replace(/^\.\//, "");
      return `${config.workspaceRoot}/${trimmed}`.replace(/\/+/g, "/");
    })
    .sort((a, b) => a.localeCompare(b));
}
