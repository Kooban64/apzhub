"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  emptyAdminInspectorSelection,
  type AdminInspectorSelection,
} from "@/lib/admin/admin-inspector-selection";

type AdminInspectorContextValue = {
  selection: AdminInspectorSelection;
  setSelection: (next: AdminInspectorSelection) => void;
  clearSelection: () => void;
};

const AdminInspectorContext = createContext<AdminInspectorContextValue | null>(null);

const initialSelection = emptyAdminInspectorSelection();

export function AdminInspectorProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<AdminInspectorSelection>(initialSelection);

  const setSelection = useCallback((next: AdminInspectorSelection) => {
    setSelectionState(next);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState(emptyAdminInspectorSelection());
  }, []);

  const value = useMemo(
    () => ({ selection, setSelection, clearSelection }),
    [selection, setSelection, clearSelection],
  );

  return <AdminInspectorContext.Provider value={value}>{children}</AdminInspectorContext.Provider>;
}

export function useAdminInspector(): AdminInspectorContextValue {
  const ctx = useContext(AdminInspectorContext);
  if (!ctx) {
    throw new Error("useAdminInspector must be used within AdminInspectorProvider");
  }
  return ctx;
}

export type { AdminInspectorSelection } from "@/lib/admin/admin-inspector-selection";
