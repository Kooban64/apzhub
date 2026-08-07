"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  getProject,
  getProjectLifecycle,
  initiateProject,
  listGovernanceProfiles,
  listProjectLifecycleTemplates,
  listWorkspaces,
  patchProjectLifecycle,
  transitionProjectLifecycle,
  updateProject,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { projectDetailPath, projectsListPath } from "@/lib/projects/routes";

import {
  EnterpriseIdentityMultiPicker,
  EnterpriseIdentityPicker,
} from "./enterprise-identity-picker";
import { ErrorState, LoadingState, PageShell } from "./projects-ui";

const STAGES = [
  { id: 1, label: "Identity" },
  { id: 2, label: "Delivery Model" },
  { id: 3, label: "Classification" },
  { id: 4, label: "Governance Profile" },
  { id: 5, label: "Template" },
  { id: 6, label: "Initial Baseline" },
  { id: 7, label: "Team & Accountability" },
  { id: 8, label: "Review & Create" },
] as const;

const DELIVERY_MODELS = [
  { value: "product_delivery", label: "Product Delivery" },
  { value: "project_delivery", label: "Project Delivery" },
  { value: "programme_delivery", label: "Programme Delivery" },
  { value: "operational_initiative", label: "Operational Initiative" },
  { value: "governance_initiative", label: "Governance Initiative" },
] as const;

const CLASSIFICATIONS = [
  { value: "strategic", label: "Strategic" },
  { value: "operational", label: "Operational" },
  { value: "regulatory", label: "Regulatory" },
  { value: "customer", label: "Customer" },
  { value: "internal", label: "Internal" },
  { value: "innovation", label: "Innovation" },
] as const;

const EXECUTION = [
  { value: "agile", label: "Agile" },
  { value: "scrum", label: "Scrum" },
  { value: "kanban", label: "Kanban" },
  { value: "waterfall", label: "Waterfall" },
  { value: "hybrid", label: "Hybrid" },
  { value: "unspecified", label: "Unspecified" },
] as const;

type WizardState = {
  workspaceId: string;
  name: string;
  identifier: string;
  description: string;
  deliveryModel: string;
  executionCharacteristic: string;
  classification: string;
  governanceProfileId: string;
  templateId: string;
  targetEndAt: string;
  successCriteria: string;
  nextMilestoneIntent: string;
  continuousDeliveryWaiver: boolean;
  milestoneFreeWaiver: boolean;
  ownerUserId: string;
  operationalRoleId: string;
  deliveryTeamId: string;
  coreTeamUserIds: string;
  customerLabel: string;
  programmeId: string;
};

const EMPTY: WizardState = {
  workspaceId: "",
  name: "",
  identifier: "",
  description: "",
  deliveryModel: "",
  executionCharacteristic: "unspecified",
  classification: "",
  governanceProfileId: "",
  templateId: "",
  targetEndAt: "",
  successCriteria: "",
  nextMilestoneIntent: "",
  continuousDeliveryWaiver: false,
  milestoneFreeWaiver: false,
  ownerUserId: "",
  operationalRoleId: "",
  deliveryTeamId: "",
  coreTeamUserIds: "",
  customerLabel: "",
  programmeId: "",
};

function fieldClass() {
  return "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2";
}

function validateStage(step: number, state: WizardState): string | null {
  switch (step) {
    case 1:
      if (!state.workspaceId) return "Workspace is required.";
      if (!state.name.trim()) return "Project name is required.";
      if (!state.identifier.trim()) return "Identifier is required.";
      if (!/^[A-Za-z][A-Za-z0-9_-]{1,15}$/.test(state.identifier.trim())) {
        return "Identifier must start with a letter and be 2–16 characters.";
      }
      return null;
    case 2:
      if (!state.deliveryModel) return "Delivery model is required.";
      return null;
    case 3:
      if (!state.classification) return "Classification is mandatory.";
      return null;
    case 4:
      if (!state.governanceProfileId) return "Governance profile is required.";
      return null;
    case 5:
      return null;
    case 6: {
      const continuous =
        state.deliveryModel === "product_delivery" || state.continuousDeliveryWaiver;
      if (!continuous && !state.targetEndAt) {
        return "Target end date is required, or apply a continuous delivery waiver.";
      }
      if (!state.successCriteria.trim()) {
        return "Success criteria are required for the initial baseline.";
      }
      if (!state.nextMilestoneIntent.trim() && !state.milestoneFreeWaiver) {
        return "Next milestone intent is required, or apply a milestone-free waiver.";
      }
      return null;
    }
    case 7:
      if (!state.ownerUserId.trim()) return "Project owner is required.";
      return null;
    case 8:
      return (
        validateStage(1, state) ??
        validateStage(2, state) ??
        validateStage(3, state) ??
        validateStage(4, state) ??
        validateStage(6, state) ??
        validateStage(7, state)
      );
    default:
      return null;
  }
}

