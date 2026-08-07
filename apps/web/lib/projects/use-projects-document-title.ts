"use client";

import { useEffect } from "react";

import { applyProjectsDocumentTitle } from "./document-title";

/**
 * Keeps `document.title` meaningful for APZ Projects surfaces (HD-H2-01).
 * Applies during render and on update so loading / error / crash paths
 * cannot leave a blank title after the shell has started painting.
 */
export function useProjectsDocumentTitle(pageTitle?: string | null): void {
  applyProjectsDocumentTitle(pageTitle);

  useEffect(() => {
    applyProjectsDocumentTitle(pageTitle);
  }, [pageTitle]);
}
