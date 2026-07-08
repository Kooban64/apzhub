import type { ActivityDocument } from "../types/activity-document";
import type { ActivityDocumentMetadata } from "../types/activity-document";
import {
  formatActivityRelativeTimestamp,
  type FormatActivityRelativeTimestampOptions,
} from "./format-activity-relative-timestamp";
import {
  freezeActivityViewModel,
  type ActivityActionRef,
  type ActivityViewModel,
} from "./activity-view-model";

export interface MapActivityDocumentToViewModelOptions extends FormatActivityRelativeTimestampOptions {
  readonly iconRef?: string;
  readonly actionRef?: ActivityActionRef;
}

function readStringMetadata(
  metadata: ActivityDocumentMetadata,
  key: string,
): string | undefined {
  const value = metadata.payloadSummary?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readActionRef(
  metadata: ActivityDocumentMetadata,
): ActivityActionRef | undefined {
  const raw = metadata.payloadSummary?.actionRef;
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const record = raw as Record<string, unknown>;
  if (typeof record.actionId !== "string" || !record.actionId.trim()) {
    return undefined;
  }

  const handlerContext = record.handlerContext;
  return Object.freeze({
    actionId: record.actionId,
    handlerContext:
      handlerContext && typeof handlerContext === "object"
        ? Object.freeze({ ...(handlerContext as Record<string, unknown>) })
        : undefined,
  });
}

/** Maps an immutable ActivityDocument to a UI-ready view model. Pure — no service access. */
export function mapActivityDocumentToViewModel(
  document: ActivityDocument,
  options: MapActivityDocumentToViewModelOptions = {},
): ActivityViewModel {
  const actionRef = options.actionRef ?? readActionRef(document.metadata);
  const icon =
    options.iconRef ?? readStringMetadata(document.metadata, "iconRef") ?? undefined;

  return freezeActivityViewModel({
    activityId: document.activityId,
    activityTypeId: document.activityTypeId,
    sourceEventId: document.sourceEventId,
    title: document.title,
    description: document.description,
    timelineScope: document.timelineScope,
    category: document.category,
    severity: document.metadata.severity,
    timestamp: document.timestamp,
    relativeTimestamp: formatActivityRelativeTimestamp(document.timestamp, options),
    icon,
    actor: document.actor,
    metadata: document.metadata,
    correlationId: document.metadata.correlationId,
    actionRef,
  });
}

export function mapActivityDocumentsToViewModels(
  documents: readonly ActivityDocument[],
  options: MapActivityDocumentToViewModelOptions = {},
): readonly ActivityViewModel[] {
  return Object.freeze(
    documents.map((document) => mapActivityDocumentToViewModel(document, options)),
  );
}
