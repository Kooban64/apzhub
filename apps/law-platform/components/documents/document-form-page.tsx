"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  LawBreadcrumbs,
  LawFormPageLayout,
  LawPageHeader,
  LawSuccessDialog,
} from "../ux";
import { DocumentFormFields } from "./document-form-fields";
import { useDocumentWorkflow } from "../../lib/documents/document-workflow-context";
import {
  createEmptyDocumentFormValues,
  documentDetailRoute,
  documentListRoute,
  documentToFormValues,
  getSharedDocumentRepository,
  validateDocumentForm,
  type DocumentFormValues,
} from "../../lib/documents";

export interface DocumentFormPageProps {
  readonly mode: "create" | "edit";
  readonly documentId?: string;
  readonly initialMatterId?: string;
}

/** Document create/edit form — full in-memory workflow (LAW-004-01). */
export function DocumentFormPage({
  mode,
  documentId,
  initialMatterId,
}: DocumentFormPageProps) {
  const router = useRouter();
  const workflow = useDocumentWorkflow();
  const repository = getSharedDocumentRepository();
  const existingDocument = useMemo(
    () => (mode === "edit" && documentId ? repository.getById(documentId) : undefined),
    [mode, documentId, repository],
  );

  const [values, setValues] = useState<DocumentFormValues>(() => {
    if (existingDocument) {
      return documentToFormValues(existingDocument);
    }

    return createEmptyDocumentFormValues(initialMatterId ?? "");
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedDocumentId, setSavedDocumentId] = useState<string | undefined>();
  const validation = useMemo(() => validateDocumentForm(values), [values]);

  const title = mode === "create" ? "Upload Document" : "Edit Document";
  const subtitle =
    mode === "create"
      ? "Complete document metadata and file placeholders. Saved to the in-memory repository for workflow validation."
      : existingDocument
        ? `Editing ${existingDocument.title}. Changes are stored in-memory only.`
        : "Document not found in the in-memory repository.";

  function handleFieldChange(field: keyof DocumentFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const result =
      mode === "create"
        ? workflow.createDocument(values)
        : documentId
          ? workflow.updateDocument(documentId, values)
          : { ok: false, run: workflow.searchDocuments({}, "legal.document.edit").run };

    if (!result.ok || !result.document || Array.isArray(result.document)) {
      return;
    }

    setSavedDocumentId(result.document.documentId);
    setShowSuccess(true);
  }

  function handleCancel() {
    if (mode === "edit" && documentId) {
      router.push(documentDetailRoute(documentId));
      return;
    }

    router.push(documentListRoute());
  }

  if (mode === "edit" && documentId && !existingDocument) {
    return (
      <LawFormPageLayout
        header={
          <LawPageHeader
            eyebrow="Document Management"
            title="Document not found"
            subtitle="Cannot edit a document that is not in the in-memory repository."
          />
        }
        sections={null}
        onCancel={() => router.push(documentListRoute())}
      />
    );
  }

  return (
    <>
      <LawFormPageLayout
        header={
          <>
            <LawBreadcrumbs
              items={[
                { label: "Documents", href: documentListRoute() },
                ...(existingDocument
                  ? [
                      {
                        label: existingDocument.title,
                        href: documentDetailRoute(existingDocument.documentId),
                      },
                    ]
                  : []),
                { label: title },
              ]}
            />
            <LawPageHeader
              eyebrow="Document Management"
              title={title}
              subtitle={subtitle}
            />
          </>
        }
        sections={
          <DocumentFormFields
            values={values}
            errors={validation.errors}
            onChange={handleFieldChange}
          />
        }
        validationSummary={
          validation.valid ? null : (
            <ul className="list-disc pl-5">
              {Object.entries(validation.errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          )
        }
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <LawSuccessDialog
        open={showSuccess}
        title={mode === "create" ? "Document uploaded" : "Document updated"}
        description="Document workflow completed. Domain event, notification, and activity placeholders were triggered."
        onClose={() => {
          setShowSuccess(false);
          if (savedDocumentId) {
            router.push(documentDetailRoute(savedDocumentId));
            return;
          }
          if (mode === "edit" && documentId) {
            router.push(documentDetailRoute(documentId));
            return;
          }
          router.push(documentListRoute());
        }}
      />
    </>
  );
}
