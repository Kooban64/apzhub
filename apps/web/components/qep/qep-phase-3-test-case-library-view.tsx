"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileCheck, X } from "lucide-react";
import type { PresentedTestCase } from "@apzhub/qep-test-management";
import { QEP_TEST_SPECIFICATION_ROUTES } from "@apzhub/qep-test-specifications/presentation";

import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import { listTestCases } from "@/lib/qep/qep-test-management-api";
import { useWorkbenchInspector } from "@/lib/workbench/workbench-inspector";
import { QepErrorState, QepLoadingState } from "./qep-ui";

type ListTab = "all" | "mine" | "status" | "type" | "tag";

const TABS: readonly { readonly id: ListTab; readonly label: string }[] = [
  { id: "all", label: "All Test Cases" },
  { id: "mine", label: "My Test Cases" },
  { id: "status", label: "By Status" },
  { id: "type", label: "By Type" },
  { id: "tag", label: "By Tag" },
];

function titleCase(value: string): string {
  return value.replaceAll("_", " ");
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function automationLabel(row: PresentedTestCase): string {
  if (row.automationMappings.length > 0) return "Mapped";
  if (row.manualCapable) return "Manual";
  return "—";
}

function TestCaseInspector({
  row,
  onClose,
  onPrev,
  onNext,
}: {
  readonly row: PresentedTestCase;
  readonly onClose: () => void;
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
}) {
  const [pane, setPane] = useState<"details" | "steps" | "links">("details");
  return (
    <div
      className="flex h-full min-h-0 flex-col text-xs"
      data-testid="qep-test-case-inspector"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{row.number}</p>
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
        <FileCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold">{row.title}</h2>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 capitalize">
              {titleCase(row.status)}
            </span>
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 capitalize">
              {titleCase(row.type)}
            </span>
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5">
              {automationLabel(row)}
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
            ["steps", `Steps (${row.steps.length})`],
            ["links", `Links (${row.criterionIds.length})`],
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
              <dt className="text-[var(--color-muted-foreground)]">ID</dt>
              <dd>{row.number}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
              <dd>{row.owner}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Last result</dt>
              <dd className="capitalize">{titleCase(row.lastResult)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Application</dt>
              <dd>{row.unbound ? "Unbound" : "Bound"}</dd>
            </div>
          </dl>
        ) : null}
        {pane === "steps" ? (
          row.steps.length === 0 ? (
            <p>No definition steps.</p>
          ) : (
            <ol className="space-y-2">
              {row.steps.map((step) => (
                <li key={step.id}>
                  <p className="font-medium">
                    {step.order}. {step.action}
                  </p>
                  <p className="text-[var(--color-muted-foreground)]">
                    {step.expectedResult}
                  </p>
                </li>
              ))}
            </ol>
          )
        ) : null}
        {pane === "links" ? (
          row.criterionIds.length === 0 ? (
            <p>No Acceptance Criteria linked.</p>
          ) : (
            <ul className="space-y-1">
              {row.criterionIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          )
        ) : null}
      </div>
      <Link
        href={QEP_TEST_SPECIFICATION_ROUTES.detail(row.id)}
        className="mt-3 inline-flex h-8 items-center justify-center rounded-md border border-[var(--color-border)] px-3"
      >
        Open Test Case
      </Link>
    </div>
  );
}

export function QepPhase3TestCaseLibraryView() {
  const { selectedId } = useQepApplicationContext();
  const inspector = useWorkbenchInspector();
  const [tab, setTab] = useState<ListTab>("all");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  useEffect(() => () => inspector.clearSelection(), [inspector]);

  const listQ = useQuery({
    queryKey: ["qep-test-cases", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listTestCases(selectedId!),
  });

  const rows = listQ.data ?? [];
  const selectedRow = rows.find((row) => row.id === selectedRowId);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (tab === "mine" && !row.owner) return false;
      if (type !== "all" && row.type !== type) return false;
      if (status !== "all" && row.status !== status) return false;
      if (priority !== "all" && row.priority !== priority) return false;
      if (!q) return true;
      return (
        row.number.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [rows, query, tab, type, status, priority]);

  function selectRow(row: PresentedTestCase) {
    setSelectedRowId(row.id);
    inspector.clearSelection();
  }

  if (!selectedId) {
    return (
      <div className="p-5 text-sm" data-testid="qep-test-case-library">
        Select an application to list test cases.
      </div>
    );
  }
  if (listQ.isLoading) return <QepLoadingState label="Loading test cases…" />;
  if (listQ.isError) return <QepErrorState message={(listQ.error as Error).message} />;

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-test-case-library"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Test Case Library</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Centralised library of reusable test cases for the selected application.
          </p>
        </div>
        <Link
          href={QEP_TEST_SPECIFICATION_ROUTES.new}
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
          data-testid="qep-test-case-create"
        >
          + Add Test Case
        </Link>
      </header>

      <div className="flex flex-wrap gap-4" role="tablist">
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
          placeholder="Search test cases..."
          className="h-9 min-w-[10rem] flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
          aria-label="Search test cases"
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          aria-label="Type"
        >
          <option value="all">Type</option>
          {[...new Set(rows.map((row) => row.type))].map((value) => (
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
          {[...new Set(rows.map((row) => row.status))].map((value) => (
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
          {[...new Set(rows.map((row) => row.priority))].map((value) => (
            <option key={value} value={value}>
              {titleCase(value)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="hidden min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
            <table className="min-w-full text-xs" data-testid="qep-test-case-table">
              <caption className="sr-only">Test Cases</caption>
              <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Priority</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Automation</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Updated</th>
                  <th className="px-3 py-2 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8">
                      No test cases in this application.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/40 ${
                        selectedRowId === row.id ? "bg-[var(--color-muted)]/50" : ""
                      }`}
                      onClick={() => selectRow(row)}
                      data-testid={`qep-test-case-row-${row.id}`}
                    >
                      <td className="px-3 py-2.5 font-medium">
                        <Link
                          href={QEP_TEST_SPECIFICATION_ROUTES.detail(row.id)}
                          data-testid={`qep-test-case-open-${row.id}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {row.number}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">{row.title}</td>
                      <td className="px-3 py-2.5 capitalize">{titleCase(row.type)}</td>
                      <td className="px-3 py-2.5 capitalize">
                        {titleCase(row.priority)}
                      </td>
                      <td className="px-3 py-2.5 capitalize">
                        {titleCase(row.status)}
                      </td>
                      <td className="px-3 py-2.5">{automationLabel(row)}</td>
                      <td className="px-3 py-2.5">{row.owner}</td>
                      <td className="px-3 py-2.5">
                        {formatRelativeTime(row.updatedAt)}
                      </td>
                      <td className="px-3 py-2.5">{row.tags.join(", ") || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="grid gap-2 lg:hidden" data-testid="qep-test-case-cards">
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
                No test cases in this application.
              </p>
            ) : (
              filtered.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left text-xs"
                  onClick={() => selectRow(row)}
                >
                  <p className="font-medium">
                    {row.number} {row.title}
                  </p>
                  <p className="mt-1 text-[var(--color-muted-foreground)]">
                    {titleCase(row.status)} · {automationLabel(row)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
        {selectedRow ? (
          <aside className="hidden w-80 shrink-0 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 lg:block">
            <TestCaseInspector
              row={selectedRow}
              onClose={() => {
                setSelectedRowId(null);
                inspector.clearSelection();
              }}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
