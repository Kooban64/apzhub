"use client";

import { usePathname } from "next/navigation";

import { resolveIdentitySection } from "@/lib/identity/routes";

import { PlatformIdentityView } from "./platform-identity-view";

export function IdentityWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveIdentitySection(pathname);
  return <PlatformIdentityView section={section} />;
}
