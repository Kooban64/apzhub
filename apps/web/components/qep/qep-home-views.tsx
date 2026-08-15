"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { QEP_CERTIFICATION_ROUTES } from "@/lib/qep/certification-routes";
import { QEP_HOME_ROUTES } from "@/lib/qep/home-routes";
import { QEP_PORTFOLIO_ROUTES } from "@/lib/qep/portfolio-routes";
import { QEP_QUALITY_FLOWS_ROUTES } from "@/lib/qep/quality-flow-routes";
import { QEP_RELEASE_READINESS_ROUTES } from "@/lib/qep/release-readiness-routes";
import {
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
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
  active: Array<{
    instanceId: string;
    qualityFlowId: string;
    currentState: string;
    paused: boolean;
    nextAction: string;
    blockedRelease: boolean;
    outstandingApprovalCount: number;
    outstandingEvidenceCount: number;
    createdAt: string;
  }>;
  waiting: Array<{
    instanceId: string;
    qualityFlowId: string;
    currentState: string;
    nextAction: string;
  }>;
  exceptions: Array<{
    instanceId: string;
    qualityFlowId: string;
    currentState: string;
    nextAction: string;
  }>;
  decisions: Array<{
    decisionPackageId: string;
    platformConclusion: string;
    qualityFlowRef: string;
    createdAt: string;
  }>;
};

