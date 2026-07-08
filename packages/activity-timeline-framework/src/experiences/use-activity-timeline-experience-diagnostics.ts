"use client";

import { useMemo } from "react";

import {
  useActivityPresentation,
  type UseActivityPresentationOptions,
  type UseActivityPresentationResult,
} from "../react/use-activity-presentation";
import { buildActivityTimelineExperienceDiagnostics } from "./build-activity-timeline-experience-diagnostics";
import type {
  ActivityTimelineExperienceDiagnostics,
  ActivityTimelineExperienceSurface,
} from "./types";

export interface UseActivityTimelineExperienceDiagnosticsOptions extends UseActivityPresentationOptions {
  readonly surface: ActivityTimelineExperienceSurface;
}

export interface UseActivityTimelineExperienceDiagnosticsResult extends UseActivityPresentationResult {
  readonly experienceDiagnostics: ActivityTimelineExperienceDiagnostics;
  readonly isLoading: boolean;
}

/**
 * Presentation hook plus experience-level diagnostics for Timeline Experiences.
 * Experiences must consume this hook (or its fields) — not ActivityService directly.
 */
export function useActivityTimelineExperienceDiagnostics(
  options: UseActivityTimelineExperienceDiagnosticsOptions,
): UseActivityTimelineExperienceDiagnosticsResult {
  const presentation = useActivityPresentation({
    ...options,
    grouping: options.grouping ?? "date",
  });

  const isLoading = !presentation.isReady;
  const renderedGroupCount = presentation.groupedViewModels.filter(
    (group) => group.items.length > 0,
  ).length;
  const renderedItemCount = presentation.viewModels.length;

  const experienceDiagnostics = useMemo(
    () =>
      buildActivityTimelineExperienceDiagnostics({
        surface: options.surface,
        totalCount: presentation.viewModels.length,
        renderedItemCount,
        renderedGroupCount,
        isEmpty: presentation.isEmpty,
        isLoading,
        presentation: presentation.diagnostics,
        service: presentation.serviceDiagnostics,
      }),
    [
      options.surface,
      presentation.diagnostics,
      presentation.groupedViewModels,
      presentation.isEmpty,
      presentation.serviceDiagnostics,
      presentation.viewModels.length,
      isLoading,
      renderedGroupCount,
      renderedItemCount,
    ],
  );

  return useMemo(
    () => ({
      ...presentation,
      experienceDiagnostics,
      isLoading,
    }),
    [experienceDiagnostics, isLoading, presentation],
  );
}
