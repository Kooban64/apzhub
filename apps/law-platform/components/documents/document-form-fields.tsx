"use client";

import { Input } from "@apzhub/ui";
import { useMemo } from "react";

import {
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  listFoldersForMatter,
  SEED_DOCUMENT_CATEGORIES,
  type DocumentFormValues,
  type DocumentValidationResult,
} from "../../lib/documents";
import { getSharedMatterRepository } from "../../lib/matters";

export interface DocumentFormFieldsProps {
  readonly values: DocumentFormValues;
  readonly errors: DocumentValidationResult["errors"];
  readonly onChange: (field: keyof DocumentFormValues, value: string) => void;
}

function FieldError({ message }: { readonly message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-[var(--color-destructive)]" role="alert">
      {message}
    </p>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  readonly htmlFor: string;
  readonly children: string;
  readonly required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-sm font-medium text-[var(--color-foreground)]"
    >
      {children}
      {required ? <span className="text-[var(--color-destructive)]"> *</span> : null}
    </label>
  );
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)]";

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Canonical Document form fields — validation only, no persistence (LAW-004-01). */
export function DocumentFormFields({
  values,
  errors,
  onChange,
}: DocumentFormFieldsProps) {
  const matters = getSharedMatterRepository().list();
  const folders = useMemo(
    () => (values.matterId ? listFoldersForMatter(values.matterId) : []),
    [values.matterId],
  );

  function handleMatterChange(matterId: string) {
    onChange("matterId", matterId);

    if (
      values.folderId &&
      !listFoldersForMatter(matterId).some(
        (folder) => folder.folderId === values.folderId,
      )
    ) {
      onChange("folderId", "");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2" data-testid="document-form-fields">
      <div>
        <FieldLabel htmlFor="documentReference">Document reference</FieldLabel>
        <Input
          id="documentReference"
          value={values.documentReference}
          onChange={(event) => onChange("documentReference", event.target.value)}
          placeholder="DOC-2026-00001"
        />
        <FieldError message={errors.documentReference} />
      </div>

      <div>
        <FieldLabel htmlFor="title" required>
          Title
        </FieldLabel>
        <Input
          id="title"
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="Document title"
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <FieldLabel htmlFor="matterId" required>
          Matter
        </FieldLabel>
        <select
          id="matterId"
          className={selectClassName}
          value={values.matterId}
          onChange={(event) => handleMatterChange(event.target.value)}
          data-testid="document-form-matter"
        >
          <option value="">Select matter…</option>
          {matters.map((matter) => (
            <option key={matter.matterId} value={matter.matterId}>
              {matter.title}
            </option>
          ))}
        </select>
        <FieldError message={errors.matterId} />
      </div>

      <div>
        <FieldLabel htmlFor="documentCategoryId" required>
          Category
        </FieldLabel>
        <select
          id="documentCategoryId"
          className={selectClassName}
          value={values.documentCategoryId}
          onChange={(event) => onChange("documentCategoryId", event.target.value)}
          data-testid="document-form-category"
        >
          {SEED_DOCUMENT_CATEGORIES.map((category) => (
            <option
              key={category.documentCategoryId}
              value={category.documentCategoryId}
            >
              {category.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.documentCategoryId} />
      </div>

      <div>
        <FieldLabel htmlFor="folderId">Folder</FieldLabel>
        <select
          id="folderId"
          className={selectClassName}
          value={values.folderId}
          onChange={(event) => onChange("folderId", event.target.value)}
          disabled={!values.matterId}
          data-testid="document-form-folder"
        >
          <option value="">No folder</option>
          {folders.map((folder) => (
            <option key={folder.folderId} value={folder.folderId}>
              {folder.name}
            </option>
          ))}
        </select>
        {!values.matterId ? (
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            Select a matter to choose a folder.
          </p>
        ) : null}
      </div>

      <div>
        <FieldLabel htmlFor="documentType" required>
          Document type
        </FieldLabel>
        <select
          id="documentType"
          className={selectClassName}
          value={values.documentType}
          onChange={(event) => onChange("documentType", event.target.value)}
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {formatLabel(type)}
            </option>
          ))}
        </select>
        <FieldError message={errors.documentType} />
      </div>

      <div>
        <FieldLabel htmlFor="documentStatus" required>
          Status
        </FieldLabel>
        <select
          id="documentStatus"
          className={selectClassName}
          value={values.documentStatus}
          onChange={(event) => onChange("documentStatus", event.target.value)}
        >
          {DOCUMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>
        <FieldError message={errors.documentStatus} />
      </div>

      <div>
        <FieldLabel htmlFor="createdByUserId">Created by user ID</FieldLabel>
        <Input
          id="createdByUserId"
          value={values.createdByUserId}
          onChange={(event) => onChange("createdByUserId", event.target.value)}
          placeholder="user-legal-workbench"
        />
      </div>

      <div className="md:col-span-2">
        <LawInformationNote title="File upload (placeholder)">
          File upload is not wired in LAW-004-01. Enter file metadata manually below — a
          real upload control will populate file name, MIME type, and size in a future
          story.
        </LawInformationNote>
      </div>

      <div>
        <FieldLabel htmlFor="fileName">File name</FieldLabel>
        <Input
          id="fileName"
          value={values.fileName}
          onChange={(event) => onChange("fileName", event.target.value)}
          placeholder="document.pdf"
          data-testid="document-form-file-name"
        />
      </div>

      <div>
        <FieldLabel htmlFor="mimeType">MIME type</FieldLabel>
        <Input
          id="mimeType"
          value={values.mimeType}
          onChange={(event) => onChange("mimeType", event.target.value)}
          placeholder="application/pdf"
          data-testid="document-form-mime-type"
        />
      </div>

      <div>
        <FieldLabel htmlFor="sizeBytes">Size (bytes)</FieldLabel>
        <Input
          id="sizeBytes"
          value={values.sizeBytes}
          onChange={(event) => onChange("sizeBytes", event.target.value)}
          placeholder="0"
          inputMode="numeric"
          data-testid="document-form-size-bytes"
        />
        <FieldError message={errors.sizeBytes} />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="tags">Tags</FieldLabel>
        <Input
          id="tags"
          value={values.tags}
          onChange={(event) => onChange("tags", event.target.value)}
          placeholder="pleading, filed"
        />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="customFields">Custom fields</FieldLabel>
        <textarea
          id="customFields"
          className={`${selectClassName} min-h-[6rem]`}
          value={values.customFields}
          onChange={(event) => onChange("customFields", event.target.value)}
          placeholder={"court=Land and Environment Court\njurisdiction=NSW"}
        />
        <FieldError message={errors.customFields} />
      </div>
    </div>
  );
}

function LawInformationNote({
  title,
  children,
}: {
  readonly title: string;
  readonly children: string;
}) {
  return (
    <div
      className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/20 px-4 py-3"
      data-testid="document-form-upload-note"
    >
      <p className="text-sm font-medium text-[var(--color-foreground)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{children}</p>
    </div>
  );
}
