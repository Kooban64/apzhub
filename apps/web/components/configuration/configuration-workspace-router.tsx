"use client";

import { usePathname } from "next/navigation";

import { resolveConfigurationSection } from "@/lib/configuration/routes";

import { PlatformConfigurationView } from "./platform-configuration-view";

export function ConfigurationWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveConfigurationSection(pathname);
  return <PlatformConfigurationView section={section} />;
}
