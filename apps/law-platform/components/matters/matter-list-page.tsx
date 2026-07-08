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
import { MatterContextPanel } from "./matter-context-panel";
import { MatterListTable } from "./matter-list-table";
import { getSharedClientRepository } from "../../lib/clients";
import { useMatterWorkflow } from "../../lib/matters/matter-workflow-context";
import {
  MATTER_PRIORITIES,
  MATTER_STATUS_OPTIONS,
  getSharedMatterRepository,
  matterCreateRoute,
  matterDetailRoute,
  type Matter,
  type MatterPriority,
  type MatterStatus,
} from "../../lib/matters";

const PAGE_SIZE = 10;

export interface MatterListPageProps {
  readonly initialQuery?: string;
}

/** Matter list page — LawListPageLayout with workflow search (LAW-003-01). */
export function MatterListPage({ initialQuery = "" }: MatterListPageProps) {
  const router = useRouter();
  const workflow = useMatterWorkflow();
  const repository = getSharedMatterRepository();
  const clients = useMemo(() => getSharedClientRepository().list(), []);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<MatterStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<MatterPriority | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedMatter, setSelectedMatter] = useState<Matter | undefined>();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, priorityFilter, clientFilter]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      workflow.searchMatters({
        query,
        status: statusFilter,
        priority: priorityFilter,
        clientId: clientFilter,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loading, query, statusFilter, priorityFilter, clientFilter, workflow]);

  const filteredMatters = useMemo(
    () =>
      repository.list({
        query,
        status: statusFilter,
        priority: priorityFilter,
        clientId: clientFilter,
      }),
    [repository, query, statusFilter, priorityFilter, clientFilter],
  );

  const pageCount = Math.max(1, Math.ceil(filteredMatters.length / PAGE_SIZE));
  const pageMatters = filteredMatters.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectClassName =
    "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm";

  return (
    <LawListPageLayout
      header={
        <LawPageHeader
          eyebrow="Matter Management"
          title="Matters"
          subtitle="Browse and search the firm matter register. Data is in-memory only for UX validation."
          primaryAction={
            <LawPageHeaderButton onClick={() => router.push(matterCreateRoute())}>
              Create Matter
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
            onClick={() => setQuery("")}
          >
            Clear search
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(matterCreateRoute())}
            data-testid="matter-toolbar-create"
          >
            New matter
          </Button>
        </div>
      }
      searchArea={
        <LawSearchBar
          placeholder="Search matters by title, reference, tag, or status…"
          value={query}
          onChange={setQuery}
          data-testid="matter-search-bar"
        />
      }
      filtersArea={
        <LawFilterBar label="Matter filters">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-muted-foreground)]">Status</span>
            <select
              className={selectClassName}
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as MatterStatus | "all")
              }
              data-testid="matter-filter-status"
            >
              <option value="all">All statuses</option>
              {MATTER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-muted-foreground)]">Priority</span>
            <select
              className={selectClassName}
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value as MatterPriority | "all")
              }
              data-testid="matter-filter-priority"
            >
              <option value="all">All priorities</option>
              {MATTER_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-muted-foreground)]">Client</span>
            <select
              className={selectClassName}
              value={clientFilter}
              onChange={(event) => setClientFilter(event.target.value)}
              data-testid="matter-filter-client"
            >
              <option value="all">All clients</option>
              {clients.map((client) => (
                <option key={client.clientId} value={client.clientId}>
                  {client.displayName}
                </option>
              ))}
            </select>
          </label>
        </LawFilterBar>
      }
      state={
        loading ? (
          <LawTableLoadingSkeleton />
        ) : filteredMatters.length === 0 ? (
          <LawEmptyState
            variant={repository.count() === 0 ? "no-matters" : "no-results"}
          />
        ) : null
      }
      table={
        loading ? (
          <div aria-hidden="true" />
        ) : (
          <MatterListTable
            matters={pageMatters}
            selectedMatterId={selectedMatter?.matterId}
            onSelect={setSelectedMatter}
            onOpen={(matter) => router.push(matterDetailRoute(matter.matterId))}
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
      contextPanel={<MatterContextPanel matter={selectedMatter} />}
    />
  );
}
