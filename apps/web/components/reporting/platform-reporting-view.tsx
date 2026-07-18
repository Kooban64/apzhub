"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { toReportingUserMessage } from "@/lib/reporting/reporting-errors";
import {
  generateReport,
  getGenerationMetadata,
  listGeneratedReports,
  listOutputFormats,
  listTemplates,
  previewReport,
  validateTemplate,
} from "@/lib/reporting/reporting-api";
import type {
  ReportGenerationMetadataViewModel,
  ReportGenerationResultViewModel,
  ReportTemplateViewModel,
} from "@/lib/reporting/reporting-types";
import type { ReportingSection } from "@/lib/reporting/routes";

function PageShell({
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
    <div className="flex flex-col gap-6 p-1" data-testid="reporting-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Reporting
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

function EmptyState({
  title,
  description,
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="reporting-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid="reporting-error"
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        Unable to load reporting
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{message}</p>
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

function ReportingTable({
  columns,
  rows,
  caption,
  onRowClick,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly caption?: string;
  readonly onRowClick?: (id: string) => void;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid="reporting-table"
    >
      <table className="min-w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-3 py-2 font-medium text-[var(--color-foreground)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={
                onRowClick
                  ? "cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/20"
                  : "border-b border-[var(--color-border)]"
              }
              onClick={onRowClick ? () => onRowClick(row.id) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row.id);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              data-testid={`reporting-row-${row.id}`}
            >
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.id}-${index}`}
                  className="px-3 py-2 text-[var(--color-foreground)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function paginate<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function sortTemplates(
  items: readonly ReportTemplateViewModel[],
  sort: "name" | "type" | "updated",
  order: "asc" | "desc",
): ReportTemplateViewModel[] {
  const dir = order === "asc" ? 1 : -1;
  return items.slice().sort((a, b) => {
    if (sort === "type") return a.reportType.localeCompare(b.reportType) * dir;
    if (sort === "updated") return a.updatedAt.localeCompare(b.updatedAt) * dir;
    return a.name.localeCompare(b.name) * dir;
  });
}

function sortMetadata(
  items: readonly ReportGenerationMetadataViewModel[],
  sort: "generated" | "type" | "format",
  order: "asc" | "desc",
): ReportGenerationMetadataViewModel[] {
  const dir = order === "asc" ? 1 : -1;
  return items.slice().sort((a, b) => {
    if (sort === "type") return a.reportType.localeCompare(b.reportType) * dir;
    if (sort === "format") return a.outputFormat.localeCompare(b.outputFormat) * dir;
    return a.generatedAt.localeCompare(b.generatedAt) * dir;
  });
}

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PlatformReportingView({
  section = "templates",
}: {
  readonly section?: ReportingSection;
}) {
  const [search, setSearch] = useState("");
  const [sortTemplatesBy, setSortTemplatesBy] = useState<"name" | "type" | "updated">(
    "name",
  );
  const [sortMetaBy, setSortMetaBy] = useState<"generated" | "type" | "format">(
    "generated",
  );
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedMetadataId, setSelectedMetadataId] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReportGenerationResultViewModel | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const pageSize = 10;

  const templatesQuery = useQuery({
    queryKey: ["reporting", "templates"],
    queryFn: ({ signal }) => listTemplates(undefined, { signal }),
  });
  const generationsQuery = useQuery({
    queryKey: ["reporting", "generations"],
    queryFn: ({ signal }) => listGeneratedReports({ signal }),
  });
  const formatsQuery = useQuery({
    queryKey: ["reporting", "formats"],
    queryFn: ({ signal }) => listOutputFormats({ signal }),
  });

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = (templatesQuery.data?.items ?? []).filter((item) =>
      q.length === 0
        ? true
        : item.name.toLowerCase().includes(q) ||
          item.reportType.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q),
    );
    return sortTemplates(items, sortTemplatesBy, order);
  }, [templatesQuery.data?.items, search, sortTemplatesBy, order]);

  const filteredGenerations = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = (generationsQuery.data?.items ?? []).filter((item) =>
      q.length === 0
        ? true
        : item.reportType.toLowerCase().includes(q) ||
          item.templateId.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.outputFormat.toLowerCase().includes(q),
    );
    return sortMetadata(items, sortMetaBy, order);
  }, [generationsQuery.data?.items, search, sortMetaBy, order]);

  const pagedTemplates = paginate(filteredTemplates, page, pageSize);
  const pagedGenerations = paginate(filteredGenerations, page, pageSize);
  const selectedTemplate =
    filteredTemplates.find((t) => t.id === selectedTemplateId) ??
    filteredTemplates[0] ??
    null;

  async function refreshAll() {
    setActionError(null);
    await Promise.all([
      templatesQuery.refetch(),
      generationsQuery.refetch(),
      formatsQuery.refetch(),
    ]);
  }

  async function runValidate() {
    if (!selectedTemplate) {
      setValidationMessage("Select a template first.");
      return;
    }
    setActionError(null);
    try {
      const result = await validateTemplate({
        reportType: selectedTemplate.reportType,
        templateId: selectedTemplate.id,
        outputFormat: "html",
      });
      setValidationMessage(
        result.valid
          ? "Template is valid."
          : `Validation failed: ${result.errors.join("; ") || "unknown"}`,
      );
    } catch (error) {
      setActionError(toReportingUserMessage(error));
    }
  }

  async function runPreview() {
    if (!selectedTemplate) {
      setActionError("Select a template first.");
      return;
    }
    setActionError(null);
    try {
      const result = await previewReport({
        reportType: selectedTemplate.reportType,
        templateId: selectedTemplate.id,
        outputFormat: "html",
      });
      setPreview(result);
    } catch (error) {
      setActionError(toReportingUserMessage(error));
    }
  }

  async function runGenerate() {
    if (!selectedTemplate) {
      setActionError("Select a template first.");
      return;
    }
    setActionError(null);
    try {
      const result = await generateReport({
        reportType: selectedTemplate.reportType,
        templateId: selectedTemplate.id,
        outputFormat: "html",
      });
      setPreview(result);
      await generationsQuery.refetch();
    } catch (error) {
      setActionError(toReportingUserMessage(error));
    }
  }

  async function viewMetadata() {
    const id =
      selectedMetadataId ?? filteredGenerations[0]?.id ?? preview?.metadata.id ?? null;
    if (!id) {
      setActionError("No generation metadata selected.");
      return;
    }
    setActionError(null);
    try {
      const meta = await getGenerationMetadata(id);
      setSelectedMetadataId(meta.id);
      downloadJson(`report-metadata-${meta.id}.json`, meta);
    } catch (error) {
      setActionError(toReportingUserMessage(error));
    }
  }

  function downloadSelectedMetadata() {
    const meta =
      filteredGenerations.find((item) => item.id === selectedMetadataId) ??
      filteredGenerations[0] ??
      preview?.metadata;
    if (!meta) {
      setActionError("No generation metadata available to download.");
      return;
    }
    downloadJson(`report-metadata-${meta.id}.json`, meta);
  }

  const commands = (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Reporting commands"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void refreshAll()}
      >
        Refresh
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void runGenerate()}
      >
        Generate
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void runPreview()}
      >
        Preview
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void viewMetadata()}
      >
        View Metadata
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={downloadSelectedMetadata}
      >
        Download Metadata
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void runValidate()}
      >
        Validate Template
      </Button>
      <Link
        href="/workspace/testing/reports"
        className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/20"
      >
        Open Consumer
      </Link>
    </div>
  );

  const filters = (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Search
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Filter…"
          aria-label="Filter reporting list"
        />
      </label>
      {section === "templates" ? (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
          Sort
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
            value={sortTemplatesBy}
            onChange={(event) =>
              setSortTemplatesBy(event.target.value as "name" | "type" | "updated")
            }
            aria-label="Sort templates"
          >
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="updated">Updated</option>
          </select>
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
          Sort
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
            value={sortMetaBy}
            onChange={(event) =>
              setSortMetaBy(event.target.value as "generated" | "type" | "format")
            }
            aria-label="Sort generations"
          >
            <option value="generated">Generated</option>
            <option value="type">Type</option>
            <option value="format">Format</option>
          </select>
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Order
        <select
          className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
          value={order}
          onChange={(event) => setOrder(event.target.value as "asc" | "desc")}
          aria-label="Sort order"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>
  );

  const title =
    section === "formats"
      ? "Formats"
      : section === "generations"
        ? "Generated Reports"
        : section === "history"
          ? "History"
          : "Templates";

  return (
    <PageShell
      title={title}
      description="Platform reporting — templates, generations, and output formats."
      actions={commands}
    >
      {actionError ? (
        <ErrorState message={actionError} onRetry={() => setActionError(null)} />
      ) : null}
      {validationMessage ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="status">
          {validationMessage}
        </p>
      ) : null}

      {section === "formats" ? (
        formatsQuery.isLoading ? (
          <p role="status">Loading formats…</p>
        ) : formatsQuery.isError ? (
          <ErrorState
            message={toReportingUserMessage(formatsQuery.error)}
            onRetry={() => void formatsQuery.refetch()}
          />
        ) : (
          <ReportingTable
            caption="Supported output formats"
            columns={["Format"]}
            rows={(formatsQuery.data ?? []).map((format) => ({
              id: format,
              cells: [format],
            }))}
          />
        )
      ) : null}

      {section === "templates" ? (
        <>
          {filters}
          {templatesQuery.isLoading ? (
            <p role="status">Loading templates…</p>
          ) : templatesQuery.isError ? (
            <ErrorState
              message={toReportingUserMessage(templatesQuery.error)}
              onRetry={() => void templatesQuery.refetch()}
            />
          ) : filteredTemplates.length === 0 ? (
            <EmptyState
              title="No templates found"
              description="No report templates are registered for this workspace."
            />
          ) : (
            <>
              <ReportingTable
                caption="Report templates"
                columns={["Name", "Type", "Version", "Builtin", "Updated"]}
                onRowClick={(id) => setSelectedTemplateId(id)}
                rows={pagedTemplates.map((item) => ({
                  id: item.id,
                  cells: [
                    item.name,
                    item.reportType,
                    item.version,
                    item.builtin ? "Yes" : "No",
                    item.updatedAt,
                  ],
                }))}
              />
              <div className="flex items-center gap-2 text-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of{" "}
                  {Math.max(1, Math.ceil(filteredTemplates.length / pageSize))}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page * pageSize >= filteredTemplates.length}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </>
      ) : null}

      {section === "generations" || section === "history" ? (
        <>
          {filters}
          {generationsQuery.isLoading ? (
            <p role="status">Loading generations…</p>
          ) : generationsQuery.isError ? (
            <ErrorState
              message={toReportingUserMessage(generationsQuery.error)}
              onRetry={() => void generationsQuery.refetch()}
            />
          ) : filteredGenerations.length === 0 ? (
            <EmptyState
              title="No generated reports"
              description="Generate or preview a report to create metadata entries."
            />
          ) : (
            <>
              <ReportingTable
                caption={
                  section === "history"
                    ? "Report generation history"
                    : "Generated reports"
                }
                columns={["ID", "Type", "Template", "Format", "Generated", "Preview"]}
                onRowClick={(id) => setSelectedMetadataId(id)}
                rows={pagedGenerations.map((item) => ({
                  id: item.id,
                  cells: [
                    item.id,
                    item.reportType,
                    item.templateId,
                    item.outputFormat,
                    item.generatedAt,
                    item.preview ? "Yes" : "No",
                  ],
                }))}
              />
              <div className="flex items-center gap-2 text-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of{" "}
                  {Math.max(1, Math.ceil(filteredGenerations.length / pageSize))}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page * pageSize >= filteredGenerations.length}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </>
      ) : null}

      <section aria-label="Report preview" className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          Preview
        </h2>
        {preview ? (
          <div className="rounded-lg border border-[var(--color-border)] p-4">
            <p className="font-medium">{preview.document.title}</p>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Format: {preview.output.format} · {preview.output.byteLength} bytes
            </p>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs">
              {preview.output.body.slice(0, 4000)}
            </pre>
          </div>
        ) : (
          <EmptyState
            title="No preview yet"
            description="Use Preview or Generate to render a report document."
          />
        )}
      </section>
    </PageShell>
  );
}
