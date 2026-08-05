import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("APZ Support navigation registration", () => {
  it("registers native chrome including help/settings and APZ Support title", () => {
    const root = join(process.cwd(), "services/support/manifests");
    const parent = readFileSync(join(root, "support/module.yaml"), "utf8");
    const help = readFileSync(join(root, "support-help/module.yaml"), "utf8");
    const settings = readFileSync(join(root, "support-settings/module.yaml"), "utf8");

    expect(parent).toContain("workspace: support");
    expect(parent).toContain("route: /workspace/support");
    expect(parent).toContain("title: APZ Support");
    expect(parent).toContain("engineBranding: hidden");
    expect(help).toContain("/workspace/support/help");
    expect(settings).toContain("/workspace/support/settings");
  });

  it("mounts SupportWorkspaceRouter from WorkbenchPage", () => {
    const page = readFileSync(
      join(process.cwd(), "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(page).toContain("SupportWorkspaceRouter");
    expect(page).toContain("isSupportRoute");
  });
});
