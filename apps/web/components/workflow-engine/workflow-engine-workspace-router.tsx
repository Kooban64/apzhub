"use client";

import { usePathname } from "next/navigation";

import { resolveWorkflowEngineSection } from "@/lib/workflows/routes";

import { PlatformWorkflowEngineView } from "./platform-workflow-engine-view";

export function WorkflowEngineWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveWorkflowEngineSection(pathname);
  return <PlatformWorkflowEngineView section={section} />;
}
