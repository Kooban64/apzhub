"use client";

/**
 * W006 Control panels — Responsibility Matrix · Continuity · Stakeholders.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  createExternalParticipant,
  createStakeholder,
  getResponsibilityMatrix,
  listContinuityCases,
  listStakeholders,
  openContinuityCase,
  updateContinuityCase,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { EnterpriseIdentityPicker } from "./enterprise-identity-picker";
import { ErrorState, LoadingState } from "./projects-ui";

export function ResponsibilityMatrixPanel({
  projectId,
}: {
  readonly projectId: string;
}) {
  const matrix = useQuery({
    queryKey: [...projectsQueryKeys.all, "responsibility-matrix", projectId],
    queryFn: ({ signal }) => getResponsibilityMatrix(projectId, { signal }),
  });

  const rows =
    (matrix.data?.rows as readonly Record<string, unknown>[] | undefined) ?? [];

  return (
    <section className="space-y-2" data-testid="responsibility-matrix">
      <h2 className="text-sm font-semibold">Operational Responsibility Matrix</h2>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Accountable gaps highlighted immediately. Rows: operational objects.
      </p>
      {matrix.isLoading ? <LoadingState label="Loading matrix…" /> : null}
      {matrix.isError ? (
        <ErrorState
          message={
            isProjectsApiError(matrix.error)
              ? matrix.error.message
              : "Unable to load matrix."
          }
          onRetry={() => void matrix.refetch()}
        />
      ) : null}
      <p className="text-sm">
        Gaps: <strong>{String(matrix.data?.gapCount ?? 0)}</strong>
      </p>
      <div className="overflow-x-auto border border-[var(--color-border)]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--color-border)] text-[var(--color-muted-foreground)]">
            <tr>
              <th className="px-2 py-1">Object</th>
              <th className="px-2 py-1">A</th>
              <th className="px-2 py-1">R</th>
              <th className="px-2 py-1">C</th>
              <th className="px-2 py-1">I</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${String(row.objectType)}:${String(row.objectId)}`}
                className={
                  row.gap
                    ? "bg-[var(--color-destructive)]/10"
                    : "border-b border-[var(--color-border)]"
                }
              >
                <td className="px-2 py-1">
                  {String(row.objectType)} · {String(row.objectLabel)}
                  {row.continuityFlag ? " · continuity" : ""}
                  {row.gap ? " · GAP" : ""}
                </td>
                <td className="px-2 py-1">{String(row.accountable ?? "—")}</td>
                <td className="px-2 py-1">{String(row.responsible ?? "—")}</td>
                <td className="px-2 py-1">
                  {Array.isArray(row.consulted)
                    ? row.consulted.map(String).join(", ") || "—"
                    : "—"}
                </td>
                <td className="px-2 py-1">
                  {Array.isArray(row.informed)
                    ? row.informed.map(String).join(", ") || "—"
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ContinuityPanel({
  projectId,
  canManage = false,
}: {
  readonly projectId: string;
  readonly canManage?: boolean;
}) {
  const queryClient = useQueryClient();
  const [principalId, setPrincipalId] = useState("");
  const [actingOwner, setActingOwner] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cases = useQuery({
    queryKey: [...projectsQueryKeys.all, "continuity", projectId],
    queryFn: ({ signal }) => listContinuityCases(projectId, { signal }),
  });

  const open = useMutation({
    mutationFn: () =>
      openContinuityCase(projectId, {
        principalId: principalId.trim(),
        actingOwnerUserId: actingOwner.trim() || undefined,
        recommendedReplacementRoles: ["delivery_lead", "project_owner"],
      }),
    onSuccess: async () => {
      setPrincipalId("");
      setActingOwner("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Open continuity failed.");
    },
  });

  return (
    <section className="space-y-2" data-testid="continuity-panel">
      <h2 className="text-sm font-semibold">Delivery continuity</h2>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Temporary replacement · acting owner · succession of operational roles — not HR.
      </p>
      {error ? <ErrorState message={error} /> : null}
      {canManage ? (
        <div className="flex flex-wrap items-end gap-2">
          <EnterpriseIdentityPicker
            label="Unavailable principal"
            value={principalId}
            onChange={setPrincipalId}
            required
          />
          <EnterpriseIdentityPicker
            label="Acting owner"
            value={actingOwner}
            onChange={setActingOwner}
          />
          <Button
            type="button"
            size="sm"
            disabled={!principalId.trim() || open.isPending}
            onClick={() => open.mutate()}
          >
            Open continuity case
          </Button>
        </div>
      ) : null}
      {cases.isLoading ? <LoadingState label="Loading…" /> : null}
      <ul className="text-sm">
        {(cases.data ?? []).map((c) => (
          <li
            key={String(c.id)}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] py-2"
          >
            <span>
              {String(c.principalId)} · {String(c.status)}
              {c.actingOwnerUserId ? ` · acting ${String(c.actingOwnerUserId)}` : ""}
              {" · affected "}
              {Array.isArray(c.affectedCommitments) ? c.affectedCommitments.length : 0}
              c/
              {Array.isArray(c.affectedMilestones) ? c.affectedMilestones.length : 0}
              m/
              {Array.isArray(c.openExceptions) ? c.openExceptions.length : 0}x
              {" · recommend "}
              {Array.isArray(c.recommendedReplacementRoles)
                ? c.recommendedReplacementRoles.map(String).join(", ")
                : "—"}
            </span>
            {canManage && String(c.status) === "open" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  void updateContinuityCase(projectId, String(c.id), {
                    status: "mitigated",
                  }).then(() =>
                    queryClient.invalidateQueries({
                      queryKey: projectsQueryKeys.all,
                    }),
                  )
                }
              >
                Mark mitigated
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StakeholdersPanel({
  projectId,
  canManage = false,
}: {
  readonly projectId: string;
  readonly canManage?: boolean;
}) {
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<"user" | "external">("user");
  const [principalId, setPrincipalId] = useState("");
  const [externalName, setExternalName] = useState("");
  const [externalOrg, setExternalOrg] = useState("");
  const [interest, setInterest] = useState("sponsor");
  const [influence, setInfluence] = useState("medium");
  const [preference, setPreference] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stakeholders = useQuery({
    queryKey: [...projectsQueryKeys.all, "stakeholders", projectId],
    queryFn: ({ signal }) => listStakeholders(projectId, { signal }),
  });

  const create = useMutation({
    mutationFn: async () => {
      let id = principalId.trim();
      if (kind === "external") {
        const external = await createExternalParticipant({
          displayName: externalName.trim(),
          organisation: externalOrg.trim() || undefined,
        });
        id = String(external.id);
      }
      return createStakeholder(projectId, {
        principalType: kind,
        principalId: id,
        interest,
        influence,
        communicationPreference: preference.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setPrincipalId("");
      setExternalName("");
      setExternalOrg("");
      setPreference("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  const canSubmit =
    kind === "user" ? Boolean(principalId.trim()) : Boolean(externalName.trim());

  return (
    <section className="space-y-2" data-testid="stakeholders-panel">
      <h2 className="text-sm font-semibold">Stakeholders</h2>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Internal and external delivery participants — engagement role, influence,
        communication preference. Not a CRM.
      </p>
      {error ? <ErrorState message={error} /> : null}
      {canManage ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Type</span>
            <select
              className="h-9 border border-[var(--color-border)] bg-transparent px-2"
              value={kind}
              onChange={(e) => setKind(e.target.value as "user" | "external")}
            >
              <option value="user">Internal</option>
              <option value="external">External</option>
            </select>
          </label>
          {kind === "user" ? (
            <EnterpriseIdentityPicker
              label="Stakeholder"
              value={principalId}
              onChange={setPrincipalId}
              required
            />
          ) : (
            <>
              <Input
                label="External name"
                value={externalName}
                onChange={(e) => setExternalName(e.target.value)}
              />
              <Input
                label="Organisation"
                value={externalOrg}
                onChange={(e) => setExternalOrg(e.target.value)}
              />
            </>
          )}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Engagement role</span>
            <select
              className="h-9 border border-[var(--color-border)] bg-transparent px-2"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            >
              <option value="sponsor">Sponsor</option>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="regulator">Regulator</option>
              <option value="partner">Partner</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Influence</span>
            <select
              className="h-9 border border-[var(--color-border)] bg-transparent px-2"
              value={influence}
              onChange={(e) => setInfluence(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <Input
            label="Communication preference"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            disabled={!canSubmit || create.isPending}
            onClick={() => create.mutate()}
          >
            Add stakeholder
          </Button>
        </div>
      ) : null}
      {stakeholders.isLoading ? <LoadingState label="Loading…" /> : null}
      <ul className="text-sm">
        {(stakeholders.data ?? []).map((s) => (
          <li key={String(s.id)} className="border-b border-[var(--color-border)] py-2">
            {String(s.principalType)} · {String(s.principalId)} · {String(s.interest)} ·
            influence {String(s.influence)}
            {s.communicationPreference ? ` · ${String(s.communicationPreference)}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}
