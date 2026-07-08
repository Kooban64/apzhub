/** UI form model for Matter Management screens — LAW-003-01. */
import type { Matter, MatterPriority, MatterStatus } from "@apzhub/legal-business-core";

export type {
  Matter,
  MatterPriority,
  MatterSearchCriteria,
  MatterStatus,
} from "@apzhub/legal-business-core";
export {
  MATTER_PRIORITIES,
  MATTER_STATUSES,
  MATTER_TYPE_CODES,
} from "@apzhub/legal-business-core";

export interface MatterFormValues {
  readonly matterReference: string;
  readonly title: string;
  readonly description: string;
  readonly clientId: string;
  readonly matterTypeId: string;
  readonly matterStatus: MatterStatus;
  readonly practiceAreaId: string;
  readonly priority: MatterPriority;
  readonly leadAttorneyId: string;
  readonly tags: string;
  readonly customFields: string;
}

export interface MatterListCriteria {
  readonly query?: string;
  readonly status?: MatterStatus | "all";
  readonly clientId?: string;
  readonly priority?: MatterPriority | "all";
}

export function matterToFormValues(matter: Matter): MatterFormValues {
  return {
    matterReference: matter.matterReference,
    title: matter.title,
    description: matter.description ?? "",
    clientId: matter.clientId,
    matterTypeId: matter.matterTypeId,
    matterStatus: matter.matterStatus,
    practiceAreaId: matter.practiceAreaId,
    priority: matter.priority,
    leadAttorneyId: matter.leadAttorneyId,
    tags: matter.tags.join(", "),
    customFields: Object.entries(matter.customFields)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n"),
  };
}

export function createEmptyMatterFormValues(): MatterFormValues {
  return {
    matterReference: "",
    title: "",
    description: "",
    clientId: "",
    matterTypeId: "litigation",
    matterStatus: "open",
    practiceAreaId: "litigation",
    priority: "normal",
    leadAttorneyId: "",
    tags: "",
    customFields: "",
  };
}
