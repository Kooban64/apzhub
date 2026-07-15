"use client";

import { usePathname } from "next/navigation";

import { resolveReportingSection } from "@/lib/reporting/routes";

import { PlatformReportingView } from "./platform-reporting-view";

export function ReportingWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveReportingSection(pathname);
  return <PlatformReportingView section={section} />;
}
