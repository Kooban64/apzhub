"use client";

import type { QepRelationshipDto, QepRelationshipTaxonomyDto } from "@apzhub/qep-contracts";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  activateRelationship,
  createRelationship,
  deprecateRelationship,
  getRelationship,
  listContentVersions,
  listRelationshipTaxonomy,
  listRelationships,
  listRelationshipsByRequirement,
  retireRelationship,
  searchRequirements,
  supersedeRelationship,
  updateRelationshipClassification,
  updateRelationshipCriticality,
  updateRelationshipRationale,
  updateRelationshipScope,
  updateRelationshipStrength,
  type CreateQepRelationshipClientInput,
  type QepRelationshipListParams,
  type SupersedeQepRelationshipClientInput,
} from "@/lib/qep/qep-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import { emitQepWorkbenchTelemetry } from "@/lib/qep/telemetry";
import {
  QEP_REQUIREMENTS_ROUTES,
  isQepRelationshipsNewRoute,
  isQepRelationshipsSupersedeRoute,
  parseQepRelationshipRouteId,
} from "@apzhub/qep-requirements/presentation";

import {
  QepEmptyState,
  QepErrorState,
  QepFilterBar,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

function formatDate(value?: string): string {
  return value ? value : "—";
}

function isImmutableLifecycle(state: string): boolean {
  return state === "retired" || state === "deprecated";
}

function hasRevisionConflict(error: unknown): boolean {
  return error instanceof Error && /revision/i.test(error.message);
}

function endpointLabel(endpoint: QepRelationshipDto["source"]): string {
  if (endpoint.contentVersionId) {
    return `${endpoint.requirementId} (CV ${endpoint.contentVersionId})`;
  }
  return endpoint.requirementId;
}

function RationaleIndicator({ rationale }: { readonly rationale?: string }) {
  if (!rationale) {
    return <span className="text-xs text-[var(--color-muted-foreground)]">No rationale</span>;
  }
  return (
    <span
      className="inline-flex rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs"
      title={rationale}
      data-testid="qep-relationships-rationale-indicator"
    >
      Rationale provided
    </span>
  );
}

/** APZQEP-ENG-020F Part 3 — Requirements Relationships list (Relationship Explorer). */
export function QepRelationshipsListView() {
  const [type, setType] = useState<string>("");
  const [lifecycleState, setLifecycleState] = useState<QepRelationshipListParams["lifecycleState"]>(
    undefined,
  );
  const [conflictsOnly, setConflictsOnly] = useState(false);
  const startedAt = useMemo(() => Date.now(), []);

  const taxonomyQuery = useQuery({
    queryKey: qepQueryKeys.relationships.taxonomy(),
    queryFn: ({ signal }) => listRelationshipTaxonomy({ signal }),
  });

  const query = useQuery({
    queryKey: qepQueryKeys.relationships.list({ type, lifecycleState, conflictsOnly }),
    queryFn: ({ signal }) =>
      listRelationships(
        {
          type: type || undefined,
          lifecycleState,
          conflictsOnly: conflictsOnly || undefined,
          limit: 50,
        },
        { signal },
      ),
  });

  useEffect(() => {
    if (query.isSuccess) {
      emitQepWorkbenchTelemetry({
        event: "relationships.list.load",
        outcome: "success",
        durationMs: Date.now() - startedAt,
      });
    } else if (query.isError) {
      emitQepWorkbenchTelemetry({
        event: "relationships.list.load",
        outcome: "error",
        durationMs: Date.now() - startedAt,
      });
    }
  }, [query.isSuccess, query.isError, startedAt]);

  return (
    <QepPageShell
      title="Requirement Relationships"
      description="Explore governed semantic links between requirements — list-first, no graph visualisation."
      breadcrumbs={["Requirements", "Relationships"]}
      actions={
        <>
          <Link
            href={QEP_REQUIREMENTS_ROUTES.relationships.supersede}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
            data-testid="qep-relationships-supersede-link"
          >
            Supersede
          </Link>
          <Link
            href={QEP_REQUIREMENTS_ROUTES.relationships.new}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm font-medium"
            data-testid="qep-relationships-create"
          >
            New relationship
          </Link>
        </>
      }
    >
      <QepFilterBar>
        <label className="text-sm">
          Type{" "}
          <select
            data-testid="qep-relationships-type-filter"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">All</option>
            {taxonomyQuery.data?.map((entry) => (
              <option key={entry.type} value={entry.type}>
                {entry.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Lifecycle{" "}
          <select
            data-testid="qep-relationships-lifecycle-filter"
            value={lifecycleState ?? ""}
            onChange={(event) =>
              setLifecycleState(
                (event.target.value || undefined) as QepRelationshipListParams["lifecycleState"],
              )
            }
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="deprecated">Deprecated</option>
            <option value="retired">Retired</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={conflictsOnly}
            onChange={(event) => setConflictsOnly(event.target.checked)}
            data-testid="qep-relationships-conflicts-filter"
          />
          Conflicts only
        </label>
      </QepFilterBar>
      {query.isLoading ? <QepLoadingState label="Loading relationships…" /> : null}
      {query.isError ? (
        <QepErrorState
          message={
            query.error instanceof Error ? query.error.message : "Unable to load relationships"
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && query.data.items.length === 0 ? (
        <QepEmptyState title="No requirement relationships found" />
      ) : null}
      {query.isSuccess && query.data.items.length > 0 ? (
        <QepTable
          caption="Requirement relationships"
          columns={[
            "Type",
            "Source",
            "Target",
            "Lifecycle",
            "Strength",
            "Criticality",
            "Scope",
            "Rationale",
            "",
          ]}
          rows={query.data.items.map((relationship) => ({
            id: relationship.id,
            cells: [
              relationship.type,
              endpointLabel(relationship.source),
              endpointLabel(relationship.target),
              <span key="lifecycle" className="inline-flex items-center gap-1">
                <QepStatusBadge status={relationship.lifecycleState} />
                <span>{relationship.lifecycleState}</span>
              </span>,
              relationship.strength,
              relationship.criticality,
              relationship.scope.kind,
              <RationaleIndicator key="rationale" rationale={relationship.rationale} />,
              <Link
                key="view"
                href={QEP_REQUIREMENTS_ROUTES.relationships.detail(relationship.id)}
                className="text-sm underline"
              >
                View
              </Link>,
            ],
          }))}
        />
      ) : null}
    </QepPageShell>
  );
}

function RequirementSearchPicker({
  label,
  selectedId,
  onSelect,
  testIdPrefix,
}: {
  readonly label: string;
  readonly selectedId: string | null;
  readonly onSelect: (requirementId: string) => void;
  readonly testIdPrefix: string;
}) {
  const [search, setSearch] = useState("");
  const searchQuery = useQuery({
    queryKey: qepQueryKeys.requirements.search({ q: search }),
    queryFn: ({ signal }) => searchRequirements({ q: search }, { signal }),
    enabled: search.trim().length > 0,
  });

  return (
    <div>
      <Input
        label={label}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        data-testid={`${testIdPrefix}-search`}
      />
      {selectedId ? (
        <p className="mt-1 text-sm">
          Selected: <strong>{selectedId}</strong>{" "}
          <button
            type="button"
            className="underline"
            onClick={() => onSelect("")}
            data-testid={`${testIdPrefix}-clear`}
          >
            Clear
          </button>
        </p>
      ) : null}
      {searchQuery.isSuccess && searchQuery.data.items.length > 0 && !selectedId ? (
        <ul className="mt-2 space-y-1 text-sm">
          {searchQuery.data.items.map((requirement) => (
            <li key={requirement.id}>
              <button
                type="button"
                className="underline"
                onClick={() => onSelect(requirement.id)}
                data-testid={`${testIdPrefix}-pick-${requirement.id}`}
              >
                {requirement.key} — {requirement.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function OptionalContentVersionPin({
  requirementId,
  value,
  onChange,
  testId,
}: {
  readonly requirementId: string | null;
  readonly value: string;
  readonly onChange: (contentVersionId: string) => void;
  readonly testId: string;
}) {
  const versionsQuery = useQuery({
    queryKey: qepQueryKeys.requirements.versions(requirementId ?? ""),
    queryFn: ({ signal }) =>
      listContentVersions(requirementId ?? "", { limit: 50 }, { signal }),
    enabled: Boolean(requirementId),
  });

  if (!requirementId) {
    return null;
  }

  return (
    <label className="block text-sm">
      Optional content version pin
      <select
        className="ml-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
      >
        <option value="">Requirement-level (no pin)</option>
        {versionsQuery.data?.items.map((version) => (
          <option key={version.id} value={version.id}>
            Version {version.versionNumber} · {version.changeReason}
          </option>
        ))}
      </select>
    </label>
  );
}

function TaxonomyRationaleHint({ taxonomy }: { readonly taxonomy?: QepRelationshipTaxonomyDto }) {
  if (!taxonomy) {
    return null;
  }
  return (
    <p
      className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-sm text-[var(--color-muted-foreground)]"
      role="note"
      data-testid="qep-relationships-rationale-policy"
    >
      Rationale policy for <strong>{taxonomy.displayName}</strong>: {taxonomy.rationalePolicy}
    </p>
  );
}

/** Guided create-relationship form. */
export function QepRelationshipCreateView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledSource = searchParams.get("source");

  const [sourceRequirementId, setSourceRequirementId] = useState<string | null>(
    prefilledSource,
  );
  const [targetRequirementId, setTargetRequirementId] = useState<string | null>(null);
  const [sourceContentVersionId, setSourceContentVersionId] = useState("");
  const [targetContentVersionId, setTargetContentVersionId] = useState("");
  const [type, setType] = useState("");
  const [strength, setStrength] = useState("recommended");
  const [criticality, setCriticality] = useState("medium");
  const [classification, setClassification] = useState("structural");
  const [scopeKind, setScopeKind] = useState("product");
  const [scopeReferenceId, setScopeReferenceId] = useState("");
  const [rationale, setRationale] = useState("");

  const taxonomyQuery = useQuery({
    queryKey: qepQueryKeys.relationships.taxonomy(),
    queryFn: ({ signal }) => listRelationshipTaxonomy({ signal }),
  });

  const selectedTaxonomy = taxonomyQuery.data?.find((entry) => entry.type === type);

  const mutation = useMutation({
    mutationFn: (input: CreateQepRelationshipClientInput) => createRelationship(input),
    onSuccess: (created) => {
      emitQepWorkbenchTelemetry({ event: "relationships.create", outcome: "success" });
      router.push(QEP_REQUIREMENTS_ROUTES.relationships.detail(created.id));
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.create", outcome: "error" });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceRequirementId || !targetRequirementId || !type) {
      return;
    }
    const source = {
      mode: sourceContentVersionId ? ("content_version_pinned" as const) : ("requirement" as const),
      requirementId: sourceRequirementId,
      ...(sourceContentVersionId ? { contentVersionId: sourceContentVersionId } : {}),
    };
    const target = {
      mode: targetContentVersionId ? ("content_version_pinned" as const) : ("requirement" as const),
      requirementId: targetRequirementId,
      ...(targetContentVersionId ? { contentVersionId: targetContentVersionId } : {}),
    };
    mutation.mutate({
      type,
      source,
      target,
      strength,
      criticality,
      classification,
      scope: {
        kind: scopeKind,
        ...(scopeReferenceId.trim() ? { referenceId: scopeReferenceId.trim() } : {}),
      },
      ...(rationale.trim() ? { rationale: rationale.trim() } : {}),
    });
  }

  return (
    <QepPageShell
      title="New requirement relationship"
      description="Create a governed semantic link between two requirements."
      breadcrumbs={["Requirements", "Relationships", "New"]}
    >
      <QepPanel title="Relationship">
        <TaxonomyRationaleHint taxonomy={selectedTaxonomy} />
        {mutation.isError ? (
          <div aria-live="polite">
            <QepErrorState
              message={
                mutation.error instanceof Error ? mutation.error.message : "Create failed"
              }
            />
          </div>
        ) : null}
        <form
          className="mt-4 flex max-w-2xl flex-col gap-4"
          onSubmit={handleSubmit}
          data-testid="qep-relationships-create-form"
        >
          <RequirementSearchPicker
            label="Source requirement"
            selectedId={sourceRequirementId}
            onSelect={(id) => {
              setSourceRequirementId(id || null);
              setSourceContentVersionId("");
            }}
            testIdPrefix="qep-relationships-source"
          />
          <OptionalContentVersionPin
            requirementId={sourceRequirementId}
            value={sourceContentVersionId}
            onChange={setSourceContentVersionId}
            testId="qep-relationships-source-cv"
          />
          <label className="text-sm">
            Relationship type
            <select
              className="ml-2 block w-full max-w-md"
              value={type}
              onChange={(event) => setType(event.target.value)}
              required
              data-testid="qep-relationships-type"
            >
              <option value="">Select type…</option>
              {taxonomyQuery.data?.map((entry) => (
                <option key={entry.type} value={entry.type}>
                  {entry.displayName}
                </option>
              ))}
            </select>
          </label>
          <RequirementSearchPicker
            label="Target requirement"
            selectedId={targetRequirementId}
            onSelect={(id) => {
              setTargetRequirementId(id || null);
              setTargetContentVersionId("");
            }}
            testIdPrefix="qep-relationships-target"
          />
          <OptionalContentVersionPin
            requirementId={targetRequirementId}
            value={targetContentVersionId}
            onChange={setTargetContentVersionId}
            testId="qep-relationships-target-cv"
          />
          <label className="text-sm">
            Strength
            <select
              className="ml-2"
              value={strength}
              onChange={(event) => setStrength(event.target.value)}
              data-testid="qep-relationships-strength"
            >
              <option value="mandatory">Mandatory</option>
              <option value="recommended">Recommended</option>
              <option value="informational">Informational</option>
            </select>
          </label>
          <label className="text-sm">
            Criticality
            <select
              className="ml-2"
              value={criticality}
              onChange={(event) => setCriticality(event.target.value)}
              data-testid="qep-relationships-criticality"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="text-sm">
            Classification
            <select
              className="ml-2"
              value={classification}
              onChange={(event) => setClassification(event.target.value)}
              data-testid="qep-relationships-classification"
            >
              <option value="structural">Structural</option>
              <option value="behavioural">Behavioural</option>
              <option value="business">Business</option>
              <option value="regulatory">Regulatory</option>
              <option value="security">Security</option>
            </select>
          </label>
          <label className="text-sm">
            Scope kind
            <select
              className="ml-2"
              value={scopeKind}
              onChange={(event) => setScopeKind(event.target.value)}
              data-testid="qep-relationships-scope-kind"
            >
              <option value="product">Product</option>
              <option value="project">Project</option>
              <option value="release">Release</option>
              <option value="baseline">Baseline</option>
            </select>
          </label>
          <Input
            label="Scope reference (optional)"
            value={scopeReferenceId}
            onChange={(event) => setScopeReferenceId(event.target.value)}
            data-testid="qep-relationships-scope-ref"
          />
          <Input
            label="Rationale (optional)"
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            data-testid="qep-relationships-rationale"
          />
          <Button
            type="submit"
            disabled={
              mutation.isPending || !sourceRequirementId || !targetRequirementId || !type
            }
            data-testid="qep-relationships-create-submit"
          >
            {mutation.isPending ? "Creating…" : "Create relationship"}
          </Button>
        </form>
      </QepPanel>
    </QepPageShell>
  );
}

function LifecycleConfirmDialog({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
  isSubmitting,
  testIdConfirm,
}: {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly isSubmitting: boolean;
  readonly testIdConfirm: string;
}) {
  return (
    <QepPanel title={title}>
      <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">{message}</p>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isSubmitting}
          onClick={onConfirm}
          data-testid={testIdConfirm}
        >
          {confirmLabel}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </QepPanel>
  );
}

/** Multi-pane relationship detail view. */
export function QepRelationshipDetailView({ relationshipId }: { readonly relationshipId: string }) {
  const queryClient = useQueryClient();
  const [pendingLifecycle, setPendingLifecycle] = useState<null | "activate" | "deprecate" | "retire">(
    null,
  );
  const [editingField, setEditingField] = useState<
    null | "rationale" | "strength" | "criticality" | "classification" | "scope"
  >(null);
  const [editRationale, setEditRationale] = useState("");
  const [editStrength, setEditStrength] = useState("recommended");
  const [editCriticality, setEditCriticality] = useState("medium");
  const [editClassification, setEditClassification] = useState("structural");
  const [editScopeKind, setEditScopeKind] = useState("product");
  const [editScopeRef, setEditScopeRef] = useState("");
  const startedAt = useMemo(() => Date.now(), []);

  const query = useQuery({
    queryKey: qepQueryKeys.relationships.detail(relationshipId),
    queryFn: ({ signal }) => getRelationship(relationshipId, { signal }),
  });

  useEffect(() => {
    if (query.isSuccess) {
      emitQepWorkbenchTelemetry({
        event: "relationships.detail.load",
        outcome: "success",
        durationMs: Date.now() - startedAt,
      });
    } else if (query.isError) {
      emitQepWorkbenchTelemetry({
        event: "relationships.detail.load",
        outcome: "error",
        durationMs: Date.now() - startedAt,
      });
    }
  }, [query.isSuccess, query.isError, startedAt]);

  function invalidate() {
    void queryClient.invalidateQueries({
      queryKey: qepQueryKeys.relationships.detail(relationshipId),
    });
    void queryClient.invalidateQueries({ queryKey: qepQueryKeys.relationships.all() });
  }

  const activateMutation = useMutation({
    mutationFn: () => activateRelationship(relationshipId),
    onSuccess: () => {
      setPendingLifecycle(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "relationships.activate", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.activate", outcome: "error" });
    },
  });

  const deprecateMutation = useMutation({
    mutationFn: () => deprecateRelationship(relationshipId),
    onSuccess: () => {
      setPendingLifecycle(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "relationships.deprecate", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.deprecate", outcome: "error" });
    },
  });

  const retireMutation = useMutation({
    mutationFn: () => retireRelationship(relationshipId),
    onSuccess: () => {
      setPendingLifecycle(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "relationships.retire", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.retire", outcome: "error" });
    },
  });

  const rationaleMutation = useMutation({
    mutationFn: () => updateRelationshipRationale(relationshipId, editRationale.trim()),
    onSuccess: () => {
      setEditingField(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "error" });
    },
  });

  const strengthMutation = useMutation({
    mutationFn: () => updateRelationshipStrength(relationshipId, editStrength),
    onSuccess: () => {
      setEditingField(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "error" });
    },
  });

  const criticalityMutation = useMutation({
    mutationFn: () => updateRelationshipCriticality(relationshipId, editCriticality),
    onSuccess: () => {
      setEditingField(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "error" });
    },
  });

  const classificationMutation = useMutation({
    mutationFn: () => updateRelationshipClassification(relationshipId, editClassification),
    onSuccess: () => {
      setEditingField(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "error" });
    },
  });

  const scopeMutation = useMutation({
    mutationFn: () =>
      updateRelationshipScope(relationshipId, {
        kind: editScopeKind,
        ...(editScopeRef.trim() ? { referenceId: editScopeRef.trim() } : {}),
      }),
    onSuccess: () => {
      setEditingField(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.update", outcome: "error" });
    },
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading relationship…" />;
  }
  if (query.isError || !query.data) {
    return (
      <QepErrorState
        message={query.error instanceof Error ? query.error.message : "Relationship not found"}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const relationship = query.data;
  const actions = new Set(relationship.availableActions ?? []);
  const immutable = isImmutableLifecycle(relationship.lifecycleState);

  const endpointHasPin = (endpoint: QepRelationshipDto["source"]) =>
    endpoint.mode === "content_version_pinned" || Boolean(endpoint.contentVersionId);

  return (
    <QepPageShell
      title={`Relationship — ${relationship.type}`}
      description={`${endpointLabel(relationship.source)} → ${endpointLabel(relationship.target)}`}
      breadcrumbs={["Requirements", "Relationships", relationship.id]}
    >
      {immutable ? (
        <p
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-sm"
          role="status"
          data-testid="qep-relationships-immutable-banner"
        >
          This relationship is <strong>{relationship.lifecycleState}</strong> and is immutable.
        </p>
      ) : null}
      {endpointHasPin(relationship.source) || endpointHasPin(relationship.target) ? (
        <p
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-sm"
          role="status"
          data-testid="qep-relationships-cv-banner"
        >
          One or both endpoints are pinned to specific content versions.
        </p>
      ) : null}
      {relationship.scope.kind === "baseline" ? (
        <p
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-sm"
          role="status"
          data-testid="qep-relationships-baseline-banner"
        >
          Scope is baseline-bound
          {relationship.scope.referenceId ? `: ${relationship.scope.referenceId}` : ""}.
        </p>
      ) : null}

      <div
        className="grid gap-4 lg:grid-cols-[minmax(200px,1fr)_minmax(0,2fr)_minmax(220px,1fr)]"
        data-testid="qep-relationships-detail-grid"
      >
        <aside aria-label="Relationship context">
          <QepPanel title="Context">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Lifecycle</dt>
                <dd data-testid="qep-relationships-status">
                  <QepStatusBadge status={relationship.lifecycleState} />{" "}
                  <span>{relationship.lifecycleState}</span>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Scope</dt>
                <dd>
                  {relationship.scope.kind}
                  {relationship.scope.referenceId
                    ? ` · ${relationship.scope.referenceId}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Revision</dt>
                <dd>{relationship.revision}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Created</dt>
                <dd>{formatDate(relationship.createdAt)}</dd>
              </div>
            </dl>
          </QepPanel>
        </aside>

        <main aria-label="Relationship summary">
          <QepPanel title="Summary">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Type</dt>
                <dd>{relationship.type}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Source</dt>
                <dd>
                  <Link
                    href={QEP_REQUIREMENTS_ROUTES.detail(relationship.source.requirementId)}
                    className="underline"
                  >
                    {endpointLabel(relationship.source)}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Target</dt>
                <dd>
                  <Link
                    href={QEP_REQUIREMENTS_ROUTES.detail(relationship.target.requirementId)}
                    className="underline"
                  >
                    {endpointLabel(relationship.target)}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Strength</dt>
                <dd>{relationship.strength}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Criticality</dt>
                <dd>{relationship.criticality}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Classification</dt>
                <dd>{relationship.classification}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-[var(--color-muted-foreground)]">Rationale</dt>
                <dd>{relationship.rationale ?? "—"}</dd>
              </div>
            </dl>
          </QepPanel>
        </main>

        <aside aria-label="Relationship inspector">
          <QepPanel title="Inspector">
            <div className="flex flex-col gap-2" data-testid="qep-relationships-actions">
              {actions.has("activate") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingLifecycle("activate")}
                  data-testid="qep-relationships-activate-open"
                >
                  Activate
                </Button>
              ) : null}
              {actions.has("deprecate") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingLifecycle("deprecate")}
                  data-testid="qep-relationships-deprecate-open"
                >
                  Deprecate
                </Button>
              ) : null}
              {actions.has("retire") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingLifecycle("retire")}
                  data-testid="qep-relationships-retire-open"
                >
                  Retire
                </Button>
              ) : null}
              {actions.has("updateRationale") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditRationale(relationship.rationale ?? "");
                    setEditingField("rationale");
                  }}
                  data-testid="qep-relationships-edit-rationale"
                >
                  Edit rationale
                </Button>
              ) : null}
              {actions.has("updateStrength") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditStrength(relationship.strength);
                    setEditingField("strength");
                  }}
                  data-testid="qep-relationships-edit-strength"
                >
                  Edit strength
                </Button>
              ) : null}
              {actions.has("updateCriticality") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditCriticality(relationship.criticality);
                    setEditingField("criticality");
                  }}
                  data-testid="qep-relationships-edit-criticality"
                >
                  Edit criticality
                </Button>
              ) : null}
              {actions.has("updateClassification") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditClassification(relationship.classification);
                    setEditingField("classification");
                  }}
                  data-testid="qep-relationships-edit-classification"
                >
                  Edit classification
                </Button>
              ) : null}
              {actions.has("updateScope") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditScopeKind(relationship.scope.kind);
                    setEditScopeRef(relationship.scope.referenceId ?? "");
                    setEditingField("scope");
                  }}
                  data-testid="qep-relationships-edit-scope"
                >
                  Edit scope
                </Button>
              ) : null}
              {actions.size === 0 ? (
                <p className="text-sm text-[var(--color-muted-foreground)]" role="status">
                  Read-only — no actions available.
                </p>
              ) : null}
            </div>

            {relationship.historySummaries.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-sm font-medium">History</h3>
                <ol
                  className="mt-2 space-y-2 text-xs"
                  data-testid="qep-relationships-history"
                >
                  {relationship.historySummaries.map((entry, index) => (
                    <li
                      key={`${entry.at}-${index}`}
                      className="rounded-md border border-[var(--color-border)] p-2"
                    >
                      <span className="font-medium">{entry.kind}</span> — {entry.summary}
                      <p className="text-[var(--color-muted-foreground)]">
                        {entry.at} · {entry.by}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </QepPanel>
        </aside>
      </div>

      {pendingLifecycle === "activate" ? (
        <LifecycleConfirmDialog
          title="Confirm activation"
          message="Activate this relationship so it becomes effective in traceability and baseline projections."
          confirmLabel={activateMutation.isPending ? "Activating…" : "Activate"}
          onCancel={() => setPendingLifecycle(null)}
          onConfirm={() => activateMutation.mutate()}
          isSubmitting={activateMutation.isPending}
          testIdConfirm="qep-relationships-activate-confirm"
        />
      ) : null}
      {pendingLifecycle === "deprecate" ? (
        <LifecycleConfirmDialog
          title="Confirm deprecation"
          message="Deprecate this relationship. It will remain visible but should no longer be treated as current."
          confirmLabel={deprecateMutation.isPending ? "Deprecating…" : "Deprecate"}
          onCancel={() => setPendingLifecycle(null)}
          onConfirm={() => deprecateMutation.mutate()}
          isSubmitting={deprecateMutation.isPending}
          testIdConfirm="qep-relationships-deprecate-confirm"
        />
      ) : null}
      {pendingLifecycle === "retire" ? (
        <LifecycleConfirmDialog
          title="Confirm retirement"
          message="Retire this relationship permanently. This action cannot be undone."
          confirmLabel={retireMutation.isPending ? "Retiring…" : "Retire"}
          onCancel={() => setPendingLifecycle(null)}
          onConfirm={() => retireMutation.mutate()}
          isSubmitting={retireMutation.isPending}
          testIdConfirm="qep-relationships-retire-confirm"
        />
      ) : null}

      {editingField === "rationale" ? (
        <QepPanel title="Edit rationale">
          {rationaleMutation.isError ? (
            <div aria-live="polite">
              <QepErrorState
                message={
                  hasRevisionConflict(rationaleMutation.error)
                    ? "This relationship was modified elsewhere. Refresh and try again."
                    : rationaleMutation.error instanceof Error
                      ? rationaleMutation.error.message
                      : "Update failed"
                }
              />
            </div>
          ) : null}
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              rationaleMutation.mutate();
            }}
          >
            <Input
              label="Rationale"
              value={editRationale}
              onChange={(event) => setEditRationale(event.target.value)}
              required
              data-testid="qep-relationships-rationale-input"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={rationaleMutation.isPending}>
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingField(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </QepPanel>
      ) : null}

      {editingField === "strength" ? (
        <QepPanel title="Edit strength">
          {strengthMutation.isError ? (
            <div aria-live="polite">
              <QepErrorState
                message={
                  hasRevisionConflict(strengthMutation.error)
                    ? "This relationship was modified elsewhere. Refresh and try again."
                    : strengthMutation.error instanceof Error
                      ? strengthMutation.error.message
                      : "Update failed"
                }
              />
            </div>
          ) : null}
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              strengthMutation.mutate();
            }}
          >
            <label className="text-sm">
              Strength
              <select
                value={editStrength}
                onChange={(event) => setEditStrength(event.target.value)}
                data-testid="qep-relationships-strength-input"
              >
                <option value="mandatory">Mandatory</option>
                <option value="recommended">Recommended</option>
                <option value="informational">Informational</option>
              </select>
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={strengthMutation.isPending}>
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingField(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </QepPanel>
      ) : null}

      {editingField === "criticality" ? (
        <QepPanel title="Edit criticality">
          {criticalityMutation.isError ? (
            <div aria-live="polite">
              <QepErrorState
                message={
                  hasRevisionConflict(criticalityMutation.error)
                    ? "This relationship was modified elsewhere. Refresh and try again."
                    : criticalityMutation.error instanceof Error
                      ? criticalityMutation.error.message
                      : "Update failed"
                }
              />
            </div>
          ) : null}
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              criticalityMutation.mutate();
            }}
          >
            <label className="text-sm">
              Criticality
              <select
                value={editCriticality}
                onChange={(event) => setEditCriticality(event.target.value)}
                data-testid="qep-relationships-criticality-input"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={criticalityMutation.isPending}>
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingField(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </QepPanel>
      ) : null}

      {editingField === "classification" ? (
        <QepPanel title="Edit classification">
          {classificationMutation.isError ? (
            <div aria-live="polite">
              <QepErrorState
                message={
                  hasRevisionConflict(classificationMutation.error)
                    ? "This relationship was modified elsewhere. Refresh and try again."
                    : classificationMutation.error instanceof Error
                      ? classificationMutation.error.message
                      : "Update failed"
                }
              />
            </div>
          ) : null}
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              classificationMutation.mutate();
            }}
          >
            <label className="text-sm">
              Classification
              <select
                value={editClassification}
                onChange={(event) => setEditClassification(event.target.value)}
                data-testid="qep-relationships-classification-input"
              >
                <option value="structural">Structural</option>
                <option value="behavioural">Behavioural</option>
                <option value="business">Business</option>
                <option value="regulatory">Regulatory</option>
                <option value="security">Security</option>
              </select>
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={classificationMutation.isPending}>
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingField(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </QepPanel>
      ) : null}

      {editingField === "scope" ? (
        <QepPanel title="Edit scope">
          {scopeMutation.isError ? (
            <div aria-live="polite">
              <QepErrorState
                message={
                  hasRevisionConflict(scopeMutation.error)
                    ? "This relationship was modified elsewhere. Refresh and try again."
                    : scopeMutation.error instanceof Error
                      ? scopeMutation.error.message
                      : "Update failed"
                }
              />
            </div>
          ) : null}
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              scopeMutation.mutate();
            }}
          >
            <label className="text-sm">
              Scope kind
              <select
                value={editScopeKind}
                onChange={(event) => setEditScopeKind(event.target.value)}
                data-testid="qep-relationships-scope-kind-input"
              >
                <option value="product">Product</option>
                <option value="project">Project</option>
                <option value="release">Release</option>
                <option value="baseline">Baseline</option>
              </select>
            </label>
            <Input
              label="Scope reference (optional)"
              value={editScopeRef}
              onChange={(event) => setEditScopeRef(event.target.value)}
              data-testid="qep-relationships-scope-ref-input"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={scopeMutation.isPending}>
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingField(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </QepPanel>
      ) : null}

      {(activateMutation.isError ||
        deprecateMutation.isError ||
        retireMutation.isError) ? (
        <div aria-live="polite">
          <QepErrorState
            message={(() => {
              const error =
                activateMutation.error ??
                deprecateMutation.error ??
                retireMutation.error;
              if (hasRevisionConflict(error)) {
                return "This relationship was modified elsewhere. Refresh and try again.";
              }
              return error instanceof Error ? error.message : "Lifecycle action failed";
            })()}
          />
        </div>
      ) : null}
    </QepPageShell>
  );
}

/** Embedded panel on requirement detail — inbound/outbound relationship counts. */
export function QepRequirementRelationshipsPanel({
  requirementId,
}: {
  readonly requirementId: string;
}) {
  const query = useQuery({
    queryKey: qepQueryKeys.relationships.byRequirement(requirementId, "both"),
    queryFn: ({ signal }) =>
      listRelationshipsByRequirement(requirementId, "both", { signal }),
  });

  const outbound =
    query.data?.filter((relationship) => relationship.source.requirementId === requirementId) ??
    [];
  const inbound =
    query.data?.filter((relationship) => relationship.target.requirementId === requirementId) ??
    [];
  const conflictCount =
    query.data?.filter((relationship) => relationship.type === "conflicts_with").length ?? 0;

  return (
    <QepPanel title="Relationships">
      {query.isLoading ? <QepLoadingState label="Loading relationships…" /> : null}
      {query.isError ? (
        <QepErrorState
          message={
            query.error instanceof Error ? query.error.message : "Unable to load relationships"
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess ? (
        <div className="space-y-3 text-sm" data-testid="qep-requirement-relationships-panel">
          <p>
            <strong>{outbound.length}</strong> outbound · <strong>{inbound.length}</strong> inbound
            {conflictCount > 0 ? (
              <span className="ml-2 text-[var(--color-destructive)]">
                · {conflictCount} conflict{conflictCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </p>
          {query.data.length === 0 ? (
            <QepEmptyState title="No relationships for this requirement yet" />
          ) : (
            <ul className="space-y-2">
              {query.data.slice(0, 5).map((relationship) => (
                <li
                  key={relationship.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-border)] p-2"
                >
                  <span>
                    {relationship.type}: {endpointLabel(relationship.source)} →{" "}
                    {endpointLabel(relationship.target)}
                  </span>
                  <Link
                    href={QEP_REQUIREMENTS_ROUTES.relationships.detail(relationship.id)}
                    className="underline"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`${QEP_REQUIREMENTS_ROUTES.relationships.new}?source=${encodeURIComponent(requirementId)}`}
              className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
              data-testid="qep-requirement-relationships-create"
            >
              New relationship
            </Link>
            <Link
              href={QEP_REQUIREMENTS_ROUTES.relationships.list}
              className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
              data-testid="qep-requirement-relationships-explorer"
            >
              Open explorer
            </Link>
          </div>
        </div>
      ) : null}
    </QepPanel>
  );
}

/**
 * Supersession workflow — uses the accepted backend supersede command
 * (create + activate supersedes). Not simulated as an ordinary edit.
 */
export function QepRelationshipSupersedeView() {
  const router = useRouter();
  const [successorRequirementId, setSuccessorRequirementId] = useState<string | null>(null);
  const [predecessorRequirementId, setPredecessorRequirementId] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");
  const [scopeKind, setScopeKind] = useState("product");
  const [scopeReferenceId, setScopeReferenceId] = useState("");

  const mutation = useMutation({
    mutationFn: (input: SupersedeQepRelationshipClientInput) => supersedeRelationship(input),
    onSuccess: (created) => {
      emitQepWorkbenchTelemetry({ event: "relationships.supersede", outcome: "success" });
      router.push(QEP_REQUIREMENTS_ROUTES.relationships.detail(created.id));
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "relationships.supersede", outcome: "error" });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!successorRequirementId || !predecessorRequirementId || !rationale.trim()) {
      return;
    }
    mutation.mutate({
      successorRequirementId,
      predecessorRequirementId,
      rationale: rationale.trim(),
      scope: {
        kind: scopeKind,
        ...(scopeReferenceId.trim() ? { referenceId: scopeReferenceId.trim() } : {}),
      },
    });
  }

  return (
    <QepPageShell
      title="Supersede requirement"
      description="Create and activate a supersedes relationship. The predecessor remains historically preserved."
      breadcrumbs={["Requirements", "Relationships", "Supersede"]}
    >
      <QepPanel title="Supersession">
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          Successor replaces predecessor for forward work. Rationale is mandatory. No delete or
          restore of historical facts.
        </p>
        {mutation.isError ? (
          <div aria-live="polite">
            <QepErrorState
              message={
                mutation.error instanceof Error ? mutation.error.message : "Supersede failed"
              }
            />
          </div>
        ) : null}
        <form
          className="mt-4 flex max-w-2xl flex-col gap-4"
          onSubmit={handleSubmit}
          data-testid="qep-relationships-supersede-form"
        >
          <RequirementSearchPicker
            label="Successor requirement (source)"
            selectedId={successorRequirementId}
            onSelect={setSuccessorRequirementId}
            testIdPrefix="qep-relationships-successor"
          />
          <RequirementSearchPicker
            label="Predecessor requirement (target)"
            selectedId={predecessorRequirementId}
            onSelect={setPredecessorRequirementId}
            testIdPrefix="qep-relationships-predecessor"
          />
          <label className="text-sm">
            Scope{" "}
            <select
              value={scopeKind}
              onChange={(event) => setScopeKind(event.target.value)}
              data-testid="qep-relationships-supersede-scope"
            >
              <option value="product">product</option>
              <option value="project">project</option>
              <option value="release">release</option>
              <option value="baseline">baseline</option>
            </select>
          </label>
          {scopeKind !== "product" ? (
            <Input
              value={scopeReferenceId}
              onChange={(event) => setScopeReferenceId(event.target.value)}
              placeholder="Scope reference id"
              data-testid="qep-relationships-supersede-scope-ref"
            />
          ) : null}
          <label className="text-sm">
            Rationale (required)
            <textarea
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm"
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              rows={3}
              required
              data-testid="qep-relationships-supersede-rationale"
            />
          </label>
          <Button
            type="submit"
            disabled={
              mutation.isPending ||
              !successorRequirementId ||
              !predecessorRequirementId ||
              !rationale.trim()
            }
            data-testid="qep-relationships-supersede-submit"
          >
            {mutation.isPending ? "Submitting…" : "Create and activate supersession"}
          </Button>
        </form>
      </QepPanel>
    </QepPageShell>
  );
}

/** Dispatches among the relationship surfaces based on pathname. */
export function QepRelationshipsRouterView({ pathname }: { readonly pathname: string }) {
  const normalized = pathname.replace(/\/+$/, "");
  if (isQepRelationshipsNewRoute(normalized)) {
    return <QepRelationshipCreateView />;
  }
  if (isQepRelationshipsSupersedeRoute(normalized)) {
    return <QepRelationshipSupersedeView />;
  }
  const id = parseQepRelationshipRouteId(normalized);
  if (id) {
    return <QepRelationshipDetailView relationshipId={id} />;
  }
  return <QepRelationshipsListView />;
}
