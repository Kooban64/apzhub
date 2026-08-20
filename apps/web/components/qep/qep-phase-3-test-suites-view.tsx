"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Layers, X } from "lucide-react";
import type { PresentedSuite, PresentedTestCase } from "@apzhub/qep-test-management";
import { parseQepSuiteRouteId } from "@apzhub/qep-suites/presentation";

import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import { useSessionOpenedId } from "@/lib/qep/use-session-opened-id";
import {
  addSuiteMember,
  createTestSuite,
  getTestSuite,
  listTestCases,
  listTestSuites,
} from "@/lib/qep/qep-test-management-api";
import { useWorkbenchInspector } from "@/lib/workbench/workbench-inspector";
import { QepErrorState, QepLoadingState } from "./qep-ui";

function titleCase(value: string): string {
  return value.replaceAll("_", " ");
}

function SuiteInspector({
  row,
  cases,
  onClose,
  onOpen,
  onPrev,
  onNext,
}: {
  readonly row: PresentedSuite;
  readonly cases: readonly PresentedTestCase[];
  readonly onClose: () => void;
  readonly onOpen: () => void;
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
}) {
  return (
    <div
      className="flex h-full min-h-0 flex-col text-xs"
      data-testid="qep-suite-inspector"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{row.suiteKey ?? row.id}</p>
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
        <Layers className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold">{row.name}</h2>
          <p className="text-[var(--color-muted-foreground)]">
            {row.description || "—"}
          </p>
        </div>
      </div>
      <p className="mt-3 font-medium">Membership</p>
      {row.memberIds.length === 0 ? (
        <p className="mt-1">No Test Cases in this suite.</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {row.memberIds.map((id) => {
            const testCase = cases.find((item) => item.id === id);
            return (
              <li key={id}>{testCase ? `${testCase.number} ${testCase.title}` : id}</li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        className="mt-4 inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-2"
        data-testid={`qep-suite-open-${row.id}`}
        onClick={onOpen}
      >
        Open suite
      </button>
    </div>
  );
}

export function QepPhase3TestSuitesView({ pathname }: { readonly pathname: string }) {
  const { selectedId } = useQepApplicationContext();
  const inspector = useWorkbenchInspector();
  const queryClient = useQueryClient();
  const livePath = usePathname() ?? pathname;
  const routeSuiteId = parseQepSuiteRouteId(livePath);
  const { openedId: openedSuiteId, setOpenedId: setOpenedSuiteId } = useSessionOpenedId(
    "apzqep.openedTestSuiteId",
  );
  const suiteId = routeSuiteId ?? openedSuiteId ?? undefined;
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  useEffect(() => () => inspector.clearSelection(), [inspector]);

  const listQ = useQuery({
    queryKey: ["qep-test-suites", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listTestSuites(selectedId!),
  });
  const casesQ = useQuery({
    queryKey: ["qep-test-cases", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listTestCases(selectedId!),
  });
  const detailQ = useQuery({
    queryKey: ["qep-test-suite", suiteId],
    enabled: Boolean(suiteId),
    queryFn: () => getTestSuite(suiteId!),
  });

  const create = useMutation({
    mutationFn: () => createTestSuite({ applicationId: selectedId!, name }),
    onSuccess: async () => {
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["qep-test-suites"] });
    },
  });
  const addMember = useMutation({
    mutationFn: () => addSuiteMember(suiteId!, memberId),
    onSuccess: async () => {
      setMemberId("");
      await queryClient.invalidateQueries({ queryKey: ["qep-test-suite", suiteId] });
      await queryClient.invalidateQueries({ queryKey: ["qep-test-suites"] });
    },
  });

  const rows = listQ.data ?? [];
  const selectedSuite = rows.find((row) => row.id === selectedRowId);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        (row.suiteKey ?? "").toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q),
    );
  }, [rows, query]);

  function selectRow(row: PresentedSuite) {
    setSelectedRowId(row.id);
    inspector.clearSelection();
  }

  if (suiteId) {
    const suite = detailQ.data ?? rows.find((row) => row.id === suiteId);
    if (!suite) {
      if (detailQ.isError)
        return <QepErrorState message={(detailQ.error as Error).message} />;
      return <QepLoadingState label="Loading suite…" />;
    }
    return (
      <div
        className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
        data-testid="qep-test-suite-detail"
      >
        <button
          type="button"
          className="w-fit text-xs text-[var(--color-muted-foreground)]"
          data-testid="qep-suite-back"
          onClick={() => setOpenedSuiteId(null)}
        >
          Test Suites
        </button>
        <h1 className="text-xl font-semibold">
          {suite.suiteKey ?? "Unbound"} {suite.name}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {suite.description || "Reusable grouping of Test Cases."}
        </p>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
          <h2 className="font-medium">Membership</h2>
          <ul className="mt-2 space-y-1 text-xs" data-testid="qep-suite-membership">
            {suite.memberIds.length === 0 ? (
              <li>No Test Cases yet.</li>
            ) : (
              suite.memberIds.map((id) => {
                const testCase = (casesQ.data ?? []).find((item) => item.id === id);
                return (
                  <li key={id}>
                    {testCase ? `${testCase.number} ${testCase.title}` : id}
                  </li>
                );
              })
            )}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              className="h-9 rounded-md border border-[var(--color-border)] px-2 text-xs"
            >
              <option value="">Add Test Case</option>
              {(casesQ.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.number} {item.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-md border border-[var(--color-border)] px-3 text-xs"
              disabled={!memberId || addMember.isPending}
              onClick={() => addMember.mutate()}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedId) {
    return (
      <div className="p-5 text-sm" data-testid="qep-test-suites">
        Select an application to list test suites.
      </div>
    );
  }
  if (listQ.isLoading) return <QepLoadingState label="Loading suites…" />;
  if (listQ.isError) return <QepErrorState message={(listQ.error as Error).message} />;

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-test-suites"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Test Suites</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Organise and manage reusable collections of test cases.
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) create.mutate();
          }}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Suite name"
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
          >
            + Add Suite
          </button>
        </form>
      </header>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search suites..."
        className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
      />
      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="hidden min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
            <table className="min-w-full text-xs" data-testid="qep-suite-table">
              <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Test Cases</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Updated</th>
                  <th className="px-3 py-2 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8">
                      No suites in this application.
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
                      data-testid={`qep-suite-row-${row.id}`}
                      onDoubleClick={() => undefined}
                    >
                      <td className="px-3 py-2.5 font-medium">{row.suiteKey ?? "—"}</td>
                      <td className="px-3 py-2.5">{row.name}</td>
                      <td className="px-3 py-2.5">{row.description || "—"}</td>
                      <td className="px-3 py-2.5 capitalize">{titleCase(row.kind)}</td>
                      <td className="px-3 py-2.5">{row.memberCount}</td>
                      <td className="px-3 py-2.5 capitalize">
                        {titleCase(row.status)}
                      </td>
                      <td className="px-3 py-2.5">{row.ownerId}</td>
                      <td className="px-3 py-2.5">{row.updatedAt.slice(0, 10)}</td>
                      <td className="px-3 py-2.5">{row.tags.join(", ") || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="grid gap-2 lg:hidden">
            {filtered.map((row) => (
              <button
                key={row.id}
                type="button"
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left text-xs"
                onClick={() => selectRow(row)}
              >
                <p className="font-medium">
                  {row.suiteKey ?? "Unbound"} {row.name}
                </p>
                <p className="text-[var(--color-muted-foreground)]">
                  {row.memberCount} test cases
                </p>
              </button>
            ))}
          </div>
        </div>
        {selectedSuite ? (
          <aside className="hidden w-80 shrink-0 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 lg:block">
            <SuiteInspector
              row={selectedSuite}
              cases={casesQ.data ?? []}
              onClose={() => {
                setSelectedRowId(null);
                inspector.clearSelection();
              }}
              onOpen={() => setOpenedSuiteId(selectedSuite.id)}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
