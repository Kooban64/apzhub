"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { createProject, listWorkspaces } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { projectDetailPath, projectsListPath } from "@/lib/projects/routes";

import { ErrorState, LoadingState, PageShell } from "./projects-ui";

export function ProjectCreateView() {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState("");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");

  const workspaces = useQuery({
    queryKey: projectsQueryKeys.workspaces(),
    queryFn: ({ signal }) => listWorkspaces({ signal }),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createProject({
        workspaceId,
        name: name.trim(),
        identifier: identifier.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: (project) => {
      router.push(projectDetailPath(project.id));
    },
  });

  const workspaceItems = workspaces.data?.items ?? [];

  return (
    <PageShell
      title="Create project"
      description="Create a new project in APZ Projects."
      breadcrumbs={["APZ Projects", "Create project"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(projectsListPath())}
        >
          Cancel
        </Button>
      }
    >
      {workspaces.isLoading ? <LoadingState label="Loading workspaces…" /> : null}
      {workspaces.isError ? (
        <ErrorState
          message={
            isProjectsApiError(workspaces.error)
              ? workspaces.error.message
              : "Unable to load workspaces."
          }
          onRetry={() => void workspaces.refetch()}
        />
      ) : null}

      <form
        className="flex max-w-xl flex-col gap-4"
        data-testid="projects-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Workspace</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
            value={workspaceId}
            onChange={(event) => setWorkspaceId(event.target.value)}
            required
            data-testid="projects-create-workspace"
          >
            <option value="">Select workspace</option>
            {workspaceItems.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          data-testid="projects-create-name"
        />
        <Input
          label="Identifier"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
          data-testid="projects-create-identifier"
        />
        <Input
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          data-testid="projects-create-description"
        />
        {mutation.isError ? (
          <ErrorState
            message={
              isProjectsApiError(mutation.error)
                ? mutation.error.message
                : "Unable to create project."
            }
          />
        ) : null}
        <Button
          type="submit"
          size="sm"
          disabled={
            mutation.isPending || !workspaceId || !name.trim() || !identifier.trim()
          }
          data-testid="projects-create-submit"
        >
          {mutation.isPending ? "Creating…" : "Create project"}
        </Button>
      </form>
    </PageShell>
  );
}
