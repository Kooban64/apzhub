"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { WorkbenchActionExecutor } from "../api/workbench-action-executor";
import type { WorkbenchAPI } from "../api/workbench-api";
import type { WorkbenchRequest, WorkbenchRequestResult } from "../interfaces/requests";
import { hydrateNavigationContributionsFromRegistry } from "../hydration/registry-hydration";
import type { ActivityBarPresentationItem } from "../presentation/activity-bar-presentation-adapter";
import { defaultActivityBarPresentationAdapter } from "../presentation/activity-bar-presentation-adapter";
import type { SidebarPresentationItem } from "../presentation/sidebar-presentation-adapter";
import { defaultSidebarPresentationAdapter } from "../presentation/sidebar-presentation-adapter";
import type { NavigationPresentationAdapter } from "../presentation/navigation-presentation-adapter";
import type { WorkbenchRequestBus } from "../interfaces/dependencies";
import type { WorkbenchPermissionAdapter } from "../interfaces/permission-adapter";
import type { NavigationModel } from "../navigation/platform-navigation-model";
import type {
  SessionDiagnostics,
  ViewState,
  WorkbenchState,
} from "../interfaces/types";
import type { AuthSessionPermissionInput } from "../permission/auth-permission-adapter";
import { createWorkbenchPermissionAdapter } from "../permission/create-permission-adapter";
import type { WorkbenchRegistryDto } from "../server";
import { createLocalStorageSessionStore } from "../session/local-storage-session-store";
import { createMemorySessionStore } from "../session/memory-session-store";
import type { SessionStore } from "../session/session-store";
import {
  createWorkbenchRequestBus,
  type WorkbenchRequestBusImpl,
} from "../request-bus/request-bus";

interface WorkbenchRuntimeContext {
  readonly bus: WorkbenchRequestBusImpl;
  readonly api: WorkbenchAPI;
}

const WorkbenchContext = createContext<WorkbenchRuntimeContext | null>(null);

export interface WorkbenchProviderProps {
  readonly initialRegistry?: WorkbenchRegistryDto;
  readonly userId?: string;
  readonly authPermissionContext?: AuthSessionPermissionInput | null;
  readonly permissionMode?: "allow-all" | "auth" | "scaffold";
  readonly sessionStore?: SessionStore;
  readonly sessionStorageBackend?: SessionDiagnostics["storageBackend"];
  /** AF-020 — wire Action Framework executor after request bus is available. */
  readonly resolveActionExecutor?: (context: {
    readonly publish: (request: WorkbenchRequest) => WorkbenchRequestResult;
    readonly permissionAdapter: WorkbenchPermissionAdapter;
  }) => WorkbenchActionExecutor | undefined;
  readonly children: ReactNode;
}

export function WorkbenchProvider({
  initialRegistry,
  userId,
  authPermissionContext,
  permissionMode,
  sessionStore,
  sessionStorageBackend = "localStorage",
  resolveActionExecutor,
  children,
}: WorkbenchProviderProps) {
  const [runtime, setRuntime] = useState<WorkbenchRuntimeContext | null>(null);

  useEffect(() => {
    const store = sessionStore ?? createLocalStorageSessionStore();
    const permissionAdapter = createWorkbenchPermissionAdapter({
      mode: permissionMode,
      authContext:
        authPermissionContext ??
        (userId ? { userId, roles: [], permissions: [] } : null),
      nodeEnv: process.env.NODE_ENV,
      allowDevRegistration: process.env.NEXT_PUBLIC_ALLOW_DEV_REGISTRATION === "true",
    });

    const busRef: { current: WorkbenchRequestBusImpl | null } = { current: null };
    const actionExecutor = resolveActionExecutor?.({
      publish: (request) => busRef.current!.publish(request),
      permissionAdapter,
    });

    const bus = createWorkbenchRequestBus({
      actionExecutor,
      dependencies: {
        permissionAdapter,
        sessionStore: store,
        sessionStorageBackend: sessionStore ? sessionStorageBackend : "localStorage",
      },
    });
    busRef.current = bus;
    const instance = bus;

    if (initialRegistry) {
      const { contributions, viewDescriptors } =
        hydrateNavigationContributionsFromRegistry(initialRegistry);
      instance.loadNavigationContributions(contributions);
      instance.loadViewDescriptors(viewDescriptors);
    }

    let active = true;

    const bootstrap = async () => {
      if (userId) {
        const result = await instance.restoreSession(userId);
        if (!active) {
          return;
        }

        if (!result.restored) {
          instance.activateDefaultViewForActiveWorkspace();
        }

        instance.enableSessionPersistence(userId);
      } else if (initialRegistry) {
        instance.activateDefaultViewForActiveWorkspace();
      }

      if (active) {
        setRuntime({
          bus: instance,
          api: instance.getWorkbenchAPI(),
        });
      }
    };

    void bootstrap();

    return () => {
      active = false;
      void instance.flushPendingPersist().finally(() => {
        instance.disableSessionPersistence();
      });
    };
  }, [
    authPermissionContext,
    initialRegistry,
    permissionMode,
    sessionStore,
    sessionStorageBackend,
    resolveActionExecutor,
    userId,
  ]);

  if (!runtime) {
    return null;
  }

  return (
    <WorkbenchContext.Provider value={runtime}>{children}</WorkbenchContext.Provider>
  );
}

