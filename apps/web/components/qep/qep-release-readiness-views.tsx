"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { QEP_CERTIFICATION_ROUTES } from "@/lib/qep/certification-routes";
import { QEP_QUALITY_FLOWS_ROUTES } from "@/lib/qep/quality-flow-routes";
import {
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

const linkPrimary =
  "inline-flex h-8 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)]";
const linkOutline =
  "inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

type CommandCentre = {
  summary: {
    activeCount: number;
    waitingCount: number;
    exceptionCount: number;
    blockedReleaseCount: number;
    decisionCount: number;
    definitionCount: number;
  };
};

type SecurityAssurancePayload = {
  summary: {
    entitled: boolean;
    linked: boolean;
    href: string;
    reviewClear: boolean;
    detail: string;
    critical: number;
    high: number;
    openCount: number;
    assessmentPosition?: string;
  };
};

type CheckItem = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  href: string;
};

type RiskListPayload = {
  items: readonly {
    riskId: string;
    title: string;
    severity: string;
    status: string;
    waiverNote?: string;
  }[];
};

export function QepReleaseReadinessRouterView() {
  return <ReleaseReadinessView />;
}

function ReleaseReadinessView() {
  const flowsQuery = useQuery({
    queryKey: ["qep-quality-flows", "command-centre", "readiness"],
    queryFn: () => fetchJson<CommandCentre>("/api/v1/qep/quality-flows"),
    refetchInterval: 15_000,
  });
  const securityQuery = useQuery({
    queryKey: ["qep-security-assurance", "readiness"],
    queryFn: () =>
      fetchJson<SecurityAssurancePayload>("/api/v1/qep/security-assurance"),
    refetchInterval: 30_000,
  });
  const riskQuery = useQuery({
    queryKey: ["qep-risk", "readiness"],
    queryFn: () => fetchJson<RiskListPayload>("/api/v1/qep/risk"),
    refetchInterval: 30_000,
  });

  if (flowsQuery.isLoading || securityQuery.isLoading) {
    return <QepLoadingState label="Loading release readiness…" />;
  }
  if (flowsQuery.isError) {
    return <QepErrorState message={(flowsQuery.error as Error).message} />;
  }

  const s = flowsQuery.data!.summary;
  const security = securityQuery.data?.summary;
  const securityOk = security?.reviewClear === true;
  const securityDetail = securityQuery.isError
    ? `Unable to load APZPEN posture: ${(securityQuery.error as Error).message}`
    : (security?.detail ?? "Security assurance posture unavailable.");
  const securityHref = security?.href ?? "/apzpen";

  const risks = riskQuery.data?.items ?? [];
  const openRisks = risks.filter((r) => r.status === "open");
  const waivedRisks = risks.filter((r) => r.status === "waived");
  const riskOk = !riskQuery.isError && openRisks.length === 0;
  const riskDetail = riskQuery.isError
    ? `Unable to load risk register: ${(riskQuery.error as Error).message}`
    : openRisks.length === 0
      ? waivedRisks.length > 0
        ? `No open risks. ${waivedRisks.length} waived — Ready with qualifications.`
        : "Risk register has no open items."
      : `${openRisks.length} open risk(s) must be mitigated or waived before certify.`;

  const checks: CheckItem[] = [
    {
      id: "exceptions",
      label: "No flow exceptions",
      ok: s.exceptionCount === 0,
      detail:
        s.exceptionCount === 0
          ? "Exception queue is clear."
          : `${s.exceptionCount} exception(s) need recovery.`,
      href: QEP_QUALITY_FLOWS_ROUTES.exceptions,
    },
    {
      id: "blocked",
      label: "No blocked releases",
      ok: s.blockedReleaseCount === 0,
      detail:
        s.blockedReleaseCount === 0
          ? "No flows are blocking release."
          : `${s.blockedReleaseCount} flow(s) blocking release.`,
      href: QEP_QUALITY_FLOWS_ROUTES.home,
    },
    {
      id: "waiting",
      label: "Waiting work cleared or accepted",
      ok: s.waitingCount === 0,
      detail:
        s.waitingCount === 0
          ? "No waiting approvals or evidence."
          : `${s.waitingCount} item(s) waiting — clear or consciously accept.`,
      href: QEP_QUALITY_FLOWS_ROUTES.waiting,
    },
    {
      id: "risk",
      label: "Release risks mitigated or waived",
      ok: riskOk,
      detail: riskDetail,
      href: "/workspace/qep/risk",
    },
    {
      id: "security",
      label: "Security assurance review-clear",
      ok: securityOk,
      detail: securityDetail,
      href: securityHref,
    },
    {
      id: "certify",
      label: "Human certification ready",
      ok: s.exceptionCount === 0 && s.blockedReleaseCount === 0 && securityOk && riskOk,
      detail:
        "Open Release Candidate for domain readiness, explain-why, and human GO/NO-GO. AI never certifies.",
      href: QEP_CERTIFICATION_ROUTES.rcHome,
    },
  ];

  const failed = checks.filter((c) => !c.ok).length;
  const overall =
    failed === 0
      ? waivedRisks.length > 0
        ? {
            status: "ready" as const,
            label: "Ready with qualifications — waived risks recorded; human certify",
          }
        : {
            status: "ready" as const,
            label: "Checklist clear — proceed to human certify",
          }
      : {
          status: "blocked" as const,
          label: `${failed} check(s) still open`,
        };

  return (
    <QepPageShell
      title="Release Readiness"
      description="Go/no-go checklist over live orchestration, risk/waivers, and APZPEN security posture. Completing checks does not certify — human GO/NO-GO is on Release Candidate."
      breadcrumbs={["QEP", "Release Readiness"]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link className={linkPrimary} href={QEP_CERTIFICATION_ROUTES.rcHome}>
            Open Release Candidate
          </Link>
          <Link className={linkOutline} href="/workspace/qep/risk">
            Risk register
          </Link>
          <Link className={linkOutline} href={QEP_QUALITY_FLOWS_ROUTES.home}>
            Quality Flows
          </Link>
        </div>
      }
    >
      <QepPanel title="Overall">
        <div
          className="flex flex-wrap items-center gap-3"
          data-testid="qep-release-readiness-overall"
        >
          <QepStatusBadge status={overall.status} />
          <p className="text-sm text-[var(--color-foreground)]">{overall.label}</p>
        </div>
      </QepPanel>

      {waivedRisks.length > 0 ? (
        <QepPanel title="Qualifications (waived risks)">
          <ul className="space-y-2 text-sm">
            {waivedRisks.map((r) => (
              <li
                key={r.riskId}
                className="rounded border border-[var(--color-border)] px-3 py-2"
              >
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {r.severity} · {r.waiverNote ?? "No rationale recorded"}
                </p>
              </li>
            ))}
          </ul>
        </QepPanel>
      ) : null}

      <QepPanel title="Checklist">
        <ul className="space-y-3" data-testid="qep-release-readiness-checklist">
          {checks.map((check) => (
            <li
              key={check.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <QepStatusBadge status={check.ok ? "ready" : "blocked"} />
                  <p className="font-medium text-[var(--color-foreground)]">
                    {check.label}
                  </p>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {check.detail}
                </p>
              </div>
              <Link className={linkOutline} href={check.href}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      </QepPanel>
    </QepPageShell>
  );
}
