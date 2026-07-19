"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { activitiesPath } from "@/lib/time/routes";
import { createActivity } from "@/lib/time/time-api";

import { ErrorState, PageShell } from "./time-ui";

export function TimeActivityCreateView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createActivity({
        name: name.trim(),
        description: description.trim() || undefined,
        projectId: projectId.trim() || undefined,
      }),
    onSuccess: () => {
      router.push(activitiesPath());
    },
  });

  return (
    <PageShell
      title="Create activity"
      description="Create an activity through the Platform Time API."
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(activitiesPath())}
        >
          Cancel
        </Button>
      }
    >
      <form
        className="flex max-w-xl flex-col gap-4"
        data-testid="time-activity-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          data-testid="time-activity-create-name"
        />
        <Input
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          data-testid="time-activity-create-description"
        />
        <Input
          label="Project ID (optional)"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          data-testid="time-activity-create-project"
        />
        {mutation.isError ? (
          <ErrorState
            message={
              isTimeApiError(mutation.error)
                ? mutation.error.message
                : "Unable to create activity."
            }
          />
        ) : null}
        <Button
          type="submit"
          size="sm"
          disabled={mutation.isPending || !name.trim()}
          data-testid="time-activity-create-submit"
        >
          {mutation.isPending ? "Creating…" : "Create activity"}
        </Button>
      </form>
    </PageShell>
  );
}
