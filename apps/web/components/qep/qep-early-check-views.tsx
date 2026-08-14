"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { QEP_EARLY_CHECK_ROUTES } from "@/lib/qep/early-check-routes";
import { QEP_PORTFOLIO_ROUTES } from "@/lib/qep/portfolio-routes";
import { QEP_QUALITY_JOURNEY_ROUTES } from "@/lib/qep/quality-journey-routes";
import { QEP_SCM_ROUTES } from "@/lib/qep/routes";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

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

type AiFixPackPayload = {
  pack: {
    packId: string;
    changeEventId: string;
    assessmentBand: string;
    assessmentHeadline: string;
    advisory: true;
    autoCertified: false;
    items: Array<{
      id: string;
      priority: string;
      severity: string;
      title: string;
      location?: string;
      recommendedFix: string;
      agentInstruction: string;
    }>;
    severityRollup: { total: number; critical: number; high: number };
  };
  markdown?: string;
};

export function QepEarlyCheckRouterView() {
  return <EarlyCheckHomeView />;
}

function EarlyCheckHomeView() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [changeEventId, setChangeEventId] = useState(
    searchParams?.get("changeEventId") ?? "",
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const trimmedId = changeEventId.trim();
  const ready = trimmedId.length > 8;

  const fixPackQuery = useQuery({
    queryKey: ["qep-ai-fix-pack", "by-change", trimmedId],
    enabled: ready,
    queryFn: () =>
      fetchJson<AiFixPackPayload>(
        `/api/v1/qep/ai-fix-packs/by-change/${encodeURIComponent(trimmedId)}?format=markdown`,
      ),
  });

  const runMutation = useMutation({
    mutationFn: () =>
      fetchJson<{
        packs: {
          quality: Array<{ status: string }>;
          security: Array<{ status: string }>;
          qualityEnabled: boolean;
          securityEnabled: boolean;
        };
        playwright: {
          attempted: boolean;
          enabled: boolean;
          skipped: boolean;
          reason?: string;
          executionId?: string;
        };
        note?: string;
      }>(`/api/v1/qep/early-check/by-change/${encodeURIComponent(trimmedId)}/run`, {
        method: "POST",
        body: JSON.stringify({
          includePlaywright: true,
          force: true,
        }),
      }),
    onSuccess: (data) => {
      const q = data.packs.quality.map((r) => r.status).join(",") || "none";
      const s = data.packs.security.map((r) => r.status).join(",") || "none";
      const pw = data.playwright.skipped
        ? `playwright skipped (${data.playwright.reason ?? "n/a"})`
        : `playwright ${data.playwright.executionId ?? "ok"}`;
      setActionMessage(
        `Early Check dispatched · quality=${q} · security=${s} · ${pw}. ${data.note ?? ""}`,
      );
      void queryClient.invalidateQueries({
        queryKey: ["qep-ai-fix-pack", "by-change", trimmedId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["qep-dispatch", "by-change", trimmedId],
      });
    },
    onError: (error) => {
      setActionMessage((error as Error).message);
    },
  });

  const pack = fixPackQuery.data?.pack;
  const markdown = fixPackQuery.data?.markdown ?? "";

  async function copyMarkdown() {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setActionMessage("Clipboard unavailable — use Open markdown instead.");
    }
  }

  return (
    <QepPageShell
      title="Early Check"
      description="Flagship F13 — Developer spot checks (quality + security + Playwright). Download an AI Fix Pack for Cursor. Advisory only — never certification."
    >
      <QepPanel title="Change under check">
        <label className="mb-2 block text-sm">
          changeEventId
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
            value={changeEventId}
            onChange={(event) => setChangeEventId(event.target.value)}
            placeholder="chg-github-…"
            data-testid="qep-early-check-change-id"
          />
        </label>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Outside the AI IDE: run packs here, then paste the AI Fix Pack into Cursor.
          Requires <code>APZHUB_VERIFICATION_DISPATCH</code> /{" "}
          <code>APZHUB_SECURITY_DISPATCH</code> (and{" "}
          <code>APZHUB_AUTOMATION_ON_CHANGE</code> for Playwright).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="qep-early-check-run"
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
            disabled={!ready || runMutation.isPending}
            onClick={() => {
              setActionMessage(null);
              runMutation.mutate();
            }}
          >
            {runMutation.isPending ? "Running…" : "Run Early Check"}
          </button>
          {ready ? (
            <Link
              href={QEP_QUALITY_JOURNEY_ROUTES.byChange(trimmedId)}
              className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
            >
              Open Quality Journey
            </Link>
          ) : null}
          <Link
            href={QEP_PORTFOLIO_ROUTES.home}
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
          >
            Portfolio
          </Link>
          <Link
            href={QEP_SCM_ROUTES.home}
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
          >
            Source Control
          </Link>
        </div>
      </QepPanel>

      {actionMessage ? (
        <p
          className="mt-2 text-sm text-[var(--color-muted-foreground)]"
          data-testid="qep-early-check-action-message"
        >
          {actionMessage}
        </p>
      ) : null}

      {!ready ? (
        <div className="mt-4">
          <QepEmptyState title="Paste a changeEventId to run Early Check." />
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Deep-link: <code>{QEP_EARLY_CHECK_ROUTES.byChange("chg-…")}</code>
          </p>
        </div>
      ) : fixPackQuery.isFetching && !pack ? (
        <QepLoadingState label="Loading AI Fix Pack…" />
      ) : fixPackQuery.isError ? (
        <QepErrorState message={(fixPackQuery.error as Error).message} />
      ) : pack ? (
        <div className="mt-4 space-y-4" data-testid="qep-early-check-pack">
          <QepPanel title="AI Fix Pack (advisory)">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <QepStatusBadge status="advisory" />
              <span>
                {pack.assessmentBand} — {pack.assessmentHeadline}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {pack.severityRollup.total} findings · {pack.items.length} fix items · C
                {pack.severityRollup.critical}/H
                {pack.severityRollup.high}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              autoCertified={String(pack.autoCertified)} · Not a GO/NO-GO.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                data-testid="qep-early-check-copy-md"
                className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-muted)]"
                onClick={() => void copyMarkdown()}
              >
                {copied ? "Copied" : "Copy markdown for Cursor"}
              </button>
              <a
                href={`/api/v1/qep/ai-fix-packs/by-change/${encodeURIComponent(trimmedId)}`}
                data-testid="qep-early-check-open-json"
              >
                Open JSON
              </a>
              <a
                href={`/api/v1/qep/ai-fix-packs/by-change/${encodeURIComponent(trimmedId)}?format=markdown`}
                data-testid="qep-early-check-open-md"
              >
                Open markdown
              </a>
            </div>
          </QepPanel>

          <QepPanel title="Top fix items">
            {pack.items.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No items yet — run Early Check and wait for evidence ingest, then
                refresh.
              </p>
            ) : (
              <ul className="space-y-2" data-testid="qep-early-check-items">
                {pack.items.slice(0, 12).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-md border border-[var(--color-border)] p-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <QepStatusBadge status={item.priority} />
                      <QepStatusBadge status={item.severity} />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.location ? (
                      <p className="mt-1 font-mono text-xs text-[var(--color-muted-foreground)]">
                        {item.location}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                      {item.recommendedFix}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </QepPanel>
        </div>
      ) : null}
    </QepPageShell>
  );
}
