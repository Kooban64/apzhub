"use client";

/**
 * P2 Enterprise Identity Picker — Platform Identity directory only.
 * Replaces free-text owner / principal fields in Projects UI.
 */

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useState } from "react";

import { listRoles, listUsers } from "@/lib/identity/identity-api";
import { listDeliveryTeams } from "@/lib/projects/projects-api";

export type EnterpriseIdentityKind = "user" | "role" | "team";

export function EnterpriseIdentityPicker({
  kind = "user",
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Search directory…",
  testId,
}: {
  readonly kind?: EnterpriseIdentityKind;
  readonly label: string;
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly testId?: string;
}) {
  const listId = useId();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(search.trim()), 250);
    return () => window.clearTimeout(handle);
  }, [search]);

  const query = useQuery({
    queryKey: ["projects", "identity-picker", kind, debounced],
    queryFn: async ({ signal }) => {
      if (kind === "role") {
        const result = await listRoles({ limit: 50 }, { signal });
        return result.items.map((role) => ({
          id: role.id,
          label: role.name,
          hint: role.id,
        }));
      }
      if (kind === "team") {
        // Enterprise Delivery Team Directory (P2 / W006) — not Identity Groups.
        const items = await listDeliveryTeams({ signal });
        return items.map((team) => ({
          id: String(team.id),
          label: String(team.name),
          hint: String(team.leadUserId ?? team.id),
        }));
      }
      const result = await listUsers({ limit: 50 }, { signal });
      return result.items.map((user) => ({
        id: user.id,
        label: user.displayName || user.email || user.id,
        hint: user.email ?? user.id,
      }));
    },
  });

  const options = useMemo(() => {
    const items = query.data ?? [];
    if (!debounced) return items.slice(0, 20);
    const q = debounced.toLowerCase();
    return items
      .filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          item.hint.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [query.data, debounced]);

  const selectedLabel =
    (query.data ?? []).find((item) => item.id === value)?.label ?? value;

  return (
    <div
      className="flex min-w-[14rem] flex-col gap-1"
      data-testid={testId ?? `enterprise-identity-picker-${kind}`}
    >
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
        autoComplete="off"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </datalist>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label={`Selected ${label}`}
          value={value}
          readOnly
          placeholder="Select from directory"
          disabled={disabled}
          required={required}
        />
        {value ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onChange("")}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {value ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Selected: {selectedLabel}
        </p>
      ) : null}
      {query.isError ? (
        <p className="text-xs text-[var(--color-destructive)]">
          Identity directory unavailable — cannot resolve principals.
        </p>
      ) : null}
      {!query.isLoading && options.length > 0 ? (
        <div
          className="max-h-32 overflow-y-auto border border-[var(--color-border)] text-sm"
          role="listbox"
          aria-label={`${label} matches`}
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={option.id === value}
              className="block w-full px-2 py-1 text-left hover:bg-[var(--color-muted)]/40"
              onClick={() => {
                onChange(option.id);
                setSearch(option.label);
              }}
            >
              <span className="font-medium">{option.label}</span>
              <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
                {option.hint}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Multi principal picker for core team membership (comma-joined ids). */
export function EnterpriseIdentityMultiPicker({
  label,
  value,
  onChange,
  disabled = false,
  testId,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly disabled?: boolean;
  readonly testId?: string;
}) {
  const selected = value
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2" data-testid={testId ?? "enterprise-identity-multi"}>
      <EnterpriseIdentityPicker
        label={label}
        value=""
        onChange={(id) => {
          if (!id || selected.includes(id)) return;
          onChange([...selected, id].join(", "));
        }}
        disabled={disabled}
        placeholder="Add directory user…"
      />
      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2 text-xs">
          {selected.map((id) => (
            <li
              key={id}
              className="flex items-center gap-1 border border-[var(--color-border)] px-2 py-1"
            >
              <span>{id}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onClick={() =>
                  onChange(selected.filter((item) => item !== id).join(", "))
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
