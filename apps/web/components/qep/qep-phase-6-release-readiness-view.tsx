"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import {
  QEP_QUALITY_GATES_BASE_PATH,
  QEP_QUALITY_RISK_BASE_PATH,
} from "@apzhub/qep-assurance/presentation";
import { QEP_CERTIFICATION_BASE_PATH } from "@/lib/qep/certification-routes";
import { listApplicationEnvironments } from "@/lib/qep/qep-applications-api";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import { getReadiness } from "@/lib/qep/qep-assurance-api";
import { QepErrorState, QepLoadingState, QepStatusBadge } from "./qep-ui";

export function QepPhase6ReleaseReadinessView() {
  const { selectedId, selected } = useQepApplicationContext();
  const [environmentId, setEnvironmentId] = useState("");
  const [changeEventId, setChangeEventId] = useState("scm-decision-subject");
  const [mobileView, setMobileView] = useState<"overview" | "gates" | "risks">(
    "overview",
  );

  const envQ = useQuery({
    queryKey: ["qep-application-environments", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listApplicationEnvironments(selectedId!),
  });
  const readinessQ = useQuery({
    queryKey: ["qep-readiness", selectedId, changeEventId],
    enabled: Boolean(selectedId),
    queryFn: () => getReadiness({ applicationId: selectedId!, changeEventId }),
  });

  if (!selectedId) {
    return <QepLoadingState label="Select an application to view Release Readiness." />;
  }
  if (readinessQ.isError)
    return <QepErrorState message={(readinessQ.error as Error).message} />;

  const data = readinessQ.data;
  const posture = data?.posture ?? "insufficient_data";
  const envName =
    envQ.data?.items.find((row) => row.id === environmentId)?.name ?? "Environment";

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 p-5"
      data-testid="qep-release-readiness"
    >
      <div>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {selected?.name ?? "Application"} / Release Readiness
        </p>
        <h1 className="text-xl font-semibold">Release Readiness</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Evidence-based briefing. No readiness score. Current Readiness Posture is
          derived, not a recommendation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="qep-readiness-context">
        <span className="rounded-md border border-[var(--color-border)] px-2 py-1 text-sm">
          Application: {selected?.name ?? selectedId}
        </span>
        <select
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          value={environmentId}
          onChange={(event) => setEnvironmentId(event.target.value)}
        >
          <option value="">Environment</option>
          {(envQ.data?.items ?? []).map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          value={changeEventId}
          onChange={(event) => setChangeEventId(event.target.value)}
          placeholder="SCM change identity"
        />
      </div>

      <div className="flex flex-wrap gap-2 md:hidden">
        {(["overview", "gates", "risks"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-md border border-[var(--color-border)] px-2 py-1 text-xs ${mobileView === item ? "bg-[var(--color-muted)]" : ""}`}
            onClick={() => setMobileView(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div
          className="rounded-lg border border-[var(--color-border)] p-4 md:col-span-2"
          data-testid="qep-readiness-posture"
        >
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Current Readiness Posture
          </p>
          <p className="mt-2 text-3xl font-semibold uppercase">
            {posture.replaceAll("_", " ")}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {selected?.name} · {envName} · {changeEventId}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
            Visual sample percentages are not product scores and are not shown.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Quality Risk exposure
          </p>
          <p className="mt-2 text-lg font-semibold">
            {data?.risks.filter((row) => row.status === "open").length ?? 0} open
          </p>
          <Link
            className="text-xs text-[var(--color-primary)]"
            href={QEP_QUALITY_RISK_BASE_PATH}
          >
            View quality risks →
          </Link>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-muted-foreground)]">Gate preview</p>
          <p className="mt-2 text-sm">
            Passed{" "}
            {data?.evaluations.filter((row) => row.result === "passed").length ?? 0} ·
            Failed{" "}
            {data?.evaluations.filter((row) => row.result === "failed").length ?? 0} ·
            Not evaluated{" "}
            {data?.evaluations.filter((row) => row.result === "not_evaluated").length ??
              0}
          </p>
          <Link
            className="text-xs text-[var(--color-primary)]"
            href={QEP_QUALITY_GATES_BASE_PATH}
          >
            View gates →
          </Link>
        </div>
      </div>

      <div
        className={`grid gap-3 md:grid-cols-2 ${mobileView === "overview" || mobileView === "gates" ? "" : "hidden md:grid"}`}
      >
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="font-medium">Latest gate evaluations</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {(data?.evaluations ?? []).slice(0, 8).map((row) => (
              <li key={row.id}>
                <QepStatusBadge status={row.result} /> {row.definitionSnapshot.name} ·{" "}
                {row.reason}
              </li>
            ))}
          </ul>
        </div>
        <div
          className={`rounded-lg border border-[var(--color-border)] p-4 ${mobileView === "risks" || mobileView === "overview" ? "" : "hidden md:block"}`}
        >
          <h2 className="font-medium">Open quality risks</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {(data?.risks ?? [])
              .filter((row) => row.status === "open")
              .slice(0, 8)
              .map((row) => (
                <li key={row.id}>
                  {row.number} {row.title} · {row.severity}
                </li>
              ))}
          </ul>
        </div>
      </div>

      <Link
        className="text-sm text-[var(--color-primary)]"
        href={QEP_CERTIFICATION_BASE_PATH}
      >
        Continue to Certification / Go-No-Go →
      </Link>
    </div>
  );
}
