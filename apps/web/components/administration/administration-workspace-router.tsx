"use client";

import { usePathname } from "next/navigation";

import { resolveAdministrationSection } from "@/lib/administration/routes";

import { PlatformAdministrationView } from "./platform-administration-view";

export function AdministrationWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveAdministrationSection(pathname);
  return <PlatformAdministrationView section={section} />;
}
