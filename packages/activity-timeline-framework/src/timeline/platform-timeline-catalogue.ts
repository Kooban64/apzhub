import type { TimelineDefinition } from "../types/timeline-definition";
import {
  TIMELINE_SCOPE_ORGANIZATION,
  TIMELINE_SCOPE_PERSONAL,
  TIMELINE_SCOPE_SYSTEM,
  TIMELINE_SCOPE_TEAM,
} from "../types/timeline-scope";

const PLATFORM_TIMELINES: TimelineDefinition[] = [
  {
    timelineId: TIMELINE_SCOPE_PERSONAL,
    scope: TIMELINE_SCOPE_PERSONAL,
    label: "Personal",
    description: "Your personal activity history",
    icon: "User",
    order: 10,
    version: "1.0.0",
    visibility: "public",
    stability: "stable",
    source: "builtin",
    status: "active",
    supportedActivityCategories: ["user", "capability", "integration"],
  },
  {
    timelineId: TIMELINE_SCOPE_TEAM,
    scope: TIMELINE_SCOPE_TEAM,
    label: "Team",
    description: "Team collaboration activity — reserved until M8+",
    icon: "Users",
    order: 20,
    version: "1.0.0",
    visibility: "internal",
    stability: "experimental",
    source: "builtin",
    status: "planned",
    supportedActivityCategories: ["team", "user"],
  },
  {
    timelineId: TIMELINE_SCOPE_ORGANIZATION,
    scope: TIMELINE_SCOPE_ORGANIZATION,
    label: "Organization",
    description: "Organization-scoped activity — reserved until M8+",
    icon: "Building2",
    order: 30,
    version: "1.0.0",
    visibility: "internal",
    stability: "experimental",
    source: "builtin",
    status: "planned",
    supportedActivityCategories: ["workspace", "system", "capability"],
  },
  {
    timelineId: TIMELINE_SCOPE_SYSTEM,
    scope: TIMELINE_SCOPE_SYSTEM,
    label: "System",
    description: "Platform and security activity — admin scaffold",
    icon: "Shield",
    order: 40,
    version: "1.0.0",
    visibility: "restricted",
    stability: "stable",
    source: "builtin",
    status: "planned",
    supportedActivityCategories: ["system", "security"],
  },
];

/** Platform timeline definitions — metadata only; no activity population. */
export const PLATFORM_TIMELINE_DEFINITIONS: readonly TimelineDefinition[] =
  Object.freeze(PLATFORM_TIMELINES.map((definition) => Object.freeze(definition)));
