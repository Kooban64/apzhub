"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  LawBreadcrumbs,
  LawFormPageLayout,
  LawPageHeader,
  LawSuccessDialog,
} from "../ux";
import { TimeEntryFormFields } from "./time-entry-form-fields";
import { useTimeEntryWorkflow } from "../../lib/time/time-entry-workflow-context";
import {
  createEmptyTimeEntryFormValues,
  getSharedTimeEntryRepository,
  timeEntryDetailRoute,
  timeEntryListRoute,
  timeEntryToFormValues,
  validateTimeEntryForm,
  type TimeEntryFormValues,
} from "../../lib/time";

export interface TimeEntryFormPageProps {
  readonly mode: "create" | "edit";
  readonly timeEntryId?: string;
  readonly initialMatterId?: string;
}

/** Time entry create/edit form — full in-memory workflow, manual duration (LAW-006-01). */
export function TimeEntryFormPage({
  mode,
  timeEntryId,
  initialMatterId,
}: TimeEntryFormPageProps) {
  const router = useRouter();
  const workflow = useTimeEntryWorkflow();
  const repository = getSharedTimeEntryRepository();
  const existingEntry = useMemo(
    () =>
      mode === "edit" && timeEntryId ? repository.getById(timeEntryId) : undefined,
    [mode, timeEntryId, repository],
  );

  const [values, setValues] = useState<TimeEntryFormValues>(() => {
    if (existingEntry) {
      return timeEntryToFormValues(existingEntry);
    }

    return createEmptyTimeEntryFormValues(initialMatterId ?? "");
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedTimeEntryId, setSavedTimeEntryId] = useState<string | undefined>();
  const validation = useMemo(() => validateTimeEntryForm(values), [values]);

  const title = mode === "create" ? "Record Time" : "Edit Time Entry";
  const subtitle =
    mode === "create"
      ? "Enter time against a matter with optional task or document links. Saved to the in-memory repository."
      : existingEntry
        ? `Editing ${existingEntry.timeEntryReference}. Changes are stored in-memory only.`
        : "Time entry not found in the in-memory repository.";

  function handleFieldChange(field: keyof TimeEntryFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const result =
      mode === "create"
        ? workflow.createTimeEntry(values)
        : timeEntryId
          ? workflow.updateTimeEntry(timeEntryId, values)
          : { ok: false, run: workflow.searchTimeEntries({}, "legal.time.edit").run };

    if (!result.ok || !result.timeEntry || Array.isArray(result.timeEntry)) {
      return;
    }

    setSavedTimeEntryId(result.timeEntry.timeEntryId);
    setShowSuccess(true);
  }

  function handleCancel() {
    if (mode === "edit" && timeEntryId) {
      router.push(timeEntryDetailRoute(timeEntryId));
      return;
    }

    router.push(timeEntryListRoute());
  }

  if (mode === "edit" && timeEntryId && !existingEntry) {
    return (
      <LawFormPageLayout
        header={
          <LawPageHeader
            eyebrow="Time Recording"
            title="Time entry not found"
            subtitle="Cannot edit a time entry that is not in the in-memory repository."
          />
        }
        sections={null}
        onCancel={() => router.push(timeEntryListRoute())}
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
                { label: "Time", href: timeEntryListRoute() },
                ...(existingEntry
                  ? [
                      {
                        label: existingEntry.timeEntryReference,
                        href: timeEntryDetailRoute(existingEntry.timeEntryId),
                      },
                    ]
                  : []),
                { label: title },
              ]}
            />
            <LawPageHeader eyebrow="Time Recording" title={title} subtitle={subtitle} />
          </>
        }
        sections={
          <TimeEntryFormFields
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
        title={mode === "create" ? "Time recorded" : "Time entry updated"}
        description="Time workflow completed. Domain event, notification, and activity placeholders were triggered."
        onClose={() => {
          setShowSuccess(false);
          if (savedTimeEntryId) {
            router.push(timeEntryDetailRoute(savedTimeEntryId));
            return;
          }
          if (mode === "edit" && timeEntryId) {
            router.push(timeEntryDetailRoute(timeEntryId));
            return;
          }
          router.push(timeEntryListRoute());
        }}
      />
    </>
  );
}
