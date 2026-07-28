"use client";

import type { QepTraceEndpointDto, QepTraceLinkDto } from "@apzhub/qep-contracts";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  approveTraceLink,
  createTraceLink,
  getTraceLink,
  getTraceLinkHistory,
  listTraceLinkTaxonomy,
  listTraceLinks,
  retireTraceLink,
  supersedeTraceLink,
  updateTraceLinkAuthority,
  updateTraceLinkConfidence,
  updateTraceLinkRationale,
  updateTraceLinkScope,
  validateTraceLink,
  type QepTraceLinkListParams,
} from "@/lib/qep/qep-traceability-api";
import { searchRequirements } from "@/lib/qep/qep-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import { emitQepWorkbenchTelemetry } from "@/lib/qep/telemetry";
import {
  QEP_REQUIREMENTS_ROUTES,
  QEP_TRACEABILITY_ROUTES,
  isQepTraceHistoryRoute,
  isQepTraceLinksNewRoute,
  isQepTraceLinksSupersedeRoute,
  isQepTraceMatrixRoute,
  isQepTraceTaxonomyRoute,
  parseQepTraceLinkRouteId,
} from "@/lib/qep/routes";

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

const TRACE_ENDPOINT_KIND_OPTIONS = [
  "requirement",
  "requirement_content_version",
  "requirement_baseline",
  "requirement_relationship",
  "test_specification",
  "test_case",
  "test_execution",
  "evidence",
  "defect",
  "risk",
  "verification_activity",
  "verification_result",
  "certification_artefact",
  "document",
  "external_reference",
] as const;

const TRACE_DIRECTION_OPTIONS = ["forward", "reverse", "symmetric"] as const;
const TRACE_STRENGTH_OPTIONS = ["mandatory", "recommended", "informative"] as const;
const TRACE_CONFIDENCE_OPTIONS = ["authoritative", "asserted", "inferred", "provisional"] as const;
const TRACE_ORIGIN_OPTIONS = ["user", "import", "system_rule", "ai_suggestion", "migration"] as const;
const TRACE_SCOPE_KIND_OPTIONS = ["product", "project", "release", "baseline", "tenant_global"] as const;
const DEFAULT_ACTOR_ID = "workbench-user";
const PAGE_SIZE = 50;

function formatDate(value?: string): string {
  return value ? value : "—";
}

function isImmutableLifecycle(state: string): boolean {
  return state === "retired" || state === "superseded";
}

function hasRevisionConflict(error: unknown): boolean {
  return error instanceof Error && /revision/i.test(error.message);
}

function endpointLabel(endpoint: QepTraceEndpointDto): string {
  return `${endpoint.kind}:${endpoint.artefactId}`;
}

function EndpointSummaryLink({ endpoint }: { readonly endpoint: QepTraceEndpointDto }) {
  if (endpoint.kind === "requirement") {
    return (
      <Link href={QEP_REQUIREMENTS_ROUTES.detail(endpoint.artefactId)} className="underline">
        {endpointLabel(endpoint)}
      </Link>
    );
  }
  return (
    <span>
      {endpointLabel(endpoint)}
      <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
        Navigation unavailable for this endpoint domain
      </span>
    </span>
  );
}

function SupersessionIndicator({ traceLink }: { readonly traceLink: QepTraceLinkDto }) {
  if (!traceLink.supersededAt && !traceLink.successorTraceId) {
    return <span className="text-[var(--color-muted-foreground)]">—</span>;
  }
  return (
    <span data-testid="qep-traceability-supersession-indicator">
      Superseded {formatDate(traceLink.supersededAt)}
      {traceLink.successorTraceId ? (
        <>
          {" "}
          →{" "}
          <Link
            href={QEP_TRACEABILITY_ROUTES.detail(traceLink.successorTraceId)}
            className="underline"
          >
            {traceLink.successorTraceId}
          </Link>
        </>
      ) : null}
    </span>
  );
}

