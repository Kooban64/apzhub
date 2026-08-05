"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { writeLastCustomerId, writeLastTimesheetId } from "@/lib/time/preferences";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { timesheetDetailPath, timesheetsPath } from "@/lib/time/routes";
import {
  createTimesheet,
  listActivities,
  listCustomers,
  listTags,
} from "@/lib/time/time-api";

import { ErrorState, PageShell, SelectField } from "./time-ui";

/**
 * Create timesheet — product pickers only. Time-domain project IDs are deferred
 * (G-09) to avoid confusion with APZ Projects.
 */
export function TimeTimesheetCreateView() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [billable, setBillable] = useState(true);
  const [activityId, setActivityId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [tagId, setTagId] = useState("");

  const activitiesQuery = useQuery({
    queryKey: timeQueryKeys.activities({ perPage: 100 }),
    queryFn: ({ signal }) => listActivities({ perPage: 100 }, { signal }),
  });

  const customersQuery = useQuery({
    queryKey: timeQueryKeys.customers({ perPage: 100 }),
    queryFn: ({ signal }) => listCustomers({ perPage: 100 }, { signal }),
  });

  const tagsQuery = useQuery({
    queryKey: timeQueryKeys.tags({ perPage: 100 }),
    queryFn: ({ signal }) => listTags({ perPage: 100 }, { signal }),
  });

  const activityOptions = useMemo(
    () =>
      (activitiesQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [activitiesQuery.data?.items],
  );

  const customerOptions = useMemo(
    () =>
      (customersQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [customersQuery.data?.items],
  );

  const tagOptions = useMemo(
    () =>
      (tagsQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [tagsQuery.data?.items],
  );

  const mutation = useMutation({
    mutationFn: () =>
      createTimesheet({
        description: description.trim() || undefined,
        billable,
        activityId: activityId || undefined,
        customerId: customerId || undefined,
        tagIds: tagId ? [tagId] : undefined,
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
      description="Start tracking time in APZ Time."
      breadcrumbs={["APZ Time", "Timesheets", "Create"]}
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
        <SelectField
          label="Activity (optional)"
          value={activityId}
          onChange={setActivityId}
          options={activityOptions}
          emptyLabel="No activity"
          testId="time-timesheet-create-activity"
        />
        <SelectField
          label="Customer (optional)"
          value={customerId}
          onChange={setCustomerId}
          options={customerOptions}
          emptyLabel="No customer"
          testId="time-timesheet-create-customer"
        />
        <SelectField
          label="Tag (optional)"
          value={tagId}
          onChange={setTagId}
          options={tagOptions}
          emptyLabel="No tag"
          testId="time-timesheet-create-tags"
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
