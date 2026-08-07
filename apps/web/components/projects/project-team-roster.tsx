"use client";

/**
 * W006 Delivery Assignment Workspace — create · reassign · history · ownership.
 */

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  createProjectAssignment,
  getAssignmentHistory,
  listProjectAssignments,
  reassignProjectAssignment,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { EnterpriseIdentityPicker } from "./enterprise-identity-picker";
import { ErrorState, LoadingState } from "./projects-ui";

export function ProjectTeamRoster({
  projectId,
  canManage = false,
}: {
  readonly projectId: string;
  readonly canManage?: boolean;
}) {
  const queryClient = useQueryClient();
  const [principalKind, setPrincipalKind] = useState<"user" | "team">("user");
  const [principalId, setPrincipalId] = useState("");
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assignments = useQuery({
    queryKey: [...projectsQueryKeys.all, "assignments", projectId],
    queryFn: ({ signal }) => listProjectAssignments(projectId, { signal }),
  });

  const history = useQuery({
    queryKey: [...projectsQueryKeys.all, "assignment-history", historyId],
    queryFn: ({ signal }) => getAssignmentHistory(projectId, historyId!, { signal }),
    enabled: Boolean(historyId),
  });

  const assign = useMutation({
    mutationFn: () =>
      createProjectAssignment(projectId, {
        principalType: principalKind,
        principalId: principalId.trim(),
        assignmentType: "core",
      }),
    onSuccess: async () => {
      setPrincipalId("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Assign failed.");
    },
  });

  const reassign = useMutation({
    mutationFn: () =>
      reassignProjectAssignment(projectId, reassignId!, {
        toPrincipalType: principalKind,
        toPrincipalId: principalId.trim(),
        transferAccountability: true,
      }),
    onSuccess: async () => {
      setReassignId(null);
      setPrincipalId("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Reassign failed.");
    },
  });

  const active = (assignments.data ?? []).filter((row) => !row.to);

  return (
    <section className="space-y-3" data-testid="project-team-roster">
      <h2 className="text-sm font-semibold">Delivery assignments</h2>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Operational ownership — create, reassign with accountability transfer, and
        review assignment history. Not HR.
      </p>
      {error ? <ErrorState message={error} /> : null}
      {canManage ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Principal</span>
            <select
              className="h-9 border border-[var(--color-border)] bg-transparent px-2"
              value={principalKind}
              onChange={(e) => {
                setPrincipalKind(e.target.value as "user" | "team");
                setPrincipalId("");
              }}
            >
              <option value="user">Person</option>
              <option value="team">Team</option>
            </select>
          </label>
          <EnterpriseIdentityPicker
            kind={principalKind}
            label={principalKind === "team" ? "Delivery team" : "Person"}
            value={principalId}
            onChange={setPrincipalId}
            required
          />
          {reassignId ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={!principalId.trim() || reassign.isPending}
                onClick={() => reassign.mutate()}
              >
                Transfer accountability
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setReassignId(null)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={!principalId.trim() || assign.isPending}
              onClick={() => assign.mutate()}
            >
              Assign
            </Button>
          )}
        </div>
      ) : null}
      {assignments.isLoading ? <LoadingState label="Loading assignments…" /> : null}
      <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] text-sm">
        {active.map((row) => (
          <li
            key={String(row.id)}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
          >
            <span>
              {String(row.principalType)} · {String(row.principalId)} ·{" "}
              {String(row.assignmentType)}
              {row.primaryRoleKey ? ` · ${String(row.primaryRoleKey)}` : ""}
            </span>
            <span className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setHistoryId(historyId === String(row.id) ? null : String(row.id))
                }
              >
                History
              </Button>
              {canManage ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReassignId(String(row.id));
                    setPrincipalId("");
                  }}
                >
                  Reassign
                </Button>
              ) : null}
            </span>
          </li>
        ))}
        {active.length === 0 && !assignments.isLoading ? (
          <li className="px-3 py-2 text-[var(--color-muted-foreground)]">
            No active delivery assignments.
          </li>
        ) : null}
      </ul>
      {historyId && history.data ? (
        <section className="space-y-1 text-xs" data-testid="assignment-history">
          <h3 className="font-semibold">Assignment history</h3>
          <ul>
            {history.data.map((ev) => (
              <li key={String(ev.id)}>
                {String(ev.at).slice(0, 19)} · {String(ev.kind)}
                {ev.fromPrincipalId ? ` · from ${String(ev.fromPrincipalId)}` : ""}
                {ev.toPrincipalId ? ` · to ${String(ev.toPrincipalId)}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
