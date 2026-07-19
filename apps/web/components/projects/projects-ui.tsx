"use client";

import { Button } from "@apzhub/ui";
import type { ReactNode } from "react";

import {
  formatProjectStatus,
  formatTaskPriority,
  formatTaskStatus,
} from "@/lib/projects/format";
import type { ProjectStatus, TaskPriority, TaskStatus } from "@/lib/projects/types";

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="projects-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Projects
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      {children}
    </div>
  );
}

export function LoadingState({
  label = "Loading Projects…",
}: {
  readonly label?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]"
      data-testid="projects-loading"
      role="status"
    >
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="projects-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/5 px-4 py-6"
      data-testid="projects-error"
      role="alert"
    >
      <p className="text-sm text-[var(--color-foreground)]">{message}</p>
      {onRetry ? (
        <Button type="button" size="sm" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  readonly status: ProjectStatus | TaskStatus;
}) {
  const label =
    status === "draft" ||
    status === "active" ||
    status === "on_hold" ||
    status === "completed" ||
    status === "archived"
      ? formatProjectStatus(status)
      : formatTaskStatus(status as TaskStatus);
  return (
    <span
      className="inline-flex rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs font-medium"
      data-testid="projects-status-badge"
    >
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { readonly priority: TaskPriority }) {
  return (
    <span className="inline-flex rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs">
      {formatTaskPriority(priority)}
    </span>
  );
}

export function ProjectsTable({
  headers,
  children,
}: {
  readonly headers: readonly string[];
  readonly children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table
        className="w-full min-w-[640px] text-left text-sm"
        data-testid="projects-table"
      >
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function ProjectPicker({
  projects,
  value,
  onChange,
  testId = "projects-project-picker",
}: {
  readonly projects: readonly { id: string; name: string; identifier: string }[];
  readonly value: string;
  readonly onChange: (projectId: string) => void;
  readonly testId?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">Project</span>
      <select
        className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
      >
        <option value="">Select a project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.identifier} — {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}
