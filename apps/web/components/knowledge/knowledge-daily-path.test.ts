/**
 * KNW-P1-03 / APZKNW-103 — Memory Companion daily path (repository smoke).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  knowledgeHomePath,
  knowledgeLessonsPath,
  knowledgeLibraryPath,
  knowledgeMemoryPath,
  resolveKnowledgeRoute,
} from "@/lib/knowledge/routes";

const root = join(process.cwd());

describe("knowledge daily path (KNW-P1-03)", () => {
  it("routes Home → Memory → Lessons → Library", () => {
    expect(resolveKnowledgeRoute(knowledgeHomePath())).toEqual({ kind: "home" });
    expect(resolveKnowledgeRoute(knowledgeMemoryPath())).toEqual({ kind: "memory" });
    expect(resolveKnowledgeRoute(knowledgeLessonsPath())).toEqual({ kind: "lessons" });
    expect(resolveKnowledgeRoute(knowledgeLibraryPath())).toEqual({ kind: "library" });
  });

  it("mounts companion views and admin-gates diagnostics", () => {
    const router = readFileSync(
      join(root, "apps/web/components/knowledge/knowledge-workspace-router.tsx"),
      "utf8",
    );
    expect(router).toContain("KnowledgeHomeView");
    expect(router).toContain('case "memory"');
    expect(router).toContain('case "lessons"');
    expect(router).toContain("canAdminKnowledge");
    expect(router).toContain('route.kind === "diagnostics"');
  });
});
