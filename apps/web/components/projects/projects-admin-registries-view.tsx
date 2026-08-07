"use client";

/**
 * W010 / W011 S-18 — Administration registries (PX-07).
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import {
  assessGovernanceMaturity,
  createAdminDelegation,
  createGovernedSearch,
  createOperationalRole,
  createRetentionPolicy,
  getConfigurationHierarchy,
  getEffectiveGovernanceConfig,
  getGovernanceCompliance,
  listAdminDelegations,
  listGovernanceAdminAudit,
  listGovernedSearches,
  listLegalHolds,
  listOperationalRoles,
  listRetentionPolicies,
  placeLegalHold,
  publishGovernedSearch,
  publishRetentionPolicy,
  releaseLegalHold,
  revokeAdminDelegation,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { ProjectsAdminNav } from "./projects-admin-nav";
import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

export type AdminRegistry =
  | "hierarchy"
  | "delegations"
  | "compliance"
  | "audit"
  | "retention"
  | "searches"
  | "roles";

const TITLES: Record<AdminRegistry, { title: string; description: string }> = {
  hierarchy: {
    title: "Configuration Hierarchy",
    description:
      "Platform → Organisation → Portfolio → Initiative → Programme → Project. Effective config shows inheritance sources.",
  },
  delegations: {
    title: "Delegation Registry",
    description:
      "Time-bounded, scoped delegations. Cannot delegate checkpoint waive or superadmin without SoD allow.",
  },
  compliance: {
    title: "Governance Compliance",
    description:
      "Compliant · Advisory · Non-Compliant · Critical bands for operational scopes.",
  },
  audit: {
    title: "Governance Audit",
    description:
      "Immutable admin events — distinct from Operational History and Review snapshots.",
  },
  retention: {
    title: "Retention & Legal Hold",
    description:
      "Retention policies and legal holds. Active holds block destructive purge.",
  },
  searches: {
    title: "Governed Search",
    description:
      "Organisation-published enterprise searches — not personal Saved Searches.",
  },
  roles: {
    title: "Operational Role Catalogue",
    description: "Accountability roles for delivery — not platform IAM permissions.",
  },
};

export function ProjectsAdminRegistryView({
  registry,
  permissions: _permissions,
}: {
  readonly registry: AdminRegistry;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const meta = TITLES[registry];
  return (
    <PageShell
      title={meta.title}
      description={meta.description}
      breadcrumbs={["APZ Projects", "Administration", meta.title]}
    >
      <div className="space-y-4" data-testid={`projects-admin-${registry}`}>
        <ProjectsAdminNav />
        {registry === "hierarchy" ? <HierarchyPanel /> : null}
        {registry === "delegations" ? <DelegationsPanel /> : null}
        {registry === "compliance" ? <CompliancePanel /> : null}
        {registry === "audit" ? <AuditPanel /> : null}
        {registry === "retention" ? <RetentionPanel /> : null}
        {registry === "searches" ? <SearchesPanel /> : null}
        {registry === "roles" ? <RolesPanel /> : null}
      </div>
    </PageShell>
  );
}

function HierarchyPanel() {
  const [scopeType, setScopeType] = useState("project");
  const [scopeId, setScopeId] = useState("prj_demo");
  const layers = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-hierarchy", scopeType, scopeId],
    queryFn: () => getConfigurationHierarchy({ scopeType, scopeId }),
    enabled: Boolean(scopeId.trim()),
  });
  const effective = useQuery({
    queryKey: [...projectsQueryKeys.all, "effective-config", scopeType, scopeId],
    queryFn: () =>
      getEffectiveGovernanceConfig({
        scopeType,
        scopeId,
      }),
    enabled: Boolean(scopeId.trim()),
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 border border-[var(--color-border)] bg-transparent px-2 text-sm"
          value={scopeType}
          onChange={(e) => setScopeType(e.target.value)}
        >
          <option value="organisation">Organisation</option>
          <option value="portfolio">Portfolio</option>
          <option value="initiative">Initiative</option>
          <option value="programme">Programme</option>
          <option value="project">Project</option>
        </select>
        <Input
          label="Scope ID"
          value={scopeId}
          onChange={(e) => setScopeId(e.target.value)}
        />
      </div>
      {layers.isLoading ? <LoadingState label="Loading hierarchy…" /> : null}
      <ol className="space-y-2">
        {(layers.data ?? []).map((layer, index) => (
          <li
            key={`${String(layer.scopeType)}-${index}`}
            className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <span className="font-medium">{String(layer.label)}</span>
            <span className="text-[var(--color-muted-foreground)]">
              {" "}
              · {String(layer.scopeType)}/{String(layer.scopeId)}
            </span>
          </li>
        ))}
      </ol>
      {effective.data ? (
        <div
          className="rounded border border-[var(--color-border)] p-3 text-sm"
          data-testid="admin-effective-config"
        >
          <p className="font-medium">Effective configuration sources</p>
          <ul className="mt-2 space-y-1">
            {(
              (effective.data.layers as
                | readonly {
                    scopeType?: string;
                    scopeId?: string;
                    profileName?: string;
                  }[]
                | undefined) ?? []
            ).map((layer, i) => (
              <li key={`${layer.scopeType}-${i}`}>
                {String(layer.scopeType)}/{String(layer.scopeId)}
                {layer.profileName ? ` · ${layer.profileName}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function DelegationsPanel() {
  const queryClient = useQueryClient();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const list = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-delegations"],
    queryFn: () => listAdminDelegations(),
  });

  const create = useMutation({
    mutationFn: () =>
      createAdminDelegation({
        fromPrincipalId: fromId.trim(),
        toPrincipalId: toId.trim(),
        scopeType: "project",
        scopeId: scopeId.trim(),
        permissionSet: ["projects.commitment.manage"],
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 7 * 86400000).toISOString(),
        reason: reason.trim(),
      }),
    onSuccess: async () => {
      setFromId("");
      setToId("");
      setScopeId("");
      setReason("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err) => {
      setError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeAdminDelegation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  return (
    <section className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          label="From principal"
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
        />
        <Input
          label="To principal"
          value={toId}
          onChange={(e) => setToId(e.target.value)}
        />
        <Input
          label="Project scope ID"
          value={scopeId}
          onChange={(e) => setScopeId(e.target.value)}
        />
        <Input
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button
        type="button"
        size="sm"
        disabled={create.isPending}
        onClick={() => create.mutate()}
      >
        Create delegation
      </Button>
      {list.isLoading ? <LoadingState label="Loading delegations…" /> : null}
      {(list.data?.length ?? 0) === 0 && !list.isLoading ? (
        <EmptyState
          title="No delegations"
          description="Create a time-bounded scoped delegation for leave cover."
        />
      ) : (
        <ul className="space-y-2">
          {(list.data ?? []).map((row) => (
            <li
              key={String(row.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <span>
                {String(row.fromPrincipalId)} → {String(row.toPrincipalId)} ·{" "}
                {String(row.scopeType)}/{String(row.scopeId)} ·{" "}
                <strong>{String(row.status)}</strong>
              </span>
              {row.status === "active" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => revoke.mutate(String(row.id))}
                >
                  Revoke
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CompliancePanel() {
  const [scopeType, setScopeType] = useState<
    "project" | "programme" | "initiative" | "portfolio"
  >("portfolio");
  const [scopeId, setScopeId] = useState("enterprise");
  const compliance = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-compliance", scopeType, scopeId],
    queryFn: () => getGovernanceCompliance({ scopeType, scopeId }),
    enabled: Boolean(scopeId.trim()),
  });
  const maturity = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-maturity"],
    queryFn: () =>
      assessGovernanceMaturity({
        scopeType: "organisation",
        scopeId: "organisation",
        publishedProfileCount: 2,
        publishedPolicyCount: 2,
        retentionPublished: true,
        governedSearchCount: 1,
      }),
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 border border-[var(--color-border)] bg-transparent px-2 text-sm"
          value={scopeType}
          onChange={(e) => setScopeType(e.target.value as typeof scopeType)}
        >
          <option value="portfolio">Portfolio</option>
          <option value="initiative">Initiative</option>
          <option value="programme">Programme</option>
          <option value="project">Project</option>
        </select>
        <Input
          label="Scope ID"
          value={scopeId}
          onChange={(e) => setScopeId(e.target.value)}
        />
      </div>
      {compliance.isError ? (
        <ErrorState
          message="Unable to compute compliance."
          onRetry={() => void compliance.refetch()}
        />
      ) : null}
      {compliance.data ? (
        <div className="rounded border border-[var(--color-border)] p-3">
          <p className="text-sm">
            Band: <strong>{String(compliance.data.band)}</strong>
          </p>
          <ul className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {(
              (compliance.data.factors as
                readonly { label?: string; severity?: string }[] | undefined) ?? []
            ).map((f, i) => (
              <li key={`${f.label}-${i}`}>
                {f.label} ({f.severity})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {maturity.data ? (
        <div className="rounded border border-[var(--color-border)] p-3">
          <p className="text-sm font-medium">
            Governance maturity: {String(maturity.data.band)}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function AuditPanel() {
  const audit = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-audit"],
    queryFn: () => listGovernanceAdminAudit(),
  });
  if (audit.isLoading) return <LoadingState label="Loading audit…" />;
  if ((audit.data?.length ?? 0) === 0) {
    return (
      <EmptyState
        title="No admin audit events"
        description="Publish profiles, create delegations, or place legal holds to populate this console."
      />
    );
  }
  return (
    <ul className="space-y-2" data-testid="admin-audit-list">
      {(audit.data ?? []).map((row) => (
        <li
          key={String(row.id)}
          className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
        >
          <span className="text-[var(--color-muted-foreground)]">
            {String(row.at).slice(0, 19)}
          </span>{" "}
          · {String(row.type)} · {String(row.summary)} · actor{" "}
          {String(row.actorPrincipalId)}
        </li>
      ))}
    </ul>
  );
}

function RetentionPanel() {
  const queryClient = useQueryClient();
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [holdScope, setHoldScope] = useState("");
  const [holdReason, setHoldReason] = useState("");

  const policies = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-retention"],
    queryFn: () => listRetentionPolicies(),
  });
  const holds = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-legal-holds"],
    queryFn: () => listLegalHolds(),
  });

  const createPolicy = useMutation({
    mutationFn: () =>
      createRetentionPolicy({
        key: key.trim(),
        name: name.trim(),
        classification: "internal",
        retainYears: 7,
        archiveBehaviour: "archive",
      }),
    onSuccess: async () => {
      setKey("");
      setName("");
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  const publish = useMutation({
    mutationFn: (id: string) => publishRetentionPolicy(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  const placeHold = useMutation({
    mutationFn: () =>
      placeLegalHold({
        scopeType: "project",
        scopeId: holdScope.trim(),
        reason: holdReason.trim(),
      }),
    onSuccess: async () => {
      setHoldScope("");
      setHoldReason("");
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  const release = useMutation({
    mutationFn: (id: string) => releaseLegalHold(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Retention policies</h3>
        <div className="flex flex-wrap gap-2">
          <Input label="Key" value={key} onChange={(e) => setKey(e.target.value)} />
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="button" size="sm" onClick={() => createPolicy.mutate()}>
            Create draft
          </Button>
        </div>
        <ul className="space-y-2">
          {(policies.data ?? []).map((row) => (
            <li
              key={String(row.id)}
              className="flex items-center justify-between gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <span>
                {String(row.name)} · {String(row.retainYears)}y · {String(row.status)}
              </span>
              {row.status === "draft" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => publish.mutate(String(row.id))}
                >
                  Publish
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Legal holds</h3>
        <div className="flex flex-wrap gap-2">
          <Input
            label="Project ID"
            value={holdScope}
            onChange={(e) => setHoldScope(e.target.value)}
          />
          <Input
            label="Reason"
            value={holdReason}
            onChange={(e) => setHoldReason(e.target.value)}
          />
          <Button type="button" size="sm" onClick={() => placeHold.mutate()}>
            Place hold
          </Button>
        </div>
        <ul className="space-y-2">
          {(holds.data ?? []).map((row) => (
            <li
              key={String(row.id)}
              className="flex items-center justify-between gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <span>
                {String(row.scopeType)}/{String(row.scopeId)} · {String(row.status)} ·{" "}
                {String(row.reason)}
              </span>
              {row.status === "active" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => release.mutate(String(row.id))}
                >
                  Release
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SearchesPanel() {
  const queryClient = useQueryClient();
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const list = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-governed-searches"],
    queryFn: () => listGovernedSearches(),
  });
  const create = useMutation({
    mutationFn: () =>
      createGovernedSearch({
        key: key.trim(),
        name: name.trim(),
        query: query.trim(),
      }),
    onSuccess: async () => {
      setKey("");
      setName("");
      setQuery("");
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });
  const publish = useMutation({
    mutationFn: (id: string) => publishGovernedSearch(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  return (
    <section className="space-y-3">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Personal Saved Searches remain under Productivity — this registry is
        enterprise-governed only.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Input label="Key" value={key} onChange={(e) => setKey(e.target.value)} />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Query" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <Button type="button" size="sm" onClick={() => create.mutate()}>
        Create governed search
      </Button>
      <ul className="space-y-2">
        {(list.data ?? []).map((row) => (
          <li
            key={String(row.id)}
            className="flex items-center justify-between gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <span>
              {String(row.name)} · {String(row.query)} · {String(row.status)}
            </span>
            {row.status === "draft" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => publish.mutate(String(row.id))}
              >
                Publish
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RolesPanel() {
  const queryClient = useQueryClient();
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const list = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-roles"],
    queryFn: () => listOperationalRoles(),
  });
  const create = useMutation({
    mutationFn: () =>
      createOperationalRole({
        key: key.trim(),
        label: label.trim(),
        accountabilityHint: "Responsible",
      }),
    onSuccess: async () => {
      setKey("");
      setLabel("");
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input label="Key" value={key} onChange={(e) => setKey(e.target.value)} />
        <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Button type="button" size="sm" onClick={() => create.mutate()}>
          Add role
        </Button>
      </div>
      {list.isLoading ? <LoadingState label="Loading roles…" /> : null}
      <ul className="space-y-2">
        {(list.data ?? []).map((row) => (
          <li
            key={String(row.id)}
            className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <span className="font-medium">{String(row.label)}</span>
            <span className="text-[var(--color-muted-foreground)]">
              {" "}
              · {String(row.key)} · {String(row.accountabilityHint)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
