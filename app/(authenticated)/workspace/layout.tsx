import type { ReactNode } from "react";

import { WorkspaceRightPanelRegistrar } from "@/features/workspace/workspace-right-panel-registrar";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <WorkspaceRightPanelRegistrar />
      {children}
    </>
  );
}
