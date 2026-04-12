"use client";

import { useAdminInspector } from "@/features/admin/admin-inspector-context";
import { selectProvisioningJob } from "@/lib/admin/admin-inspector-selection";
import { useAdminProvisioningJobsQuery } from "@/lib/hooks/use-admin-provisioning-jobs-query";
import { cn } from "@/lib/utils";

export function AdminProvisioningQueuePage() {
  const { data: jobs = [], isLoading } = useAdminProvisioningJobsQuery();
  const { setSelection } = useAdminInspector();

  if (isLoading) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-provisioning-loading">
        Loading jobs…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-testid="admin-provisioning-page">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">Provisioning jobs</h1>
        <p className="text-xs text-muted-foreground">
          Every downstream change is a visible job. Select a row to inspect actions in the right panel.
        </p>
      </header>
      <div className="overflow-auto rounded-md border border-border">
        <table className="w-full min-w-[48rem] text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 font-medium">Job</th>
              <th className="px-2 py-1.5 font-medium">Type</th>
              <th className="px-2 py-1.5 font-medium">Connector</th>
              <th className="px-2 py-1.5 font-medium">Subject</th>
              <th className="px-2 py-1.5 font-medium">Status</th>
              <th className="px-2 py-1.5 font-medium">Updated</th>
              <th className="px-2 py-1.5 font-medium">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-muted/30">
                <td className="p-0" colSpan={7}>
                  <button
                    type="button"
                    data-testid={`admin-provisioning-job-row-${j.id}`}
                    onClick={() => setSelection(selectProvisioningJob(j))}
                    className="grid w-full grid-cols-[minmax(6rem,0.75fr)_4.5rem_minmax(5rem,0.9fr)_1.1fr_6rem_9rem_1fr] gap-2 px-2 py-1.5 text-left"
                  >
                    <span className="font-mono text-[0.65rem] text-foreground">{j.id}</span>
                    <span className="uppercase text-muted-foreground">{j.jobType}</span>
                    <span className="font-mono text-[0.6rem] text-muted-foreground" title={j.connectorCapabilitySummary}>
                      {j.connectorId ? (
                        <>
                          <span className="text-foreground">{j.connectorId}</span>
                          {j.connectorProfile ? (
                            <span className="block text-[0.55rem] text-muted-foreground/90">{j.connectorProfile}</span>
                          ) : null}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                    <span className="text-muted-foreground">{j.subjectLabel}</span>
                    <span className="font-mono text-[0.6rem] text-foreground">{j.status}</span>
                    <span className="font-mono text-[0.6rem] text-muted-foreground">{j.updatedAt}</span>
                    <span className={cn("truncate text-muted-foreground", j.failureMessage && "text-destructive")}>
                      {j.failureMessage ?? "—"}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[0.65rem] text-muted-foreground">{jobs.length} jobs in queue</p>
    </div>
  );
}
