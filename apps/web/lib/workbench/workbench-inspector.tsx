"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WorkbenchInspectorSelection = {
  readonly id: string;
  readonly title: string;
  readonly content: ReactNode;
};

type WorkbenchInspectorContextValue = {
  readonly selection: WorkbenchInspectorSelection | null;
  readonly expandToken: number;
  readonly setSelection: (selection: WorkbenchInspectorSelection | null) => void;
  readonly clearSelection: () => void;
};

const WorkbenchInspectorContext = createContext<WorkbenchInspectorContextValue | null>(
  null,
);

export function WorkbenchInspectorProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [selection, setSelectionState] = useState<WorkbenchInspectorSelection | null>(
    null,
  );
  const [expandToken, setExpandToken] = useState(0);

  const setSelection = useCallback((next: WorkbenchInspectorSelection | null) => {
    setSelectionState(next);
    if (next) setExpandToken((n) => n + 1);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState(null);
  }, []);

  const value = useMemo(
    () => ({ selection, expandToken, setSelection, clearSelection }),
    [selection, expandToken, setSelection, clearSelection],
  );

  return (
    <WorkbenchInspectorContext.Provider value={value}>
      {children}
    </WorkbenchInspectorContext.Provider>
  );
}

export function useWorkbenchInspector(): WorkbenchInspectorContextValue {
  const ctx = useContext(WorkbenchInspectorContext);
  if (!ctx) {
    return {
      selection: null,
      expandToken: 0,
      setSelection: () => undefined,
      clearSelection: () => undefined,
    };
  }
  return ctx;
}
