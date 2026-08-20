"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSession } from "@apzhub/auth";

import { QEP_DEFECT_ROUTES } from "@apzhub/qep-defects/presentation";
import { QEP_EVIDENCE_ROUTES } from "@apzhub/qep-evidence/presentation";
import { QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH } from "@apzhub/qep-requirements-traceability/presentation";
import { QEP_REQUIREMENTS_ROUTES } from "@apzhub/qep-requirements/presentation";
import { QEP_TEST_EXECUTION_ROUTES } from "@apzhub/qep-test-execution/presentation";
import { QEP_TEST_PLAN_ROUTES } from "@apzhub/qep-test-plans/presentation";
import { QEP_TEST_SPECIFICATION_ROUTES } from "@apzhub/qep-test-specifications/presentation";
import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Clock,
  FolderOpen,
  ListTodo,
} from "lucide-react";
import { isQualityCommandCentreActivity } from "@/lib/qep/qep-command-centre-activity";
import { QEP_HOME_ROUTES } from "@/lib/qep/home-routes";
import { listDefects } from "@/lib/qep/qep-defects-api";
import { listAssignedExecutions } from "@/lib/qep/qep-test-execution-api";
import { getCoverageDashboard } from "@/lib/qep/qep-enterprise-requirements-api";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import { QepLoadingState } from "./qep-ui";

type AttentionItem = {
  readonly kind: "critical" | "verification" | "retest";
  readonly id: string;
  readonly title: string;
  readonly detail?: string;
  readonly href?: string;
};

type WorkRow = {
  readonly id: string;
  readonly typeLabel: string;
  readonly item: string;
  readonly state: string;
  readonly context: string;
  readonly href: string;
};

type ActivityRow = {
  readonly id: string;
  readonly title: string;
  readonly at?: string;
  readonly actor?: string;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 403 || response.status === 404) return null;
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return (body.data as T) ?? null;
}

function formatState(value: string): string {
  return value.replaceAll("_", " ");
}

