"use client";

import { Button } from "@apzhub/ui";
import type { ReactNode } from "react";

import {
  formatProjectStatus,
  formatTaskPriority,
  formatTaskStatus,
} from "@/lib/projects/format";
import type { ProjectStatus, TaskPriority, TaskStatus } from "@/lib/projects/types";
import { useProjectsDocumentTitle } from "@/lib/projects/use-projects-document-title";

import { ProjectsProductivityChrome } from "./projects-productivity-chrome";

export const PROJECTS_PRODUCT_NAME = "APZ Projects";

export function PageShell({
  title,
  documentTitle,
  description,
  actions,
  breadcrumbs,
  enableProductivityChrome = true,
  children,
}: {
  readonly title: string;
  /** Overrides visible `title` for `document.title` when more specific (HD-H2-01). */
  readonly documentTitle?: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly breadcrumbs?: readonly string[];
  /** Disable on error fallbacks so chrome cannot re-throw into the boundary. */
  readonly enableProductivityChrome?: boolean;
  readonly children: ReactNode;
}) {
  useProjectsDocumentTitle(documentTitle ?? title);

  const crumbs =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : [PROJECTS_PRODUCT_NAME, title];

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="projects-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {PROJECTS_PRODUCT_NAME}
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-1 text-xs text-[var(--color-muted-foreground)]"
            data-testid="projects-breadcrumbs"
          >
            <ol className="flex flex-wrap gap-1">
              {crumbs.map((crumb, index) => (
                <li
                  key={`${crumb}-${index}`}
                  className="inline-flex items-center gap-1"
                >
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  <span>{crumb}</span>
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--color-foreground)]">
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
      {enableProductivityChrome ? <ProjectsProductivityChrome /> : null}
    </div>
  );
}

/** Primary workspace + optional context panel (native APZHUB composition). */
export function ProjectsWorkspaceFrame({
  children,
  context,
}: {
  readonly children: ReactNode;
  readonly context?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
      data-testid="projects-workspace-frame"
    >
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
      {context ? (
        <aside
          className="w-full shrink-0 space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/10 p-4 lg:sticky lg:top-2 lg:w-72"
          data-testid="projects-context-panel"
          aria-label="APZ Projects context"
        >
          {context}
        </aside>
      ) : null}
    </div>
  );
}

export function ContextSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {title}
      </h2>
      <div className="space-y-2 text-sm text-[var(--color-foreground)]">{children}</div>
    </section>
  );
}

export function LoadingState({
  label = "Loading APZ Projects…",
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
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid="projects-error"
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        Unable to load APZ Projects
      </p>
      <p className="mt-1 text-sm text-[var(--color-foreground)]/80">{message}</p>
      {onRetry ? (
        <div className="mt-3">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
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
    status === "initiating" ||
    status === "active" ||
    status === "on_hold" ||
    status === "closing" ||
    status === "closed" ||
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
