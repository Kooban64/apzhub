"use client";

/**
 * W005 Hierarchy Administration — Enterprise Portfolio / Initiative / Programme / Objectives.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  canAdminProjects,
  canManageProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  archivePortfolioInitiative,
  archivePortfolioObjective,
  archivePortfolioProgramme,
  createPortfolioInitiative,
  createPortfolioObjective,
  createPortfolioProgramme,
  listPortfolioInitiatives,
  listPortfolioObjectives,
  listPortfolioProgrammes,
  movePortfolioProjectMembership,
  updatePortfolioInitiative,
  updatePortfolioObjective,
  updatePortfolioProgramme,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { portfolioWorkspacePath } from "@/lib/projects/routes";

import { EnterpriseIdentityPicker } from "./enterprise-identity-picker";
import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

type EditState = {
  readonly kind: "initiative" | "programme" | "objective";
  readonly id: string;
  name: string;
  ownerUserId: string;
  statement?: string;
  strategicInitiativeId?: string;
};

export function PortfolioAdminView({
  permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageProjects(permissions) || canAdminProjects(permissions);

  const [iniName, setIniName] = useState("");
  const [iniSponsor, setIniSponsor] = useState("");
  const [prgName, setPrgName] = useState("");
  const [prgOwner, setPrgOwner] = useState("");
  const [prgInitiativeId, setPrgInitiativeId] = useState("");
  const [objName, setObjName] = useState("");
  const [objStatement, setObjStatement] = useState("");
  const [objOwner, setObjOwner] = useState("");
  const [moveProjectId, setMoveProjectId] = useState("");
  const [moveProgrammeId, setMoveProgrammeId] = useState("");
  const [edit, setEdit] = useState<EditState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const initiatives = useQuery({
    queryKey: [...projectsQueryKeys.all, "portfolio-admin-initiatives"],
    queryFn: ({ signal }) => listPortfolioInitiatives({ signal }),
  });
  const programmes = useQuery({
    queryKey: [...projectsQueryKeys.all, "portfolio-admin-programmes"],
    queryFn: ({ signal }) => listPortfolioProgrammes({ signal }),
  });
  const objectives = useQuery({
    queryKey: [...projectsQueryKeys.all, "portfolio-admin-objectives"],
    queryFn: ({ signal }) => listPortfolioObjectives({ signal }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
  };

  const createIni = useMutation({
    mutationFn: () =>
      createPortfolioInitiative({
        name: iniName.trim(),
        sponsorUserId: iniSponsor.trim(),
      }),
    onSuccess: async () => {
      setIniName("");
      setIniSponsor("");
      setActionError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setActionError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  const createPrg = useMutation({
    mutationFn: () =>
      createPortfolioProgramme({
        name: prgName.trim(),
        ownerUserId: prgOwner.trim(),
        strategicInitiativeId: prgInitiativeId.trim() || undefined,
      }),
    onSuccess: async () => {
      setPrgName("");
      setPrgOwner("");
      setActionError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setActionError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  const createObj = useMutation({
    mutationFn: () =>
      createPortfolioObjective({
        name: objName.trim(),
        statement: objStatement.trim(),
        ownerUserId: objOwner.trim(),
      }),
    onSuccess: async () => {
      setObjName("");
      setObjStatement("");
      setObjOwner("");
      setActionError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setActionError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  const move = useMutation({
    mutationFn: () =>
      movePortfolioProjectMembership({
        projectId: moveProjectId.trim(),
        toProgrammeId: moveProgrammeId.trim() || null,
      }),
    onSuccess: async () => {
      setMoveProjectId("");
      setActionError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setActionError(isProjectsApiError(err) ? err.message : "Move failed.");
    },
  });

  const saveEdit = useMutation({
    mutationFn: async () => {
      if (!edit) throw new Error("no_edit");
      if (edit.kind === "initiative") {
        return updatePortfolioInitiative(edit.id, {
          name: edit.name.trim(),
          sponsorUserId: edit.ownerUserId.trim(),
        });
      }
      if (edit.kind === "programme") {
        return updatePortfolioProgramme(edit.id, {
          name: edit.name.trim(),
          ownerUserId: edit.ownerUserId.trim(),
          strategicInitiativeId: edit.strategicInitiativeId?.trim()
            ? edit.strategicInitiativeId.trim()
            : null,
        });
      }
      return updatePortfolioObjective(edit.id, {
        name: edit.name.trim(),
        statement: (edit.statement ?? "").trim(),
        ownerUserId: edit.ownerUserId.trim(),
      });
    },
    onSuccess: async () => {
      setEdit(null);
      setActionError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setActionError(isProjectsApiError(err) ? err.message : "Update failed.");
    },
  });

  return (
    <PageShell
      title="Portfolio Hierarchy Administration"
      description="Create, edit, move, and archive Enterprise Portfolio nodes. Permissions: projects.manage / projects.admin."
      breadcrumbs={["APZ Projects", "Portfolio", "Administration"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(portfolioWorkspacePath())}
        >
          Portfolio Workspace
        </Button>
      }
    >
      {!canManage ? (
        <EmptyState
          title="Permission required"
          description="Portfolio hierarchy administration requires projects.manage or projects.admin."
        />
      ) : (
        <div className="space-y-8" data-testid="portfolio-admin">
          {actionError ? <ErrorState message={actionError} /> : null}

          {edit ? (
            <section
              className="space-y-3 border border-[var(--color-border)] p-4"
              data-testid="portfolio-admin-edit"
            >
              <h2 className="text-sm font-semibold">Edit {edit.kind}</h2>
              <div className="flex flex-wrap items-end gap-2">
                <Input
                  label="Name"
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
                {edit.kind === "objective" ? (
                  <Input
                    label="Statement"
                    value={edit.statement ?? ""}
                    onChange={(e) => setEdit({ ...edit, statement: e.target.value })}
                  />
                ) : null}
                <EnterpriseIdentityPicker
                  label={edit.kind === "initiative" ? "Sponsor" : "Owner"}
                  value={edit.ownerUserId}
                  onChange={(next) => setEdit({ ...edit, ownerUserId: next })}
                  required
                />
                {edit.kind === "programme" ? (
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Initiative</span>
                    <select
                      className="h-9 border border-[var(--color-border)] bg-transparent px-2"
                      value={edit.strategicInitiativeId ?? ""}
                      onChange={(e) =>
                        setEdit({
                          ...edit,
                          strategicInitiativeId: e.target.value,
                        })
                      }
                    >
                      <option value="">None</option>
                      {(initiatives.data ?? []).map((row) => (
                        <option key={String(row.id)} value={String(row.id)}>
                          {String(row.name)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    !edit.name.trim() || !edit.ownerUserId.trim() || saveEdit.isPending
                  }
                  onClick={() => saveEdit.mutate()}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEdit(null)}
                >
                  Cancel
                </Button>
              </div>
            </section>
          ) : null}

          <section className="space-y-3" data-testid="portfolio-admin-initiatives">
            <h2 className="text-sm font-semibold">Strategic Initiatives</h2>
            <div className="flex flex-wrap items-end gap-2">
              <Input
                label="Name"
                value={iniName}
                onChange={(e) => setIniName(e.target.value)}
              />
              <EnterpriseIdentityPicker
                label="Sponsor"
                value={iniSponsor}
                onChange={setIniSponsor}
                required
              />
              <Button
                type="button"
                size="sm"
                disabled={!iniName.trim() || !iniSponsor.trim() || createIni.isPending}
                onClick={() => createIni.mutate()}
              >
                Create initiative
              </Button>
            </div>
            {initiatives.isLoading ? <LoadingState label="Loading…" /> : null}
            <ul className="text-sm">
              {(initiatives.data ?? []).map((row) => (
                <li
                  key={String(row.id)}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] py-2"
                >
                  <span>
                    {String(row.name)} · {String(row.status)}
                  </span>
                  <span className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          kind: "initiative",
                          id: String(row.id),
                          name: String(row.name ?? ""),
                          ownerUserId: String(row.sponsorUserId ?? ""),
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void archivePortfolioInitiative(String(row.id)).then(invalidate)
                      }
                    >
                      Archive
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3" data-testid="portfolio-admin-programmes">
            <h2 className="text-sm font-semibold">Programmes</h2>
            <div className="flex flex-wrap items-end gap-2">
              <Input
                label="Name"
                value={prgName}
                onChange={(e) => setPrgName(e.target.value)}
              />
              <EnterpriseIdentityPicker
                label="Owner"
                value={prgOwner}
                onChange={setPrgOwner}
                required
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Initiative</span>
                <select
                  className="h-9 border border-[var(--color-border)] bg-transparent px-2"
                  value={prgInitiativeId}
                  onChange={(e) => setPrgInitiativeId(e.target.value)}
                >
                  <option value="">None</option>
                  {(initiatives.data ?? []).map((row) => (
                    <option key={String(row.id)} value={String(row.id)}>
                      {String(row.name)}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                size="sm"
                disabled={!prgName.trim() || !prgOwner.trim() || createPrg.isPending}
                onClick={() => createPrg.mutate()}
              >
                Create programme
              </Button>
            </div>
            {programmes.isLoading ? <LoadingState label="Loading…" /> : null}
            <ul className="text-sm">
              {(programmes.data ?? []).map((row) => (
                <li
                  key={String(row.id)}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] py-2"
                >
                  <span>
                    {String(row.name)} · members{" "}
                    {Array.isArray(row.memberProjectIds)
                      ? row.memberProjectIds.length
                      : 0}
                  </span>
                  <span className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          kind: "programme",
                          id: String(row.id),
                          name: String(row.name ?? ""),
                          ownerUserId: String(row.ownerUserId ?? ""),
                          strategicInitiativeId: String(
                            row.strategicInitiativeId ?? "",
                          ),
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void archivePortfolioProgramme(String(row.id)).then(invalidate)
                      }
                    >
                      Archive
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3" data-testid="portfolio-admin-objectives">
            <h2 className="text-sm font-semibold">Strategic Objectives</h2>
            <div className="flex flex-wrap items-end gap-2">
              <Input
                label="Name"
                value={objName}
                onChange={(e) => setObjName(e.target.value)}
              />
              <Input
                label="Statement"
                value={objStatement}
                onChange={(e) => setObjStatement(e.target.value)}
              />
              <EnterpriseIdentityPicker
                label="Owner"
                value={objOwner}
                onChange={setObjOwner}
                required
              />
              <Button
                type="button"
                size="sm"
                disabled={
                  !objName.trim() ||
                  !objStatement.trim() ||
                  !objOwner.trim() ||
                  createObj.isPending
                }
                onClick={() => createObj.mutate()}
              >
                Create objective
              </Button>
            </div>
            {objectives.isLoading ? <LoadingState label="Loading…" /> : null}
            <ul className="text-sm">
              {(objectives.data ?? []).map((row) => (
                <li
                  key={String(row.id)}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] py-2"
                >
                  <span>
                    {String(row.name)} · {String(row.status)} · {String(row.progress)}%
                  </span>
                  <span className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          kind: "objective",
                          id: String(row.id),
                          name: String(row.name ?? ""),
                          ownerUserId: String(row.ownerUserId ?? ""),
                          statement: String(row.statement ?? ""),
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void archivePortfolioObjective(String(row.id)).then(invalidate)
                      }
                    >
                      Archive
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3" data-testid="portfolio-admin-move">
            <h2 className="text-sm font-semibold">Move project membership</h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Moving a project between programmes preserves operational history on the
              project. Programme movement under Initiative is via Edit.
            </p>
            <div className="flex flex-wrap items-end gap-2">
              <Input
                label="Project id"
                value={moveProjectId}
                onChange={(e) => setMoveProjectId(e.target.value)}
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">To programme</span>
                <select
                  className="h-9 border border-[var(--color-border)] bg-transparent px-2"
                  value={moveProgrammeId}
                  onChange={(e) => setMoveProgrammeId(e.target.value)}
                >
                  <option value="">Unassign</option>
                  {(programmes.data ?? []).map((row) => (
                    <option key={String(row.id)} value={String(row.id)}>
                      {String(row.name)}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                size="sm"
                disabled={!moveProjectId.trim() || move.isPending}
                onClick={() => move.mutate()}
              >
                Move
              </Button>
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
