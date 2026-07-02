import { readdirSync, statSync } from "node:fs";
import path from "node:path";

import {
  MANIFEST_FILENAME_KIND_MAP,
  type ManifestFileName,
  type ResolvedDiscoveryConfig,
} from "./config";
import type { DiscoveredManifestRef, DiscoveryDiagnostic } from "./types";

function kindHintForFileName(fileName: string): string {
  if (fileName in MANIFEST_FILENAME_KIND_MAP) {
    return MANIFEST_FILENAME_KIND_MAP[fileName as ManifestFileName];
  }
  return "unknown";
}

function scanDirectory(
  directoryPath: string,
  workspaceRoot: string,
  config: ResolvedDiscoveryConfig,
  manifests: DiscoveredManifestRef[],
  diagnostics: DiscoveryDiagnostic[],
): void {
  let entries;
  try {
    entries = readdirSync(directoryPath, { withFileTypes: true });
  } catch (error) {
    diagnostics.push({
      code: "SCAN_ERROR",
      message: error instanceof Error ? error.message : "Directory scan failed",
      path: directoryPath,
    });
    return;
  }

  const sortedEntries = [...entries].sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of sortedEntries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      if (config.ignoreDirNames.has(entry.name)) {
        continue;
      }
      scanDirectory(entryPath, workspaceRoot, config, manifests, diagnostics);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!config.manifestFileNames.has(entry.name)) {
      continue;
    }

    manifests.push({
      absolutePath: entryPath,
      relativePath: path.relative(workspaceRoot, entryPath).replace(/\\/g, "/"),
      fileName: entry.name,
      kindHint: kindHintForFileName(entry.name),
    });
  }
}

export function scanForManifestFiles(
  config: ResolvedDiscoveryConfig,
  rootPaths: readonly string[],
): { manifests: DiscoveredManifestRef[]; diagnostics: DiscoveryDiagnostic[] } {
  const manifests: DiscoveredManifestRef[] = [];
  const diagnostics: DiscoveryDiagnostic[] = [];

  for (const rootPath of rootPaths) {
    let stat;
    try {
      stat = statSync(rootPath);
    } catch {
      diagnostics.push({
        code: "ROOT_NOT_FOUND",
        message: `Discovery root does not exist: ${rootPath}`,
        path: rootPath,
      });
      continue;
    }

    if (!stat.isDirectory()) {
      diagnostics.push({
        code: "SCAN_ERROR",
        message: `Discovery root is not a directory: ${rootPath}`,
        path: rootPath,
      });
      continue;
    }

    scanDirectory(rootPath, config.workspaceRoot, config, manifests, diagnostics);
  }

  manifests.sort((a, b) => a.absolutePath.localeCompare(b.absolutePath));

  return { manifests, diagnostics };
}
