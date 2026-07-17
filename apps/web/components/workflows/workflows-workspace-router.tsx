"use client";

import { usePathname } from "next/navigation";

import { resolveWorkflowsSection } from "@/lib/workflows/routes";

import { PlatformWorkflowsView } from "./platform-workflows-view";

export function WorkflowsWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveWorkflowsSection(pathname);
  return <PlatformWorkflowsView section={section} />;
}
