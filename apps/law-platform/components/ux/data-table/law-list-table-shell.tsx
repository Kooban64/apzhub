import type { ReactNode } from "react";

export interface LawListTableColumn {
  readonly id: string;
  readonly header: string;
  readonly width?: string;
  readonly align?: "left" | "right";
}

export interface LawListTableShellProps {
  readonly columns: readonly LawListTableColumn[];
  readonly children: ReactNode;
  readonly testId?: string;
  readonly emptyMessage?: string;
  readonly isEmpty?: boolean;
  readonly actionsHeader?: string;
}

/** Standard list table shell — sticky header, consistent styling (LAW-013-05). */
export function LawListTableShell({
  columns,
  children,
  testId,
  emptyMessage = "No rows match the current filters.",
  isEmpty = false,
  actionsHeader = "Actions",
}: LawListTableShellProps) {
  const columnCount = columns.length + 1;

  return (
    <div
      className="max-h-[min(70vh,48rem)] overflow-auto rounded-lg border border-[var(--color-border)]"
      data-testid={testId}
    >
      <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--color-muted)]/95 backdrop-blur-sm">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={`px-4 py-3 font-medium text-[var(--color-muted-foreground)] ${
                  column.align === "right" ? "text-right" : "text-left"
                }`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
            <th
              scope="col"
              className="px-4 py-3 text-right font-medium text-[var(--color-muted-foreground)]"
            >
              {actionsHeader}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
          {isEmpty ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-4 py-8 text-center text-[var(--color-muted-foreground)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
