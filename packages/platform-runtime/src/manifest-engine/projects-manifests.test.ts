import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { parseCapabilityManifestYaml } from "./validate";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");

const projectsManifestPaths = [
  "services/projects/service.yaml",
  "services/projects/manifests/projects/module.yaml",
  "integrations/plane/integration.yaml",
  "events/projects/project-created/event.yaml",
  "events/projects/project-updated/event.yaml",
  "events/projects/task-created/event.yaml",
  "events/projects/task-updated/event.yaml",
  "events/projects/task-status-changed/event.yaml",
  "events/projects/task-assigned/event.yaml",
  "events/projects/sprint-created/event.yaml",
  "events/projects/sprint-completed/event.yaml",
];

describe("Manifest Engine — OSS-101-03 Projects manifests", () => {
  it.each(projectsManifestPaths)("validates %s", (relativePath) => {
    const manifestPath = path.join(repoRoot, relativePath);
    const yaml = readFileSync(manifestPath, "utf8");
    const result = parseCapabilityManifestYaml(yaml);
    expect(result.success, `${relativePath} should validate`).toBe(true);
  });

  it("registers canonical Projects permissions on the module manifest", () => {
    const yaml = readFileSync(
      path.join(repoRoot, "services/projects/manifests/projects/module.yaml"),
      "utf8",
    );
    const result = parseCapabilityManifestYaml(yaml);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const permissions =
      (result.data as { permissions?: { id: string }[] }).permissions ?? [];
    const permissionIds = permissions.map((entry) => entry.id);
    expect(permissionIds).toContain("projects.view");
    expect(permissionIds).toContain("projects.admin");
  });
});
