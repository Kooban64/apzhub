export interface LawDataTableColumn {
  readonly id: string;
  readonly header: string;
  readonly width?: string;
}

export interface LawDataTableProps {
  readonly columns: readonly LawDataTableColumn[];
  readonly rowCount?: number;
  readonly emptyMessage?: string;
}

/** Presentational table shell — no data binding (LAW-001-02). */
export function LawDataTable({
  columns,
  rowCount = 0,
  emptyMessage = "No rows to display.",
}: LawDataTableProps) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid="law-data-table"
    >
      <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
        <thead className="bg-[var(--color-muted)]/40">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className="px-4 py-3 text-left font-medium text-[var(--color-muted-foreground)]"
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
          {rowCount === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[var(--color-muted-foreground)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            Array.from({ length: rowCount }, (_, rowIndex) => (
              <tr key={rowIndex} data-testid={`law-data-table-row-${rowIndex}`}>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className="px-4 py-3 text-[var(--color-foreground)]"
                  >
                    —
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
