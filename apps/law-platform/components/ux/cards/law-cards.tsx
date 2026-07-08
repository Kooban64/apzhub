import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@apzhub/ui";

export interface LawInformationCardProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function LawInformationCard({ title, children }: LawInformationCardProps) {
  return (
    <Card data-testid="law-information-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export interface LawStatisticsCardProps {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
}

export function LawStatisticsCard({ label, value, hint }: LawStatisticsCardProps) {
  return (
    <Card data-testid="law-statistics-card">
      <CardContent className="flex flex-col gap-1 pt-6">
        <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
        <p className="text-3xl font-semibold text-[var(--color-foreground)]">{value}</p>
        {hint ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export interface LawWarningCardProps {
  readonly title: string;
  readonly message: string;
}

export function LawWarningCard({ title, message }: LawWarningCardProps) {
  return (
    <Card
      className="border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10"
      data-testid="law-warning-card"
    >
      <CardHeader>
        <CardTitle className="text-[var(--color-warning-foreground)]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-[var(--color-foreground)]">
        {message}
      </CardContent>
    </Card>
  );
}

export interface LawStatusCardProps {
  readonly label: string;
  readonly status: string;
  readonly tone?: "neutral" | "success" | "warning";
}

export function LawStatusCard({ label, status, tone = "neutral" }: LawStatusCardProps) {
  const toneClass =
    tone === "success"
      ? "text-[var(--color-success)]"
      : tone === "warning"
        ? "text-[var(--color-warning)]"
        : "text-[var(--color-foreground)]";

  return (
    <Card data-testid="law-status-card">
      <CardContent className="flex items-center justify-between pt-6">
        <span className="text-sm text-[var(--color-muted-foreground)]">{label}</span>
        <span className={`text-sm font-medium ${toneClass}`}>{status}</span>
      </CardContent>
    </Card>
  );
}

export interface LawQuickActionsCardProps {
  readonly title?: string;
  readonly actions: ReactNode;
}

export function LawQuickActionsCard({
  title = "Quick actions",
  actions,
}: LawQuickActionsCardProps) {
  return (
    <Card data-testid="law-quick-actions-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">{actions}</CardContent>
    </Card>
  );
}
