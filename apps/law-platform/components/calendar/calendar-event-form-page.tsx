"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  LawBreadcrumbs,
  LawFormPageLayout,
  LawPageHeader,
  LawSuccessDialog,
} from "../ux";
import { CalendarEventFormFields } from "./calendar-event-form-fields";
import { useCalendarEventWorkflow } from "../../lib/calendar/calendar-event-workflow-context";
import {
  calendarEventDetailRoute,
  calendarEventListRoute,
  calendarEventToFormValues,
  createEmptyCalendarEventFormValues,
  getSharedCalendarEventRepository,
  resolveClientIdForMatter,
  validateCalendarEventForm,
  type CalendarEventFormValues,
} from "../../lib/calendar";

export interface CalendarEventFormPageProps {
  readonly mode: "create" | "edit";
  readonly calendarEventId?: string;
  readonly initialMatterId?: string;
}

/** Calendar event create/edit form (LAW-008-01). */
export function CalendarEventFormPage({
  mode,
  calendarEventId,
  initialMatterId,
}: CalendarEventFormPageProps) {
  const router = useRouter();
  const workflow = useCalendarEventWorkflow();
  const repository = getSharedCalendarEventRepository();
  const existingEvent = useMemo(
    () =>
      mode === "edit" && calendarEventId
        ? repository.getById(calendarEventId)
        : undefined,
    [mode, calendarEventId, repository],
  );

  const [values, setValues] = useState<CalendarEventFormValues>(() => {
    if (existingEvent) {
      return calendarEventToFormValues(existingEvent);
    }

    const empty = createEmptyCalendarEventFormValues(initialMatterId ?? "");
    if (initialMatterId) {
      const clientId = resolveClientIdForMatter(initialMatterId);
      return { ...empty, clientId: clientId ?? "" };
    }

    return empty;
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedEventId, setSavedEventId] = useState<string | undefined>();

  const validation = validateCalendarEventForm(values);
  const title = mode === "create" ? "Create calendar event" : "Edit calendar event";
  const subtitle =
    mode === "create"
      ? "Schedule a hearing, deadline, or meeting linked to a matter."
      : (existingEvent?.calendarEventReference ?? "Update calendar event details.");

  function handleFieldChange(field: keyof CalendarEventFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const currentValidation = validateCalendarEventForm(values);
    if (!currentValidation.valid) {
      return;
    }

    const result =
      mode === "create"
        ? workflow.createCalendarEvent(values)
        : workflow.updateCalendarEvent(calendarEventId!, values);

    if (!result.ok || !result.calendarEvent || Array.isArray(result.calendarEvent)) {
      return;
    }

    setSavedEventId(result.calendarEvent.calendarEventId);
    setShowSuccess(true);
  }

  function handleCancel() {
    if (mode === "edit" && calendarEventId) {
      router.push(calendarEventDetailRoute(calendarEventId));
      return;
    }

    router.push(calendarEventListRoute());
  }

  return (
    <>
      <LawFormPageLayout
        header={
          <>
            <LawBreadcrumbs
              items={[
                { label: "Calendar", href: calendarEventListRoute() },
                ...(existingEvent
                  ? [
                      {
                        label: existingEvent.calendarEventReference,
                        href: calendarEventDetailRoute(existingEvent.calendarEventId),
                      },
                    ]
                  : []),
                { label: title },
              ]}
            />
            <LawPageHeader
              eyebrow="Calendar Management"
              title={title}
              subtitle={subtitle}
            />
          </>
        }
        sections={
          <CalendarEventFormFields
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
        title={mode === "create" ? "Event scheduled" : "Event updated"}
        description="Calendar workflow completed. Domain event, notification, and activity placeholders were triggered."
        onClose={() => {
          setShowSuccess(false);
          if (savedEventId) {
            router.push(calendarEventDetailRoute(savedEventId));
            return;
          }
          if (mode === "edit" && calendarEventId) {
            router.push(calendarEventDetailRoute(calendarEventId));
            return;
          }
          router.push(calendarEventListRoute());
        }}
      />
    </>
  );
}
