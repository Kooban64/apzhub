"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { formatTimeDate } from "@/lib/time/format";
import { canCreateCustomers, type TimePermissionSource } from "@/lib/time/permissions";
import { writeLastCustomerId } from "@/lib/time/preferences";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { customerCreatePath } from "@/lib/time/routes";
import { listCustomers } from "@/lib/time/time-api";
import type { TimeCustomerListParams } from "@/lib/time/types";

import { EmptyState, ErrorState, LoadingState, PageShell, TimeTable } from "./time-ui";

function readParams(searchParams: URLSearchParams): TimeCustomerListParams {
  return {
    search: searchParams.get("q") ?? undefined,
    page: Number(searchParams.get("page") ?? "1") || 1,
    perPage: Number(searchParams.get("perPage") ?? "20") || 20,
  };
}

export function TimeCustomersView({
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
    queryKey: timeQueryKeys.customers(params),
    queryFn: ({ signal }) => listCustomers(params, { signal }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const canCreate = canCreateCustomers(permissions);
  const items = (query.data?.items ?? []).filter((customer) => {
    if (!filterText.trim()) return true;
    const needle = filterText.trim().toLowerCase();
    return (
      customer.name.toLowerCase().includes(needle) ||
      (customer.number ?? "").toLowerCase().includes(needle)
    );
  });

  return (
    <PageShell
      title="Customers"
      description="List of time customers."
      actions={
        canCreate ? (
          <Button
            type="button"
            size="sm"
            onClick={() => router.push(customerCreatePath())}
            data-testid="time-customers-create"
          >
            New customer
          </Button>
        ) : null
      }
    >
      <div
        className="grid gap-3 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-2"
        data-testid="time-customers-filters"
      >
        <Input
          label="Filter"
          value={filterText}
          onChange={(event) => updateParam("q", event.target.value)}
          data-testid="time-customers-filter"
        />
      </div>

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isTimeApiError(query.error)
              ? query.error.message
              : "Unable to load customers."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <EmptyState title="No customers found" />
      ) : null}
      {query.isSuccess && items.length > 0 ? (
        <TimeTable headers={["Name", "Number", "Status", "Updated"]}>
          {items.map((customer) => (
            <tr
              key={customer.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20"
              onClick={() => writeLastCustomerId(customer.id)}
              data-testid={`time-customer-row-${customer.id}`}
            >
              <td className="px-3 py-2 font-medium">{customer.name}</td>
              <td className="px-3 py-2">{customer.number ?? "—"}</td>
              <td className="px-3 py-2">{customer.status}</td>
              <td className="px-3 py-2">{formatTimeDate(customer.updatedAt)}</td>
            </tr>
          ))}
        </TimeTable>
      ) : null}
    </PageShell>
  );
}
