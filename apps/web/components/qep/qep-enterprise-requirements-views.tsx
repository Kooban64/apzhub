"use client";

import type {
  RequirementLifecycleState,
  RequirementRisk,
} from "@apzhub/qep-requirements-traceability";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import {
  createEnterpriseRequirement,
  getCoverageDashboard,
  getEnterpriseRequirement,
  getRequirementTraceability,
  getTraceabilityMatrix,
  linkSuiteToRequirement,
  listEnterpriseRequirements,
  transitionEnterpriseRequirement,
  type CreateEnterpriseRequirementInput,
  type QepEnterpriseRequirementListParams,
} from "@/lib/qep/qep-enterprise-requirements-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_DEFECT_ROUTES,
  QEP_ENTERPRISE_REQUIREMENT_ROUTES,
  QEP_EXECUTION_WORKSPACE_ROUTES,
  isQepEnterpriseRequirementsCoverageRoute,
  isQepEnterpriseRequirementsMatrixRoute,
  isQepEnterpriseRequirementsNewRoute,
  parseQepEnterpriseRequirementRouteId,
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

const LIFECYCLE_ACTIONS: Readonly<
  Record<
    RequirementLifecycleState,
    readonly { status: RequirementLifecycleState; label: string }[]
  >
> = {
  draft: [
    { status: "under_review", label: "Submit for review" },
    { status: "archived", label: "Archive" },
  ],
  under_review: [
    { status: "approved", label: "Approve" },
    { status: "draft", label: "Return to draft" },
  ],
  approved: [
    { status: "active", label: "Activate" },
    { status: "deprecated", label: "Deprecate" },
  ],
  active: [
    { status: "deprecated", label: "Deprecate" },
    { status: "archived", label: "Archive" },
  ],
  deprecated: [
    { status: "active", label: "Reactivate" },
    { status: "archived", label: "Archive" },
  ],
  archived: [
    { status: "retired", label: "Retire" },
    { status: "draft", label: "Restore" },
  ],
  retired: [],
};

