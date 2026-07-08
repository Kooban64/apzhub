import { cn } from "@apzhub/ui";

export interface LawBreadcrumbItem {
  readonly label: string;
  readonly href?: string;
  readonly current?: boolean;
}

export interface LawBreadcrumbsProps {
  readonly items: readonly LawBreadcrumbItem[];
  readonly className?: string;
}

/** Reusable breadcrumb trail for Law Platform modules (LAW-001-02). */
export function LawBreadcrumbs({ items, className }: LawBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" data-testid="law-breadcrumbs" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="hover:text-[var(--color-foreground)] hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(isLast && "font-medium text-[var(--color-foreground)]")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
