import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_DISCOVERY_ROOTS,
  DEFAULT_MANIFEST_FILE_NAMES,
  resolveDiscoveryConfig,
  resolveDiscoveryRootPaths,
} from "./config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "../../../../");

describe("Discovery config", () => {
  it("provides default manifest filenames and roots", () => {
    expect(DEFAULT_MANIFEST_FILE_NAMES).toContain("component.yaml");
    expect(DEFAULT_DISCOVERY_ROOTS).toContain("packages/ui/src");
  });

  it("resolves absolute discovery root paths deterministically", () => {
    const resolved = resolveDiscoveryConfig({ workspaceRoot });
    const roots = resolveDiscoveryRootPaths(resolved);
    expect(roots).toContain(`${workspaceRoot}/packages/ui/src`.replace(/\\/g, "/"));
    expect(roots).toEqual([...roots].sort((a, b) => a.localeCompare(b)));
  });
});
