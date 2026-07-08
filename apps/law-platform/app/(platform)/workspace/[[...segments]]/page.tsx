import { Suspense } from "react";

import { WorkbenchPage } from "@/components/workbench-page";

export default function WorkspacePage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchPage />
    </Suspense>
  );
}
