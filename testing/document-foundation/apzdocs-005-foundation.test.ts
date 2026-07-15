/**
 * APZDOCS-005 foundation harness.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZDOCS-005 foundation", () => {
  it("ships Documents workbench view, router, manifests, and audit", () => {
    expect(
      existsSync(
        join(ROOT, "apps/web/components/documents/platform-documents-view.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(ROOT, "apps/web/components/documents/documents-workspace-router.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "packages/workbench-framework/manifests/platform-documents/module.yaml",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(join(ROOT, "scripts/apzdocs-005-document-workbench-audit.mjs")),
    ).toBe(true);
  });

  it("WorkbenchPage mounts DocumentsWorkspaceRouter", () => {
    const page = readFileSync(
      join(ROOT, "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(page).toContain("DocumentsWorkspaceRouter");
    expect(page).toContain("isDocumentsRoute");
  });

  it("parent manifest uses document.read and documents workspace", () => {
    const yaml = readFileSync(
      join(
        ROOT,
        "packages/workbench-framework/manifests/platform-documents/module.yaml",
      ),
      "utf8",
    );
    expect(yaml).toContain("workspace: documents");
    expect(yaml).toContain("document.read");
    expect(yaml).toContain("/workspace/documents");
  });
});