/** APZQEP-ENG-030C — Trace Link Explorer (list). */
export function QepTraceLinksListView() {
  const [type, setType] = useState("");
  const [lifecycleState, setLifecycleState] = useState("");
  const [sourceKind, setSourceKind] = useState("");
  const [targetKind, setTargetKind] = useState("");
  const [confidence, setConfidence] = useState("");
  const [strength, setStrength] = useState("");
  const [origin, setOrigin] = useState("");
  const [offset, setOffset] = useState(0);
  const startedAt = useMemo(() => Date.now(), []);

  const taxonomyQuery = useQuery({
    queryKey: qepQueryKeys.traceability.taxonomy(),
    queryFn: ({ signal }) => listTraceLinkTaxonomy({ signal }),
  });

  const serverParams: QepTraceLinkListParams = {
    type: type || undefined,
    lifecycleState: lifecycleState || undefined,
    sourceKind: sourceKind || undefined,
    targetKind: targetKind || undefined,
    limit: PAGE_SIZE,
    offset,
  };

  const query = useQuery({
    queryKey: qepQueryKeys.traceability.list({ ...serverParams, confidence, strength, origin }),
    queryFn: ({ signal }) => listTraceLinks(serverParams, { signal }),
  });

  useEffect(() => {
    if (query.isSuccess) {
      emitQepWorkbenchTelemetry({
        event: "traceability.list.load",
        outcome: "success",
        durationMs: Date.now() - startedAt,
      });
    } else if (query.isError) {
      emitQepWorkbenchTelemetry({
        event: "traceability.list.load",
        outcome: "error",
        durationMs: Date.now() - startedAt,
      });
    }
  }, [query.isSuccess, query.isError, startedAt]);

  const items = useMemo(() => {
    const all = query.data?.items ?? [];
    return all.filter((link) => {
      if (confidence && link.confidence !== confidence) return false;
      if (strength && link.strength !== strength) return false;
      if (origin && link.origin !== origin) return false;
      return true;
    });
  }, [query.data, confidence, strength, origin]);

  const total = query.data?.total ?? 0;
  const canGoNext = offset + PAGE_SIZE < total;
  const canGoPrev = offset > 0;

  return (
    <QepPageShell
      title="Trace Links"
      description="Explore governed traceability links across artefact domains — list-first, no graph visualisation."
      breadcrumbs={["Traceability", "Trace Links"]}
      actions={
        <>
          <Link
            href={QEP_TRACEABILITY_ROUTES.supersede}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
            data-testid="qep-traceability-supersede-link"
          >
            Supersede
          </Link>
          <Link
            href={QEP_TRACEABILITY_ROUTES.new}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm font-medium"
            data-testid="qep-traceability-create"
          >
            New trace link
          </Link>
        </>
      }
    >
      <QepFilterBar>
        <label className="text-sm">
          Type{" "}
          <select
            data-testid="qep-traceability-type-filter"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setOffset(0);
            }}
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
            data-testid="qep-traceability-lifecycle-filter"
            value={lifecycleState}
            onChange={(event) => {
              setLifecycleState(event.target.value);
              setOffset(0);
            }}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="validated">Validated</option>
            <option value="approved">Approved</option>
            <option value="retired">Retired</option>
            <option value="superseded">Superseded</option>
          </select>
        </label>
        <label className="text-sm">
          Source kind{" "}
          <select
            data-testid="qep-traceability-source-kind-filter"
            value={sourceKind}
            onChange={(event) => {
              setSourceKind(event.target.value);
              setOffset(0);
            }}
          >
            <option value="">All</option>
            {TRACE_ENDPOINT_KIND_OPTIONS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Target kind{" "}
          <select
            data-testid="qep-traceability-target-kind-filter"
            value={targetKind}
            onChange={(event) => {
              setTargetKind(event.target.value);
              setOffset(0);
            }}
          >
            <option value="">All</option>
            {TRACE_ENDPOINT_KIND_OPTIONS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Confidence{" "}
          <select
            data-testid="qep-traceability-confidence-filter"
            value={confidence}
            onChange={(event) => setConfidence(event.target.value)}
          >
            <option value="">All</option>
            {TRACE_CONFIDENCE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Strength{" "}
          <select
            data-testid="qep-traceability-strength-filter"
            value={strength}
            onChange={(event) => setStrength(event.target.value)}
          >
            <option value="">All</option>
            {TRACE_STRENGTH_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Origin{" "}
          <select
            data-testid="qep-traceability-origin-filter"
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
          >
            <option value="">All</option>
            {TRACE_ORIGIN_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </QepFilterBar>
      {query.isLoading ? <QepLoadingState label="Loading trace links…" /> : null}
      {query.isError ? (
        <QepErrorState
          message={query.error instanceof Error ? query.error.message : "Unable to load trace links"}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <QepEmptyState title="No trace links found for the current filters" />
      ) : null}
      {query.isSuccess && items.length > 0 ? (
        <>
          <QepTable
            caption="Trace links"
            columns={[
              "Trace ID",
              "Type",
              "Source",
              "Target",
              "Lifecycle",
              "Scope",
              "Strength",
              "Confidence",
              "Origin",
              "Authority",
              "Supersession",
              "Updated",
              "",
            ]}
            rows={items.map((traceLink) => ({
              id: traceLink.id,
              cells: [
                traceLink.id,
                traceLink.type,
                endpointLabel(traceLink.source),
                endpointLabel(traceLink.target),
                <span key="lifecycle" className="inline-flex items-center gap-1">
                  <QepStatusBadge status={traceLink.lifecycleState} />
                  <span>{traceLink.lifecycleState}</span>
                </span>,
                `${traceLink.scope.kind}${traceLink.scope.referenceId ? ` · ${traceLink.scope.referenceId}` : ""}`,
                traceLink.strength,
                traceLink.confidence,
                traceLink.origin,
                `${traceLink.authority.kind}:${traceLink.authority.actorId}`,
                <SupersessionIndicator key="supersession" traceLink={traceLink} />,
                formatDate(traceLink.updatedAt),
                <Link
                  key="view"
                  href={QEP_TRACEABILITY_ROUTES.detail(traceLink.id)}
                  className="text-sm underline"
                >
                  View
                </Link>,
              ],
            }))}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">
              Showing {offset + 1}–{offset + items.length} of {total}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canGoPrev}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                data-testid="qep-traceability-list-prev"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canGoNext}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                data-testid="qep-traceability-list-next"
              >
                Next
              </Button>
            </div>
          </div>
        </>
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
      {searchQuery.isSuccess && searchQuery.data.items.length > 0 ? (
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
      {selectedId ? (
        <p className="mt-1 text-sm">
          Selected: <strong>{selectedId}</strong>
        </p>
      ) : null}
    </div>
  );
}

function EndpointFields({
  label,
  kind,
  artefactId,
  onKindChange,
  onArtefactIdChange,
  testIdPrefix,
}: {
  readonly label: string;
  readonly kind: string;
  readonly artefactId: string;
  readonly onKindChange: (kind: string) => void;
  readonly onArtefactIdChange: (artefactId: string) => void;
  readonly testIdPrefix: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] p-3">
      <p className="text-sm font-medium">{label}</p>
      <label className="text-sm">
        Kind
        <select
          className="ml-2"
          value={kind}
          onChange={(event) => onKindChange(event.target.value)}
          data-testid={`${testIdPrefix}-kind`}
        >
          {TRACE_ENDPOINT_KIND_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="Artefact ID"
        value={artefactId}
        onChange={(event) => onArtefactIdChange(event.target.value)}
        required
        data-testid={`${testIdPrefix}-artefact-id`}
      />
      {kind === "requirement" ? (
        <RequirementSearchPicker
          label="Search requirements"
          selectedId={artefactId || null}
          onSelect={onArtefactIdChange}
          testIdPrefix={`${testIdPrefix}-picker`}
        />
      ) : null}
    </div>
  );
}

/** Guided create-trace-link form. */
export function QepTraceLinkCreateView() {
  const router = useRouter();
  const [sourceKind, setSourceKind] = useState<string>(TRACE_ENDPOINT_KIND_OPTIONS[0]);
  const [sourceArtefactId, setSourceArtefactId] = useState("");
  const [targetKind, setTargetKind] = useState<string>(TRACE_ENDPOINT_KIND_OPTIONS[0]);
  const [targetArtefactId, setTargetArtefactId] = useState("");
  const [type, setType] = useState("");
  const [direction, setDirection] = useState<string>(TRACE_DIRECTION_OPTIONS[0]);
  const [strength, setStrength] = useState<string>("recommended");
  const [confidence, setConfidence] = useState<string>("asserted");
  const [origin, setOrigin] = useState<string>("user");
  const [scopeKind, setScopeKind] = useState<string>("product");
  const [scopeReferenceId, setScopeReferenceId] = useState("");
  const [rationale, setRationale] = useState("");
  const [actorId, setActorId] = useState(DEFAULT_ACTOR_ID);

  const taxonomyQuery = useQuery({
    queryKey: qepQueryKeys.traceability.taxonomy(),
    queryFn: ({ signal }) => listTraceLinkTaxonomy({ signal }),
  });

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof createTraceLink>[0]) => createTraceLink(input),
    onSuccess: (created) => {
      emitQepWorkbenchTelemetry({ event: "traceability.create", outcome: "success" });
      router.push(QEP_TRACEABILITY_ROUTES.detail(created.id));
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "traceability.create", outcome: "error" });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceArtefactId.trim() || !targetArtefactId.trim() || !type) {
      return;
    }
    const resolvedActorId = actorId.trim() || DEFAULT_ACTOR_ID;
    mutation.mutate({
      type,
      source: { kind: sourceKind, artefactId: sourceArtefactId.trim() },
      target: { kind: targetKind, artefactId: targetArtefactId.trim() },
      direction,
      strength,
      confidence,
      origin,
      authority: { kind: "user", actorId: resolvedActorId },
      provenance: { actorId: resolvedActorId, correlationId: crypto.randomUUID() },
      scope: {
        kind: scopeKind,
        ...(scopeReferenceId.trim() ? { referenceId: scopeReferenceId.trim() } : {}),
      },
      ...(rationale.trim() ? { rationale: rationale.trim() } : {}),
    });
  }

  return (
    <QepPageShell
      title="New trace link"
      description="Create a governed Trace Link between two artefacts across any registered endpoint domain."
      breadcrumbs={["Traceability", "Trace Links", "New"]}
    >
      <QepPanel title="Trace link">
        {mutation.isError ? (
          <div aria-live="polite">
            <QepErrorState
              message={mutation.error instanceof Error ? mutation.error.message : "Create failed"}
            />
          </div>
        ) : null}
        <form
          className="mt-4 flex max-w-2xl flex-col gap-4"
          onSubmit={handleSubmit}
          data-testid="qep-traceability-create-form"
        >
          <EndpointFields
            label="Source"
            kind={sourceKind}
            artefactId={sourceArtefactId}
            onKindChange={setSourceKind}
            onArtefactIdChange={setSourceArtefactId}
            testIdPrefix="qep-traceability-source"
          />
          <label className="text-sm">
            Trace type
            <select
              className="ml-2 block w-full max-w-md"
              value={type}
              onChange={(event) => setType(event.target.value)}
              required
              data-testid="qep-traceability-type"
            >
              <option value="">Select type…</option>
              {taxonomyQuery.data?.map((entry) => (
                <option key={entry.type} value={entry.type}>
                  {entry.displayName}
                </option>
              ))}
            </select>
          </label>
          <EndpointFields
            label="Target"
            kind={targetKind}
            artefactId={targetArtefactId}
            onKindChange={setTargetKind}
            onArtefactIdChange={setTargetArtefactId}
            testIdPrefix="qep-traceability-target"
          />
          <label className="text-sm">
            Direction
            <select
              className="ml-2"
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
              data-testid="qep-traceability-direction"
            >
              {TRACE_DIRECTION_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Strength
            <select
              className="ml-2"
              value={strength}
              onChange={(event) => setStrength(event.target.value)}
              data-testid="qep-traceability-strength"
            >
              {TRACE_STRENGTH_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Confidence
            <select
              className="ml-2"
              value={confidence}
              onChange={(event) => setConfidence(event.target.value)}
              data-testid="qep-traceability-confidence"
            >
              {TRACE_CONFIDENCE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Origin
            <select
              className="ml-2"
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              data-testid="qep-traceability-origin"
            >
              {TRACE_ORIGIN_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Scope kind
            <select
              className="ml-2"
              value={scopeKind}
              onChange={(event) => setScopeKind(event.target.value)}
              data-testid="qep-traceability-scope-kind"
            >
              {TRACE_SCOPE_KIND_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Scope reference (optional)"
            value={scopeReferenceId}
            onChange={(event) => setScopeReferenceId(event.target.value)}
            data-testid="qep-traceability-scope-ref"
          />
          <Input
            label="Rationale (optional)"
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            data-testid="qep-traceability-rationale"
          />
          <Input
            label="Authority / provenance actor ID"
            value={actorId}
            onChange={(event) => setActorId(event.target.value)}
            data-testid="qep-traceability-actor-id"
          />
          <Button
            type="submit"
            disabled={
              mutation.isPending || !sourceArtefactId.trim() || !targetArtefactId.trim() || !type
            }
            data-testid="qep-traceability-create-submit"
          >
            {mutation.isPending ? "Creating…" : "Create trace link"}
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

/** Multi-pane trace link detail view — Context | Summary | Inspector. */
export function QepTraceLinkDetailView({ traceLinkId }: { readonly traceLinkId: string }) {
  const queryClient = useQueryClient();
  const [pendingLifecycle, setPendingLifecycle] = useState<
    null | "validate" | "approve" | "retire"
  >(null);
  const [editingField, setEditingField] = useState<
    null | "confidence" | "authority" | "scope" | "rationale"
  >(null);
  const [editConfidence, setEditConfidence] = useState("asserted");
  const [editAuthorityKind, setEditAuthorityKind] = useState("user");
  const [editAuthorityActorId, setEditAuthorityActorId] = useState("");
  const [editScopeKind, setEditScopeKind] = useState("product");
  const [editScopeRef, setEditScopeRef] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const startedAt = useMemo(() => Date.now(), []);

  const query = useQuery({
    queryKey: qepQueryKeys.traceability.detail(traceLinkId),
    queryFn: ({ signal }) => getTraceLink(traceLinkId, { signal }),
  });

  useEffect(() => {
    if (query.isSuccess) {
      emitQepWorkbenchTelemetry({
        event: "traceability.detail.load",
        outcome: "success",
        durationMs: Date.now() - startedAt,
      });
    } else if (query.isError) {
      emitQepWorkbenchTelemetry({
        event: "traceability.detail.load",
        outcome: "error",
        durationMs: Date.now() - startedAt,
      });
    }
  }, [query.isSuccess, query.isError, startedAt]);

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: qepQueryKeys.traceability.detail(traceLinkId) });
    void queryClient.invalidateQueries({ queryKey: qepQueryKeys.traceability.all() });
  }

  const validateMutation = useMutation({
    mutationFn: () => validateTraceLink(traceLinkId),
    onSuccess: () => {
      setPendingLifecycle(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "traceability.validate", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "traceability.validate", outcome: "error" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => approveTraceLink(traceLinkId),
    onSuccess: () => {
      setPendingLifecycle(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "traceability.approve", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "traceability.approve", outcome: "error" });
    },
  });

  const retireMutation = useMutation({
    mutationFn: () => retireTraceLink(traceLinkId),
    onSuccess: () => {
      setPendingLifecycle(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "traceability.retire", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "traceability.retire", outcome: "error" });
    },
  });

  const confidenceMutation = useMutation({
    mutationFn: () => updateTraceLinkConfidence(traceLinkId, editConfidence),
    onSuccess: () => {
      setEditingField(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "traceability.update", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "traceability.update", outcome: "error" });
    },
  });

  const authorityMutation = useMutation({
    mutationFn: () =>
      updateTraceLinkAuthority(traceLinkId, {
        kind: editAuthorityKind,
        actorId: editAuthorityActorId.trim() || DEFAULT_ACTOR_ID,
      }),
    onSuccess: () => {
      setEditingField(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "traceability.update", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "traceability.update", outcome: "error" });
    },
  });

  const scopeMutation = useMutation({
    mutationFn: () =>
      updateTraceLinkScope(traceLinkId, {
        kind: editScopeKind,
        ...(editScopeRef.trim() ? { referenceId: editScopeRef.trim() } : {}),
      }),
    onSuccess: () => {
      setEditingField(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "traceability.update", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "traceability.update", outcome: "error" });
    },
  });

  const rationaleMutation = useMutation({
    mutationFn: () => updateTraceLinkRationale(traceLinkId, editRationale.trim()),
    onSuccess: () => {
      setEditingField(null);
      invalidate();
      emitQepWorkbenchTelemetry({ event: "traceability.update", outcome: "success" });
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "traceability.update", outcome: "error" });
    },
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading trace link…" />;
  }
  if (query.isError || !query.data) {
    return (
      <QepErrorState
        message={query.error instanceof Error ? query.error.message : "Trace link not found"}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const traceLink = query.data;
  const actions = new Set(traceLink.availableActions ?? []);
  const immutable = isImmutableLifecycle(traceLink.lifecycleState);

  return (
    <QepPageShell
      title={`Trace link — ${traceLink.type}`}
      description={`${endpointLabel(traceLink.source)} → ${endpointLabel(traceLink.target)}`}
      breadcrumbs={["Traceability", "Trace Links", traceLink.id]}
    >
      {immutable ? (
        <p
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-sm"
          role="status"
          data-testid="qep-traceability-immutable-banner"
        >
          This trace link is <strong>{traceLink.lifecycleState}</strong> and is immutable.
        </p>
      ) : null}
      {traceLink.context.immutable ? (
        <p
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-sm"
          role="status"
          data-testid="qep-traceability-context-banner"
        >
          This trace link is bound to an immutable context
          {traceLink.context.baselineId ? ` (baseline ${traceLink.context.baselineId})` : ""}
          {traceLink.context.contentVersionId
            ? ` (content version ${traceLink.context.contentVersionId})`
            : ""}
          .
        </p>
      ) : null}

      <div
        className="grid gap-4 lg:grid-cols-[minmax(200px,1fr)_minmax(0,2fr)_minmax(220px,1fr)]"
        data-testid="qep-traceability-detail-grid"
      >
        <aside aria-label="Trace link context">
          <QepPanel title="Context">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Lifecycle</dt>
                <dd data-testid="qep-traceability-status">
                  <QepStatusBadge status={traceLink.lifecycleState} />{" "}
                  <span>{traceLink.lifecycleState}</span>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Scope</dt>
                <dd>
                  {traceLink.scope.kind}
                  {traceLink.scope.referenceId ? ` · ${traceLink.scope.referenceId}` : ""}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Direction</dt>
                <dd>{traceLink.direction}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Revision</dt>
                <dd>{traceLink.revision}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Created</dt>
                <dd>{formatDate(traceLink.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Updated</dt>
                <dd>{formatDate(traceLink.updatedAt)}</dd>
              </div>
            </dl>
          </QepPanel>
        </aside>

        <main aria-label="Trace link summary">
          <QepPanel title="Summary">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Type</dt>
                <dd>{traceLink.type}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Origin</dt>
                <dd>{traceLink.origin}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Source</dt>
                <dd>
                  <EndpointSummaryLink endpoint={traceLink.source} />
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Target</dt>
                <dd>
                  <EndpointSummaryLink endpoint={traceLink.target} />
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Strength</dt>
                <dd>{traceLink.strength}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Confidence</dt>
                <dd>{traceLink.confidence}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Authority</dt>
                <dd>
                  {traceLink.authority.kind}:{traceLink.authority.actorId}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Provenance</dt>
                <dd>
                  {traceLink.provenance.actorId} · {traceLink.provenance.correlationId}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-[var(--color-muted-foreground)]">Rationale</dt>
                <dd>{traceLink.rationale ?? "—"}</dd>
              </div>
            </dl>
          </QepPanel>
        </main>

        <aside aria-label="Trace link inspector">
          <QepPanel title="Inspector">
            <div className="flex flex-col gap-2" data-testid="qep-traceability-actions">
              {actions.has("validate") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingLifecycle("validate")}
                  data-testid="qep-traceability-validate-open"
                >
                  Validate
                </Button>
              ) : null}
              {actions.has("approve") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingLifecycle("approve")}
                  data-testid="qep-traceability-approve-open"
                >
                  Approve
                </Button>
              ) : null}
              {actions.has("retire") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingLifecycle("retire")}
                  data-testid="qep-traceability-retire-open"
                >
                  Retire
                </Button>
              ) : null}
              {actions.has("supersede") ? (
                <Link
                  href={`${QEP_TRACEABILITY_ROUTES.supersede}?predecessor=${encodeURIComponent(traceLink.id)}`}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--color-border)] px-3 text-sm"
                  data-testid="qep-traceability-supersede-open"
                >
                  Supersede
                </Link>
              ) : null}
              {actions.has("updateConfidence") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditConfidence(traceLink.confidence);
                    setEditingField("confidence");
                  }}
                  data-testid="qep-traceability-edit-confidence"
                >
                  Edit confidence
                </Button>
              ) : null}
              {actions.has("updateAuthority") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditAuthorityKind(traceLink.authority.kind);
                    setEditAuthorityActorId(traceLink.authority.actorId);
                    setEditingField("authority");
                  }}
                  data-testid="qep-traceability-edit-authority"
                >
                  Edit authority
                </Button>
              ) : null}
              {actions.has("updateScope") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditScopeKind(traceLink.scope.kind);
                    setEditScopeRef(traceLink.scope.referenceId ?? "");
                    setEditingField("scope");
                  }}
                  data-testid="qep-traceability-edit-scope"
                >
                  Edit scope
                </Button>
              ) : null}
              {actions.has("updateRationale") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditRationale(traceLink.rationale ?? "");
                    setEditingField("rationale");
                  }}
                  data-testid="qep-traceability-edit-rationale"
                >
                  Edit rationale
                </Button>
              ) : null}
              {actions.size === 0 ? (
                <p className="text-sm text-[var(--color-muted-foreground)]" role="status">
                  Read-only — no actions available.
                </p>
              ) : null}
            </div>

            {traceLink.historySummaries.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-sm font-medium">History</h3>
                <ol className="mt-2 space-y-2 text-xs" data-testid="qep-traceability-history-preview">
                  {traceLink.historySummaries.slice(0, 5).map((entry, index) => (
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
                <Link
                  href={QEP_TRACEABILITY_ROUTES.history(traceLink.id)}
                  className="mt-2 inline-block text-xs underline"
                  data-testid="qep-traceability-history-link"
                >
                  View full history
                </Link>
              </div>
            ) : (
              <Link
                href={QEP_TRACEABILITY_ROUTES.history(traceLink.id)}
                className="mt-4 inline-block text-xs underline"
                data-testid="qep-traceability-history-link"
              >
                View full history
              </Link>
            )}
          </QepPanel>
        </aside>
      </div>

      {pendingLifecycle === "validate" ? (
        <LifecycleConfirmDialog
          title="Confirm validation"
          message="Validate this trace link. Endpoint changes remain possible until approval."
          confirmLabel={validateMutation.isPending ? "Validating…" : "Validate"}
          onCancel={() => setPendingLifecycle(null)}
          onConfirm={() => validateMutation.mutate()}
          isSubmitting={validateMutation.isPending}
          testIdConfirm="qep-traceability-validate-confirm"
        />
      ) : null}
      {pendingLifecycle === "approve" ? (
        <LifecycleConfirmDialog
          title="Confirm approval"
          message="Approve this trace link. Endpoints become locked; only retire or supersede remain available."
          confirmLabel={approveMutation.isPending ? "Approving…" : "Approve"}
          onCancel={() => setPendingLifecycle(null)}
          onConfirm={() => approveMutation.mutate()}
          isSubmitting={approveMutation.isPending}
          testIdConfirm="qep-traceability-approve-confirm"
        />
      ) : null}
      {pendingLifecycle === "retire" ? (
        <LifecycleConfirmDialog
          title="Confirm retirement"
          message="Retire this trace link permanently. This action cannot be undone."
          confirmLabel={retireMutation.isPending ? "Retiring…" : "Retire"}
          onCancel={() => setPendingLifecycle(null)}
          onConfirm={() => retireMutation.mutate()}
          isSubmitting={retireMutation.isPending}
          testIdConfirm="qep-traceability-retire-confirm"
        />
      ) : null}

      {editingField === "confidence" ? (
        <QepPanel title="Edit confidence">
          {confidenceMutation.isError ? (
            <div aria-live="polite">
              <QepErrorState
                message={
                  hasRevisionConflict(confidenceMutation.error)
                    ? "This trace link was modified elsewhere. Refresh and try again."
                    : confidenceMutation.error instanceof Error
                      ? confidenceMutation.error.message
                      : "Update failed"
                }
              />
            </div>
          ) : null}
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              confidenceMutation.mutate();
            }}
          >
            <label className="text-sm">
              Confidence
              <select
                value={editConfidence}
                onChange={(event) => setEditConfidence(event.target.value)}
                data-testid="qep-traceability-confidence-input"
              >
                {TRACE_CONFIDENCE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={confidenceMutation.isPending}>
                Save
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingField(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </QepPanel>
      ) : null}

      {editingField === "authority" ? (
        <QepPanel title="Edit authority">
          {authorityMutation.isError ? (
            <div aria-live="polite">
              <QepErrorState
                message={
                  hasRevisionConflict(authorityMutation.error)
                    ? "This trace link was modified elsewhere. Refresh and try again."
                    : authorityMutation.error instanceof Error
                      ? authorityMutation.error.message
                      : "Update failed"
                }
              />
            </div>
          ) : null}
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              authorityMutation.mutate();
            }}
          >
            <Input
              label="Authority kind"
              value={editAuthorityKind}
              onChange={(event) => setEditAuthorityKind(event.target.value)}
              data-testid="qep-traceability-authority-kind-input"
            />
            <Input
              label="Actor ID"
              value={editAuthorityActorId}
              onChange={(event) => setEditAuthorityActorId(event.target.value)}
              data-testid="qep-traceability-authority-actor-input"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={authorityMutation.isPending}>
                Save
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingField(null)}>
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
                    ? "This trace link was modified elsewhere. Refresh and try again."
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
                data-testid="qep-traceability-scope-kind-input"
              >
                {TRACE_SCOPE_KIND_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Scope reference (optional)"
              value={editScopeRef}
              onChange={(event) => setEditScopeRef(event.target.value)}
              data-testid="qep-traceability-scope-ref-input"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={scopeMutation.isPending}>
                Save
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingField(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </QepPanel>
      ) : null}

      {editingField === "rationale" ? (
        <QepPanel title="Edit rationale">
          {rationaleMutation.isError ? (
            <div aria-live="polite">
              <QepErrorState
                message={
                  hasRevisionConflict(rationaleMutation.error)
                    ? "This trace link was modified elsewhere. Refresh and try again."
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
              data-testid="qep-traceability-rationale-input"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={rationaleMutation.isPending}>
                Save
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingField(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </QepPanel>
      ) : null}

      {validateMutation.isError || approveMutation.isError || retireMutation.isError ? (
        <div aria-live="polite">
          <QepErrorState
            message={(() => {
              const error = validateMutation.error ?? approveMutation.error ?? retireMutation.error;
              if (hasRevisionConflict(error)) {
                return "This trace link was modified elsewhere. Refresh and try again.";
              }
              return error instanceof Error ? error.message : "Lifecycle action failed";
            })()}
          />
        </div>
      ) : null}
    </QepPageShell>
  );
}

/** Full history timeline for a Trace Link. */
export function QepTraceLinkHistoryView({ traceLinkId }: { readonly traceLinkId: string }) {
  const startedAt = useMemo(() => Date.now(), []);

  const traceLinkQuery = useQuery({
    queryKey: qepQueryKeys.traceability.detail(traceLinkId),
    queryFn: ({ signal }) => getTraceLink(traceLinkId, { signal }),
  });

  const historyQuery = useQuery({
    queryKey: qepQueryKeys.traceability.history(traceLinkId),
    queryFn: ({ signal }) => getTraceLinkHistory(traceLinkId, { signal }),
  });

  useEffect(() => {
    if (historyQuery.isSuccess) {
      emitQepWorkbenchTelemetry({
        event: "traceability.history.load",
        outcome: "success",
        durationMs: Date.now() - startedAt,
      });
    } else if (historyQuery.isError) {
      emitQepWorkbenchTelemetry({
        event: "traceability.history.load",
        outcome: "error",
        durationMs: Date.now() - startedAt,
      });
    }
  }, [historyQuery.isSuccess, historyQuery.isError, startedAt]);

  return (
    <QepPageShell
      title="Trace link history"
      description={
        traceLinkQuery.data
          ? `${endpointLabel(traceLinkQuery.data.source)} → ${endpointLabel(traceLinkQuery.data.target)}`
          : traceLinkId
      }
      breadcrumbs={["Traceability", "Trace Links", traceLinkId, "History"]}
      actions={
        <Link
          href={QEP_TRACEABILITY_ROUTES.detail(traceLinkId)}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          data-testid="qep-traceability-history-back"
        >
          Back to detail
        </Link>
      }
    >
      {historyQuery.isLoading ? <QepLoadingState label="Loading history…" /> : null}
      {historyQuery.isError ? (
        <QepErrorState
          message={
            historyQuery.error instanceof Error ? historyQuery.error.message : "Unable to load history"
          }
          onRetry={() => void historyQuery.refetch()}
        />
      ) : null}
      {historyQuery.isSuccess && historyQuery.data.length === 0 ? (
        <QepEmptyState title="No history recorded for this trace link yet" />
      ) : null}
      {historyQuery.isSuccess && historyQuery.data.length > 0 ? (
        <QepPanel title="History timeline">
          <ol className="space-y-3 text-sm" data-testid="qep-traceability-history-timeline">
            {historyQuery.data.map((entry, index) => (
              <li
                key={`${entry.at}-${index}`}
                className="rounded-md border border-[var(--color-border)] p-3"
              >
                <p className="font-medium">{entry.kind}</p>
                <p>{entry.summary}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {entry.at} · {entry.by}
                </p>
              </li>
            ))}
          </ol>
        </QepPanel>
      ) : null}
    </QepPageShell>
  );
}

/** Supersession workflow — predecessor trace link is retired-and-linked to a successor. */
export function QepTraceLinkSupersedeView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledPredecessor = searchParams.get("predecessor") ?? "";

  const [predecessorId, setPredecessorId] = useState(prefilledPredecessor);
  const [successorId, setSuccessorId] = useState("");

  const mutation = useMutation({
    mutationFn: () => supersedeTraceLink(predecessorId.trim(), { successorTraceId: successorId.trim() }),
    onSuccess: (updated) => {
      emitQepWorkbenchTelemetry({ event: "traceability.supersede", outcome: "success" });
      router.push(QEP_TRACEABILITY_ROUTES.detail(updated.id));
    },
    onError: () => {
      emitQepWorkbenchTelemetry({ event: "traceability.supersede", outcome: "error" });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!predecessorId.trim() || !successorId.trim()) {
      return;
    }
    mutation.mutate();
  }

  return (
    <QepPageShell
      title="Supersede trace link"
      description="Mark a predecessor trace link as superseded by a successor trace link. The predecessor remains historically preserved."
      breadcrumbs={["Traceability", "Trace Links", "Supersede"]}
    >
      <QepPanel title="Supersession">
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          Successor replaces predecessor for forward traceability. No delete or restore of
          historical facts.
        </p>
        {mutation.isError ? (
          <div aria-live="polite">
            <QepErrorState
              message={mutation.error instanceof Error ? mutation.error.message : "Supersede failed"}
            />
          </div>
        ) : null}
        <form
          className="mt-4 flex max-w-2xl flex-col gap-4"
          onSubmit={handleSubmit}
          data-testid="qep-traceability-supersede-form"
        >
          <Input
            label="Predecessor trace link ID"
            value={predecessorId}
            onChange={(event) => setPredecessorId(event.target.value)}
            required
            data-testid="qep-traceability-supersede-predecessor"
          />
          <Input
            label="Successor trace link ID"
            value={successorId}
            onChange={(event) => setSuccessorId(event.target.value)}
            required
            data-testid="qep-traceability-supersede-successor"
          />
          <Button
            type="submit"
            disabled={mutation.isPending || !predecessorId.trim() || !successorId.trim()}
            data-testid="qep-traceability-supersede-submit"
          >
            {mutation.isPending ? "Submitting…" : "Supersede trace link"}
          </Button>
        </form>
      </QepPanel>
    </QepPageShell>
  );
}

/** Presentation-only Trace Matrix — no coverage percentage, no graph. */
export function QepTraceMatrixView() {
  const [sourceKind, setSourceKind] = useState("requirement");
  const [targetKind, setTargetKind] = useState("requirement");
  const startedAt = useMemo(() => Date.now(), []);

  const query = useQuery({
    queryKey: qepQueryKeys.traceability.matrix({ sourceKind, targetKind }),
    queryFn: ({ signal }) => listTraceLinks({ sourceKind, targetKind, limit: 100 }, { signal }),
  });

  useEffect(() => {
    if (query.isSuccess) {
      emitQepWorkbenchTelemetry({
        event: "traceability.matrix.load",
        outcome: "success",
        durationMs: Date.now() - startedAt,
      });
    } else if (query.isError) {
      emitQepWorkbenchTelemetry({
        event: "traceability.matrix.load",
        outcome: "error",
        durationMs: Date.now() - startedAt,
      });
    }
  }, [query.isSuccess, query.isError, startedAt]);

  const items = useMemo(() => query.data?.items ?? [], [query.data]);

  const rowIds = useMemo(() => {
    const ids: string[] = [];
    for (const link of items) {
      if (!ids.includes(link.source.artefactId)) {
        ids.push(link.source.artefactId);
      }
      if (ids.length >= 20) break;
    }
    return ids;
  }, [items]);

  const colIds = useMemo(() => {
    const ids: string[] = [];
    for (const link of items) {
      if (!ids.includes(link.target.artefactId)) {
        ids.push(link.target.artefactId);
      }
      if (ids.length >= 20) break;
    }
    return ids;
  }, [items]);

  function cellLinks(rowId: string, colId: string) {
    return items.filter(
      (link) => link.source.artefactId === rowId && link.target.artefactId === colId,
    );
  }

  return (
    <QepPageShell
      title="Trace Matrix"
      description="Presentation-only cross-tabulation of trace links between two endpoint domains. Empty cells mean no returned link, not uncovered."
      breadcrumbs={["Traceability", "Matrix"]}
    >
      <QepFilterBar>
        <label className="text-sm">
          Source kind{" "}
          <select
            data-testid="qep-traceability-matrix-source-kind"
            value={sourceKind}
            onChange={(event) => setSourceKind(event.target.value)}
          >
            {TRACE_ENDPOINT_KIND_OPTIONS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Target kind{" "}
          <select
            data-testid="qep-traceability-matrix-target-kind"
            value={targetKind}
            onChange={(event) => setTargetKind(event.target.value)}
          >
            {TRACE_ENDPOINT_KIND_OPTIONS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
      </QepFilterBar>

      {query.isLoading ? <QepLoadingState label="Loading trace matrix…" /> : null}
      {query.isError ? (
        <QepErrorState
          message={query.error instanceof Error ? query.error.message : "Unable to load trace matrix"}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <QepEmptyState title="No trace links found for the selected endpoint kinds" />
      ) : null}
      {query.isSuccess && items.length > 0 ? (
        <>
          <div
            className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
            data-testid="qep-traceability-matrix-table"
          >
            <table className="min-w-full text-sm">
              <caption className="sr-only">
                Trace matrix from {sourceKind} sources to {targetKind} targets. A dash means no
                trace link was returned for that pair, not that coverage is missing.
              </caption>
              <thead className="bg-[var(--color-muted)]/40 text-left">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Source \ Target
                  </th>
                  {colIds.map((colId) => (
                    <th key={colId} scope="col" className="px-3 py-2 font-medium">
                      {colId}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowIds.map((rowId) => (
                  <tr key={rowId} className="border-t border-[var(--color-border)]">
                    <th scope="row" className="px-3 py-2 text-left font-medium">
                      {rowId}
                    </th>
                    {colIds.map((colId) => {
                      const links = cellLinks(rowId, colId);
                      return (
                        <td key={colId} className="px-3 py-2 align-top">
                          {links.length === 0 ? (
                            <span className="text-[var(--color-muted-foreground)]">—</span>
                          ) : (
                            <ul className="space-y-1">
                              {links.map((link) => (
                                <li key={link.id}>
                                  <Link
                                    href={QEP_TRACEABILITY_ROUTES.detail(link.id)}
                                    className="underline"
                                  >
                                    {link.type} · {link.lifecycleState}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <QepPanel title="List alternative (accessibility)">
            <ul className="space-y-2 text-sm" data-testid="qep-traceability-matrix-list">
              {items.map((link) => (
                <li
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-border)] p-2"
                >
                  <span>
                    {endpointLabel(link.source)} → {endpointLabel(link.target)} ({link.type} ·{" "}
                    {link.lifecycleState})
                  </span>
                  <Link href={QEP_TRACEABILITY_ROUTES.detail(link.id)} className="underline">
                    View
                  </Link>
                </li>
              ))}
            </ul>
          </QepPanel>
        </>
      ) : null}
    </QepPageShell>
  );
}

/** Trace Type taxonomy browser. */
export function QepTraceTaxonomyBrowserView() {
  const startedAt = useMemo(() => Date.now(), []);

  const query = useQuery({
    queryKey: qepQueryKeys.traceability.taxonomy(),
    queryFn: ({ signal }) => listTraceLinkTaxonomy({ signal }),
  });

  useEffect(() => {
    if (query.isSuccess) {
      emitQepWorkbenchTelemetry({
        event: "traceability.taxonomy.load",
        outcome: "success",
        durationMs: Date.now() - startedAt,
      });
    } else if (query.isError) {
      emitQepWorkbenchTelemetry({
        event: "traceability.taxonomy.load",
        outcome: "error",
        durationMs: Date.now() - startedAt,
      });
    }
  }, [query.isSuccess, query.isError, startedAt]);

  return (
    <QepPageShell
      title="Trace Type Taxonomy"
      description="Normative Trace Types governing which endpoint domains may be linked, and under what governance class."
      breadcrumbs={["Traceability", "Taxonomy"]}
    >
      {query.isLoading ? <QepLoadingState label="Loading taxonomy…" /> : null}
      {query.isError ? (
        <QepErrorState
          message={query.error instanceof Error ? query.error.message : "Unable to load taxonomy"}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && query.data.length === 0 ? (
        <QepEmptyState title="No trace types registered" />
      ) : null}
      {query.isSuccess && query.data.length > 0 ? (
        <QepTable
          caption="Trace type taxonomy"
          columns={[
            "Type",
            "Display name",
            "Family",
            "Allowed sources",
            "Allowed targets",
            "Direction",
            "Symmetric",
            "Governance class",
            "Cycle policy",
            "Default strength",
          ]}
          rows={query.data.map((entry) => ({
            id: entry.type,
            cells: [
              entry.type,
              entry.displayName,
              entry.family,
              entry.allowedSourceKinds.join(", "),
              entry.allowedTargetKinds.join(", "),
              entry.directionDefault,
              entry.symmetric ? "Yes" : "No",
              entry.governanceClass,
              entry.cyclePolicy,
              entry.defaultStrength,
            ],
          }))}
        />
      ) : null}
    </QepPageShell>
  );
}

/** Dispatches among the Traceability surfaces based on pathname. */
export function QepTraceabilityRouterView({ pathname }: { readonly pathname: string }) {
  const normalized = pathname.replace(/\/+$/, "");
  if (isQepTraceMatrixRoute(normalized)) {
    return <QepTraceMatrixView />;
  }
  if (isQepTraceTaxonomyRoute(normalized)) {
    return <QepTraceTaxonomyBrowserView />;
  }
  if (isQepTraceLinksNewRoute(normalized)) {
    return <QepTraceLinkCreateView />;
  }
  if (isQepTraceLinksSupersedeRoute(normalized)) {
    return <QepTraceLinkSupersedeView />;
  }
  if (isQepTraceHistoryRoute(normalized)) {
    const id = parseQepTraceLinkRouteId(normalized);
    if (id) {
      return <QepTraceLinkHistoryView traceLinkId={id} />;
    }
  }
  const id = parseQepTraceLinkRouteId(normalized);
  if (id) {
    return <QepTraceLinkDetailView traceLinkId={id} />;
  }
  return <QepTraceLinksListView />;
}
