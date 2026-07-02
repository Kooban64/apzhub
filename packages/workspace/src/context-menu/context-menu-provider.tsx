"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

export interface ContextMenuAnchor {
  readonly x: number;
  readonly y: number;
}

export interface ContextMenuProviderState {
  readonly open: boolean;
  readonly anchor: ContextMenuAnchor | null;
}

export interface ContextMenuProviderValue {
  readonly state: ContextMenuProviderState;
  readonly openFromMouseEvent: (event: MouseEvent) => void;
  readonly close: () => void;
}

const ContextMenuContext = createContext<ContextMenuProviderValue | null>(null);

export interface ContextMenuProviderProps {
  readonly children: ReactNode;
}

/** Manages context menu open state and anchor position. */
export function ContextMenuProvider({ children }: ContextMenuProviderProps) {
  const [state, setState] = useState<ContextMenuProviderState>({
    open: false,
    anchor: null,
  });

  const close = useCallback(() => {
    setState({ open: false, anchor: null });
  }, []);

  const openFromMouseEvent = useCallback((event: MouseEvent) => {
    event.preventDefault();
    setState({
      open: true,
      anchor: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const value = useMemo(
    () => ({
      state,
      openFromMouseEvent,
      close,
    }),
    [close, openFromMouseEvent, state],
  );

  return (
    <ContextMenuContext.Provider value={value}>{children}</ContextMenuContext.Provider>
  );
}

export function useContextMenuProvider(): ContextMenuProviderValue {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("useContextMenu must be used within ContextMenuProvider");
  }

  return context;
}
