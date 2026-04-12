"use client";

import { Button } from "@/components/ui/button";
import { useAdminAccessQuery } from "@/lib/hooks/use-admin-access-query";

export function AdminBundleEditorPage({ bundleId }: { bundleId: string }) {
  const accessQuery = useAdminAccessQuery();
  const data = accessQuery.data?.accessData;
  const isLoading = accessQuery.isLoading;
  const detail = data?.bundleDetailsById[bundleId];

  if (isLoading || !data) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-bundle-loading">
        Loading bundle…
      </div>
    );
  }

  if (!detail) {
    return (
      <div data-testid="admin-bundle-not-found">
        <p className="text-sm text-muted-foreground">Bundle not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="admin-bundle-editor">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">{detail.name}</h1>
        <p className="text-xs text-muted-foreground">{detail.description}</p>
      </header>
      {detail.metadata ? (
        <section>
          <h2 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Metadata</h2>
          <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
            {Object.entries(detail.metadata).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-mono text-muted-foreground">{k}</dt>
                <dd className="text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      <section>
        <h2 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Service roles</h2>
        <div className="overflow-auto rounded-md border border-border">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 font-medium">Service</th>
                <th className="px-2 py-1.5 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {detail.serviceRoles.map((r) => (
                <tr key={`${r.serviceId}-${r.roleId}`}>
                  <td className="px-2 py-1 font-mono">{r.serviceId}</td>
                  <td className="px-2 py-1">{r.roleLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Preview</h2>
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {detail.previewLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Impact summary</h2>
        <dl className="grid max-w-lg grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <dt>Services affected</dt>
          <dd className="font-mono text-foreground">{detail.impact.servicesAffectedCount}</dd>
          <dt>Users affected</dt>
          <dd className="font-mono text-foreground">{detail.impact.usersAffectedCount}</dd>
          <dt>Overrides present</dt>
          <dd className="font-mono text-foreground">{detail.impact.overridesPresentCount}</dd>
          <dt>Conflicts</dt>
          <dd className="font-mono text-foreground">{detail.impact.conflictsCount}</dd>
        </dl>
      </section>
      <section>
        <h2 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Users affected</h2>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{detail.affectedUserCount}</span> users — sample:{" "}
          {detail.affectedUserSample.join(", ")}
        </p>
      </section>
      <Button type="button" size="sm" disabled title="Saving bundles is not available in this build.">
        Save changes
      </Button>
    </div>
  );
}
