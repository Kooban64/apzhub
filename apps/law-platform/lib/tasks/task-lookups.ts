import { getSharedDocumentRepository } from "../documents/in-memory-document-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { getAssigneeDisplayName } from "./seed-assignees";

export function getMatterTitleForTask(matterId?: string): string {
  if (!matterId) {
    return "—";
  }

  return getSharedMatterRepository().getById(matterId)?.title ?? matterId;
}

export function getDocumentTitleForTask(documentId?: string): string {
  if (!documentId) {
    return "—";
  }

  return getSharedDocumentRepository().getById(documentId)?.title ?? documentId;
}

export function getAssigneeLabel(assigneeUserId: string): string {
  return getAssigneeDisplayName(assigneeUserId);
}

export function formatTaskDueDate(dueAt?: string): string {
  if (!dueAt) {
    return "—";
  }

  return new Date(dueAt).toLocaleString();
}

export function formatTaskDate(value?: string): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}
