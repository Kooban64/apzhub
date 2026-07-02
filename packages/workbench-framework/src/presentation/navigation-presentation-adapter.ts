import type { NavigationModel } from "../navigation/platform-navigation-model";

/** Presentation target identifiers for navigation consumers. */
export type NavigationPresentationTarget =
  "activity-bar" | "sidebar" | "command" | "search";

/**
 * Maps the platform Navigation Model to a presentation-specific shape.
 * UI components must consume adapters — never manifests or registry DTOs directly.
 */
export interface NavigationPresentationAdapter<
  TTarget extends NavigationPresentationTarget,
  TPresentation,
> {
  readonly target: TTarget;
  adapt(model: NavigationModel): TPresentation;
}
