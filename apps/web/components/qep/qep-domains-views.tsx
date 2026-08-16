"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { QEP_AUTOMATION_ROUTES } from "@/lib/qep/routes";
import { QEP_CERTIFICATION_ROUTES } from "@/lib/qep/certification-routes";
import { QEP_PR_QUALITY_ROUTES } from "@/lib/qep/pr-quality-routes";

import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

type DomainSignalStatus =
  "pass" | "fail" | "warning" | "unknown" | "not_tested" | "not_applicable";

type DomainCard = {
  readonly id: "security" | "performance" | "accessibility";
  readonly label: string;
  readonly status: DomainSignalStatus;
  readonly summary: string;
  readonly href: string;
  readonly openInPen?: boolean;
};

type SecuritySummary = {
  summary: {
    entitled: boolean;
    linked: boolean;
    status?: string;
    href: string;
    reviewClear: boolean;
    detail: string;
    critical: number;
    high: number;
    openCount: number;
  };
  bridge?: { penEntitled: boolean; qepEntitled: boolean };
};

type JourneyBundle = {
  journey: {
    domainTiles: Array<{
      domainId: string;
      label: string;
      status: string;
      summary: string;
    }>;
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

function mapTileStatus(raw: string | undefined): DomainSignalStatus {
  if (!raw) return "unknown";
  if (raw === "pass" || raw === "satisfied") return "pass";
  if (raw === "fail" || raw === "failed") return "fail";
  if (raw === "warning" || raw === "attention") return "warning";
  if (raw === "not_present" || raw === "not_tested") return "not_tested";
  if (raw === "not_applicable") return "not_applicable";
  return "unknown";
}

/**
 * Stream 2 Q2-09 — Security / Performance / Accessibility as release quality
 * signals. Does not replace APZPEN; opens PEN when entitled. UNKNOWN when stale/empty
 * — never false green.
 */
export function QepDomainsRouterView() {
  const searchParams = useSearchParams();
  const changeEventId = searchParams?.get("changeEventId")?.trim() || "";

  const securityQuery = useQuery({
    queryKey: ["qep-domains", "security", changeEventId],
    queryFn: () => {
      const qs = changeEventId
        ? `?changeEventId=${encodeURIComponent(changeEventId)}`
        : "";
      return fetchJson<SecuritySummary>(`/api/v1/qep/security-assurance${qs}`);
    },
  });

  const journeyQuery = useQuery({
    queryKey: ["qep-domains", "journey", changeEventId],
    enabled: Boolean(changeEventId),
    queryFn: () =>
      fetchJson<JourneyBundle>(
        `/api/v1/qep/quality-journey/by-change/${encodeURIComponent(changeEventId)}`,
      ),
  });

  if (securityQuery.isLoading) {
    return <QepLoadingState label="Loading domain signals…" />;
  }
  if (securityQuery.isError) {
    return <QepErrorState message={(securityQuery.error as Error).message} />;
  }

  const tiles = journeyQuery.data?.journey.domainTiles ?? [];
  const tile = (id: string) => tiles.find((t) => t.domainId === id);
  const security = securityQuery.data?.summary;
  const penEntitled = securityQuery.data?.bridge?.penEntitled !== false;

  const securityTile = tile("security");
  const perfTile = tile("performance");
  const a11yTile = tile("accessibility");

  const cards: DomainCard[] = [
    {
      id: "security",
      label: "Security",
      status: changeEventId
        ? mapTileStatus(securityTile?.status)
        : security?.reviewClear
          ? "pass"
          : security?.openCount
            ? "warning"
            : security?.entitled
              ? "unknown"
              : "not_applicable",
      summary: changeEventId
        ? (securityTile?.summary ??
          "No security domain tile for this change yet — UNKNOWN, not pass.")
        : (security?.detail ?? "Security assurance posture unavailable."),
      href: penEntitled
        ? security?.href?.trim() || "/apzpen"
        : QEP_CERTIFICATION_ROUTES.rcHome,
      openInPen: penEntitled,
    },
    {
      id: "performance",
      label: "Performance",
      status: changeEventId ? mapTileStatus(perfTile?.status) : "not_tested",
      summary: changeEventId
        ? (perfTile?.summary ??
          "No performance evidence linked — NOT TESTED (not a green pass).")
        : "Select a change (add ?changeEventId=) or ingest performance evidence in Automation.",
      href: QEP_AUTOMATION_ROUTES.home,
    },
    {
      id: "accessibility",
      label: "Accessibility",
      status: changeEventId ? mapTileStatus(a11yTile?.status) : "not_tested",
      summary: changeEventId
        ? (a11yTile?.summary ??
          "No accessibility evidence linked — NOT TESTED (not a green pass).")
        : "Select a change or ingest a11y evidence in Automation. WCAG-oriented counts map via evidence domains.",
      href: QEP_AUTOMATION_ROUTES.home,
    },
  ];

  return (
    <QepPageShell
      title="Quality domains"
      description="Security · Performance · Accessibility as release quality signals. NO DATA ≠ PASS. Security opens APZPEN when entitled — this hub does not replace it."
      breadcrumbs={["QEP", "Domains"]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href={QEP_PR_QUALITY_ROUTES.home}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            PR Quality
          </Link>
          <Link
            href={QEP_CERTIFICATION_ROUTES.rcHome}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Release Candidate
          </Link>
        </div>
      }
    >
      {changeEventId ? (
        <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
          Scoped to change <span className="font-mono">{changeEventId}</span>
        </p>
      ) : (
        <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
          Portfolio posture for Security; Perf/A11y need a change id or evidence ingest.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3" data-testid="qep-domains-hub">
        {cards.map((card) => (
          <QepPanel key={card.id} title={card.label}>
            <div className="mb-2">
              <QepStatusBadge status={card.status} />
            </div>
            <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
              {card.summary}
            </p>
            <Link href={card.href} className="text-sm underline">
              {card.openInPen ? "Open in APZPEN" : "Open related surface"}
            </Link>
          </QepPanel>
        ))}
      </div>

      {!changeEventId ? (
        <QepPanel title="Tip">
          <QepEmptyState title="Append ?changeEventId=<id> to load domain tiles from the Quality Journey for a specific change." />
        </QepPanel>
      ) : null}
    </QepPageShell>
  );
}
