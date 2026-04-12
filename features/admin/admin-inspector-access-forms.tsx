"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import type { AdminMatrixCell } from "@/lib/admin/access/matrix";
import type { AdminServiceDetail } from "@/lib/admin/access/services";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";

type InspectorDirectoryBundleEditorProps = {
  userId: string;
  accessData: AdminAccessData;
  currentBundleIds: string[];
};

export function InspectorDirectoryBundleEditor({
  userId,
  accessData,
  currentBundleIds,
}: InspectorDirectoryBundleEditorProps) {
  const queryClient = useQueryClient();
  const sortedCatalog = useMemo(
    () => [...accessData.bundles.bundles].sort((a, b) => a.name.localeCompare(b.name)),
    [accessData.bundles.bundles],
  );
  const baselineKey = currentBundleIds.slice().sort().join(",");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(currentBundleIds));

  useEffect(() => {
    setSelected(new Set(currentBundleIds));
  }, [userId, baselineKey]);

  const dirty = useMemo(() => {
    const a = [...selected].sort().join(",");
    return a !== baselineKey;
  }, [selected, baselineKey]);

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setMessage(null);
    const cur = new Set(currentBundleIds);
    const addBundleIds = [...selected].filter((id) => !cur.has(id));
    const removeBundleIds = [...cur].filter((id) => !selected.has(id));
    if (addBundleIds.length === 0 && removeBundleIds.length === 0) {
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/access/triggers/bundle-assignment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          addBundleIds: addBundleIds.length ? addBundleIds : undefined,
          removeBundleIds: removeBundleIds.length ? removeBundleIds : undefined,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-access"] });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-border pt-2">
      <p className="font-medium text-foreground">Edit bundles</p>
      <ul className="space-y-1.5">
        {sortedCatalog.map((b) => (
          <li key={b.id} className="flex items-center gap-2">
            <input
              id={`inspector-bundle-${userId}-${b.id}`}
              type="checkbox"
              className="h-3.5 w-3.5 rounded border border-input"
              checked={selected.has(b.id)}
              onChange={(ev) => {
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (ev.target.checked) {
                    next.add(b.id);
                  } else {
                    next.delete(b.id);
                  }
                  return next;
                });
              }}
            />
            <label htmlFor={`inspector-bundle-${userId}-${b.id}`} className="cursor-pointer text-muted-foreground">
              {b.name} <span className="font-mono text-[0.65rem]">({b.id})</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="xs" variant="secondary" disabled={!dirty || pending} onClick={() => void save()}>
          Save bundle changes
        </Button>
        {message ? <span className="text-[0.65rem] text-destructive">{message}</span> : null}
      </div>
    </div>
  );
}

type InspectorMatrixServiceOverrideProps = {
  userId: string;
  serviceId: string;
  cell: AdminMatrixCell;
  serviceDetail: AdminServiceDetail | undefined;
};

export function InspectorMatrixServiceOverride({
  userId,
  serviceId,
  cell,
  serviceDetail,
}: InspectorMatrixServiceOverrideProps) {
  const queryClient = useQueryClient();
  const mappings = serviceDetail?.roleMappings ?? [];
  const initialToken = useMemo(() => {
    const hit = mappings.find((m) => m.roleLabel === cell.effectiveRole);
    return hit?.roleId ?? "";
  }, [cell.effectiveRole, mappings]);

  const [roleToken, setRoleToken] = useState(initialToken);
  useEffect(() => {
    setRoleToken(initialToken);
  }, [userId, serviceId, initialToken]);

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function postOverride(effectiveRole: string | null) {
    setMessage(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/access/triggers/service-override", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, serviceId, effectiveRole }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-access"] });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setPending(false);
    }
  }

  if (mappings.length === 0) {
    return (
      <p className="border-t border-border pt-2 text-[0.65rem] text-muted-foreground">
        No role catalog for this service.
      </p>
    );
  }

  return (
    <div className="space-y-2 border-t border-border pt-2">
      <p className="font-medium text-foreground">Service override</p>
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.65rem] font-medium text-muted-foreground" htmlFor={`inspector-override-${serviceId}`}>
          Effective role (token)
        </label>
        <select
          id={`inspector-override-${serviceId}`}
          className="h-8 max-w-full rounded-md border border-input bg-background px-2 font-mono text-[0.65rem]"
          value={roleToken}
          onChange={(ev) => setRoleToken(ev.target.value)}
        >
          <option value="">— pick a role —</option>
          {mappings.map((m) => (
            <option key={m.roleId} value={m.roleId}>
              {m.roleLabel} ({m.roleId})
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="xs"
          variant="secondary"
          disabled={pending || !roleToken}
          onClick={() => void postOverride(roleToken)}
        >
          Apply override
        </Button>
        <Button type="button" size="xs" variant="outline" disabled={pending} onClick={() => void postOverride(null)}>
          Clear override
        </Button>
      </div>
      {message ? <p className="text-[0.65rem] text-destructive">{message}</p> : null}
    </div>
  );
}
