"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";
import { QEP_REQUIREMENTS_ROUTES } from "@apzhub/qep-requirements/presentation";
import type { QepRequirementDto } from "@apzhub/qep-contracts";

import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import {
  listDefinitionRequirements,
  type DefinitionRequirementRow,
} from "@/lib/qep/qep-definition-api";
import { useWorkbenchInspector } from "@/lib/workbench/workbench-inspector";
import { QepErrorState, QepLoadingState } from "./qep-ui";

type ListTab = "all" | "mine" | "status" | "priority" | "type";

const TABS: readonly { readonly id: ListTab; readonly label: string }[] = [
  { id: "all", label: "All Requirements" },
  { id: "mine", label: "My Requirements" },
  { id: "status", label: "By Status" },
  { id: "priority", label: "By Priority" },
  { id: "type", label: "By Type" },
];

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const delta = Date.now() - date.getTime();
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  return date.toISOString().slice(0, 10);
}

function titleCase(value: string): string {
  return value.replaceAll("_", " ");
}

function ownerLabel(row: QepRequirementDto): string {
  return row.owner?.displayName?.trim() || (row.owner?.userId ? "Unavailable" : "—");
}

function RequirementInspector({
  row,
  applicationName,
  onClose,
  onPrev,
  onNext,
}: {
  readonly row: DefinitionRequirementRow;
  readonly applicationName: string;
  readonly onClose: () => void;
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
}) {
  const item = row.requirement;
  const [pane, setPane] = useState<"details" | "linked" | "history" | "attachments">(
    "details",
  );
  return (
    <div
      className="flex h-full min-h-0 flex-col text-xs"
      data-testid="qep-requirement-inspector"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{item.key}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} aria-label="Close inspector">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2">
        <FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold">{item.title}</h2>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 capitalize">
              {titleCase(item.status)}
            </span>
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 capitalize">
              {titleCase(item.type)}
            </span>
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 capitalize">
              {titleCase(item.priority)}
            </span>
          </div>
        </div>
      </div>
      <div
        className="mt-3 flex gap-3 border-b border-[var(--color-border)]"
        role="tablist"
      >
        {(
          [
            ["details", "Details"],
            ["linked", `Linked (${row.storyCount + row.criterionCount})`],
            ["history", "History"],
            ["attachments", "Attachments (—)"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={pane === id}
            className={`-mb-px border-b-2 pb-1.5 ${
              pane === id
                ? "border-[var(--color-primary)] font-medium"
                : "border-transparent text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setPane(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-auto">
        {pane === "details" ? (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Requirement ID</dt>
              <dd>{item.key}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Type</dt>
              <dd className="capitalize">{titleCase(item.type)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Priority</dt>
              <dd className="capitalize">{titleCase(item.priority)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd className="capitalize">{titleCase(item.status)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
              <dd>{ownerLabel(item)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Stories</dt>
              <dd>{row.storyCount}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">
                Acceptance Criteria
              </dt>
              <dd>{row.criterionCount}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Coverage</dt>
              <dd>
                {row.criterionCount === 0
                  ? "—"
                  : `${row.coveredCount} covered / ${row.gapCount} gaps`}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Created</dt>
              <dd>{formatRelativeTime(item.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Updated</dt>
              <dd>{formatRelativeTime(item.updatedAt)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[var(--color-muted-foreground)]">Application</dt>
              <dd>{applicationName}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[var(--color-muted-foreground)]">Source</dt>
              <dd>—</dd>
            </div>
            {item.description ? (
              <div className="col-span-2">
                <dt className="text-[var(--color-muted-foreground)]">Description</dt>
                <dd className="mt-1">{item.description}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {pane === "linked" ? (
          <p>
            {row.storyCount} user stor{row.storyCount === 1 ? "y" : "ies"} ·{" "}
            {row.criterionCount} acceptance criteria
          </p>
        ) : null}
        {pane === "history" ? (
          <p className="text-[var(--color-muted-foreground)]">
            Open the requirement to view history.
          </p>
        ) : null}
        {pane === "attachments" ? (
          <p className="text-[var(--color-muted-foreground)]">No attachments linked.</p>
        ) : null}
      </div>
      <Link
        href={QEP_REQUIREMENTS_ROUTES.detail(item.id)}
        className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-primary)] text-xs font-medium text-[var(--color-primary-foreground)]"
        data-testid="qep-open-requirement"
      >
        Open Requirement
      </Link>
    </div>
  );
}

export function QepPhase2RequirementsView() {
  const { selected, selectedId, displayContext } = useQepApplicationContext();
  const inspector = useWorkbenchInspector();
  const [tab, setTab] = useState<ListTab>("all");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [selectedIdRow, setSelectedIdRow] = useState<string | null>(null);

  useEffect(() => () => inspector.clearSelection(), [inspector]);

  const listQ = useQuery({
    queryKey: ["qep-definition-requirements", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listDefinitionRequirements(selectedId!),
  });

  const rows = listQ.data?.items ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const item = row.requirement;
      if (tab === "mine" && !item.owner?.userId) return false;
      if (type !== "all" && item.type !== type) return false;
      if (status !== "all" && item.status !== status) return false;
      if (priority !== "all" && item.priority !== priority) return false;
      if (!q) return true;
      return (
        item.key.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, tab, type, status, priority]);

  const types = useMemo(
    () => [...new Set(rows.map((row) => row.requirement.type))].sort(),
    [rows],
  );
  const statuses = useMemo(
    () => [...new Set(rows.map((row) => row.requirement.status))].sort(),
    [rows],
  );
  const priorities = useMemo(
    () => [...new Set(rows.map((row) => row.requirement.priority))].sort(),
    [rows],
  );

  function selectRow(row: DefinitionRequirementRow) {
    const index = filtered.findIndex(
      (item) => item.requirement.id === row.requirement.id,
    );
    const prev = index > 0 ? filtered[index - 1] : undefined;
    const next =
      index >= 0 && index < filtered.length - 1 ? filtered[index + 1] : undefined;
    setSelectedIdRow(row.requirement.id);
    inspector.setSelection({
      id: row.requirement.id,
      title: row.requirement.key,
      content: (
        <RequirementInspector
          row={row}
          applicationName={selected?.name ?? displayContext(row.requirement.projectId)}
          onClose={() => {
            setSelectedIdRow(null);
            inspector.clearSelection();
          }}
          onPrev={prev ? () => selectRow(prev) : undefined}
          onNext={next ? () => selectRow(next) : undefined}
        />
      ),
    });
  }

  if (!selectedId) {
    return (
      <div className="p-5 text-sm" data-testid="qep-requirements">
        Select an application to list requirements.
      </div>
    );
  }
  if (listQ.isLoading) return <QepLoadingState label="Loading requirements…" />;
  if (listQ.isError) return <QepErrorState message={(listQ.error as Error).message} />;

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-requirements"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Requirements</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Define and manage business and system requirements for the application.
          </p>
        </div>
        <Link
          href={QEP_REQUIREMENTS_ROUTES.new}
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
          data-testid="qep-requirements-create"
        >
          + Create
        </Link>
      </header>

      <div
        className="flex flex-wrap gap-4"
        role="tablist"
        data-testid="qep-requirements-tabs"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`border-b-2 px-0.5 pb-1.5 text-sm ${
              tab === item.id
                ? "border-[var(--color-foreground)] font-medium"
                : "border-transparent text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search requirements…"
          className="h-9 min-w-[10rem] flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
          aria-label="Search requirements"
          data-testid="qep-requirements-search"
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          aria-label="Type"
        >
          <option value="all">Type</option>
          {types.map((value) => (
            <option key={value} value={value}>
              {titleCase(value)}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          aria-label="Status"
        >
          <option value="all">Status</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {titleCase(value)}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          aria-label="Priority"
        >
          <option value="all">Priority</option>
          {priorities.map((value) => (
            <option key={value} value={value}>
              {titleCase(value)}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
        <table className="min-w-full text-xs" data-testid="qep-requirements-table">
          <caption className="sr-only">Requirements</caption>
          <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Priority</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Owner</th>
              <th className="px-3 py-2 font-medium">Coverage</th>
              <th className="px-3 py-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8">
                  No requirements in this application.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.requirement.id}
                  className={`cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/40 ${
                    selectedIdRow === row.requirement.id
                      ? "bg-[var(--color-muted)]/50"
                      : ""
                  }`}
                  onClick={() => selectRow(row)}
                  data-testid={`qep-requirement-row-${row.requirement.id}`}
                >
                  <td className="px-3 py-2.5 font-medium">{row.requirement.key}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{row.requirement.title}</p>
                    {row.requirement.description ? (
                      <p className="line-clamp-1 text-[var(--color-muted-foreground)]">
                        {row.requirement.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 capitalize">
                    {titleCase(row.requirement.type)}
                  </td>
                  <td className="px-3 py-2.5 capitalize">
                    {titleCase(row.requirement.priority)}
                  </td>
                  <td className="px-3 py-2.5 capitalize">
                    {titleCase(row.requirement.status)}
                  </td>
                  <td className="px-3 py-2.5">{ownerLabel(row.requirement)}</td>
                  <td className="px-3 py-2.5">{row.coverageLabel}</td>
                  <td className="px-3 py-2.5">
                    {formatRelativeTime(row.requirement.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul
        className="flex flex-col gap-2 lg:hidden"
        data-testid="qep-requirements-cards"
      >
        {filtered.length === 0 ? (
          <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs">
            No requirements in this application.
          </li>
        ) : (
          filtered.map((row) => (
            <li key={row.requirement.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left"
                onClick={() => selectRow(row)}
                data-testid={`qep-requirement-card-${row.requirement.id}`}
              >
                <p className="text-[11px] text-[var(--color-muted-foreground)]">
                  {row.requirement.key}
                </p>
                <p className="text-sm font-medium">{row.requirement.title}</p>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs">
                  <span className="capitalize">{titleCase(row.requirement.type)}</span>
                  <span className="capitalize">
                    {titleCase(row.requirement.priority)}
                  </span>
                  <span className="capitalize">
                    {titleCase(row.requirement.status)}
                  </span>
                  <span>{formatRelativeTime(row.requirement.updatedAt)}</span>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
