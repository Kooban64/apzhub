export type { ActivityActionRef, ActivityViewModel } from "./activity-view-model";

export { freezeActivityViewModel } from "./activity-view-model";

export type { ActivityPresentationLayerStatus } from "./layer-status";
export { ACTIVITY_PRESENTATION_LAYER_STATUS } from "./layer-status";

export {
  formatActivityRelativeTimestamp,
  isActivityRelativeTimestampFormatted,
  type FormatActivityRelativeTimestampOptions,
} from "./format-activity-relative-timestamp";

export {
  mapActivityDocumentToViewModel,
  mapActivityDocumentsToViewModels,
  type MapActivityDocumentToViewModelOptions,
} from "./map-activity-document-to-view-model";

export {
  compareActivityViewModels,
  sortActivityViewModels,
} from "./sort-activity-view-models";

export {
  groupActivityViewModels,
  type ActivityGroupingStrategy,
  type ActivityDateGroupKey,
  type ActivityViewModelGroup,
  type GroupActivityViewModelsOptions,
} from "./group-activity-view-models";

export {
  buildActivityPresentationDiagnostics,
  presentActivities,
  type ActivityPresentationDiagnostics,
  type ActivityPresentationDiagnosticsStatus,
  type ActivityPresentationFormattingStatus,
  type BuildActivityPresentationDiagnosticsOptions,
  type PresentActivitiesOptions,
  type PresentActivitiesResult,
} from "./activity-presentation-diagnostics";
