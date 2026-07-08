"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  LawBreadcrumbs,
  LawFormPageLayout,
  LawPageHeader,
  LawSuccessDialog,
} from "../ux";
import { MatterFormFields } from "./matter-form-fields";
import { useMatterWorkflow } from "../../lib/matters/matter-workflow-context";
import {
  createEmptyMatterFormValues,
  getSharedMatterRepository,
  matterDetailRoute,
  matterListRoute,
  matterToFormValues,
  validateMatterForm,
  type MatterFormValues,
} from "../../lib/matters";

export interface MatterFormPageProps {
  readonly mode: "create" | "edit";
  readonly matterId?: string;
}

/** Matter create/edit form — full in-memory workflow (LAW-003-01). */
export function MatterFormPage({ mode, matterId }: MatterFormPageProps) {
  const router = useRouter();
  const workflow = useMatterWorkflow();
  const repository = getSharedMatterRepository();
  const existingMatter = useMemo(
    () => (mode === "edit" && matterId ? repository.getById(matterId) : undefined),
    [mode, matterId, repository],
  );

  const [values, setValues] = useState<MatterFormValues>(() =>
    existingMatter ? matterToFormValues(existingMatter) : createEmptyMatterFormValues(),
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedMatterId, setSavedMatterId] = useState<string | undefined>();
  const validation = useMemo(() => validateMatterForm(values), [values]);

  const title = mode === "create" ? "Create Matter" : "Edit Matter";
  const subtitle =
    mode === "create"
      ? "Complete all canonical Matter fields. Saved to the in-memory repository for workflow validation."
      : existingMatter
        ? `Editing ${existingMatter.title}. Changes are stored in-memory only.`
        : "Matter not found in the in-memory repository.";

  function handleFieldChange(field: keyof MatterFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const result =
      mode === "create"
        ? workflow.createMatter(values)
        : matterId
          ? workflow.updateMatter(matterId, values)
          : { ok: false, run: workflow.searchMatters({}, "legal.matter.edit").run };

    if (!result.ok || !result.matter || Array.isArray(result.matter)) {
      return;
    }

    setSavedMatterId(result.matter.matterId);
    setShowSuccess(true);
  }

  function handleCancel() {
    if (mode === "edit" && matterId) {
      router.push(matterDetailRoute(matterId));
      return;
    }

    router.push(matterListRoute());
  }

  if (mode === "edit" && matterId && !existingMatter) {
    return (
      <LawFormPageLayout
        header={
          <LawPageHeader
            eyebrow="Matter Management"
            title="Matter not found"
            subtitle="Cannot edit a matter that is not in the in-memory repository."
          />
        }
        sections={null}
        onCancel={() => router.push(matterListRoute())}
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
                { label: "Matters", href: matterListRoute() },
                ...(existingMatter
                  ? [
                      {
                        label: existingMatter.title,
                        href: matterDetailRoute(existingMatter.matterId),
                      },
                    ]
                  : []),
                { label: title },
              ]}
            />
            <LawPageHeader
              eyebrow="Matter Management"
              title={title}
              subtitle={subtitle}
            />
          </>
        }
        sections={
          <MatterFormFields
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
        title={mode === "create" ? "Matter created" : "Matter updated"}
        description="Matter workflow completed. Domain event, notification, and activity placeholders were triggered."
        onClose={() => {
          setShowSuccess(false);
          if (savedMatterId) {
            router.push(matterDetailRoute(savedMatterId));
            return;
          }
          if (mode === "edit" && matterId) {
            router.push(matterDetailRoute(matterId));
            return;
          }
          router.push(matterListRoute());
        }}
      />
    </>
  );
}