function formatClock(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function QepHomeRouterView() {
  return <QualityCommandCentreView />;
}

function QualityCommandCentreView() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const application = useQepApplicationContext();

  const defectsQ = useQuery({
    queryKey: ["qep-command-centre", "defects"],
    queryFn: async () => {
      try {
        const [critical, retest, listed] = await Promise.all([
          listDefects({
            severity: "critical",
            sortBy: "updatedAt",
            sortDirection: "desc",
          }),
          listDefects({
            status: "ready_for_retest",
            sortBy: "updatedAt",
            sortDirection: "desc",
          }),
          listDefects({
            sortBy: "updatedAt",
            sortDirection: "desc",
          }),
        ]);
        const isOpen = (status: string) =>
          status !== "closed" && status !== "archived" && status !== "verified";
        return {
          critical: critical.items.filter((d) => isOpen(d.status)),
          retest: retest.items,
          items: listed.items,
          openCount: listed.items.filter((d) => isOpen(d.status)).length,
        };
      } catch {
        return null;
      }
    },
  });

  const assignedQ = useQuery({
    queryKey: ["qep-command-centre", "assigned", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      try {
        const executions = await listAssignedExecutions({ limit: 20 });
        const defects = await listDefects({
          assigneeId: userId,
          sortBy: "updatedAt",
          sortDirection: "desc",
        });
        return { executions: executions.items, defects: defects.items };
      } catch {
        return null;
      }
    },
  });

  const coverageQ = useQuery({
    queryKey: ["qep-command-centre", "coverage"],
    queryFn: async () => {
      try {
        return await getCoverageDashboard({
          uncoveredOnly: true,
        });
      } catch {
        return null;
      }
    },
  });

  const activityQ = useQuery({
    queryKey: ["qep-command-centre", "audit"],
    queryFn: async () => {
      try {
        const data = await fetchJson<{
          items?: readonly {
            readonly auditId: string;
            readonly action: string;
            readonly createdAt: string;
            readonly detail?: string;
            readonly actor?: string;
          }[];
        }>("/api/v1/qep/audit");
        const items = (data?.items ?? []).filter(isQualityCommandCentreActivity);
        return items.map((event) => ({
          id: event.auditId,
          title: event.detail ? `${event.action} · ${event.detail}` : event.action,
          at: event.createdAt,
          actor: event.actor,
        }));
      } catch {
        return null;
      }
    },
  });

  if (defectsQ.isLoading || !userId || assignedQ.isLoading) {
    return <QepLoadingState label="Loading quality command centre…" />;
  }

  const defectsUnavailable = defectsQ.isFetched && defectsQ.data == null;
  const assignedUnavailable = assignedQ.isFetched && assignedQ.data == null;
  const coverageUnavailable = coverageQ.isFetched && coverageQ.data == null;
  const critical = defectsQ.data?.critical ?? [];
  const retest = defectsQ.data?.retest ?? [];
  const selectedId = application.selectedId;
  const associatedOpenCount =
    selectedId && defectsQ.data
      ? (defectsQ.data.items ?? []).filter(
          (row) =>
            row.status !== "closed" &&
            row.status !== "archived" &&
            row.status !== "verified" &&
            application.resolver.isAssociated(row.projectId, selectedId),
        ).length
      : undefined;
  const openCount = selectedId ? associatedOpenCount : defectsQ.data?.openCount;
  const assignedExec = assignedQ.data?.executions ?? [];
  const assignedDefects = assignedQ.data?.defects ?? [];
  const uncovered = coverageQ.data?.summary.uncovered;
  const activity = activityQ.data;

  const attentionItems: AttentionItem[] = [];
  for (const d of critical.slice(0, 4)) {
    attentionItems.push({
      kind: "critical",
      id: d.defectId,
      title: `${d.defectId} · ${d.title}`,
      detail: formatState(d.status),
      href: QEP_DEFECT_ROUTES.detail(d.defectId),
    });
  }
  if (coverageQ.isFetched && coverageQ.data != null && uncovered && uncovered > 0) {
    attentionItems.push({
      kind: "verification",
      id: "verification-gaps",
      title: `${uncovered} required check${uncovered === 1 ? "" : "s"} outstanding`,
      detail: "",
    });
  }
  const first = retest[0];
  if (first) {
    attentionItems.push({
      kind: "retest",
      id: first.defectId,
      title:
        retest.length === 1
          ? `${first.defectId} · ${first.title}`
          : `${retest.length} tests require retest`,
      detail: "Retest required",
      href: QEP_DEFECT_ROUTES.detail(first.defectId),
    });
  }

  const workRows: WorkRow[] = [
    ...assignedDefects.map((row) => ({
      id: `defect:${row.defectId}`,
      typeLabel: row.status === "ready_for_retest" ? "Retest" : "Defect",
      item: `${row.defectId} ${row.title}`,
      state: formatState(row.status),
      context: application.displayContext(row.projectId),
      href: QEP_DEFECT_ROUTES.detail(row.defectId),
    })),
    ...assignedExec.map((row) => ({
      id: `execution:${row.id}`,
      typeLabel: "Execution",
      item: row.executionNumber,
      state: formatState(row.status),
      context: application.displayContext(row.projectId),
      href: QEP_TEST_EXECUTION_ROUTES.detail(row.id),
    })),
  ].slice(0, 5);

  const verificationFact = coverageUnavailable
    ? "Unavailable"
    : uncovered === undefined
      ? "Unknown"
      : uncovered === 0
        ? "None detected"
        : `${uncovered} outstanding`;
  const criticalFact = defectsUnavailable
    ? "Unavailable"
    : defectsQ.isFetched
      ? critical.length === 0
        ? "None"
        : String(critical.length)
      : "Unknown";
  const retestFact = defectsUnavailable
    ? "Unavailable"
    : defectsQ.isFetched
      ? retest.length === 0
        ? "None"
        : String(retest.length)
      : "Unknown";
  const openDefectFact = defectsUnavailable
    ? "Unavailable"
    : defectsQ.isFetched
      ? String(openCount ?? 0)
      : "Unknown";

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-auto bg-[var(--color-muted)] px-5 py-5"
      data-testid="qep-command-centre"
    >
      <header
        className="mb-5 flex flex-wrap items-start justify-between gap-3"
        data-testid="qep-page"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Quality Command Centre
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Your attention and decision hub for quality.
          </p>
        </div>
        <p
          className="text-xs text-[var(--color-muted-foreground)]"
          data-testid="qep-cc-application"
        >
          Application:{" "}
          <span className="font-medium text-[var(--color-foreground)]">
            {application.applications.length === 0
              ? "None"
              : (application.selected?.name ?? "Not selected")}
          </span>
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-4" data-testid="qep-cc-mobile">
        <AttentionPanel
          defectsUnavailable={defectsUnavailable}
          coverageUnavailable={coverageUnavailable}
          items={attentionItems}
          criticalFact={criticalFact}
          retestFact={retestFact}
          verificationFact={verificationFact}
        />
        <QualityContextPanel
          applicationName={application.selected?.name}
          verificationFact={verificationFact}
          defectCount={openDefectFact}
        />
        <MyWorkPanel unavailable={assignedUnavailable} rows={workRows} />
        <ActivityPanel activity={activity} loading={activityQ.isLoading} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.6fr)]">
        <section className={cardClass}>
          <h2 className="text-sm font-semibold">Quality at a glance</h2>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            Test Runs (7d)
          </p>
          <div className="mt-8 flex flex-col items-center justify-center px-6 py-8 text-center">
            <FolderOpen
              className="h-10 w-10 text-[var(--color-muted-foreground)]"
              aria-hidden
              strokeWidth={1.5}
            />
            <p className="mt-3 max-w-sm text-sm text-[var(--color-muted-foreground)]">
              No execution data in the selected context. Select an application to see
              quality at a glance.
            </p>
          </div>
        </section>
        <section className={cardClass}>
          <h2 className="text-sm font-semibold">Helpful links</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {HELPFUL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between rounded-md px-1 py-1.5 text-[var(--color-primary)] hover:bg-[var(--color-muted)]"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function AttentionPanel({
  defectsUnavailable,
  coverageUnavailable,
  items,
  criticalFact,
  retestFact,
  verificationFact,
}: {
  readonly defectsUnavailable: boolean;
  readonly coverageUnavailable: boolean;
  readonly items: readonly AttentionItem[];
  readonly criticalFact: string;
  readonly retestFact: string;
  readonly verificationFact: string;
}) {
  return (
    <section className={cardClass} data-testid="qep-cc-attention">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" aria-hidden />
        <h2 className="text-sm font-semibold">Attention</h2>
      </div>
      {defectsUnavailable && coverageUnavailable ? (
        <p
          className="text-xs text-[var(--color-muted-foreground)]"
          data-testid="qep-cc-attention-unavailable"
        >
          Attention is unavailable.
        </p>
      ) : items.length === 0 ? (
        <div className="text-xs" data-testid="qep-cc-attention-empty">
          <p>No quality items currently require your attention.</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[var(--color-muted-foreground)]">
            <dt>Critical defects</dt>
            <dd className="text-[var(--color-foreground)]">{criticalFact}</dd>
            <dt>Retests required</dt>
            <dd className="text-[var(--color-foreground)]">{retestFact}</dd>
            <dt>Verification gaps</dt>
            <dd className="text-[var(--color-foreground)]">{verificationFact}</dd>
            <dt>Evidence gaps</dt>
            <dd className="text-[var(--color-foreground)]">Unavailable</dd>
          </dl>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.id} className="text-xs">
              <p className="font-medium capitalize">
                {item.kind === "critical" ? "Critical" : item.kind}
              </p>
              {item.href ? (
                <Link href={item.href} className="hover:underline">
                  {item.title}
                </Link>
              ) : (
                <p
                  data-testid={
                    item.kind === "verification" ? "qep-cc-coverage-gaps" : undefined
                  }
                >
                  {item.title}
                </p>
              )}
              {item.detail ? (
                <p className="text-[var(--color-muted-foreground)]">{item.detail}</p>
              ) : null}
            </li>
          ))}
          {coverageUnavailable ? (
            <li
              className="text-xs text-[var(--color-muted-foreground)]"
              data-testid="qep-cc-coverage-unavailable"
            >
              Verification gaps unavailable.
            </li>
          ) : null}
        </ul>
      )}
      <p className="mt-4">
        <Link className={linkClass} href={QEP_DEFECT_ROUTES.home}>
          View all attention →
        </Link>
      </p>
    </section>
  );
}

