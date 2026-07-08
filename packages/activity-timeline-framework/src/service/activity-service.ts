import type { ActivityServiceDiagnostics } from "../types/activity-diagnostics";
import type { ActivityDocument } from "../types/activity-document";
import type { TimelineQuery, TimelineResult } from "../types/timeline-scope";
import type {
  AddActivitiesResult,
  ListActivitiesOptions,
} from "./activity-session-store";

/** Public activity boundary — stores immutable ActivityDocuments; no Event Bus or UI. */
export interface ActivityService {
  addActivities(items: readonly ActivityDocument[]): AddActivitiesResult;
  listActivities(query?: ListActivitiesOptions): readonly ActivityDocument[];
  getActivity(activityId: string): ActivityDocument | undefined;
  queryTimeline(query: TimelineQuery): TimelineResult;
  clearActivities(): number;
  getDiagnostics(): ActivityServiceDiagnostics;
}

export type {
  AddActivitiesResult,
  ListActivitiesOptions,
} from "./activity-session-store";
