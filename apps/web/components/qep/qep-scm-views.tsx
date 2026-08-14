"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { QEP_CERTIFICATION_ROUTES } from "@/lib/qep/certification-routes";
import { QEP_EARLY_CHECK_ROUTES } from "@/lib/qep/early-check-routes";
import { QEP_PORTFOLIO_ROUTES } from "@/lib/qep/portfolio-routes";
import { QEP_QUALITY_JOURNEY_ROUTES } from "@/lib/qep/quality-journey-routes";
import { QEP_SCM_ROUTES, parseQepScmRepositoryId } from "@/lib/qep/routes";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

type ChangeRow = {
  changeEventId: string;
  kind: string;
  sha?: string;
  prNumber?: number;
  title?: string;
  authorLogin?: string;
  authorName?: string;
  branch?: string;
  summary: string;
  source: string;
  occurredAt: string;
  filesChanged?: string[];
};

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

export function QepScmRouterView() {
  const pathname = usePathname() ?? "";
  const repositoryId = parseQepScmRepositoryId(pathname);

  if (pathname.includes("/providers")) {
    return <ProvidersView />;
  }
  if (pathname.includes("/webhooks")) {
    return <WebhooksView />;
  }
  if (repositoryId) {
    return <RepositoryDetailView repositoryId={repositoryId} />;
  }
  return <ScmHomeView />;
}

