"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@apzhub/ui";

import {
  applyProjectsDocumentTitle,
  buildProjectsDocumentTitle,
} from "@/lib/projects/document-title";
import { isProjectsRoute } from "@/lib/projects/routes";

/**
 * Workspace route error UI — always exposes a non-empty document title (HD-H2-01).
 */
export default function WorkspaceSegmentError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  const pathname = usePathname() ?? "";
  const projects = isProjectsRoute(pathname);
  const title = projects ? "Something went wrong" : "Workspace error";

  useEffect(() => {
    if (projects) {
      applyProjectsDocumentTitle(title);
      return;
    }
    if (typeof document !== "undefined") {
      document.title = document.title.trim() ? document.title : "APZHUB";
    }
  }, [projects, title]);

  if (typeof document !== "undefined") {
    if (projects) {
      applyProjectsDocumentTitle(title);
    } else if (!document.title.trim()) {
      document.title = "APZHUB";
    }
  }

  return (
    <div
      className="flex flex-col gap-4 p-6"
      data-testid="workspace-route-error"
      role="alert"
    >
      <h1 className="text-xl font-semibold text-[var(--color-foreground)]">{title}</h1>
      <p className="sr-only">
        {projects ? buildProjectsDocumentTitle(title) : "APZHUB"}
      </p>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        {error.message?.trim()
          ? error.message
          : "This workspace surface could not be displayed."}
      </p>
      <div>
        <Button type="button" variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
