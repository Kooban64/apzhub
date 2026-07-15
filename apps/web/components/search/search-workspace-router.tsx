"use client";

import { usePathname } from "next/navigation";

import { resolveSearchSection } from "@/lib/search/routes";

import { PlatformSearchView } from "./platform-search-view";

export function SearchWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveSearchSection(pathname);
  return <PlatformSearchView section={section} />;
}
