"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAdminInspector } from "@/features/admin/admin-inspector-context";
import { RealizationPill } from "@/features/admin/access/realization-pill";
import { SourcePill } from "@/features/admin/access/source-pill";
import { matrixCellSelectionInspectorStatus, selectMatrixCell } from "@/lib/admin/admin-inspector-selection";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import { useAdminAccessQuery } from "@/lib/hooks/use-admin-access-query";
import { cn } from "@/lib/utils";

export function AdminMatrixPage() {
  const { selection, setSelection } = useAdminInspector();
  const accessQuery = useAdminAccessQuery();
  const data = accessQuery.data?.accessData;
  const isLoading = accessQuery.isLoading;
  const searchParams = useSearchParams();
  const focusUser = searchParams.get("user");

  const [q, setQ] = useState("");
  const [onlyOverrides, setOnlyOverrides] = useState(false);

  const users = useMemo(() => {
    if (!data) {
      return [];
    }
    let u = data.directory.users;
    if (focusUser) {
      u = u.filter((x) => x.id === focusUser);
    }
    if (!q.trim()) {
      return u;
    }
    const s = q.toLowerCase();
    return u.filter((x) => x.displayName.toLowerCase().includes(s) || x.email.toLowerCase().includes(s));
  }, [data, focusUser, q]);

  const userIdsWithOverride = useMemo(() => {
    const ids = new Set<string>();
    if (!data) {
      return ids;
    }
    for (const c of data.matrix.cells) {
      if (c.sourceVisibility === "override" || c.sourceVisibility === "bundle_plus_override") {
        ids.add(c.userId);
      }
    }
    return ids;
  }, [data]);

  const visibleUsers = useMemo(() => {
    if (!onlyOverrides) {
      return users;
    }
    return users.filter((u) => userIdsWithOverride.has(u.id));
  }, [onlyOverrides, userIdsWithOverride, users]);

  const cellMap = useMemo(() => {
    const m = new Map<string, AdminAccessData["matrix"]["cells"][0]>();
    if (!data) {
      return m;
    }
    for (const c of data.matrix.cells) {
      m.set(`${c.userId}:${c.serviceId}`, c);
    }
    return m;
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-matrix-loading">
        Loading matrix…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3" data-testid="admin-matrix-page">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">Access matrix</h1>
        <p className="text-xs text-muted-foreground">Rows are users, columns are services. Select a cell for details.</p>
      </header>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
          Search users
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 w-56 rounded-md border border-input bg-background px-2 text-xs"
            data-testid="admin-matrix-search"
          />
        </label>
        <label className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyOverrides}
            onChange={(e) => setOnlyOverrides(e.target.checked)}
            data-testid="admin-matrix-filter-overrides"
          />
          Only users with an override
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
        <table className="w-max min-w-full border-collapse text-left text-[0.65rem]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="sticky left-0 z-20 min-w-[10rem] border-r border-border bg-muted/90 px-2 py-1.5 font-medium text-muted-foreground">
                User
              </th>
              {data.matrix.services.map((svc) => (
                <th key={svc.id} className="min-w-[6.5rem] px-1 py-1.5 text-center font-medium text-muted-foreground">
                  {svc.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u.id} className="border-b border-border/80">
                <td className="sticky left-0 z-10 border-r border-border bg-background px-2 py-1 font-medium text-foreground">
                  <div className="max-w-[12rem] truncate">{u.displayName}</div>
                  <div className="truncate font-mono text-[0.6rem] text-muted-foreground">{u.email}</div>
                </td>
                {data.matrix.services.map((svc) => {
                  const cell = cellMap.get(`${u.id}:${svc.id}`);
                  const active =
                    selection.kind === "matrix_cell" &&
                    selection.id === `${u.id}::${svc.id}`;
                  return (
                    <td key={svc.id} className="p-0">
                      <button
                        type="button"
                        data-testid={`admin-matrix-cell-${u.id}-${svc.id}`}
                        onClick={() =>
                          cell &&
                          setSelection(
                            selectMatrixCell({
                              userId: u.id,
                              serviceId: svc.id,
                              title: `${u.displayName} · ${svc.name}`,
                              status: matrixCellSelectionInspectorStatus(cell.realizationStatus),
                              activeJobId: cell.activeJobId,
                            }),
                          )
                        }
                        disabled={!cell}
                        className={cn(
                          "flex h-full min-h-[2.5rem] w-full flex-col items-center justify-center gap-0.5 px-1 py-1 text-center hover:bg-muted/50",
                          active && "bg-muted/70",
                        )}
                      >
                        {cell ? (
                          <>
                            <span className="font-mono text-[0.6rem] text-foreground">{cell.effectiveRole}</span>
                            <SourcePill source={cell.sourceVisibility} />
                            {cell.realizationStatus ? <RealizationPill status={cell.realizationStatus} /> : null}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
