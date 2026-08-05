import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("APZ Time navigation registration", () => {
  it("registers native sidebar including help/settings and admin ops gates", () => {
    const manifest = readFileSync(
      join(process.cwd(), "services/time/manifests/time/module.yaml"),
      "utf8",
    );
    expect(manifest).toContain("workspace: time");
    expect(manifest).toContain("route: /workspace/time");
    expect(manifest).toContain("title: APZ Time");
    expect(manifest).toContain("/workspace/time/help");
    expect(manifest).toContain("/workspace/time/settings");
    expect(manifest).toContain("label: Platform readiness");
    expect(manifest).toMatch(/time\.settings[\s\S]*permission:\s*time\.admin/);
    expect(manifest).toMatch(/time\.health[\s\S]*permission:\s*time\.admin/);
    expect(manifest).toMatch(/time\.diagnostics[\s\S]*permission:\s*time\.admin/);
  });

  it("mounts TimeWorkspaceRouter from WorkbenchPage", () => {
    const page = readFileSync(
      join(process.cwd(), "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(page).toContain("TimeWorkspaceRouter");
    expect(page).toContain("isTimeRoute");
  });
});
