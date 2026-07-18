"use client";

import { Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";

import {
  listSupportGroups,
  listSupportOrganizations,
  listSupportUsers,
} from "@/lib/support/support-api";

export type SupportLookupKind = "users" | "organizations" | "groups";

export function SupportLookupSelect({
  kind,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Search…",
}: {
  readonly kind: SupportLookupKind;
  readonly label: string;
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
}) {
  const listId = useId();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(search.trim()), 250);
    return () => window.clearTimeout(handle);
  }, [search]);

  const query = useQuery({
    queryKey: ["support", "lookup", kind, debounced],
    queryFn: async ({ signal }) => {
      if (kind === "users") {
        const result = await listSupportUsers(
          { search: debounced || undefined, limit: 20 },
          { signal },
        );
        return result.data.map((user) => ({
          id: user.id,
          label: `${user.displayName}${user.email ? ` (${user.email})` : ""}`,
        }));
      }
      if (kind === "organizations") {
        const result = await listSupportOrganizations(
          { search: debounced || undefined, limit: 20 },
          { signal },
        );
        return result.data.map((org) => ({ id: org.id, label: org.name }));
      }
      const result = await listSupportGroups(
        { search: debounced || undefined, limit: 20 },
        { signal },
      );
      return result.data.map((group) => ({ id: group.id, label: group.name }));
    },
  });

  const options = query.data ?? [];

  return (
    <div className="flex flex-col gap-1" data-testid={`support-lookup-${kind}`}>
      <label className="text-sm font-medium" htmlFor={`${listId}-search`}>
        {label}
        {required ? " *" : ""}
      </label>
      <Input
        id={`${listId}-search`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        list={listId}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </datalist>
      <Input
        aria-label={`${label} ID`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Global ID"
        disabled={disabled}
        required={required}
      />
      {query.isError ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Lookup unavailable.
        </p>
      ) : null}
    </div>
  );
}