function useWorkbenchRuntime(): WorkbenchRuntimeContext {
  const runtime = useContext(WorkbenchContext);

  if (!runtime) {
    throw new Error("useWorkbenchAPI must be used within WorkbenchProvider");
  }

  return runtime;
}

/** Public Workbench API for capabilities and shell integration. */
export function useWorkbenchAPI(): WorkbenchAPI {
  return useWorkbenchRuntime().api;
}

/** Internal shell bus — prefer useWorkbenchAPI() for new code. */
export function useWorkbenchRequestBus(): WorkbenchRequestBus {
  return useWorkbenchRuntime().bus;
}

export function useNavigationModel(): NavigationModel {
  const bus = useWorkbenchRequestBus();
  const [model, setModel] = useState(() => bus.getNavigationModel());

  useEffect(() => bus.subscribe(() => setModel(bus.getNavigationModel())), [bus]);

  return model;
}

export function useViewState(): ViewState {
  const bus = useWorkbenchRequestBus();
  const [viewState, setViewState] = useState(() => bus.getViewState());

  useEffect(() => bus.subscribe(() => setViewState(bus.getViewState())), [bus]);

  return viewState;
}

export function useSessionDiagnostics(): SessionDiagnostics {
  const api = useWorkbenchAPI();
  const [diagnostics, setDiagnostics] = useState(() => api.getDiagnostics().session);

  useEffect(
    () => api.subscribe(() => setDiagnostics(api.getDiagnostics().session)),
    [api],
  );

  return diagnostics;
}

export function useWorkbenchState(): WorkbenchState {
  const api = useWorkbenchAPI();
  const [state, setState] = useState(() => api.getState());

  useEffect(() => api.subscribe(setState), [api]);

  return state;
}

export function useContextDiagnostics() {
  const api = useWorkbenchAPI();
  const [diagnostics, setDiagnostics] = useState(() => api.getDiagnostics().context);

  useEffect(
    () => api.subscribe(() => setDiagnostics(api.getDiagnostics().context)),
    [api],
  );

  return diagnostics;
}

export function useSelectionDiagnostics() {
  const api = useWorkbenchAPI();
  const [diagnostics, setDiagnostics] = useState(() => api.getDiagnostics().selection);

  useEffect(
    () => api.subscribe(() => setDiagnostics(api.getDiagnostics().selection)),
    [api],
  );

  return diagnostics;
}

export function usePermissionDiagnostics() {
  const api = useWorkbenchAPI();
  const [diagnostics, setDiagnostics] = useState(() => api.getDiagnostics().permission);

  useEffect(
    () => api.subscribe(() => setDiagnostics(api.getDiagnostics().permission)),
    [api],
  );

  return diagnostics;
}

export function useActivityBarPresentation(
  adapter: NavigationPresentationAdapter<
    "activity-bar",
    readonly ActivityBarPresentationItem[]
  > = defaultActivityBarPresentationAdapter,
): readonly ActivityBarPresentationItem[] {
  const model = useNavigationModel();

  return useMemo(() => adapter.adapt(model), [adapter, model]);
}

export function useSidebarPresentation(
  adapter: NavigationPresentationAdapter<
    "sidebar",
    readonly SidebarPresentationItem[]
  > = defaultSidebarPresentationAdapter,
): readonly (SidebarPresentationItem & { active: boolean })[] {
  const model = useNavigationModel();
  const viewState = useViewState();
  const activeRoute = viewState.openViews.find(
    (view) => view.viewId === viewState.focusedViewId,
  )?.route;

  return useMemo(() => {
    const items = adapter.adapt(model);
    return items.map((item) => ({
      ...item,
      active: Boolean(activeRoute && item.route === activeRoute),
    }));
  }, [adapter, model, activeRoute]);
}

export function useWorkbenchNavigationActions() {
  const bus = useWorkbenchRequestBus();
  const api = useWorkbenchAPI();

  return useMemo(
    () => ({
      selectActivityBarItem: (navId: string) =>
        bus.selectActivityBarNavigationItem(navId),
      selectSidebarItem: (navId: string) => bus.selectSidebarNavigationItem(navId),
      activateViewForRoute: (route: string) => bus.activateViewForRoute(route),
      getNavigationDiagnostics: () => api.getDiagnostics().navigation,
      getViewDiagnostics: () => api.getDiagnostics().view,
      getSessionDiagnostics: () => api.getDiagnostics().session,
      getContextDiagnostics: () => api.getDiagnostics().context,
      getSelectionDiagnostics: () => api.getDiagnostics().selection,
      getPermissionDiagnostics: () => api.getDiagnostics().permission,
      setContext: (contextKey: string, payload?: Record<string, unknown>) =>
        api.context.set(contextKey, { payload }),
      setSelection: (
        items: WorkbenchState["selection"]["items"],
        options?: { mode?: "clear" | "single" | "multi"; viewId?: string },
      ) => api.selection.set(items, options),
      clearSession: (targetUserId: string) => bus.clearSession(targetUserId),
    }),
    [api, bus],
  );
}

export { createMemorySessionStore };
