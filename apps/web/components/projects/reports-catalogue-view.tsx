"use client";

/**
 * W008 S-13 Reports Library + S-14 Viewer — PX-05.
 */

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import { listReportCatalogue, runOperationalReport } from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { reportsCataloguePath, reportViewerPath } from "@/lib/projects/routes";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

export function ReportsCatalogueView({
  permissions: _permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const catalogue = useQuery({
    queryKey: [...projectsQueryKeys.all, "report-catalogue"],
    queryFn: ({ signal }) => listReportCatalogue({ signal }),
  });

  return (
    <PageShell
      title="Reports"
      description="Authoritative operational report catalogue — not Analytics BI."
      breadcrumbs={["APZ Projects", "Reports"]}
    >
      <div className="space-y-4" data-testid="reports-catalogue">
        {catalogue.isLoading ? <LoadingState label="Loading catalogue…" /> : null}
        {catalogue.isError ? (
          <ErrorState
            message={
              isProjectsApiError(catalogue.error)
                ? catalogue.error.message
                : "Unable to load catalogue."
            }
            onRetry={() => void catalogue.refetch()}
          />
        ) : null}
        {!catalogue.isLoading && (catalogue.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No reports"
            description="v1 catalogue is empty — unexpected."
          />
        ) : null}
        <ul className="space-y-2 text-sm">
          {(catalogue.data ?? []).map((r) => (
            <li
              key={String(r.key)}
              className="flex flex-wrap items-center justify-between gap-2 border border-[var(--color-border)] p-3"
            >
              <div>
                <p className="font-medium">{String(r.question)}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {String(r.key)} · {String(r.audience)} · drill {String(r.drillHint)}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => router.push(reportViewerPath(String(r.key)))}
              >
                Open
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}

export function ReportViewerView({
  reportKey,
  permissions: _permissions,
}: {
  readonly reportKey: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const [scopeId, setScopeId] = useState("enterprise");
  const [scopeType, setScopeType] = useState("portfolio");

  const report = useQuery({
    queryKey: [...projectsQueryKeys.all, "report", reportKey, scopeType, scopeId],
    queryFn: ({ signal }) =>
      runOperationalReport(reportKey, { scopeType, scopeId }, { signal }),
    enabled: Boolean(scopeId.trim()),
  });

  return (
    <PageShell
      title="Report"
      description="Explainable operational report with metric drill-through."
      breadcrumbs={["APZ Projects", "Reports", reportKey]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(reportsCataloguePath())}
        >
          Catalogue
        </Button>
      }
    >
      <div className="space-y-4" data-testid="report-viewer">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Scope</span>
            <select
              className="h-9 border border-[var(--color-border)] bg-transparent px-2"
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value)}
            >
              <option value="project">Project</option>
              <option value="programme">Programme</option>
              <option value="portfolio">Portfolio</option>
              <option value="initiative">Initiative</option>
            </select>
          </label>
          <Input
            label="Scope ID"
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
          />
        </div>

        {report.isLoading ? <LoadingState label="Running report…" /> : null}
        {report.isError ? (
          <ErrorState
            message={
              isProjectsApiError(report.error) ? report.error.message : "Report failed."
            }
            onRetry={() => void report.refetch()}
          />
        ) : null}

        {report.data ? (
          <>
            <p className="text-sm font-medium">
              {String(
                (report.data.definition as { question?: string } | undefined)
                  ?.question ?? reportKey,
              )}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              As of {String(report.data.asOf)} · {String(report.data.summary)}
            </p>
            <ul className="text-sm" data-testid="report-drill-rows">
              {(
                (report.data.rows as
                  | readonly {
                      id?: string;
                      label?: string;
                      values?: Record<string, string | number>;
                      drill?: { href?: string; label?: string };
                    }[]
                  | undefined) ?? []
              ).map((row) => (
                <li
                  key={String(row.id)}
                  className="border-b border-[var(--color-border)] py-2"
                >
                  <a className="underline" href={String(row.drill?.href ?? "#")}>
                    {String(row.label)}
                  </a>
                  <span className="text-[var(--color-muted-foreground)]">
                    {" "}
                    ·{" "}
                    {Object.entries(row.values ?? {})
                      .map(([k, v]) => `${k}=${String(v)}`)
                      .join(" · ")}{" "}
                    · drill {String(row.drill?.label)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}
