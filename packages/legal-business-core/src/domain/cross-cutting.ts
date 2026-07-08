import type { CustomFieldType, NoteVisibility } from "./enums";

export interface CustomField {
  readonly customFieldId: string;
  readonly fieldCode: string;
  readonly label: string;
  readonly fieldType: CustomFieldType;
  readonly entityType: string;
  readonly picklistValues?: readonly string[];
  readonly required: boolean;
  readonly isActive: boolean;
}

export interface Tag {
  readonly tagId: string;
  readonly name: string;
  readonly colour?: string;
  readonly entityTypes: readonly string[];
}

export interface Note {
  readonly noteId: string;
  readonly body: string;
  readonly authorUserId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly parentEntityType: string;
  readonly parentEntityId: string;
  readonly isPinned: boolean;
  readonly visibility: NoteVisibility;
}

export interface CustomFieldValues {
  readonly values: Readonly<Record<string, string>>;
}
