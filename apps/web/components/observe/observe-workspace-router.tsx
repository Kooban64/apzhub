"use client";

import { usePathname } from "next/navigation";

import { resolveObserveSection } from "@/lib/observe/routes";

import { PlatformObservabilityView } from "./platform-observability-view";

export function ObserveWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveObserveSection(pathname);
  return <PlatformObservabilityView section={section} />;
}
