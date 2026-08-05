"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { formatTimeDate } from "@/lib/time/format";
import { canCreateTags, type TimePermissionSource } from "@/lib/time/permissions";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { tagCreatePath } from "@/lib/time/routes";
import { listTags } from "@/lib/time/time-api";
import type { TimeTagListParams } from "@/lib/time/types";

import { EmptyState, ErrorState, LoadingState, PageShell, TimeTable } from "./time-ui";

function readParams(searchParams: URLSearchParams): TimeTagListParams {
  return {
    search: searchParams.get("q") ?? undefined,
    page: Number(searchParams.get("page") ?? "1") || 1,
    perPage: Number(searchParams.get("perPage") ?? "20") || 20,
  };
}

export function TimeTagsView({
  permissions,
}: {
  readonly permissions?: TimePermissionSource;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => readParams(searchParams), [searchParams]);
  const filterText = searchParams.get("q") ?? "";

  const query = useQuery({
    queryKey: timeQueryKeys.tags(params),
    queryFn: ({ signal }) => listTags(params, { signal }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const canCreate = canCreateTags(permissions);
  const items = (query.data?.items ?? []).filter((tag) => {
    if (!filterText.trim()) return true;
    const needle = filterText.trim().toLowerCase();
    return tag.name.toLowerCase().includes(needle);
  });

  return (
    <PageShell
      title="Tags"
      description="Tags used to organise timesheets in APZ Time."
      breadcrumbs={["APZ Time", "Tags"]}
      actions={
        canCreate ? (
          <Button
            type="button"
            size="sm"
            onClick={() => router.push(tagCreatePath())}
            data-testid="time-tags-create"
          >
            New tag
          </Button>
        ) : null
      }
    >
      <div
        className="grid gap-3 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-2"
        data-testid="time-tags-filters"
      >
        <Input
          label="Filter"
          value={filterText}
          onChange={(event) => updateParam("q", event.target.value)}
          data-testid="time-tags-filter"
        />
      </div>

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isTimeApiError(query.error) ? query.error.message : "Unable to load tags."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <EmptyState title="No tags found" />
      ) : null}
      {query.isSuccess && items.length > 0 ? (
        <TimeTable headers={["Name", "Color", "Status", "Updated"]}>
          {items.map((tag) => (
            <tr
              key={tag.id}
              className="border-b border-[var(--color-border)] last:border-0"
              data-testid={`time-tag-row-${tag.id}`}
            >
              <td className="px-3 py-2 font-medium">{tag.name}</td>
              <td className="px-3 py-2 font-mono text-xs">{tag.color ?? "—"}</td>
              <td className="px-3 py-2">{tag.status}</td>
              <td className="px-3 py-2">{formatTimeDate(tag.updatedAt)}</td>
            </tr>
          ))}
        </TimeTable>
      ) : null}
    </PageShell>
  );
}
