import { cn } from "@apzhub/ui";

export interface LawLoadingSkeletonProps {
  readonly rows?: number;
  readonly className?: string;
}

function SkeletonBar({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--color-muted)]", className)}
      aria-hidden="true"
    />
  );
}

/** Reusable loading skeleton blocks (LAW-001-02). */
export function LawLoadingSkeleton({ rows = 4, className }: LawLoadingSkeletonProps) {
  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      data-testid="law-loading-skeleton"
      aria-busy="true"
      aria-label="Loading"
    >
      <SkeletonBar className="h-8 w-1/3" />
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonBar key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function LawTableLoadingSkeleton() {
  return (
    <div
      data-testid="law-table-loading-skeleton"
      aria-busy="true"
      aria-label="Loading table"
    >
      <LawLoadingSkeleton rows={6} />
    </div>
  );
}

export function LawDetailLoadingSkeleton() {
  return (
    <div
      className="grid gap-4 md:grid-cols-3"
      data-testid="law-detail-loading-skeleton"
    >
      <LawLoadingSkeleton rows={2} className="md:col-span-1" />
      <LawLoadingSkeleton rows={5} className="md:col-span-2" />
    </div>
  );
}
