"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { tagsPath } from "@/lib/time/routes";
import { createTag } from "@/lib/time/time-api";

import { ErrorState, PageShell } from "./time-ui";

export function TimeTagCreateView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createTag({
        name: name.trim(),
        color: color.trim() || undefined,
      }),
    onSuccess: () => {
      router.push(tagsPath());
    },
  });

  return (
    <PageShell
      title="Create tag"
      description="Create a tag through the Platform Time API."
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(tagsPath())}
        >
          Cancel
        </Button>
      }
    >
      <form
        className="flex max-w-xl flex-col gap-4"
        data-testid="time-tag-create-form"
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
          data-testid="time-tag-create-name"
        />
        <Input
          label="Color (#RRGGBB, optional)"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          data-testid="time-tag-create-color"
        />
        {mutation.isError ? (
          <ErrorState
            message={
              isTimeApiError(mutation.error)
                ? mutation.error.message
                : "Unable to create tag."
            }
          />
        ) : null}
        <Button
          type="submit"
          size="sm"
          disabled={mutation.isPending || !name.trim()}
          data-testid="time-tag-create-submit"
        >
          {mutation.isPending ? "Creating…" : "Create tag"}
        </Button>
      </form>
    </PageShell>
  );
}
