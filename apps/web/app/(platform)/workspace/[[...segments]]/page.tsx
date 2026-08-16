import { Suspense } from "react";

import { WorkbenchPage } from "@/components/workbench-page";
import { WorkspaceSettingsAliasRedirect } from "@/components/workspace-settings-alias-redirect";
import { WorkspaceSuspenseFallback } from "@/components/workspace-suspense-fallback";

export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspaceSuspenseFallback />}>
      <WorkspaceSettingsAliasRedirect />
      <WorkbenchPage />
    </Suspense>
  );
}
