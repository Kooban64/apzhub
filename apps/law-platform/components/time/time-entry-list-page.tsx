"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  LawEmptyState,
  LawFilterBar,
  LawListPageLayout,
  LawPageHeader,
  LawPageHeaderButton,
  LawPagination,
  LawSearchBar,
  LawTableLoadingSkeleton,
} from "../ux";
import { TimeEntryContextPanel } from "./time-entry-context-panel";
import { TimeEntryListTable } from "./time-entry-list-table";
import { useTimeEntryWorkflow } from "../../lib/time/time-entry-workflow-context";
import {
  SEED_TIME_ATTORNEYS,
  getSharedTimeEntryRepository,
  timeEntryCreateRoute,
  timeEntryDetailRoute,
  type ManagedTimeEntry,
  type TimeEntryBillableFilter,
  type TimeEntryDateFilter,
} from "../../lib/time";
import { getSharedMatterRepository } from "../../lib/matters";
import { getSharedTaskRepository } from "../../lib/tasks";

const PAGE_SIZE = 10;

export interface TimeEntryListPageProps {
  readonly initialQuery?: string;
}

/** Time entry list page — LawListPageLayout with workflow search (LAW-006-01). */
export function TimeEntryListPage({ initialQuery = "" }: TimeEntryListPageProps) {
  const router = useRouter();
  const workflow = useTimeEntryWorkflow();
  const repository = getSharedTimeEntryRepository();
  const matters = useMemo(() => getSharedMatterRepository().list(), []);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [dateFilter, setDateFilter] = useState<TimeEntryDateFilter>("all");
  const [matterFilter, setMatterFilter] = useState<string>("all");
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const [attorneyFilter, setAttorneyFilter] = useState<string>("all");
  const [billableFilter, setBillableFilter] = useState<TimeEntryBillableFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<ManagedTimeEntry | undefined>();

  const taskOptions = useMemo(() => {
    if (matterFilter === "all") {
      return getSharedTaskRepository().list();
    }

    return getSharedTaskRepository().list({ matterId: matterFilter });
  }, [matterFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  function resetFiltersPage() {
    setPage(1);
  }

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      workflow.searchTimeEntries({
        query,
        entryDateFilter: dateFilter,
        matterId: matterFilter,
        taskId: taskFilter,
        userId: attorneyFilter,
        billableFilter,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [
    loading,
    query,
    dateFilter,
    matterFilter,
    taskFilter,
    attorneyFilter,
    billableFilter,
    workflow,
  ]);

  const filteredEntries = useMemo(
    () =>
      repository.list({
        query,
        entryDateFilter: dateFilter,
        matterId: matterFilter,
        taskId: taskFilter,
        userId: attorneyFilter,
        billableFilter,
      }),
    [
      repository,
      query,
      dateFilter,
      matterFilter,
      taskFilter,
      attorneyFilter,
      billableFilter,
    ],
  );

  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const pageEntries = filteredEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectClassName =
    "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm";

  return (
    <div data-testid="time-entry-list-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Time Recording"
            title="Time Entries"
            subtitle="Browse and record firm time linked to matters. Data is in-memory only for UX validation."
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(timeEntryCreateRoute())}
                data-testid="time-entry-create-button"
              >
                Record Time
              </LawPageHeaderButton>
            }
          />
        }
        toolbar={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                resetFiltersPage();
              }}
            >
              Clear search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(timeEntryCreateRoute())}
              data-testid="time-entry-toolbar-create"
            >
              Record time
            </Button>
          </div>
        }
        searchArea={
          <LawSearchBar
            placeholder="Search time entries by description, reference, matter, or attorney…"
            value={query}
            onChange={(value) => {
              setQuery(value);
              resetFiltersPage();
            }}
            data-testid="time-entry-search-bar"
          />
        }
        filtersArea={
          <LawFilterBar label="Time filters">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Date</span>
              <select
                className={selectClassName}
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value as TimeEntryDateFilter);
                  resetFiltersPage();
                }}
                data-testid="time-entry-filter-date"
              >
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="this_week">This week</option>
                <option value="this_month">This month</option>
                <option value="last_30_days">Last 30 days</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Matter</span>
              <select
                className={selectClassName}
                value={matterFilter}
                onChange={(event) => {
                  setMatterFilter(event.target.value);
                  setTaskFilter("all");
                  resetFiltersPage();
                }}
                data-testid="time-entry-filter-matter"
              >
                <option value="all">All matters</option>
                {matters.map((matter) => (
                  <option key={matter.matterId} value={matter.matterId}>
                    {matter.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Task</span>
              <select
                className={selectClassName}
                value={taskFilter}
                onChange={(event) => {
                  setTaskFilter(event.target.value);
                  resetFiltersPage();
                }}
                data-testid="time-entry-filter-task"
              >
                <option value="all">All tasks</option>
                {taskOptions.map((task) => (
                  <option key={task.taskId} value={task.taskId}>
                    {task.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Attorney</span>
              <select
                className={selectClassName}
                value={attorneyFilter}
                onChange={(event) => {
                  setAttorneyFilter(event.target.value);
                  resetFiltersPage();
                }}
                data-testid="time-entry-filter-attorney"
              >
                <option value="all">All attorneys</option>
                {SEED_TIME_ATTORNEYS.map((attorney) => (
                  <option key={attorney.userId} value={attorney.userId}>
                    {attorney.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Billable</span>
              <select
                className={selectClassName}
                value={billableFilter}
                onChange={(event) => {
                  setBillableFilter(event.target.value as TimeEntryBillableFilter);
                  resetFiltersPage();
                }}
                data-testid="time-entry-filter-billable"
              >
                <option value="all">All entries</option>
                <option value="billable">Billable only</option>
                <option value="non_billable">Non-billable only</option>
              </select>
            </label>
          </LawFilterBar>
        }
        table={
          loading ? (
            <LawTableLoadingSkeleton />
          ) : pageEntries.length === 0 ? (
            <LawEmptyState variant="no-results" />
          ) : (
            <TimeEntryListTable
              entries={pageEntries}
              selectedTimeEntryId={selectedEntry?.timeEntryId}
              onSelect={setSelectedEntry}
              onOpen={(entry) => router.push(timeEntryDetailRoute(entry.timeEntryId))}
            />
          )
        }
        pagination={
          loading ? null : (
            <LawPagination
              page={page}
              pageCount={pageCount}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => Math.min(pageCount, current + 1))}
            />
          )
        }
        contextPanel={<TimeEntryContextPanel timeEntry={selectedEntry} />}
      />
    </div>
  );
}
