"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  applyProjectsDocumentTitle,
  buildProjectsDocumentTitle,
} from "@/lib/projects/document-title";
import { isProjectsRoute } from "@/lib/projects/routes";

/**
 * Suspense fallback for the workspace catch-all. Must never leave an empty
 * document title (HD-H2-01) when Projects is loading.
 */
export function WorkspaceSuspenseFallback() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (isProjectsRoute(pathname)) {
      applyProjectsDocumentTitle("Loading");
      return;
    }
    if (typeof document !== "undefined" && !document.title.trim()) {
      document.title = "APZHUB";
    }
  }, [pathname]);

  if (typeof document !== "undefined") {
    if (isProjectsRoute(pathname)) {
      applyProjectsDocumentTitle("Loading");
    } else if (!document.title.trim()) {
      document.title = "APZHUB";
    }
  }

  const label = isProjectsRoute(pathname)
    ? "Loading APZ Projects…"
    : "Loading workspace…";

  return (
    <div
      className="flex flex-col gap-2 p-6"
      data-testid="workspace-suspense-fallback"
      role="status"
      aria-live="polite"
    >
      <p className="sr-only">
        {isProjectsRoute(pathname) ? buildProjectsDocumentTitle("Loading") : "APZHUB"}
      </p>
      <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
    </div>
  );
}
