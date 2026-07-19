"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { writeLastCustomerId, writeLastTimesheetId } from "@/lib/time/preferences";
import { timesheetDetailPath, timesheetsPath } from "@/lib/time/routes";
import { createTimesheet } from "@/lib/time/time-api";

import { ErrorState, PageShell } from "./time-ui";

function parseOptionalId(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseTagIds(value: string): readonly string[] | undefined {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

export function TimeTimesheetCreateView() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [billable, setBillable] = useState(true);
  const [activityId, setActivityId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tagIds, setTagIds] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createTimesheet({
        description: description.trim() || undefined,
        billable,
        activityId: parseOptionalId(activityId),
        customerId: parseOptionalId(customerId),
        projectId: parseOptionalId(projectId),
        tagIds: parseTagIds(tagIds),
      }),
    onSuccess: (timesheet) => {
      writeLastTimesheetId(timesheet.id);
      if (timesheet.customerId) {
        writeLastCustomerId(timesheet.customerId);
      }
      router.push(timesheetDetailPath(timesheet.id));
    },
  });

  return (
    <PageShell
      title="Create timesheet"
      description="Create a timesheet through the Platform Time API."
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(timesheetsPath())}
        >
          Cancel
        </Button>
      }
    >
      <form
        className="flex max-w-xl flex-col gap-4"
        data-testid="time-timesheet-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <Input
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          data-testid="time-timesheet-create-description"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={billable}
            onChange={(event) => setBillable(event.target.checked)}
            data-testid="time-timesheet-create-billable"
          />
          <span className="font-medium">Billable</span>
        </label>
        <Input
          label="Activity ID (optional)"
          value={activityId}
          onChange={(event) => setActivityId(event.target.value)}
          data-testid="time-timesheet-create-activity"
        />
        <Input
          label="Customer ID (optional)"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          data-testid="time-timesheet-create-customer"
        />
        <Input
          label="Project ID (optional)"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          data-testid="time-timesheet-create-project"
        />
        <Input
          label="Tag IDs (optional, comma-separated)"
          value={tagIds}
          onChange={(event) => setTagIds(event.target.value)}
          data-testid="time-timesheet-create-tags"
        />
        {mutation.isError ? (
          <ErrorState
            message={
              isTimeApiError(mutation.error)
                ? mutation.error.message
                : "Unable to create timesheet."
            }
          />
        ) : null}
        <Button
          type="submit"
          size="sm"
          disabled={mutation.isPending}
          data-testid="time-timesheet-create-submit"
        >
          {mutation.isPending ? "Creating…" : "Create timesheet"}
        </Button>
      </form>
    </PageShell>
  );
}
