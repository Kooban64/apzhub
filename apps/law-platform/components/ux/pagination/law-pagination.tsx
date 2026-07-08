import { Button } from "@apzhub/ui";

export interface LawPaginationProps {
  readonly page?: number;
  readonly pageCount?: number;
  readonly onPrevious?: () => void;
  readonly onNext?: () => void;
}

/** Presentational pagination controls — no paging logic (LAW-001-02). */
export function LawPagination({
  page = 1,
  pageCount = 1,
  onPrevious,
  onNext,
}: LawPaginationProps) {
  return (
    <nav
      className="flex items-center justify-between gap-3 text-sm"
      data-testid="law-pagination"
      aria-label="Pagination"
    >
      <span className="text-[var(--color-muted-foreground)]">
        Page {page} of {pageCount}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= pageCount}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
