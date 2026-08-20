"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { QEP_APPLICATION_ROUTES } from "@apzhub/qep-applications/presentation";
import {
  createApplication,
  listApplications,
  type PresentedQepApplication,
} from "@/lib/qep/qep-applications-api";
import { useWorkbenchInspector } from "@/lib/workbench/workbench-inspector";
import { QepErrorState, QepLoadingState } from "./qep-ui";

function ownerLabel(row: PresentedQepApplication): string {
  if (!row.ownerUserId) return "—";
  return row.ownerDisplayName?.trim() || "Unavailable";
}

function qualityLabel(status: PresentedQepApplication["status"]): string {
  return status === "active" ? "Available" : "—";
}

function RegisterForm({ onClose }: { readonly onClose: () => void }) {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"setup" | "active">("setup");
  const mutation = useMutation({
    mutationFn: () => createApplication({ name, key, description, status }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["qep-applications"] });
      onClose();
    },
  });

  return (
    <form
      className="space-y-3 text-xs"
      data-testid="qep-register-application"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <label className="block">
        <span className="text-[var(--color-muted-foreground)]">Application name *</span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3"
        />
      </label>
      <label className="block">
        <span className="text-[var(--color-muted-foreground)]">Application key *</span>
        <input
          required
          value={key}
          onChange={(event) => setKey(event.target.value.toUpperCase())}
          className="mt-1 h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 uppercase"
        />
      </label>
      <label className="block">
        <span className="text-[var(--color-muted-foreground)]">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 min-h-[4.5rem] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-[var(--color-muted-foreground)]">Status</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "setup" | "active")}
          className="mt-1 h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
        >
          <option value="setup">Setup</option>
          <option value="active">Active</option>
        </select>
      </label>
      {mutation.isError ? (
        <p className="text-[var(--color-destructive)]">
          {(mutation.error as Error).message}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-[var(--color-primary)] text-xs font-medium text-[var(--color-primary-foreground)]"
        >
          Register Application
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-md border border-[var(--color-border)] px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function QepApplicationsView() {
  const inspector = useWorkbenchInspector();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [registering, setRegistering] = useState(false);
  const listQ = useQuery({
    queryKey: ["qep-applications", query, status],
    queryFn: () =>
      listApplications({
        q: query || undefined,
        status: status === "all" ? undefined : status,
      }),
  });

  const items = listQ.data?.applications ?? [];
  const ownerOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of items) {
      if (row.ownerUserId) map.set(row.ownerUserId, ownerLabel(row));
    }
    return [...map.entries()];
  }, [items]);
  const [owner, setOwner] = useState("all");
  const filtered = items.filter((row) =>
    owner === "all" ? true : row.ownerUserId === owner,
  );

  function selectRow(row: PresentedQepApplication) {
    inspector.setSelection({
      id: row.id,
      title: row.key,
      content: (
        <div className="space-y-3 text-xs" data-testid="qep-application-inspector">
          <h2 className="text-sm font-semibold">{row.name}</h2>
          <p className="capitalize text-[var(--color-muted-foreground)]">
            {row.status}
          </p>
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Key</dt>
              <dd className="mt-0.5 font-medium">{row.key}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
              <dd className="mt-0.5">{ownerLabel(row)}</dd>
            </div>
          </dl>
          {row.description ? <p>{row.description}</p> : null}
          <Link
            href={QEP_APPLICATION_ROUTES.detail(row.id)}
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-[var(--color-primary)] text-xs font-medium text-[var(--color-primary-foreground)]"
          >
            Open Application
          </Link>
        </div>
      ),
    });
  }

  if (listQ.isLoading) return <QepLoadingState label="Loading applications…" />;
  if (listQ.isError) return <QepErrorState message={(listQ.error as Error).message} />;

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-applications"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Applications</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Register and manage applications under quality assurance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRegistering((value) => !value)}
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
          data-testid="qep-register-application-open"
        >
          + Register Application
        </button>
      </header>

      {registering ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <RegisterForm onClose={() => setRegistering(false)} />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search applications..."
          className="h-9 min-w-[10rem] flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
          aria-label="Search applications"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          aria-label="Status"
        >
          <option value="all">Status</option>
          <option value="active">Active</option>
          <option value="setup">Setup</option>
        </select>
        <select
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          aria-label="Owner"
        >
          <option value="all">Owner</option>
          {ownerOptions.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
        <table className="min-w-full text-xs" data-testid="qep-applications-table">
          <caption className="sr-only">Applications</caption>
          <thead className="sticky top-0 bg-[var(--color-surface)] text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-3 py-2 font-medium">Application</th>
              <th className="px-3 py-2 font-medium">Key</th>
              <th className="px-3 py-2 font-medium">Owner</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Quality</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8">
                  No applications are registered yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/40"
                  onClick={() => selectRow(row)}
                  data-testid={`qep-application-row-${row.id}`}
                >
                  <td className="px-3 py-2.5 font-medium">{row.name}</td>
                  <td className="px-3 py-2.5">{row.key}</td>
                  <td className="px-3 py-2.5">{ownerLabel(row)}</td>
                  <td className="px-3 py-2.5 capitalize">{row.status}</td>
                  <td className="px-3 py-2.5">{qualityLabel(row.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul
        className="flex flex-col gap-2 lg:hidden"
        data-testid="qep-applications-cards"
      >
        {filtered.length === 0 ? (
          <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs">
            No applications are registered yet.
          </li>
        ) : (
          filtered.map((row) => (
            <li key={row.id}>
              <Link
                href={QEP_APPLICATION_ROUTES.detail(row.id)}
                className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                data-testid={`qep-application-card-${row.id}`}
              >
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {row.key}
                </p>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="capitalize">{row.status}</span>
                  <span>{qualityLabel(row.status)}</span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
