"use client";

import { usePathname } from "next/navigation";

import { resolveMetricsSection } from "@/lib/metrics/routes";

import { PlatformMetricsView } from "./platform-metrics-view";

export function MetricsWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveMetricsSection(pathname);
  return <PlatformMetricsView section={section} />;
}
