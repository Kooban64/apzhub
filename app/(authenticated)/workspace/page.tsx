import { Suspense } from "react";

import { WorkspaceHome } from "@/features/workspace/workspace-home";

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading workspace…</div>}>
      <WorkspaceHome />
    </Suspense>
  );
}
