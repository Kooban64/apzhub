import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Governance Companion navigation (N-03)", () => {
  it("mounts GovernanceWorkspaceRouter from WorkbenchPage before practice routers", () => {
    const page = readFileSync(join(__dirname, "../workbench-page.tsx"), "utf8");
    expect(page).toContain("GovernanceWorkspaceRouter");
    expect(page).toContain("isLawGovernanceRoute");
    const governanceIdx = page.indexOf("isGovernanceRoute");
    const clientIdx = page.indexOf("isClientRoute ?");
    expect(governanceIdx).toBeGreaterThan(-1);
    expect(clientIdx).toBeGreaterThan(governanceIdx);
  });

  it("points Activity Bar and default view at governance home", () => {
    const root = readFileSync(
      join(
        __dirname,
        "../../../../services/legal-platform/manifests/law-root/module.yaml",
      ),
      "utf8",
    );
    expect(root).toContain("route: /workspace/law/home");
    expect(root).toContain("permission: law.view");
    expect(root).not.toContain("route: /workspace/law/dashboard");
  });

  it("keeps firm overview secondary and law.admin gated", () => {
    const dashboard = readFileSync(
      join(
        __dirname,
        "../../../../services/legal-platform/manifests/law-dashboard/module.yaml",
      ),
      "utf8",
    );
    expect(dashboard).toContain("permission: law.admin");
    expect(dashboard).toContain("Firm overview");
    expect(dashboard).toContain("group: APZ Law Practice");
  });
});
