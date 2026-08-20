"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createApplicationContextResolver,
  type ApplicationContextResolver,
} from "@apzhub/qep-applications/domain";

import { resolveSelectedApplicationId } from "./qep-application-selection";

const STORAGE_KEY = "apzqep.selectedApplicationId";

export type QepApplicationOption = {
  readonly id: string;
  readonly name: string;
  readonly projectRefs?: readonly string[];
};

type QepApplicationContextValue = {
  readonly applications: readonly QepApplicationOption[];
  readonly selectedId: string | null;
  readonly selected: QepApplicationOption | null;
  readonly resolver: ApplicationContextResolver;
  readonly setApplications: (apps: readonly QepApplicationOption[]) => void;
  readonly selectApplication: (id: string | null) => void;
  readonly displayContext: (projectRef: string | undefined) => string;
};

const QepApplicationContext = createContext<QepApplicationContextValue | null>(null);

function readStoredId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY)?.trim();
    return value ? value : null;
  } catch {
    return null;
  }
}

function writeStoredId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) window.sessionStorage.setItem(STORAGE_KEY, id);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

function buildResolver(
  applications: readonly QepApplicationOption[],
): ApplicationContextResolver {
  return createApplicationContextResolver({
    applications,
    associations: applications.flatMap((app) =>
      (app.projectRefs ?? [app.id]).map((projectRef) => ({
        projectRef,
        applicationId: app.id,
      })),
    ),
  });
}

export function QepApplicationProvider({ children }: { readonly children: ReactNode }) {
  const [applications, setApplicationsState] = useState<
    readonly QepApplicationOption[]
  >([]);
  const [selectedId, setSelectedId] = useState<string | null>(readStoredId);

  const setApplications = useCallback((apps: readonly QepApplicationOption[]) => {
    setApplicationsState(apps);
    setSelectedId((current) => {
      const next = resolveSelectedApplicationId({
        applications: apps,
        currentId: current,
        storedId: readStoredId(),
      });
      writeStoredId(next);
      return next;
    });
  }, []);

  const selectApplication = useCallback((id: string | null) => {
    writeStoredId(id);
    setSelectedId(id);
  }, []);

  const selected = useMemo(
    () => applications.find((a) => a.id === selectedId) ?? null,
    [applications, selectedId],
  );

  const resolver = useMemo(() => buildResolver(applications), [applications]);

  const displayContext = useCallback(
    (projectRef: string | undefined) => resolver.displayContext(projectRef),
    [resolver],
  );

  const value = useMemo(
    () => ({
      applications,
      selectedId,
      selected,
      resolver,
      setApplications,
      selectApplication,
      displayContext,
    }),
    [
      applications,
      selectedId,
      selected,
      resolver,
      setApplications,
      selectApplication,
      displayContext,
    ],
  );

  return (
    <QepApplicationContext.Provider value={value}>
      {children}
    </QepApplicationContext.Provider>
  );
}

export function useQepApplicationContext(): QepApplicationContextValue {
  const ctx = useContext(QepApplicationContext);
  if (!ctx) {
    const resolver = buildResolver([]);
    return {
      applications: [],
      selectedId: null,
      selected: null,
      resolver,
      setApplications: () => undefined,
      selectApplication: () => undefined,
      displayContext: (projectRef) => resolver.displayContext(projectRef),
    };
  }
  return ctx;
}
