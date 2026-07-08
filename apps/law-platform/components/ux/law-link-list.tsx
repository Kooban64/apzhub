import Link from "next/link";

export interface LawLinkListItem {
  readonly title: string;
  readonly subtitle: string;
  readonly route: string;
}

export interface LawLinkListProps {
  readonly items: readonly LawLinkListItem[];
  readonly emptyLabel: string;
  readonly testId?: string;
}

/** Standard linked list for dashboard and workspace panels (LAW-013). */
export function LawLinkList({ items, emptyLabel, testId }: LawLinkListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]" data-testid={testId}>
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-border)]" data-testid={testId}>
      {items.map((item) => (
        <li key={item.route}>
          <Link
            href={item.route}
            className="block rounded-sm py-2 transition hover:bg-[var(--color-muted)]/40 hover:text-[var(--law-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--law-accent)]"
          >
            <span className="block text-sm font-medium text-[var(--color-foreground)]">
              {item.title}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {item.subtitle}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