function ScmHomeView() {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("apzor/apzhub");

  const repositoriesQuery = useQuery({
    queryKey: ["qep-scm", "repositories"],
    queryFn: () =>
      fetchJson<{
        repositories: Array<{
          repositoryId: string;
          fullName: string;
          providerId: string;
          state: string;
          defaultBranch: string;
          health?: { ok: boolean; detail?: string };
        }>;
      }>("/api/v1/qep/scm/repositories"),
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      await fetchJson("/api/v1/qep/scm/providers/connect", {
        method: "POST",
        body: JSON.stringify({
          providerId: "github",
          correlationId: crypto.randomUUID(),
        }),
      });
      return fetchJson<{ repository: { repositoryId: string } }>(
        "/api/v1/qep/scm/repositories",
        {
          method: "POST",
          body: JSON.stringify({
            providerId: "github",
            fullName,
          }),
        },
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-scm"] });
    },
  });

  if (repositoriesQuery.isLoading) {
    return <QepLoadingState label="Loading source control…" />;
  }
  if (repositoriesQuery.isError) {
    return <QepErrorState message={(repositoriesQuery.error as Error).message} />;
  }

  const repositories = repositoriesQuery.data?.repositories ?? [];

  return (
    <QepPageShell
      title="Enterprise Source Control"
      description="Flagship F1 GitHub Heartbeat — catalogue repos; credentials from server secrets only; sync/webhooks persist durable change events."
      actions={
        <div className="flex items-center gap-2">
          <input
            className="rounded border px-2 py-1 text-sm"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            aria-label="Repository full name"
          />
          <Button
            type="button"
            onClick={() => registerMutation.mutate()}
            disabled={registerMutation.isPending || !fullName.trim()}
          >
            {registerMutation.isPending ? "Registering…" : "Register GitHub repo"}
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex gap-3 text-sm">
        <Link href={QEP_SCM_ROUTES.providers}>Providers</Link>
        <Link href={QEP_SCM_ROUTES.repositories}>Repositories</Link>
        <Link href={QEP_SCM_ROUTES.webhooks}>Webhooks</Link>
        <Link href={QEP_PORTFOLIO_ROUTES.home}>Portfolio</Link>
        <Link href={QEP_EARLY_CHECK_ROUTES.home}>Early Check</Link>
        <Link href={QEP_QUALITY_JOURNEY_ROUTES.home}>Quality Journey</Link>
      </div>

      <QepPanel title="Registered repositories">
        {repositories.length === 0 ? (
          <QepEmptyState title="No repositories yet — register a GitHub repository to begin." />
        ) : (
          <QepTable
            caption="Repositories"
            columns={["Repository", "Provider", "Branch", "State", "Health"]}
            rows={repositories.map((repository) => ({
              id: repository.repositoryId,
              href: QEP_SCM_ROUTES.repository(repository.repositoryId),
              cells: [
                repository.fullName,
                repository.providerId,
                repository.defaultBranch,
                <QepStatusBadge key="state" status={repository.state} />,
                repository.health?.ok ? "healthy" : (repository.health?.detail ?? "—"),
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function ProvidersView() {
  const providersQuery = useQuery({
    queryKey: ["qep-scm", "providers"],
    queryFn: () =>
      fetchJson<{
        providers: Array<{
          providerId: string;
          name: string;
          status: string;
          capabilities: string[];
        }>;
      }>("/api/v1/qep/scm/providers"),
  });

  if (providersQuery.isLoading) {
    return <QepLoadingState label="Loading providers…" />;
  }
  if (providersQuery.isError) {
    return <QepErrorState message={(providersQuery.error as Error).message} />;
  }

  return (
    <QepPageShell
      title="SCM providers"
      description="Active and placeholder source-control providers"
    >
      <div className="mb-4 text-sm">
        <Link href={QEP_SCM_ROUTES.home}>← Source Control</Link>
      </div>
      <QepPanel title="Provider registry">
        <QepTable
          caption="Providers"
          columns={["Provider", "Status", "Capabilities"]}
          rows={(providersQuery.data?.providers ?? []).map((provider) => ({
            id: provider.providerId,
            href: QEP_SCM_ROUTES.provider(provider.providerId),
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

function WebhooksView() {
  const webhooksQuery = useQuery({
    queryKey: ["qep-scm", "webhooks"],
    queryFn: () =>
      fetchJson<{
        webhooks: Array<{
          auditId: string;
          providerId: string;
          state: string;
          eventKind: string;
          repositoryFullName?: string;
          detail?: string;
          occurredAt: string;
        }>;
      }>("/api/v1/qep/scm/webhooks"),
  });

  if (webhooksQuery.isLoading) {
    return <QepLoadingState label="Loading webhook history…" />;
  }
  if (webhooksQuery.isError) {
    return <QepErrorState message={(webhooksQuery.error as Error).message} />;
  }

  const webhooks = webhooksQuery.data?.webhooks ?? [];

  return (
    <QepPageShell
      title="Webhook history"
      description="Delivery audit for provider-neutral webhook ingestion. Public GitHub URL: POST /api/v1/qep/scm/ingress/github (HMAC; no session)."
    >
      <div className="mb-4 text-sm">
        <Link href={QEP_SCM_ROUTES.home}>← Source Control</Link>
      </div>
      <QepPanel title="Deliveries">
        {webhooks.length === 0 ? (
          <QepEmptyState title="No webhook deliveries recorded yet." />
        ) : (
          <QepTable
            caption="Webhooks"
            columns={["When", "Provider", "Kind", "State", "Repository", "Detail"]}
            rows={webhooks.map((webhook) => ({
              id: webhook.auditId,
              cells: [
                webhook.occurredAt,
                webhook.providerId,
                webhook.eventKind,
                <QepStatusBadge key="st" status={webhook.state} />,
                webhook.repositoryFullName ?? "—",
                webhook.detail ?? "—",
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

type DesignDraftRow = {
  proposalItemId: string;
  kind: string;
  title: string;
  why: string;
  type: string;
  domain?: string;
  requirementId?: string;
};

function RepositoryDetailView({ repositoryId }: { repositoryId: string }) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);
  const [impactSummary, setImpactSummary] = useState<string | null>(null);
  const [proposalNote, setProposalNote] = useState<string | null>(null);
  const [acceptedPlanId, setAcceptedPlanId] = useState<string | null>(null);
  const [designDrafts, setDesignDrafts] = useState<DesignDraftRow[]>([]);
  const [designNote, setDesignNote] = useState<string | null>(null);
  const [acceptedSpecIds, setAcceptedSpecIds] = useState<string[]>([]);
  const [designAssistBootstrapped, setDesignAssistBootstrapped] = useState(false);

  const detailQuery = useQuery({
    queryKey: ["qep-scm", "repository", repositoryId],
    queryFn: () =>
      fetchJson<{
        repository: {
          repositoryId: string;
          fullName: string;
          providerId: string;
          state: string;
          defaultBranch: string;
          visibility: string;
          htmlUrl?: string;
          health?: { ok: boolean; detail?: string };
          metadata?: Record<string, string>;
        };
        links: Array<{
          linkId: string;
          kind: string;
          externalRef: string;
          platformRef?: string;
        }>;
        changes: ChangeRow[];
      }>(`/api/v1/qep/scm/repositories/${repositoryId}`),
  });

  const syncMutation = useMutation({
    mutationFn: () =>
      fetchJson<{
        repository: { repositoryId: string };
        branches: Array<{ name: string; sha?: string }>;
        commits: Array<{ sha: string; message: string }>;
        pullRequests: Array<{ number: number; title: string; state: string }>;
        changes: Array<{ changeEventId: string }>;
      }>(`/api/v1/qep/scm/repositories/${repositoryId}/sync`, {
        method: "POST",
        body: JSON.stringify({ correlationId: crypto.randomUUID() }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-scm"] });
    },
  });

  const stateMutation = useMutation({
    mutationFn: (state: "enabled" | "disabled") =>
      fetchJson(`/api/v1/qep/scm/repositories/${repositoryId}/state`, {
        method: "POST",
        body: JSON.stringify({ state }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-scm"] });
    },
  });

  const impactMutation = useMutation({
    mutationFn: (changeEventId: string) =>
      fetchJson<{
        impact: {
          summary: string;
          riskLevel: string;
          nodes: Array<{
            nodeId: string;
            assetType: string;
            name: string;
            reason: string;
          }>;
          matchedSuiteIds: string[];
        };
      }>(`/api/v1/qep/scm/changes/${changeEventId}/impact`),
    onSuccess: (data, changeEventId) => {
      setSelectedChangeId(changeEventId);
      setImpactSummary(
        `${data.impact.riskLevel}: ${data.impact.summary} · nodes=${data.impact.nodes.length} · suites=${data.impact.matchedSuiteIds.length}`,
      );
      setProposalNote(null);
      setAcceptedPlanId(null);
    },
  });

  const proposeMutation = useMutation({
    mutationFn: (changeEventId: string) =>
      fetchJson<{
        proposal: {
          note: string;
          proposedSuites: Array<{ suiteId: string; name: string }>;
        };
      }>(`/api/v1/qep/scm/changes/${changeEventId}/regression-proposal`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: (data) => {
      setProposalNote(
        `${data.proposal.note} · ${data.proposal.proposedSuites.map((s) => s.name).join(", ") || "none"}`,
      );
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (changeEventId: string) => {
      const proposal = await fetchJson<{
        proposal: { proposedSuites: Array<{ suiteId: string; name: string }> };
      }>(`/api/v1/qep/scm/changes/${changeEventId}/regression-proposal`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      const suiteId = proposal.proposal.proposedSuites[0]?.suiteId;
      if (!suiteId) {
        throw new Error(
          "No proposed suites — tag a suite with path:<prefix> matching changed files first.",
        );
      }
      return fetchJson<{ acceptance: { planId: string; suiteId: string } }>(
        `/api/v1/qep/scm/changes/${changeEventId}/regression-proposal/accept`,
        {
          method: "POST",
          body: JSON.stringify({ suiteId }),
        },
      );
    },
    onSuccess: (data) => {
      setAcceptedPlanId(data.acceptance.planId);
      void queryClient.invalidateQueries({ queryKey: ["qep-scm"] });
    },
  });

  const designProposeMutation = useMutation({
    mutationFn: (changeEventId: string) =>
      fetchJson<{
        proposal: {
          note: string;
          drafts: DesignDraftRow[];
        };
      }>(`/api/v1/qep/scm/changes/${changeEventId}/design-proposal`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: (data, changeEventId) => {
      setSelectedChangeId(changeEventId);
      setDesignNote(data.proposal.note);
      setDesignDrafts(data.proposal.drafts);
      setAcceptedSpecIds([]);
    },
  });

  const designAcceptMutation = useMutation({
    mutationFn: (input: {
      changeEventId: string;
      proposalItemIds?: string[];
      acceptAll?: boolean;
    }) =>
      fetchJson<{
        acceptance: {
          accepted: Array<{ specificationId: string; number: string; title: string }>;
        };
      }>(`/api/v1/qep/scm/changes/${input.changeEventId}/design-proposal/accept`, {
        method: "POST",
        body: JSON.stringify({
          proposalItemIds: input.proposalItemIds,
          acceptAll: input.acceptAll,
        }),
      }),
    onSuccess: (data) => {
      setAcceptedSpecIds(data.acceptance.accepted.map((row) => row.specificationId));
      void queryClient.invalidateQueries({ queryKey: ["qep-scm"] });
    },
  });

  useEffect(() => {
    const designAssist = searchParams?.get("designAssist")?.trim();
    if (!designAssist || designAssistBootstrapped) return;
    setDesignAssistBootstrapped(true);
    setSelectedChangeId(designAssist);
    designProposeMutation.mutate(designAssist);
    // Bootstrap once from QI/RC deep-link query param.
  }, [searchParams, designAssistBootstrapped]);

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading repository…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={(detailQuery.error as Error | undefined)?.message ?? "Not found"}
      />
    );
  }

  const { repository, links, changes } = detailQuery.data;
  const sync = syncMutation.data;

  return (
    <QepPageShell
      title={repository.fullName}
      description={`${repository.providerId} · ${repository.state} · ${repository.visibility}`}
      actions={
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? "Syncing…" : "Sync heartbeat"}
          </Button>
          <Button
            type="button"
            onClick={() =>
              stateMutation.mutate(
                repository.state === "enabled" ? "disabled" : "enabled",
              )
            }
            disabled={stateMutation.isPending}
          >
            {repository.state === "enabled" ? "Disable" : "Enable"}
          </Button>
        </div>
      }
    >
      <div className="mb-4 text-sm">
        <Link href={QEP_SCM_ROUTES.home}>← Source Control</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <QepPanel title="Repository">
          <p className="text-sm">Default branch: {repository.defaultBranch}</p>
          <p className="text-sm">
            Health:{" "}
            {repository.health?.ok
              ? `ok — ${repository.health.detail ?? ""}`
              : (repository.health?.detail ?? "unknown")}
          </p>
          {repository.htmlUrl ? (
            <p className="text-sm">
              <a href={repository.htmlUrl} target="_blank" rel="noreferrer">
                Open upstream
              </a>
            </p>
          ) : null}
        </QepPanel>
        <QepPanel title="Traceability links">
          {links.length === 0 ? (
            <QepEmptyState title="No links yet — relationships only (no AI)." />
          ) : (
            <ul className="list-disc pl-5 text-sm">
              {links.map((link) => (
                <li key={link.linkId}>
                  {link.kind}: {link.externalRef}
                  {link.platformRef ? ` → ${link.platformRef}` : ""}
                </li>
              ))}
            </ul>
          )}
        </QepPanel>
        <QepPanel title="Durable change heartbeat (F1) + Impact (F2)">
          {changes.length === 0 ? (
            <QepEmptyState title="No durable changes yet — Sync or receive a webhook." />
          ) : (
            <div className="flex flex-col gap-3">
              <QepTable
                caption="Change events"
                columns={["When", "Kind", "Summary", "Author", "Actions"]}
                rows={changes.map((change) => ({
                  id: change.changeEventId,
                  cells: [
                    change.occurredAt,
                    change.kind,
                    change.prNumber
                      ? `#${change.prNumber} ${change.title ?? change.summary}`
                      : change.sha
                        ? `${change.sha.slice(0, 7)} — ${change.title ?? change.summary}`
                        : change.summary,
                    change.authorLogin ?? change.authorName ?? "—",
                    <div key="actions" className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={impactMutation.isPending}
                        onClick={() => impactMutation.mutate(change.changeEventId)}
                      >
                        Impact
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={proposeMutation.isPending}
                        onClick={() => proposeMutation.mutate(change.changeEventId)}
                      >
                        Propose
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={acceptMutation.isPending}
                        onClick={() => acceptMutation.mutate(change.changeEventId)}
                      >
                        Accept pack
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={designProposeMutation.isPending}
                        onClick={() =>
                          designProposeMutation.mutate(change.changeEventId)
                        }
                        data-testid="qep-scm-design-propose"
                      >
                        Propose design
                      </Button>
                      <Link
                        className="text-xs underline"
                        href={QEP_QUALITY_JOURNEY_ROUTES.byChange(change.changeEventId)}
                      >
                        Open journey
                      </Link>
                      <Link
                        className="text-xs underline"
                        href={QEP_EARLY_CHECK_ROUTES.byChange(change.changeEventId)}
                      >
                        Early Check
                      </Link>
                      <Link
                        className="text-xs underline"
                        href={QEP_CERTIFICATION_ROUTES.byChange(change.changeEventId)}
                      >
                        Open RC
                      </Link>
                    </div>,
                  ],
                }))}
              />
              {selectedChangeId ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Selected change: {selectedChangeId.slice(0, 24)}…
                </p>
              ) : null}
              {impactSummary ? (
                <p className="text-sm" data-testid="qep-scm-impact-summary">
                  {impactSummary}
                </p>
              ) : null}
              {proposalNote ? (
                <p className="text-sm" data-testid="qep-scm-proposal-note">
                  {proposalNote}
                </p>
              ) : null}
              {acceptedPlanId ? (
                <p className="text-sm" data-testid="qep-scm-accepted-plan">
                  Draft execution plan created: {acceptedPlanId}
                </p>
              ) : null}
              {acceptMutation.isError ? (
                <QepErrorState message={(acceptMutation.error as Error).message} />
              ) : null}
              {designNote ? (
                <div className="space-y-2" data-testid="qep-scm-design-pack">
                  <p className="text-sm font-medium">Test design assist (F7)</p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {designNote}
                  </p>
                  {designDrafts.length === 0 ? (
                    <QepEmptyState title="No draft specs suggested for this change." />
                  ) : (
                    <ul className="space-y-2">
                      {designDrafts.map((draft) => (
                        <li
                          key={draft.proposalItemId}
                          className="rounded-md border border-[var(--color-border)] p-2 text-sm"
                          data-testid="qep-scm-design-draft"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <QepStatusBadge status={draft.kind} />
                            <span className="font-medium">{draft.title}</span>
                            <span className="text-xs text-[var(--color-muted-foreground)]">
                              {draft.type}
                              {draft.domain ? ` · ${draft.domain}` : ""}
                            </span>
                          </div>
                          <p className="mt-1 text-[var(--color-muted-foreground)]">
                            {draft.why}
                          </p>
                          {selectedChangeId ? (
                            <Button
                              type="button"
                              size="sm"
                              className="mt-2"
                              disabled={designAcceptMutation.isPending}
                              onClick={() =>
                                designAcceptMutation.mutate({
                                  changeEventId: selectedChangeId,
                                  proposalItemIds: [draft.proposalItemId],
                                })
                              }
                            >
                              Accept draft
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                  {selectedChangeId && designDrafts.length > 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={designAcceptMutation.isPending}
                      onClick={() =>
                        designAcceptMutation.mutate({
                          changeEventId: selectedChangeId,
                          acceptAll: true,
                        })
                      }
                      data-testid="qep-scm-design-accept-all"
                    >
                      Accept all drafts
                    </Button>
                  ) : null}
                  {acceptedSpecIds.length > 0 ? (
                    <p className="text-sm" data-testid="qep-scm-accepted-specs">
                      Draft specifications created: {acceptedSpecIds.join(", ")}
                    </p>
                  ) : null}
                  {designAcceptMutation.isError ? (
                    <QepErrorState
                      message={(designAcceptMutation.error as Error).message}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </QepPanel>
        <QepPanel title="Branches (last sync)">
          <ul className="list-disc pl-5 text-sm">
            {(sync?.branches ?? []).map((branch) => (
              <li key={branch.name}>
                {branch.name}
                {branch.sha ? ` · ${branch.sha.slice(0, 7)}` : ""}
              </li>
            ))}
            {!sync ? <li>Run Sync heartbeat to refresh remote snapshot.</li> : null}
          </ul>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}
