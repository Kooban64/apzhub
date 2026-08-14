"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import {
  OperatorMetricStrip,
  OperatorPage,
  OperatorPanel,
} from "@/components/operator/operator-shell";

export function DenseLinkList({
  items,
}: {
  readonly items: readonly { href: string; label: string; hint?: string }[];
}) {
  return (
    <ul className="divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-[var(--color-muted)]/60"
          >
            <span className="font-medium">{item.label}</span>
            {item.hint ? (
              <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                {item.hint}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function OperatorOverview({
  title,
  subtitle,
  metrics,
  links,
  children,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly metrics: readonly { label: string; value: string }[];
  readonly links: readonly { href: string; label: string; hint?: string }[];
  readonly children?: ReactNode;
}) {
  return (
    <OperatorPage title={title} subtitle={subtitle}>
      <OperatorMetricStrip metrics={metrics} />
      <OperatorPanel title="Jump to">
        <DenseLinkList items={links} />
      </OperatorPanel>
      {children}
    </OperatorPage>
  );
}

export function DataTable({
  columns,
  rows,
  empty = "No rows.",
}: {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly ReactNode[])[];
  readonly empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-xs text-[var(--color-muted-foreground)]">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--color-border)]">
      <table className="w-full min-w-[480px] text-left text-xs">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 font-medium tracking-wide uppercase">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-[var(--color-muted)]/40">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top">
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