function lifecyclePayload(state: WizardState, wizardStep: number) {
  return {
    classification: state.classification || undefined,
    deliveryModel: state.deliveryModel || undefined,
    executionCharacteristic: state.executionCharacteristic || undefined,
    governanceProfileId: state.governanceProfileId || undefined,
    templateId: state.templateId || undefined,
    targetEndAt: state.targetEndAt
      ? new Date(state.targetEndAt).toISOString()
      : undefined,
    successCriteria: state.successCriteria.trim() || undefined,
    nextMilestoneIntent: state.nextMilestoneIntent.trim() || undefined,
    continuousDeliveryWaiver: state.continuousDeliveryWaiver,
    milestoneFreeWaiver: state.milestoneFreeWaiver,
    ownerUserId: state.ownerUserId.trim() || undefined,
    operationalRoleId: state.operationalRoleId.trim() || undefined,
    deliveryTeamId: state.deliveryTeamId.trim() || undefined,
    coreTeamUserIds: state.coreTeamUserIds
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean),
    customerLabel: state.customerLabel.trim() || undefined,
    programmeId: state.programmeId.trim() || undefined,
    wizardStep,
  };
}

export function ProjectInitiateWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resume")?.trim() || "";

  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(EMPTY);
  const [projectId, setProjectId] = useState(resumeId);
  const [stageError, setStageError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!resumeId);

  const workspaces = useQuery({
    queryKey: projectsQueryKeys.workspaces(),
    queryFn: ({ signal }) => listWorkspaces({ signal }),
  });

  const profiles = useQuery({
    queryKey: projectsQueryKeys.lifecycleProfiles(),
    queryFn: ({ signal }) => listGovernanceProfiles({ signal }),
  });

  const templates = useQuery({
    queryKey: projectsQueryKeys.lifecycleTemplates(),
    queryFn: ({ signal }) => listProjectLifecycleTemplates({ signal }),
  });

  const resumeProject = useQuery({
    queryKey: projectsQueryKeys.detail(resumeId),
    queryFn: ({ signal }) => getProject(resumeId, { signal }),
    enabled: Boolean(resumeId),
  });

  const resumeLifecycle = useQuery({
    queryKey: projectsQueryKeys.lifecycle(resumeId),
    queryFn: ({ signal }) => getProjectLifecycle(resumeId, { signal }),
    enabled: Boolean(resumeId),
  });

  useEffect(() => {
    if (!resumeId || hydrated) return;
    if (resumeProject.isError || resumeLifecycle.isError) {
      setHydrated(true);
      setStageError("Unable to resume draft — start a new initiation.");
      return;
    }
    if (!resumeProject.data || !resumeLifecycle.data) return;
    const life = resumeLifecycle.data;
    const project = resumeProject.data;
    setProjectId(project.id);
    setState({
      workspaceId: project.workspaceId ?? "",
      name: project.name,
      identifier: project.identifier,
      description: project.description ?? "",
      deliveryModel: String(life.deliveryModel ?? ""),
      executionCharacteristic: String(life.executionCharacteristic ?? "unspecified"),
      classification: String(life.classification ?? ""),
      governanceProfileId: String(life.governanceProfileId ?? ""),
      templateId: String(life.templateId ?? ""),
      targetEndAt: life.targetEndAt ? String(life.targetEndAt).slice(0, 10) : "",
      successCriteria: String(life.successCriteria ?? ""),
      nextMilestoneIntent: String(life.nextMilestoneIntent ?? ""),
      continuousDeliveryWaiver: Boolean(life.continuousDeliveryWaiver),
      milestoneFreeWaiver: Boolean(life.milestoneFreeWaiver),
      ownerUserId: String(life.ownerUserId ?? project.leadId ?? ""),
      operationalRoleId: String(
        (life as { operationalRoleId?: string }).operationalRoleId ?? "",
      ),
      deliveryTeamId: String(
        (life as { deliveryTeamId?: string }).deliveryTeamId ?? "",
      ),
      coreTeamUserIds: Array.isArray(life.coreTeamUserIds)
        ? life.coreTeamUserIds.join(", ")
        : "",
      customerLabel: String(life.customerLabel ?? ""),
      programmeId: String(life.programmeId ?? ""),
    });
    const wizardStep = Number(life.wizardStep ?? 1);
    setStep(
      Number.isFinite(wizardStep) && wizardStep >= 1 && wizardStep <= 8
        ? wizardStep
        : 1,
    );
    setHydrated(true);
    setBanner("Resumed draft initiation. Continue from where you left off.");
  }, [
    resumeId,
    hydrated,
    resumeProject.data,
    resumeProject.isError,
    resumeLifecycle.data,
    resumeLifecycle.isError,
  ]);

  const filteredTemplates = useMemo(() => {
    const items = templates.data ?? [];
    if (!state.deliveryModel) return items;
    return items.filter(
      (t) =>
        !t.deliveryModel ||
        t.deliveryModel === state.deliveryModel ||
        t.key === "blank",
    );
  }, [templates.data, state.deliveryModel]);

  const filteredProfiles = useMemo(() => {
    const items = profiles.data ?? [];
    return items.filter((p) => {
      const models = p.allowedDeliveryModels as readonly string[] | undefined;
      const classes = p.allowedClassifications as readonly string[] | undefined;
      if (
        state.deliveryModel &&
        models?.length &&
        !models.includes(state.deliveryModel)
      ) {
        return false;
      }
      if (
        state.classification &&
        classes?.length &&
        !classes.includes(state.classification)
      ) {
        return false;
      }
      return true;
    });
  }, [profiles.data, state.deliveryModel, state.classification]);

  const persistDraft = useMutation({
    mutationFn: async (nextStep: number) => {
      const payload = lifecyclePayload(state, nextStep);
      if (!projectId) {
        const created = await initiateProject({
          workspaceId: state.workspaceId,
          name: state.name.trim(),
          identifier: state.identifier.trim(),
          description: state.description.trim() || undefined,
          ...payload,
          startMode: "draft",
        });
        setProjectId(created.project.id);
        await patchProjectLifecycle(created.project.id, payload);
        return created.project.id;
      }
      await updateProject(projectId, {
        name: state.name.trim(),
        description: state.description.trim() || undefined,
        leadId: state.ownerUserId.trim() || undefined,
      });
      await patchProjectLifecycle(projectId, payload);
      return projectId;
    },
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      const payload = lifecyclePayload(state, 8);
      const id = projectId;
      if (!id) {
        const created = await initiateProject({
          workspaceId: state.workspaceId,
          name: state.name.trim(),
          identifier: state.identifier.trim(),
          description: state.description.trim() || undefined,
          ...payload,
          startMode: "initiating",
        });
        return created.project.id;
      }
      await updateProject(id, {
        name: state.name.trim(),
        description: state.description.trim() || undefined,
        leadId: state.ownerUserId.trim() || undefined,
      });
      await patchProjectLifecycle(id, payload);
      const life = await getProjectLifecycle(id);
      if (life.stage === "draft") {
        await transitionProjectLifecycle(id, { to: "initiating" });
      }
      return id;
    },
    onSuccess: (id) => {
      router.push(projectDetailPath(id));
    },
  });

  const setField = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setStageError(null);
  };

  const goNext = async () => {
    const error = validateStage(step, state);
    if (error) {
      setStageError(error);
      return;
    }
    try {
      await persistDraft.mutateAsync(Math.min(step + 1, 8));
      setBanner("Draft saved.");
      setStep((s) => Math.min(s + 1, 8));
    } catch (err) {
      setStageError(isProjectsApiError(err) ? err.message : "Unable to save draft.");
    }
  };

  const saveOnly = async () => {
    const error = validateStage(1, state);
    if (error) {
      setStageError(error);
      return;
    }
    try {
      const id = await persistDraft.mutateAsync(step);
      setBanner(`Draft saved. Resume later from Create Project (resume=${id}).`);
      router.replace(`/workspace/projects/new?resume=${encodeURIComponent(id)}`);
    } catch (err) {
      setStageError(isProjectsApiError(err) ? err.message : "Unable to save draft.");
    }
  };

  const loadingResume =
    Boolean(resumeId) &&
    !hydrated &&
    (resumeProject.isLoading || resumeLifecycle.isLoading);

  return (
    <PageShell
      title="Initiate project"
      description="Eight-stage Project Lifecycle wizard. Drafts can be saved and resumed."
      breadcrumbs={["APZ Projects", "Initiate project"]}
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
      {loadingResume ? <LoadingState label="Resuming draft…" /> : null}
      {workspaces.isLoading || profiles.isLoading || templates.isLoading ? (
        <LoadingState label="Loading catalogues…" />
      ) : null}

      <ol
        className="flex flex-wrap gap-2"
        data-testid="projects-initiate-steps"
        aria-label="Wizard stages"
      >
        {STAGES.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={`rounded-md border px-2 py-1 text-xs ${
                step === s.id
                  ? "border-[var(--color-foreground)] font-semibold"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
              }`}
              onClick={() => {
                if (s.id < step) setStep(s.id);
              }}
              data-testid={`projects-initiate-step-${s.id}`}
              aria-current={step === s.id ? "step" : undefined}
            >
              {s.id}. {s.label}
            </button>
          </li>
        ))}
      </ol>

      {banner ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="status">
          {banner}
        </p>
      ) : null}
      {stageError ? <ErrorState message={stageError} /> : null}
      {finishMutation.isError ? (
        <ErrorState
          message={
            isProjectsApiError(finishMutation.error)
              ? finishMutation.error.message
              : "Unable to start initiation."
          }
        />
      ) : null}

      <div
        className="flex max-w-2xl flex-col gap-4 rounded-lg border border-[var(--color-border)] p-4"
        data-testid="projects-initiate-wizard"
      >
        <h2 className="text-sm font-semibold">
          Stage {step}: {STAGES[step - 1]?.label}
        </h2>

        {step === 1 ? (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Workspace</span>
              <select
                className={fieldClass()}
                value={state.workspaceId}
                onChange={(e) => setField("workspaceId", e.target.value)}
                required
                data-testid="projects-create-workspace"
              >
                <option value="">Select workspace</option>
                {(workspaces.data?.items ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Name"
              value={state.name}
              onChange={(e) => setField("name", e.target.value)}
              required
              data-testid="projects-create-name"
            />
            <Input
              label="Identifier"
              value={state.identifier}
              onChange={(e) => setField("identifier", e.target.value)}
              required
              data-testid="projects-create-identifier"
              disabled={Boolean(projectId)}
            />
            <Input
              label="Description"
              value={state.description}
              onChange={(e) => setField("description", e.target.value)}
              data-testid="projects-create-description"
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Delivery model</span>
              <select
                className={fieldClass()}
                value={state.deliveryModel}
                onChange={(e) => setField("deliveryModel", e.target.value)}
                data-testid="projects-initiate-delivery-model"
              >
                <option value="">Select model</option>
                {DELIVERY_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Execution characteristic</span>
              <select
                className={fieldClass()}
                value={state.executionCharacteristic}
                onChange={(e) => setField("executionCharacteristic", e.target.value)}
                data-testid="projects-initiate-execution"
              >
                {EXECUTION.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {step === 3 ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Project classification</span>
            <select
              className={fieldClass()}
              value={state.classification}
              onChange={(e) => setField("classification", e.target.value)}
              data-testid="projects-initiate-classification"
            >
              <option value="">Select classification</option>
              {CLASSIFICATIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {step === 4 ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Governance profile</span>
            <select
              className={fieldClass()}
              value={state.governanceProfileId}
              onChange={(e) => setField("governanceProfileId", e.target.value)}
              data-testid="projects-initiate-governance"
            >
              <option value="">Select profile</option>
              {filteredProfiles.map((p) => (
                <option key={String(p.id)} value={String(p.id)}>
                  {String(p.name)} (v{String(p.version)})
                </option>
              ))}
            </select>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Profile is snapshotted at creation. Later catalogue changes do not alter
              this project.
            </span>
          </label>
        ) : null}

        {step === 5 ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Template</span>
            <select
              className={fieldClass()}
              value={state.templateId}
              onChange={(e) => setField("templateId", e.target.value)}
              data-testid="projects-initiate-template"
            >
              <option value="">Blank (no seed)</option>
              {filteredTemplates.map((t) => (
                <option key={String(t.id)} value={String(t.id)}>
                  {String(t.name)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {step === 6 ? (
          <>
            <Input
              label="Target end date"
              type="date"
              value={state.targetEndAt}
              onChange={(e) => setField("targetEndAt", e.target.value)}
              data-testid="projects-initiate-target-end"
            />
            <Input
              label="Success criteria"
              value={state.successCriteria}
              onChange={(e) => setField("successCriteria", e.target.value)}
              data-testid="projects-initiate-success"
            />
            <Input
              label="Next milestone intent"
              value={state.nextMilestoneIntent}
              onChange={(e) => setField("nextMilestoneIntent", e.target.value)}
              data-testid="projects-initiate-milestone-intent"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.continuousDeliveryWaiver}
                onChange={(e) => setField("continuousDeliveryWaiver", e.target.checked)}
                data-testid="projects-initiate-continuous-waiver"
              />
              Continuous delivery waiver (no fixed end date)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.milestoneFreeWaiver}
                onChange={(e) => setField("milestoneFreeWaiver", e.target.checked)}
                data-testid="projects-initiate-milestone-waiver"
              />
              Milestone-free waiver
            </label>
          </>
        ) : null}

        {step === 7 ? (
          <>
            <EnterpriseIdentityPicker
              label="Project owner"
              value={state.ownerUserId}
              onChange={(next) => setField("ownerUserId", next)}
              required
              testId="projects-initiate-owner"
            />
            <EnterpriseIdentityPicker
              kind="role"
              label="Operational role"
              value={state.operationalRoleId}
              onChange={(next) => setField("operationalRoleId", next)}
              testId="projects-initiate-role"
            />
            <EnterpriseIdentityPicker
              kind="team"
              label="Primary delivery team"
              value={state.deliveryTeamId}
              onChange={(next) => setField("deliveryTeamId", next)}
              testId="projects-initiate-delivery-team"
            />
            <EnterpriseIdentityMultiPicker
              label="Core team members"
              value={state.coreTeamUserIds}
              onChange={(next) => setField("coreTeamUserIds", next)}
              testId="projects-initiate-team"
            />
            <Input
              label="Customer label (optional)"
              value={state.customerLabel}
              onChange={(e) => setField("customerLabel", e.target.value)}
            />
            <Input
              label="Programme ID (optional)"
              value={state.programmeId}
              onChange={(e) => setField("programmeId", e.target.value)}
            />
          </>
        ) : null}

        {step === 8 ? (
          <dl
            className="grid gap-2 text-sm md:grid-cols-2"
            data-testid="projects-initiate-review"
          >
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Name
              </dt>
              <dd>{state.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Identifier
              </dt>
              <dd>{state.identifier}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Delivery model
              </dt>
              <dd>{state.deliveryModel}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Classification
              </dt>
              <dd>{state.classification}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Governance profile
              </dt>
              <dd>{state.governanceProfileId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Template
              </dt>
              <dd>{state.templateId || "Blank"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Owner
              </dt>
              <dd>{state.ownerUserId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Target end
              </dt>
              <dd>{state.targetEndAt || "Continuous / waived"}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Success criteria
              </dt>
              <dd>{state.successCriteria}</dd>
            </div>
          </dl>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={step === 1 || persistDraft.isPending}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            data-testid="projects-initiate-back"
          >
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={persistDraft.isPending}
            onClick={() => void saveOnly()}
            data-testid="projects-initiate-save-draft"
          >
            {persistDraft.isPending ? "Saving…" : "Save draft"}
          </Button>
          {step < 8 ? (
            <Button
              type="button"
              size="sm"
              disabled={persistDraft.isPending}
              onClick={() => void goNext()}
              data-testid="projects-create-submit"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={finishMutation.isPending}
              onClick={() => {
                const error = validateStage(8, state);
                if (error) {
                  setStageError(error);
                  return;
                }
                finishMutation.mutate();
              }}
              data-testid="projects-initiate-start"
            >
              {finishMutation.isPending ? "Starting…" : "Start Initiating"}
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
