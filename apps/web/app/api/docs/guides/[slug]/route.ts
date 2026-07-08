import fs from "node:fs";
import path from "node:path";

import { notFound } from "next/navigation";

export const runtime = "nodejs";

const GUIDE_FILES: Record<string, string> = {
  "getting-started": "legal-api-getting-started.md",
  onboarding: "legal-api-onboarding.md",
  authentication: "legal-api-authentication.md",
  "tenant-resolution": "legal-api-tenant-resolution.md",
  permissions: "legal-api-permissions.md",
  filtering: "legal-api-filtering.md",
  pagination: "legal-api-pagination.md",
  "optimistic-concurrency": "legal-api-optimistic-concurrency.md",
  "error-handling": "legal-api-error-handling.md",
  versioning: "legal-api-versioning.md",
  examples: "../specs/LAW-API-Examples.md",
  troubleshooting: "legal-api-troubleshooting.md",
  changelog: "legal-api-changelog.md",
};

function resolveGuidePath(relativePath: string): string {
  const isSpecsPath = relativePath.startsWith("../specs/");
  const specsFile = isSpecsPath ? relativePath.replace("../specs/", "") : null;

  const candidates = isSpecsPath
    ? [
        path.resolve(process.cwd(), "docs/specs", specsFile!),
        path.resolve(process.cwd(), "../../docs/specs", specsFile!),
      ]
    : [
        path.resolve(process.cwd(), "docs/developer", relativePath),
        path.resolve(process.cwd(), "../../docs/developer", relativePath),
      ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Guide not found: ${relativePath}`);
}

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug } = await context.params;
  const relative = GUIDE_FILES[slug];

  if (!relative) {
    notFound();
  }

  const filePath = resolveGuidePath(relative);
  const markdown = fs.readFileSync(filePath, "utf8");

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
