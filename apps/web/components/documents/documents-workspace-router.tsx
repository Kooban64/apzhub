"use client";

import { usePathname } from "next/navigation";

import { resolveDocumentsSection } from "@/lib/documents/routes";

import { PlatformDocumentsView } from "./platform-documents-view";

export function DocumentsWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveDocumentsSection(pathname);
  return <PlatformDocumentsView section={section} />;
}
