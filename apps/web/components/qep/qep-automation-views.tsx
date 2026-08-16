"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  QEP_AUTOMATION_ROUTES,
  QEP_DEFECT_ROUTES,
  parseQepAutomationExecutionId,
} from "@/lib/qep/routes";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

export function QepAutomationRouterView() {
  const pathname = usePathname() ?? "";
  const executionId = parseQepAutomationExecutionId(pathname);

  if (pathname.includes("/providers")) {
    return <ProvidersView />;
  }
  if (pathname.includes("/flaky")) {
    return <FlakyCentreView />;
  }
  if (executionId) {
    return <ExecutionDetailView executionId={executionId} />;
  }
  return <AutomationHomeView />;
}

function AutomationHomeView() {
  const queryClient = useQueryClient();
  const [changeEventId, setChangeEventId] = useState("");
  const [vitestJson, setVitestJson] = useState(
    '{\n  "success": true,\n  "tests": [{ "title": "unit", "status": "passed", "duration": 4 }]\n}',
  );
  const [axeJson, setAxeJson] = useState(
    '{\n  "url": "about:blank",\n  "violations": [],\n  "passes": [{ "id": "document-title" }]\n}',
  );
  const [securityJson, setSecurityJson] = useState(
    '{\n  "ok": true,\n  "findings": []\n}',
  );
  const [codeQualityJson, setCodeQualityJson] = useState(
    '{\n  "ok": true,\n  "findings": []\n}',
  );
  const [k6Json, setK6Json] = useState(
    '{\n  "ok": true,\n  "p95": 120,\n  "http_req_failed": { "values": { "rate": 0 } },\n  "checks": { "values": { "rate": 1 } }\n}',
  );
  const [cypressJson, setCypressJson] = useState(
    '{\n  "success": true,\n  "tests": [{ "title": "smoke", "status": "passed" }]\n}',
  );
  const [ingestNote, setIngestNote] = useState<string | null>(null);
  const [mapProviderId, setMapProviderId] = useState("playwright");
  const [mapExternalKey, setMapExternalKey] = useState("");
  const [mapOwner, setMapOwner] = useState("");
  const [flakyTarget, setFlakyTarget] = useState<{
    providerId: string;
    externalKey: string;
  } | null>(null);
  const [flakyNotes, setFlakyNotes] = useState("");
  const [flakyDefectRef, setFlakyDefectRef] = useState("");
  const [cvSource, setCvSource] = useState("automation.playwright");
  const [cvSubject, setCvSubject] = useState("");

  const providersQuery = useQuery({
    queryKey: ["qep-automation", "providers"],
    queryFn: () =>
      fetchJson<{
        providers: Array<{ providerId: string }>;
        liveModeEnabled: boolean;
      }>("/api/v1/qep/automation/providers"),
  });

  const executionsQuery = useQuery({
    queryKey: ["qep-automation", "executions"],
    queryFn: () =>
      fetchJson<{
        executions: Array<{
          executionId: string;
          providerId: string;
          state: string;
          resultSummary?: string;
        }>;
      }>("/api/v1/qep/automation/executions"),
  });

  const mappingsQuery = useQuery({
    queryKey: ["qep-automation", "mappings"],
    queryFn: () =>
      fetchJson<{
        mappings: Array<{
          mappingId: string;
          providerId: string;
          externalKey: string;
          owner?: string;
          flaky: boolean;
          stale: boolean;
          notes?: string;
          defectRef?: string;
        }>;
      }>("/api/v1/qep/automation/mappings"),
  });

  const continuousVerificationQuery = useQuery({
    queryKey: ["qep-continuous-verification", "signals"],
    queryFn: () =>
      fetchJson<{
        signals: Array<{
          signalId: string;
          source: string;
          subjectRef: string;
          status: string;
          lastSeenAt: string;
          staleAfterHours: number;
        }>;
      }>("/api/v1/qep/continuous-verification/signals"),
  });

  const continuousVerificationMutation = useMutation({
    mutationFn: (input: {
      action: "upsert" | "mark_stale" | "acknowledge";
      source: string;
      subjectRef: string;
    }) =>
      fetchJson("/api/v1/qep/continuous-verification/signals", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["qep-continuous-verification"],
      });
    },
  });

  const changeMetadata = (): Record<string, string> | undefined => {
    const id = changeEventId.trim();
    return id ? { changeEventId: id } : undefined;
  };

  const runMutation = useMutation({
    mutationFn: (mode: "dry-run" | "live") =>
      fetchJson<{ execution: { executionId: string } }>(
        "/api/v1/qep/automation/executions",
        {
          method: "POST",
          body: JSON.stringify({
            providerId: "playwright",
            correlationId: crypto.randomUUID(),
            runImmediately: true,
            target: {
              kind: "url",
              name: mode === "live" ? "workspace-live-smoke" : "workspace-smoke",
              baseUrl: "about:blank",
              metadata: changeMetadata(),
            },
            options: {
              dryRun: mode !== "live",
              collectScreenshots: true,
              collectTraces: mode === "live",
              collectVideos: false,
            },
          }),
        },
      ),
    onSuccess: (data) => {
      setIngestNote(
        `Playwright execution ${data.execution.executionId.slice(0, 8)}… published` +
          (changeEventId.trim()
            ? ` · linked to change ${changeEventId.trim().slice(0, 24)}…`
            : ""),
      );
      void queryClient.invalidateQueries({ queryKey: ["qep-automation"] });
    },
  });

  const ingestMutation = useMutation({
    mutationFn: (input: {
      providerId:
        | "vitest"
        | "accessibility"
        | "security"
        | "codequality"
        | "k6"
        | "cypress"
        | "selenium"
        | "appium"
        | "rest"
        | "visual";
      name: string;
      report: string;
    }) => {
      JSON.parse(input.report);
      return fetchJson<{ execution: { executionId: string; state: string } }>(
        "/api/v1/qep/automation/executions",
        {
          method: "POST",
          body: JSON.stringify({
            providerId: input.providerId,
            correlationId: crypto.randomUUID(),
            runImmediately: true,
            target: {
              kind: "custom",
              name: input.name,
              entry: input.report,
              metadata: changeMetadata(),
            },
          }),
        },
      );
    },
    onSuccess: (data, variables) => {
      setIngestNote(
        `${variables.providerId} ${data.execution.state} · ${data.execution.executionId.slice(0, 8)}…` +
          (changeEventId.trim()
            ? ` · change ${changeEventId.trim().slice(0, 24)}…`
            : " · set changeEventId to attach graph edges"),
      );
      void queryClient.invalidateQueries({ queryKey: ["qep-automation"] });
    },
  });

  const mappingMutation = useMutation({
    mutationFn: (payload: {
      action:
        | "upsert"
        | "mark_flaky"
        | "clear_flaky"
        | "mark_stale"
        | "clear_stale"
        | "set_owner";
      providerId: string;
      externalKey: string;
      owner?: string;
      notes?: string;
      defectRef?: string;
    }) =>
      fetchJson<{
        mapping: { mappingId: string };
      }>("/api/v1/qep/automation/mappings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      setFlakyTarget(null);
      setFlakyNotes("");
      setFlakyDefectRef("");
      void queryClient.invalidateQueries({
        queryKey: ["qep-automation", "mappings"],
      });
    },
  });

  if (executionsQuery.isLoading) {
    return <QepLoadingState label="Loading automation queue…" />;
  }
  if (executionsQuery.isError) {
    return <QepErrorState message={(executionsQuery.error as Error).message} />;
  }

  const executions = executionsQuery.data?.executions ?? [];
  const mappings = mappingsQuery.data?.mappings ?? [];
  const flakyMappings = mappings.filter((row) => row.flaky);
  const liveModeEnabled = providersQuery.data?.liveModeEnabled === true;
  const actionBtn =
    "inline-flex h-7 items-center rounded-md border border-[var(--color-border)] px-2 text-xs disabled:opacity-50";

  return (
    <QepPageShell
      title="Enterprise Automation"
      description="Provider evidence matrix + flaky governance. Mark flaky only with justification — never silent suppress."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${QEP_AUTOMATION_ROUTES.home}/flaky`}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
            data-testid="qep-automation-open-flaky"
          >
            Flaky centre ({flakyMappings.length})
          </Link>
          <Button
            type="button"
            onClick={() => runMutation.mutate("dry-run")}
            disabled={runMutation.isPending || ingestMutation.isPending}
          >
            {runMutation.isPending && runMutation.variables === "dry-run"
              ? "Running…"
              : "Run Playwright dry-run"}
          </Button>
          <Button
            type="button"
            variant={liveModeEnabled ? "default" : "outline"}
            onClick={() => runMutation.mutate("live")}
            disabled={
              runMutation.isPending || ingestMutation.isPending || !liveModeEnabled
            }
            title={
              liveModeEnabled
                ? "Live Chromium run with real screenshot/trace artifacts"
                : "Set APZHUB_AUTOMATION_LIVE=true and restart the web process"
            }
          >
            {runMutation.isPending && runMutation.variables === "live"
              ? "Running live…"
              : "Run Playwright live"}
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex gap-3 text-sm">
        <Link href={QEP_AUTOMATION_ROUTES.providers}>Providers</Link>
        <Link href={QEP_AUTOMATION_ROUTES.queue}>Queue</Link>
        <Link href={QEP_AUTOMATION_ROUTES.history}>History</Link>
      </div>
      {!liveModeEnabled ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Live mode is off. Enable with{" "}
          <code className="text-xs">APZHUB_AUTOMATION_LIVE=true</code> and restart web
          to capture real browser artifacts into evidence storage.
        </p>
      ) : null}

      <QepPanel title="Continuous verification signals">
        <div data-testid="qep-continuous-verification">
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            Event-driven freshness of verification/evidence sources (SPR-APZQEP-230-A).
            Stale signals advise operators — they never auto-certify or set GO.
          </p>
          <form
            className="mb-4 grid gap-2 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!cvSource.trim() || !cvSubject.trim()) return;
              continuousVerificationMutation.mutate({
                action: "upsert",
                source: cvSource.trim(),
                subjectRef: cvSubject.trim(),
              });
              setCvSubject("");
            }}
          >
            <label className="block text-sm">
              source
              <input
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
                value={cvSource}
                onChange={(event) => setCvSource(event.target.value)}
                data-testid="qep-cv-source"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              subjectRef
              <input
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
                value={cvSubject}
                onChange={(event) => setCvSubject(event.target.value)}
                placeholder="chg-… / suite/…"
                data-testid="qep-cv-subject"
              />
            </label>
            <div className="md:col-span-3">
              <Button
                type="submit"
                size="sm"
                disabled={continuousVerificationMutation.isPending}
              >
                Record heartbeat
              </Button>
            </div>
          </form>
          {continuousVerificationQuery.isLoading ? (
            <QepLoadingState label="Loading signals…" />
          ) : continuousVerificationQuery.isError ? (
            <QepErrorState
              message={(continuousVerificationQuery.error as Error).message}
            />
          ) : (continuousVerificationQuery.data?.signals.length ?? 0) === 0 ? (
            <QepEmptyState title="No continuous verification signals yet." />
          ) : (
            <ul className="space-y-2">
              {(continuousVerificationQuery.data?.signals ?? []).map((signal) => (
                <li
                  key={signal.signalId}
                  className="flex flex-wrap items-center gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
                >
                  <QepStatusBadge status={signal.status} />
                  <span className="font-mono text-xs">{signal.source}</span>
                  <span className="font-mono text-xs">{signal.subjectRef}</span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    last {signal.lastSeenAt}
                  </span>
                  {signal.status !== "acknowledged" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        continuousVerificationMutation.mutate({
                          action: "acknowledge",
                          source: signal.source,
                          subjectRef: signal.subjectRef,
                        })
                      }
                    >
                      Acknowledge
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </QepPanel>

      <QepPanel title="Mapping governance">
        <div data-testid="qep-automation-mappings">
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            Track provider external keys for flaky / stale governance. Marking flaky
            requires a justification — silent suppress is blocked.
          </p>
          <form
            className="mb-4 grid gap-2 md:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!mapProviderId.trim() || !mapExternalKey.trim()) return;
              mappingMutation.mutate({
                action: "upsert",
                providerId: mapProviderId.trim(),
                externalKey: mapExternalKey.trim(),
                ...(mapOwner.trim() ? { owner: mapOwner.trim() } : {}),
              });
              setMapExternalKey("");
            }}
          >
            <label className="block text-sm">
              providerId
              <input
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
                value={mapProviderId}
                onChange={(event) => setMapProviderId(event.target.value)}
                data-testid="qep-automation-mapping-provider"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              externalKey
              <input
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
                value={mapExternalKey}
                onChange={(event) => setMapExternalKey(event.target.value)}
                placeholder="suite/login.spec.ts"
                data-testid="qep-automation-mapping-external-key"
              />
            </label>
            <label className="block text-sm">
              owner
              <input
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
                value={mapOwner}
                onChange={(event) => setMapOwner(event.target.value)}
                placeholder="optional"
                data-testid="qep-automation-mapping-owner"
              />
            </label>
            <div className="md:col-span-4">
              <Button
                type="submit"
                size="sm"
                disabled={
                  mappingMutation.isPending ||
                  !mapProviderId.trim() ||
                  !mapExternalKey.trim()
                }
              >
                Add mapping
              </Button>
            </div>
          </form>
          {mappingsQuery.isError ? (
            <QepErrorState message={(mappingsQuery.error as Error).message} />
          ) : mappingsQuery.isLoading ? (
            <QepLoadingState label="Loading mappings…" />
          ) : mappings.length === 0 ? (
            <QepEmptyState title="No mappings yet — add a provider + external key." />
          ) : (
            <QepTable
              caption="Automation mappings"
              columns={[
                "Provider",
                "External key",
                "Owner",
                "Flaky",
                "Stale",
                "Justification",
                "Actions",
              ]}
              rows={mappings.map((row) => ({
                id: row.mappingId,
                cells: [
                  row.providerId,
                  row.externalKey,
                  row.owner ?? "—",
                  row.flaky ? "Yes" : "No",
                  row.stale ? "Yes" : "No",
                  row.notes ? (
                    <span className="text-xs" key={`${row.mappingId}:notes`}>
                      {row.notes}
                      {row.defectRef ? (
                        <>
                          {" "}
                          ·{" "}
                          <Link
                            href={QEP_DEFECT_ROUTES.detail(row.defectRef)}
                            className="underline"
                          >
                            {row.defectRef}
                          </Link>
                        </>
                      ) : null}
                    </span>
                  ) : (
                    "—"
                  ),
                  <div
                    key={`${row.mappingId}:actions`}
                    className="flex flex-wrap gap-1"
                  >
                    {row.flaky ? (
                      <button
                        type="button"
                        className={actionBtn}
                        disabled={mappingMutation.isPending}
                        onClick={() =>
                          mappingMutation.mutate({
                            action: "clear_flaky",
                            providerId: row.providerId,
                            externalKey: row.externalKey,
                          })
                        }
                      >
                        Clear flaky
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={actionBtn}
                        disabled={mappingMutation.isPending}
                        onClick={() =>
                          setFlakyTarget({
                            providerId: row.providerId,
                            externalKey: row.externalKey,
                          })
                        }
                      >
                        Mark flaky…
                      </button>
                    )}
                    <button
                      type="button"
                      className={actionBtn}
                      disabled={mappingMutation.isPending}
                      onClick={() =>
                        mappingMutation.mutate({
                          action: row.stale ? "clear_stale" : "mark_stale",
                          providerId: row.providerId,
                          externalKey: row.externalKey,
                        })
                      }
                    >
                      {row.stale ? "Clear stale" : "Mark stale"}
                    </button>
                  </div>,
                ],
              }))}
            />
          )}
          {flakyTarget ? (
            <div
              className="mt-4 space-y-2 rounded border border-dashed border-[var(--color-border)] p-3"
              data-testid="qep-automation-flaky-form"
            >
              <p className="text-sm font-medium">
                Mark flaky · {flakyTarget.providerId} / {flakyTarget.externalKey}
              </p>
              <label className="block text-xs text-[var(--color-muted-foreground)]">
                Justification (required)
                <textarea
                  className="mt-1 min-h-[64px] w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
                  value={flakyNotes}
                  onChange={(event) => setFlakyNotes(event.target.value)}
                  data-testid="qep-automation-flaky-notes"
                />
              </label>
              <label className="block text-xs text-[var(--color-muted-foreground)]">
                Linked defect id (optional)
                <input
                  className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
                  value={flakyDefectRef}
                  onChange={(event) => setFlakyDefectRef(event.target.value)}
                  placeholder="def-…"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={mappingMutation.isPending || flakyNotes.trim().length < 8}
                  onClick={() =>
                    mappingMutation.mutate({
                      action: "mark_flaky",
                      providerId: flakyTarget.providerId,
                      externalKey: flakyTarget.externalKey,
                      notes: flakyNotes.trim(),
                      ...(flakyDefectRef.trim()
                        ? { defectRef: flakyDefectRef.trim() }
                        : {}),
                    })
                  }
                >
                  Confirm flaky
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFlakyTarget(null);
                    setFlakyNotes("");
                    setFlakyDefectRef("");
                  }}
                >
                  Cancel
                </Button>
                <Link
                  href={QEP_DEFECT_ROUTES.home}
                  className="inline-flex h-8 items-center text-xs underline"
                >
                  Open defects
                </Link>
              </div>
            </div>
          ) : null}
          {mappingMutation.isError ? (
            <QepErrorState message={(mappingMutation.error as Error).message} />
          ) : null}
        </div>
      </QepPanel>

      <QepPanel title="Link to SCM change (F3 graph edge)">
        <label className="mb-2 block text-sm">
          changeEventId
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
            value={changeEventId}
            onChange={(event) => setChangeEventId(event.target.value)}
            placeholder="chg-github-…-commit-…"
            data-testid="qep-automation-change-event-id"
          />
        </label>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          When set, published evidence rows are tagged and linked on the Quality Graph
          for that change.
        </p>
        {ingestNote ? (
          <p className="mt-2 text-sm" data-testid="qep-automation-ingest-note">
            {ingestNote}
          </p>
        ) : null}
        {ingestMutation.isError ? (
          <QepErrorState message={(ingestMutation.error as Error).message} />
        ) : null}
      </QepPanel>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <QepPanel title="Vitest CI ingest">
          <textarea
            className="mb-2 min-h-28 w-full rounded border border-[var(--color-border)] bg-transparent p-2 font-mono text-xs"
            value={vitestJson}
            onChange={(event) => setVitestJson(event.target.value)}
            data-testid="qep-automation-vitest-json"
          />
          <Button
            type="button"
            size="sm"
            disabled={ingestMutation.isPending}
            onClick={() =>
              ingestMutation.mutate({
                providerId: "vitest",
                name: "ci-unit-ingest",
                report: vitestJson,
              })
            }
          >
            Ingest Vitest report
          </Button>
        </QepPanel>
        <QepPanel title="Accessibility (axe) ingest">
          <textarea
            className="mb-2 min-h-28 w-full rounded border border-[var(--color-border)] bg-transparent p-2 font-mono text-xs"
            value={axeJson}
            onChange={(event) => setAxeJson(event.target.value)}
            data-testid="qep-automation-axe-json"
          />
          <Button
            type="button"
            size="sm"
            disabled={ingestMutation.isPending}
            onClick={() =>
              ingestMutation.mutate({
                providerId: "accessibility",
                name: "a11y-ingest",
                report: axeJson,
              })
            }
          >
            Ingest axe summary
          </Button>
        </QepPanel>
        <QepPanel title="Security scan ingest">
          <textarea
            className="mb-2 min-h-28 w-full rounded border border-[var(--color-border)] bg-transparent p-2 font-mono text-xs"
            value={securityJson}
            onChange={(event) => setSecurityJson(event.target.value)}
            data-testid="qep-automation-security-json"
          />
          <Button
            type="button"
            size="sm"
            disabled={ingestMutation.isPending}
            onClick={() =>
              ingestMutation.mutate({
                providerId: "security",
                name: "security-ingest",
                report: securityJson,
              })
            }
          >
            Ingest security report
          </Button>
        </QepPanel>
        <QepPanel title="Code quality ingest">
          <textarea
            className="mb-2 min-h-28 w-full rounded border border-[var(--color-border)] bg-transparent p-2 font-mono text-xs"
            value={codeQualityJson}
            onChange={(event) => setCodeQualityJson(event.target.value)}
            data-testid="qep-automation-codequality-json"
          />
          <Button
            type="button"
            size="sm"
            disabled={ingestMutation.isPending}
            onClick={() =>
              ingestMutation.mutate({
                providerId: "codequality",
                name: "code-quality-ingest",
                report: codeQualityJson,
              })
            }
          >
            Ingest code quality report
          </Button>
        </QepPanel>
        <QepPanel title="Performance (k6) ingest">
          <textarea
            className="mb-2 min-h-28 w-full rounded border border-[var(--color-border)] bg-transparent p-2 font-mono text-xs"
            value={k6Json}
            onChange={(event) => setK6Json(event.target.value)}
            data-testid="qep-automation-k6-json"
          />
          <Button
            type="button"
            size="sm"
            disabled={ingestMutation.isPending}
            onClick={() =>
              ingestMutation.mutate({
                providerId: "k6",
                name: "performance-ingest",
                report: k6Json,
              })
            }
          >
            Ingest performance report
          </Button>
        </QepPanel>
        <QepPanel title="Cypress (automation family) ingest">
          <textarea
            className="mb-2 min-h-28 w-full rounded border border-[var(--color-border)] bg-transparent p-2 font-mono text-xs"
            value={cypressJson}
            onChange={(event) => setCypressJson(event.target.value)}
            data-testid="qep-automation-cypress-json"
          />
          <Button
            type="button"
            size="sm"
            disabled={ingestMutation.isPending}
            onClick={() =>
              ingestMutation.mutate({
                providerId: "cypress",
                name: "cypress-ingest",
                report: cypressJson,
              })
            }
          >
            Ingest Cypress report
          </Button>
        </QepPanel>
      </div>

      <QepPanel title="Execution queue / history">
        {executions.length === 0 ? (
          <QepEmptyState title="No executions yet — run Playwright or ingest a CI/a11y report." />
        ) : (
          <QepTable
            caption="Automation executions"
            columns={["Execution", "Provider", "State", "Summary"]}
            rows={executions.map((execution) => ({
              id: execution.executionId,
              href: QEP_AUTOMATION_ROUTES.execution(execution.executionId),
              cells: [
                execution.executionId.slice(0, 8),
                execution.providerId,
                <QepStatusBadge key="state" status={execution.state} />,
                execution.resultSummary ?? "—",
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function FlakyCentreView() {
  const queryClient = useQueryClient();
  const [flakyNotes, setFlakyNotes] = useState("");
  const [flakyDefectRef, setFlakyDefectRef] = useState("");
  const [flakyTarget, setFlakyTarget] = useState<{
    providerId: string;
    externalKey: string;
  } | null>(null);

  const mappingsQuery = useQuery({
    queryKey: ["qep-automation", "mappings"],
    queryFn: () =>
      fetchJson<{
        mappings: Array<{
          mappingId: string;
          providerId: string;
          externalKey: string;
          owner?: string;
          flaky: boolean;
          stale: boolean;
          notes?: string;
          defectRef?: string;
        }>;
      }>("/api/v1/qep/automation/mappings"),
  });

  const mappingMutation = useMutation({
    mutationFn: async (payload: {
      action: string;
      providerId: string;
      externalKey: string;
      notes?: string;
      defectRef?: string;
    }) => {
      if (payload.action === "mark_flaky_new") {
        await fetchJson("/api/v1/qep/automation/mappings", {
          method: "POST",
          body: JSON.stringify({
            action: "upsert",
            providerId: payload.providerId,
            externalKey: payload.externalKey,
          }),
        });
        return fetchJson("/api/v1/qep/automation/mappings", {
          method: "POST",
          body: JSON.stringify({
            action: "mark_flaky",
            providerId: payload.providerId,
            externalKey: payload.externalKey,
            notes: payload.notes,
            ...(payload.defectRef ? { defectRef: payload.defectRef } : {}),
          }),
        });
      }
      return fetchJson("/api/v1/qep/automation/mappings", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      setFlakyTarget(null);
      setFlakyNotes("");
      setFlakyDefectRef("");
      void queryClient.invalidateQueries({
        queryKey: ["qep-automation", "mappings"],
      });
    },
  });

  if (mappingsQuery.isLoading) {
    return <QepLoadingState label="Loading flaky centre…" />;
  }
  if (mappingsQuery.isError) {
    return <QepErrorState message={(mappingsQuery.error as Error).message} />;
  }

  const flaky = (mappingsQuery.data?.mappings ?? []).filter((row) => row.flaky);

  return (
    <QepPageShell
      title="Flaky centre"
      description="Governed flaky suppressions — justification required; link a defect when the flake is tracked as a quality debt."
      breadcrumbs={["QEP", "Automation", "Flaky"]}
      actions={
        <Link
          href={QEP_AUTOMATION_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Automation home
        </Link>
      }
    >
      <QepPanel title={`Active flaky mappings (${flaky.length})`}>
        {flaky.length === 0 ? (
          <QepEmptyState title="No flaky mappings — mark from Automation home with a justification." />
        ) : (
          <ul className="space-y-3" data-testid="qep-flaky-centre-list">
            {flaky.map((row) => (
              <li
                key={row.mappingId}
                className="rounded border border-[var(--color-border)] px-3 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {row.providerId} · {row.externalKey}
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      Owner: {row.owner ?? "unassigned"}
                    </p>
                    <p className="mt-1 text-xs">{row.notes ?? "No justification"}</p>
                    {row.defectRef ? (
                      <Link
                        href={QEP_DEFECT_ROUTES.detail(row.defectRef)}
                        className="mt-1 inline-block text-xs underline"
                      >
                        Defect {row.defectRef}
                      </Link>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="text-xs underline disabled:opacity-50"
                    disabled={mappingMutation.isPending}
                    onClick={() =>
                      mappingMutation.mutate({
                        action: "clear_flaky",
                        providerId: row.providerId,
                        externalKey: row.externalKey,
                      })
                    }
                  >
                    Resolve / clear
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {mappingMutation.isError ? (
          <QepErrorState message={(mappingMutation.error as Error).message} />
        ) : null}
      </QepPanel>

      <QepPanel title="Mark another mapping flaky">
        <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
          Prefer selecting from Automation home. Or enter provider + key here.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="text-xs">
            Provider
            <input
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
              value={flakyTarget?.providerId ?? ""}
              onChange={(event) =>
                setFlakyTarget((prev) => ({
                  providerId: event.target.value,
                  externalKey: prev?.externalKey ?? "",
                }))
              }
            />
          </label>
          <label className="text-xs">
            External key
            <input
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
              value={flakyTarget?.externalKey ?? ""}
              onChange={(event) =>
                setFlakyTarget((prev) => ({
                  providerId: prev?.providerId ?? "",
                  externalKey: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <label className="mt-2 block text-xs">
          Justification
          <textarea
            className="mt-1 min-h-[56px] w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={flakyNotes}
            onChange={(event) => setFlakyNotes(event.target.value)}
          />
        </label>
        <label className="mt-2 block text-xs">
          Defect ref
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
            value={flakyDefectRef}
            onChange={(event) => setFlakyDefectRef(event.target.value)}
          />
        </label>
        <Button
          type="button"
          size="sm"
          className="mt-2"
          disabled={
            mappingMutation.isPending ||
            !flakyTarget?.providerId.trim() ||
            !flakyTarget.externalKey.trim() ||
            flakyNotes.trim().length < 8
          }
          onClick={() => {
            if (!flakyTarget) return;
            mappingMutation.mutate({
              action: "mark_flaky_new",
              providerId: flakyTarget.providerId.trim(),
              externalKey: flakyTarget.externalKey.trim(),
              notes: flakyNotes.trim(),
              ...(flakyDefectRef.trim() ? { defectRef: flakyDefectRef.trim() } : {}),
            });
          }}
        >
          Mark flaky
        </Button>
      </QepPanel>
    </QepPageShell>
  );
}

function ProvidersView() {
  const providersQuery = useQuery({
    queryKey: ["qep-automation", "providers"],
    queryFn: () =>
      fetchJson<{
        providers: Array<{
          providerId: string;
          name: string;
          status: string;
          capabilities: string[];
        }>;
      }>("/api/v1/qep/automation/providers"),
  });

  if (providersQuery.isLoading) {
    return <QepLoadingState label="Loading providers…" />;
  }
  if (providersQuery.isError) {
    return <QepErrorState message={(providersQuery.error as Error).message} />;
  }

  return (
    <QepPageShell
      title="Automation providers"
      description="Active and placeholder providers"
    >
      <QepPanel title="Provider registry">
        <QepTable
          caption="Providers"
          columns={["Provider", "Status", "Capabilities"]}
          rows={(providersQuery.data?.providers ?? []).map((provider) => ({
            id: provider.providerId,
            href: QEP_AUTOMATION_ROUTES.provider(provider.providerId),
            cells: [
              provider.name,
              <QepStatusBadge key="st" status={provider.status} />,
              provider.capabilities.join(", "),
            ],
          }))}
        />
      </QepPanel>
    </QepPageShell>
  );
}

function ExecutionDetailView({ executionId }: { executionId: string }) {
  const detailQuery = useQuery({
    queryKey: ["qep-automation", "execution", executionId],
    queryFn: () =>
      fetchJson<{
        execution: {
          executionId: string;
          state: string;
          providerId: string;
          artifacts: Array<{ name: string; kind: string }>;
          evidenceRefs: string[];
          resultSummary?: string;
          timing: Record<string, string | number | undefined>;
        };
      }>(`/api/v1/qep/automation/executions/${executionId}`),
  });

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading execution…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={(detailQuery.error as Error | undefined)?.message ?? "Not found"}
      />
    );
  }

  const execution = detailQuery.data.execution;

  return (
    <QepPageShell
      title={`Execution ${execution.executionId.slice(0, 8)}`}
      description={`${execution.providerId} · ${execution.state}`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <QepPanel title="Live status">
          <QepStatusBadge status={execution.state} />
          <p className="mt-2 text-sm">{execution.resultSummary ?? "—"}</p>
        </QepPanel>
        <QepPanel title="Timeline / timing">
          <pre className="overflow-auto text-xs">
            {JSON.stringify(execution.timing, null, 2)}
          </pre>
        </QepPanel>
        <QepPanel title="Artifacts">
          <ul className="list-disc pl-5 text-sm">
            {execution.artifacts.map((artifact) => (
              <li key={artifact.name}>
                {artifact.kind}: {artifact.name}
              </li>
            ))}
          </ul>
        </QepPanel>
        <QepPanel title="Evidence references">
          <ul className="list-disc pl-5 text-sm">
            {execution.evidenceRefs.map((ref) => (
              <li key={ref}>{ref}</li>
            ))}
          </ul>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}
