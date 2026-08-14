import { describe, expect, it, beforeEach } from "vitest";

import {
  attachRepositoriesToQualityProject,
  createQualityProject,
  getQualityProject,
  listQualityProjects,
  resetQualityProjectStoreForTests,
} from "./quality-project-store";
import { getScmTokenHealth } from "./quality-project-insight";
import { isQepPortfolioRoute, QEP_PORTFOLIO_ROUTES } from "./portfolio-routes";

describe("F14 quality-project-store", () => {
  beforeEach(() => {
    resetQualityProjectStoreForTests();
  });

  it("creates and lists projects; attaches repository ids", () => {
    const project = createQualityProject({
      tenantId: "tenant-1",
      name: "Lovebloom Quality",
      description: "Demo",
      createdBy: "user-1",
      now: () => new Date("2026-08-10T10:00:00.000Z"),
    });
    expect(project.id).toMatch(/^qproj-/);
    expect(project.status).toBe("active");
    expect(listQualityProjects({ tenantId: "tenant-1" })).toHaveLength(1);

    const updated = attachRepositoriesToQualityProject({
      tenantId: "tenant-1",
      projectId: project.id,
      repositoryIds: ["repo-1", "repo-1", "repo-2"],
      now: () => new Date("2026-08-10T10:05:00.000Z"),
    });
    expect(updated.repositoryIds).toEqual(["repo-1", "repo-2"]);
    expect(getQualityProject("tenant-1", project.id)?.repositoryIds).toEqual([
      "repo-1",
      "repo-2",
    ]);
  });

  it("rejects empty name", () => {
    expect(() =>
      createQualityProject({
        tenantId: "tenant-1",
        name: "  ",
        createdBy: "user-1",
      }),
    ).toThrow("quality_project.name_required");
  });
});

describe("F14 token health + routes", () => {
  it("reports configured when PAT present", () => {
    expect(getScmTokenHealth({ APZHUB_SCM_GITHUB_TOKEN: "ghp_test" }).configured).toBe(
      true,
    );
    expect(getScmTokenHealth({}).configured).toBe(false);
    expect(getScmTokenHealth({}).source).toBe("none");
  });

  it("builds portfolio deep links", () => {
    expect(QEP_PORTFOLIO_ROUTES.byProject("qproj-1")).toContain("projectId=qproj-1");
    expect(isQepPortfolioRoute("/workspace/qep/portfolio")).toBe(true);
  });

  it("source policy: portfolio handlers must not accept client PAT fields", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/api/v1/handlers/qep-portfolio.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/body\.token|body\.pat|githubToken|personalAccessToken/);
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
  });
});
