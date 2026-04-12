"use client";

import { useEffect } from "react";

import { WorkspaceRightPanelContent } from "@/features/workspace/workspace-right-panel-content";
import { setWorkspaceRightPanelSlot } from "@/lib/workspace/right-panel-slot";

export function WorkspaceRightPanelRegistrar() {
  useEffect(() => {
    setWorkspaceRightPanelSlot(<WorkspaceRightPanelContent />);
    return () => {
      setWorkspaceRightPanelSlot(null);
    };
  }, []);

  return null;
}