function formatDate(value?: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function QepEnterpriseRequirementsRouterView({
  pathname,
}: {
  readonly pathname: string;
}) {
  if (isQepEnterpriseRequirementsNewRoute(pathname)) {
    return <RequirementCreateView />;
  }
  if (isQepEnterpriseRequirementsMatrixRoute(pathname)) {
    return <MatrixView />;
  }
  if (isQepEnterpriseRequirementsCoverageRoute(pathname)) {
    return <CoverageDashboardView />;
  }
  const requirementId = parseQepEnterpriseRequirementRouteId(pathname);
  if (requirementId) {
    return <RequirementDetailView requirementId={requirementId} />;
  }
  return <RequirementListView />;
}

function RequirementListView() {
  const [status, setStatus] = useState("");
  const [risk, setRisk] = useState("");
  const [query, setQuery] = useState("");
  const [uncoveredOnly, setUncoveredOnly] = useState(false);

  const params = useMemo<QepEnterpriseRequirementListParams>(
    () => ({
      ...(status ? { status } : {}),
      ...(risk ? { risk } : {}),
      ...(query.trim() ? { query: query.trim() } : {}),
      ...(uncoveredOnly ? { uncoveredOnly: true } : {}),
      sortBy: "updatedAt",
      sortDirection: "desc",
    }),
    [status, risk, query, uncoveredOnly],
  );

  const listQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseRequirements.list(params),
    queryFn: ({ signal }) => listEnterpriseRequirements(params, { signal }),
  });

  const items = listQuery.data?.items ?? [];

  return (
    <QepPageShell
      title="Requirements & Traceability"
      description="Expectations governed independently. Traceability and coverage are derived."
      breadcrumbs={["QEP", "Enterprise Requirements"]}
      actions={
        <>
          <Link
            href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.matrix}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Matrix
          </Link>
          <Link
            href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.coverage}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Coverage
          </Link>
          <Link
            href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.new}
            className="inline-flex h-8 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm text-[var(--color-primary-foreground)]"
          >
            New requirement
          </Link>
        </>
      }
    >
      <QepFilterBar>
        <Input
          aria-label="Search requirements"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filter by status"
          className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {(
            [
              "draft",
              "under_review",
              "approved",
              "active",
              "deprecated",
              "archived",
            ] as const
          ).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by risk"
          className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
        >
          <option value="">All risks</option>
          {(["critical", "high", "medium", "low"] as const).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={uncoveredOnly}
            onChange={(e) => setUncoveredOnly(e.target.checked)}
          />
          Uncovered only
        </label>
      </QepFilterBar>

      {listQuery.isLoading ? (
        <QepLoadingState label="Loading requirements…" />
      ) : listQuery.isError ? (
        <QepErrorState
          message={
            listQuery.error instanceof Error
              ? listQuery.error.message
              : "Failed to load"
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : items.length === 0 ? (
        <QepEmptyState title="No requirements yet. Create one and link suites for derived coverage." />
      ) : (
        <QepTable
          caption="Enterprise requirements"
          columns={["Title", "Status", "Priority", "Risk", "Suites", "Updated"]}
          rows={items.map((r) => ({
            id: r.requirementId,
            cells: [
              <Link
                key="t"
                href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.detail(r.requirementId)}
                className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
              >
                {r.title}
              </Link>,
              <QepStatusBadge key="s" status={r.status} />,
              r.priority,
              r.risk,
              String(r.suiteLinks.length),
              formatDate(r.updatedAt),
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function RequirementCreateView() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [risk, setRisk] = useState<RequirementRisk>("medium");

  const createMutation = useMutation({
    mutationFn: (input: CreateEnterpriseRequirementInput) =>
      createEnterpriseRequirement(input),
    onSuccess: (req) => {
      router.push(QEP_ENTERPRISE_REQUIREMENT_ROUTES.detail(req.requirementId));
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate({
      title: title.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      risk,
    });
  };

  return (
    <QepPageShell
      title="New requirement"
      description="Requirements define what the organisation expects — independent of execution."
      breadcrumbs={["QEP", "Enterprise Requirements", "New"]}
      actions={
        <Link
          href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Cancel
        </Link>
      }
    >
      <form className="mx-auto flex max-w-xl flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          Title
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            className="min-h-24 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Risk
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2"
            value={risk}
            onChange={(e) => setRisk(e.target.value as RequirementRisk)}
          >
            {(["critical", "high", "medium", "low"] as const).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        {createMutation.error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : "Create failed"}
          </p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating…" : "Create requirement"}
        </Button>
      </form>
    </QepPageShell>
  );
}

function RequirementDetailView({ requirementId }: { readonly requirementId: string }) {
  const queryClient = useQueryClient();
  const [suiteId, setSuiteId] = useState("");

  const detailQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseRequirements.detail(requirementId),
    queryFn: ({ signal }) => getEnterpriseRequirement(requirementId, { signal }),
  });

  const traceQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseRequirements.traceability(requirementId),
    queryFn: ({ signal }) => getRequirementTraceability(requirementId, { signal }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: qepQueryKeys.enterpriseRequirements.all(),
    });
  };

  const lifecycleMutation = useMutation({
    mutationFn: (status: RequirementLifecycleState) =>
      transitionEnterpriseRequirement(requirementId, status),
    onSuccess: invalidate,
  });

  const linkMutation = useMutation({
    mutationFn: () => linkSuiteToRequirement(requirementId, suiteId.trim()),
    onSuccess: async () => {
      setSuiteId("");
      await invalidate();
    },
  });

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading requirement…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={
          detailQuery.error instanceof Error ? detailQuery.error.message : "Not found"
        }
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const { requirement, history } = detailQuery.data;
  const actions = LIFECYCLE_ACTIONS[requirement.status];
  const coverage = traceQuery.data?.coverage;
  const links = traceQuery.data?.links ?? [];

  return (
    <QepPageShell
      title={requirement.title}
      description={`${requirement.category} · ${requirement.priority} · risk ${requirement.risk}`}
      breadcrumbs={["QEP", "Enterprise Requirements", requirement.title]}
      actions={
        <>
          <Link
            href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.home}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Back
          </Link>
          {actions.map((action) => (
            <Button
              key={action.status}
              type="button"
              size="sm"
              variant="outline"
              disabled={lifecycleMutation.isPending}
              onClick={() => lifecycleMutation.mutate(action.status)}
            >
              {action.label}
            </Button>
          ))}
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <QepPanel title="Summary">
            <p className="mb-2">
              <QepStatusBadge status={requirement.status} />
            </p>
            <p className="whitespace-pre-wrap text-sm">
              {requirement.description || "No description"}
            </p>
          </QepPanel>

          <QepPanel title="Derived coverage">
            {coverage ? (
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Overall</dt>
                  <dd className="text-lg font-semibold">{coverage.overallCoverage}%</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Verification</dt>
                  <dd>
                    <QepStatusBadge status={coverage.verificationStatus} />
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Suites</dt>
                  <dd>{coverage.suiteCount}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Sessions</dt>
                  <dd>{coverage.sessionCount}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Evidence</dt>
                  <dd>{coverage.evidenceCount}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Open defects</dt>
                  <dd>{coverage.openDefectCount}</dd>
                </div>
              </dl>
            ) : (
              <QepLoadingState label="Calculating coverage…" />
            )}
            <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
              Coverage is calculated. It cannot be manually edited.
            </p>
          </QepPanel>

          <QepPanel title="Traceability graph (derived)">
            <ul className="max-h-80 space-y-1 overflow-auto text-sm">
              {links.map((link) => (
                <li key={link.linkId} className="font-mono text-xs">
                  {link.fromKind}:{link.fromId.slice(0, 12)} → {link.toKind}:
                  {link.toId.slice(0, 12)}{" "}
                  <span className="text-[var(--color-muted-foreground)]">
                    ({link.origin})
                  </span>
                  {link.toKind === "execution_session" ? (
                    <>
                      {" "}
                      <Link
                        href={QEP_EXECUTION_WORKSPACE_ROUTES.detail(link.toId)}
                        className="text-[var(--color-primary)] underline"
                      >
                        open
                      </Link>
                    </>
                  ) : null}
                  {link.toKind === "defect" ? (
                    <>
                      {" "}
                      <Link
                        href={QEP_DEFECT_ROUTES.detail(link.toId)}
                        className="text-[var(--color-primary)] underline"
                      >
                        open
                      </Link>
                    </>
                  ) : null}
                </li>
              ))}
              {links.length === 0 ? (
                <li className="text-[var(--color-muted-foreground)]">
                  Link a suite to derive the chain.
                </li>
              ) : null}
            </ul>
          </QepPanel>

          <QepPanel title="History">
            <ol className="space-y-2 text-sm">
              {[...history].reverse().map((entry, index) => (
                <li
                  key={`${entry.at}-${entry.action}-${index}`}
                  className="border-l-2 border-[var(--color-border)] pl-3"
                >
                  <div className="font-medium capitalize">
                    {entry.action.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">
                    {formatDate(entry.at)} · {entry.actorId}
                    {entry.detail ? ` · ${entry.detail}` : ""}
                  </div>
                </li>
              ))}
            </ol>
          </QepPanel>
        </div>

        <div className="flex flex-col gap-4">
          <QepPanel title="Link suite">
            <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
              Explicit entry to the derivation chain. Caps A–D remain SoRs.
            </p>
            <ul className="mb-3 space-y-1 text-sm">
              {requirement.suiteLinks.map((l) => (
                <li key={l.linkId} className="font-mono text-xs">
                  {l.suiteId}
                  {l.suiteName ? ` · ${l.suiteName}` : ""}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              <Input
                aria-label="Suite ID"
                placeholder="Suite ID"
                value={suiteId}
                onChange={(e) => setSuiteId(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                disabled={!suiteId.trim() || linkMutation.isPending}
                onClick={() => linkMutation.mutate()}
              >
                Link suite
              </Button>
            </div>
            {linkMutation.error ? (
              <p className="mt-2 text-xs text-[var(--color-destructive)]">
                {linkMutation.error instanceof Error
                  ? linkMutation.error.message
                  : "Link failed"}
              </p>
            ) : null}
          </QepPanel>

          <QepPanel title="Ownership">
            <dl className="space-y-1 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
                <dd>{requirement.ownerId}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Version</dt>
                <dd>{requirement.version}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Created</dt>
                <dd>{formatDate(requirement.createdAt)}</dd>
              </div>
            </dl>
          </QepPanel>
        </div>
      </div>
    </QepPageShell>
  );
}

function MatrixView() {
  const matrixQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseRequirements.matrix({}),
    queryFn: ({ signal }) => getTraceabilityMatrix({}, { signal }),
  });

  const rows = matrixQuery.data?.items ?? [];

  return (
    <QepPageShell
      title="Traceability matrix"
      description="Derived relationships — not a manually maintained document."
      breadcrumbs={["QEP", "Enterprise Requirements", "Matrix"]}
      actions={
        <Link
          href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Requirements
        </Link>
      }
    >
      {matrixQuery.isLoading ? (
        <QepLoadingState label="Deriving matrix…" />
      ) : rows.length === 0 ? (
        <QepEmptyState title="No requirements in the matrix yet." />
      ) : (
        <QepTable
          caption="Traceability matrix"
          columns={[
            "Requirement",
            "Suites",
            "Plans",
            "Sessions",
            "Evidence",
            "Defects",
            "Coverage",
            "Verification",
          ]}
          rows={rows.map((row) => ({
            id: row.requirementId,
            cells: [
              <Link
                key="t"
                href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.detail(row.requirementId)}
                className="underline-offset-2 hover:underline"
              >
                {row.title}
              </Link>,
              String(row.suiteIds.length),
              String(row.planIds.length),
              String(row.sessionIds.length),
              String(row.evidenceIds.length),
              String(row.defectIds.length),
              `${row.coverage.overallCoverage}%`,
              <QepStatusBadge key="v" status={row.coverage.verificationStatus} />,
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function CoverageDashboardView() {
  const dashQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseRequirements.coverageDashboard({}),
    queryFn: ({ signal }) => getCoverageDashboard({}, { signal }),
  });

  const summary = dashQuery.data?.summary;
  const items = dashQuery.data?.items ?? [];

  return (
    <QepPageShell
      title="Coverage dashboard"
      description="Automatically calculated coverage across requirements."
      breadcrumbs={["QEP", "Enterprise Requirements", "Coverage"]}
      actions={
        <Link
          href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Requirements
        </Link>
      }
    >
      {dashQuery.isLoading ? (
        <QepLoadingState label="Calculating coverage…" />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <QepPanel title="Total">
              <p className="text-2xl font-semibold">{summary?.total ?? 0}</p>
            </QepPanel>
            <QepPanel title="Uncovered">
              <p className="text-2xl font-semibold">{summary?.uncovered ?? 0}</p>
            </QepPanel>
            <QepPanel title="High-risk gaps">
              <p className="text-2xl font-semibold">{summary?.highRiskGaps ?? 0}</p>
            </QepPanel>
            <QepPanel title="Average coverage">
              <p className="text-2xl font-semibold">{summary?.averageCoverage ?? 0}%</p>
            </QepPanel>
          </div>
          {items.length === 0 ? (
            <QepEmptyState title="No coverage data yet." />
          ) : (
            <QepTable
              caption="Coverage by requirement"
              columns={[
                "Requirement",
                "Overall",
                "Suite",
                "Execution",
                "Evidence",
                "Defect",
                "Verification",
              ]}
              rows={items.map((item) => ({
                id: item.requirementId,
                cells: [
                  <Link
                    key="t"
                    href={QEP_ENTERPRISE_REQUIREMENT_ROUTES.detail(item.requirementId)}
                    className="underline-offset-2 hover:underline"
                  >
                    {item.requirementId}
                  </Link>,
                  `${item.overallCoverage}%`,
                  `${item.suiteCoverage}%`,
                  `${item.executionCoverage}%`,
                  `${item.evidenceCoverage}%`,
                  `${item.defectCoverage}%`,
                  <QepStatusBadge key="v" status={item.verificationStatus} />,
                ],
              }))}
            />
          )}
        </>
      )}
    </QepPageShell>
  );
}