function Metric({
  label,
  value,
  tone = "default",
}: {
  readonly label: string;
  readonly value: number;
  readonly tone?: "default" | "warn" | "danger" | "ok";
}) {
  const color =
    tone === "danger"
      ? "text-red-700 dark:text-red-300"
      : tone === "warn"
        ? "text-amber-700 dark:text-amber-300"
        : tone === "ok"
          ? "text-emerald-700 dark:text-emerald-300"
          : "text-[var(--color-foreground)]";
  return (
    <div className="rounded-lg border border-[var(--color-border)] px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function releaseVerdict(summary: CommandCentre["summary"]): {
  label: string;
  detail: string;
  tone: "ok" | "warn" | "danger";
} {
  if (summary.exceptionCount > 0) {
    return {
      label: "Not ready — exceptions",
      detail: "Resolve Quality Flow exceptions before a release decision.",
      tone: "danger",
    };
  }
  if (summary.blockedReleaseCount > 0) {
    return {
      label: "Blocked",
      detail: "One or more flows are blocking release until gates clear.",
      tone: "danger",
    };
  }
  if (summary.waitingCount > 0) {
    return {
      label: "Waiting on work",
      detail: "Approvals or evidence still outstanding — review waiting queue.",
      tone: "warn",
    };
  }
  if (summary.activeCount > 0) {
    return {
      label: "In progress",
      detail: "Active quality flows are running — monitor and certify when ready.",
      tone: "warn",
    };
  }
  return {
    label: "Quiet posture",
    detail:
      "No active blockers. Start a flow or open Release Candidate when a change arrives.",
    tone: "ok",
  };
}

export function QepHomeRouterView() {
  return <HomeCommandCentreView />;
}

function HomeCommandCentreView() {
  const query = useQuery({
    queryKey: ["qep-quality-flows", "command-centre", "home"],
    queryFn: () => fetchJson<CommandCentre>("/api/v1/qep/quality-flows"),
    refetchInterval: 15_000,
  });
  const securityQuery = useQuery({
    queryKey: ["qep-security-assurance", "home"],
    queryFn: () =>
      fetchJson<{
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
          assessmentPosition?: string;
          vaFreshness?: {
            toolId: string;
            probedAt: string;
            status: string;
            detail: string;
          };
        };
      }>("/api/v1/qep/security-assurance"),
    refetchInterval: 30_000,
  });

  if (query.isLoading) {
    return <QepLoadingState label="Loading release control centre…" />;
  }
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const data = query.data!;
  const s = data.summary;
  const verdict = releaseVerdict(s);
  const blocked = data.active.filter((row) => row.blockedRelease).slice(0, 5);
  const security = securityQuery.data?.summary;

  return (
    <QepPageShell
      title="Home — Release Control"
      description="Can we release with confidence? Live posture from continuous quality orchestration — humans still certify."
      breadcrumbs={["QEP", "Home"]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link className={linkPrimary} href={QEP_CERTIFICATION_ROUTES.rcHome}>
            Release Candidate
          </Link>
          <Link className={linkOutline} href={QEP_QUALITY_FLOWS_ROUTES.home}>
            Quality Flows
          </Link>
          <Link className={linkOutline} href={QEP_RELEASE_READINESS_ROUTES.home}>
            Readiness
          </Link>
        </div>
      }
    >
      <QepPanel title="Release confidence">
        <div
          className="flex flex-wrap items-center gap-3"
          data-testid="qep-home-verdict"
        >
          <QepStatusBadge
            status={
              verdict.tone === "ok"
                ? "ready"
                : verdict.tone === "warn"
                  ? "waiting"
                  : "blocked"
            }
          />
          <div>
            <p className="text-base font-medium text-[var(--color-foreground)]">
              {verdict.label}
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {verdict.detail}
            </p>
          </div>
        </div>
      </QepPanel>

      <QepPanel title="Security assurance (APZPEN)">
        <div data-testid="qep-home-security">
          {securityQuery.isLoading ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Loading security posture…
            </p>
          ) : securityQuery.isError ? (
            <QepErrorState message={(securityQuery.error as Error).message} />
          ) : security ? (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <QepStatusBadge status={security.reviewClear ? "ready" : "blocked"} />
                  <span className="text-sm font-medium">
                    {security.status ??
                      (security.linked
                        ? (security.assessmentPosition ?? "linked")
                        : security.entitled
                          ? "not linked"
                          : "not entitled")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {security.detail}
                </p>
                {security.linked ? (
                  <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                    Open critical {security.critical} · high {security.high} · open{" "}
                    {security.openCount}
                  </p>
                ) : null}
                {security.vaFreshness ? (
                  <p
                    className="mt-1 text-xs text-[var(--color-muted-foreground)]"
                    data-testid="qep-home-security-va-freshness"
                  >
                    VA freshness ({security.vaFreshness.toolId}):{" "}
                    {security.vaFreshness.status} — {security.vaFreshness.detail} ·
                    probed {security.vaFreshness.probedAt}
                  </p>
                ) : null}
              </div>
              {security.href ? (
                <Link className={linkOutline} href={security.href}>
                  Open APZPEN
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Security posture unavailable.
            </p>
          )}
        </div>
      </QepPanel>

      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        data-testid="qep-home-metrics"
      >
        <Metric label="Active flows" value={s.activeCount} />
        <Metric label="Waiting" value={s.waitingCount} tone="warn" />
        <Metric
          label="Blocked releases"
          value={s.blockedReleaseCount}
          tone={s.blockedReleaseCount > 0 ? "danger" : "ok"}
        />
        <Metric
          label="Exceptions"
          value={s.exceptionCount}
          tone={s.exceptionCount > 0 ? "danger" : "default"}
        />
        <Metric label="Decisions" value={s.decisionCount} />
        <Metric label="Definitions" value={s.definitionCount} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <QepPanel title="Blocked / attention">
          {blocked.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No flows currently blocking release.
            </p>
          ) : (
            <QepTable
              caption="Blocked quality flows"
              columns={["Flow", "State", "Next action"]}
              rows={blocked.map((row) => ({
                id: row.instanceId,
                href: QEP_QUALITY_FLOWS_ROUTES.instance(row.instanceId),
                cells: [
                  row.qualityFlowId,
                  <QepStatusBadge
                    key={`${row.instanceId}-state`}
                    status={row.currentState}
                  />,
                  row.nextAction,
                ],
              }))}
            />
          )}
        </QepPanel>

        <QepPanel title="Operate">
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                className="font-medium underline-offset-2 hover:underline"
                href={QEP_QUALITY_FLOWS_ROUTES.waiting}
              >
                Waiting queue
              </Link>
              <span className="text-[var(--color-muted-foreground)]">
                {" "}
                — approvals and evidence
              </span>
            </li>
            <li>
              <Link
                className="font-medium underline-offset-2 hover:underline"
                href={QEP_QUALITY_FLOWS_ROUTES.exceptions}
              >
                Exceptions
              </Link>
              <span className="text-[var(--color-muted-foreground)]">
                {" "}
                — recover stuck flows
              </span>
            </li>
            <li>
              <Link
                className="font-medium underline-offset-2 hover:underline"
                href={QEP_PORTFOLIO_ROUTES.home}
              >
                Portfolio
              </Link>
              <span className="text-[var(--color-muted-foreground)]">
                {" "}
                — quality projects and change context
              </span>
            </li>
            <li>
              <Link
                className="font-medium underline-offset-2 hover:underline"
                href="/apzpen"
              >
                Security assurance (APZPEN)
              </Link>
              <span className="text-[var(--color-muted-foreground)]">
                {" "}
                — security evidence feeds release gates
              </span>
            </li>
            <li>
              <Link
                className="font-medium underline-offset-2 hover:underline"
                href={QEP_HOME_ROUTES.home}
              >
                Refresh Home
              </Link>
              <span className="text-[var(--color-muted-foreground)]">
                {" "}
                — posture auto-refreshes every 15s
              </span>
            </li>
          </ul>
        </QepPanel>
      </div>

      <QepPanel title="Recent platform conclusions">
        {data.decisions.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No decision packages yet. Orchestration conclusions appear here after gate
            evaluation — human GO/NO-GO remains on Release Candidate.
          </p>
        ) : (
          <QepTable
            caption="Recent platform conclusions"
            columns={["Package", "Conclusion", "Flow", "When"]}
            rows={data.decisions.slice(0, 8).map((d) => ({
              id: d.decisionPackageId,
              cells: [
                d.decisionPackageId,
                <QepStatusBadge
                  key={d.decisionPackageId}
                  status={d.platformConclusion}
                />,
                d.qualityFlowRef,
                new Date(d.createdAt).toLocaleString(),
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}