function QualityContextPanel({
  applicationName,
  verificationFact,
  defectCount,
}: {
  readonly applicationName?: string;
  readonly verificationFact: string;
  readonly defectCount: string;
}) {
  return (
    <section className={cardClass} data-testid="qep-cc-context">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
        <h2 className="text-sm font-semibold">Quality context</h2>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
        <dt className="text-[var(--color-muted-foreground)]">Application</dt>
        <dd>{applicationName ?? "Not selected"}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Verification</dt>
        <dd>{verificationFact}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Evidence</dt>
        <dd>Unavailable</dd>
        <dt className="text-[var(--color-muted-foreground)]">Open defects</dt>
        <dd>{defectCount}</dd>
      </dl>
      <p className="mt-4">
        <Link
          className={linkClass}
          href={`${QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH}/coverage`}
        >
          Open coverage →
        </Link>
      </p>
    </section>
  );
}

function MyWorkPanel({
  unavailable,
  rows,
}: {
  readonly unavailable: boolean;
  readonly rows: readonly WorkRow[];
}) {
  return (
    <section className={cardClass} data-testid="qep-cc-my-work">
      <div className="mb-3 flex items-center gap-2">
        <ListTodo className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
        <h2 className="text-sm font-semibold">My work</h2>
      </div>
      {unavailable ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Assigned work is unavailable.
        </p>
      ) : rows.length === 0 ? (
        <div className="text-xs" data-testid="qep-cc-my-work-empty">
          <p>No quality work is currently assigned to you.</p>
          <p className="mt-1 text-[var(--color-muted-foreground)]">
            When executions, defects or retests are assigned to you, they will appear
            here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 text-xs">
          {rows.map((row) => (
            <li key={row.id}>
              <p className="text-[var(--color-muted-foreground)]">{row.typeLabel}</p>
              <Link href={row.href} className="font-medium hover:underline">
                {row.item}
              </Link>
              <p className="text-[var(--color-muted-foreground)]">{row.state}</p>
              <p className="text-[var(--color-muted-foreground)]">{row.context}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4">
        <Link className={linkClass} href={QEP_HOME_ROUTES.myWork}>
          Go to My Work →
        </Link>
      </p>
    </section>
  );
}

function ActivityPanel({
  activity,
  loading,
}: {
  readonly activity: readonly ActivityRow[] | null | undefined;
  readonly loading: boolean;
}) {
  return (
    <section className={cardClass} data-testid="qep-cc-activity">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-[var(--color-warning)]" aria-hidden />
        <h2 className="text-sm font-semibold">Recent quality activity</h2>
      </div>
      {loading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : activity == null ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Activity is unavailable.
        </p>
      ) : activity.length === 0 ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          No recent activity.
        </p>
      ) : (
        <ul className="space-y-1.5 text-xs">
          {activity.slice(0, 5).map((event) => (
            <li key={event.id ?? `${event.title}-${event.at}`}>
              <span className="text-[var(--color-foreground)]">{event.title}</span>
              {event.at ? (
                <span className="ml-2 text-[var(--color-muted-foreground)]">
                  {formatClock(event.at)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4">
        <Link className={linkClass} href="/workspace/qep/audit">
          Open audit →
        </Link>
      </p>
    </section>
  );
}

const cardClass =
  "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm";

const linkClass = "text-xs font-medium text-[var(--color-primary)] hover:underline";

const HELPFUL_LINKS = [
  { href: QEP_REQUIREMENTS_ROUTES.new, label: "Create Requirement" },
  { href: QEP_TEST_SPECIFICATION_ROUTES.new, label: "Create Test Case" },
  { href: QEP_TEST_PLAN_ROUTES.new, label: "Create Test Plan" },
  { href: QEP_DEFECT_ROUTES.new, label: "Create Defect" },
  { href: QEP_EVIDENCE_ROUTES.new, label: "Add Evidence" },
] as const;
