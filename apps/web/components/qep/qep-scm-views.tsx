"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
      description="Provider-neutral SCM platform. GitHub is the first active provider."
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
      description="Delivery audit for provider-neutral webhook ingestion"
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

function RepositoryDetailView({ repositoryId }: { repositoryId: string }) {
  const queryClient = useQueryClient();

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
      }>(`/api/v1/qep/scm/repositories/${repositoryId}`),
  });

  const syncMutation = useMutation({
    mutationFn: () =>
      fetchJson<{
        repository: { repositoryId: string };
        branches: Array<{ name: string; sha?: string }>;
        commits: Array<{ sha: string; message: string }>;
        pullRequests: Array<{ number: number; title: string; state: string }>;
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

  const { repository, links } = detailQuery.data;
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
            {syncMutation.isPending ? "Syncing…" : "Sync"}
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
        <QepPanel title="Branches (last sync)">
          <ul className="list-disc pl-5 text-sm">
            {(sync?.branches ?? []).map((branch) => (
              <li key={branch.name}>
                {branch.name}
                {branch.sha ? ` · ${branch.sha.slice(0, 7)}` : ""}
              </li>
            ))}
            {!sync ? <li>Run Sync to load branches.</li> : null}
          </ul>
        </QepPanel>
        <QepPanel title="Commits / pull requests (last sync)">
          <ul className="mb-3 list-disc pl-5 text-sm">
            {(sync?.commits ?? []).map((commit) => (
              <li key={commit.sha}>
                {commit.sha.slice(0, 7)} — {commit.message}
              </li>
            ))}
          </ul>
          <ul className="list-disc pl-5 text-sm">
            {(sync?.pullRequests ?? []).map((pullRequest) => (
              <li key={pullRequest.number}>
                #{pullRequest.number} {pullRequest.title} ({pullRequest.state})
              </li>
            ))}
            {!sync ? <li>Run Sync to load commits and pull requests.</li> : null}
          </ul>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}
