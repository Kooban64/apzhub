"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type ProductRole = { roleId: string; name: string; productKey?: string };

type RolePreview = {
  productKey: string;
  fromRoleName: string | null;
  toRoleName: string;
  gain: string[];
  lose: string[];
};

export function PlatformAdminManageAccess({
  tenantId,
  userId,
  currentProducts,
}: {
  readonly tenantId: string;
  readonly userId: string;
  readonly currentProducts: readonly {
    productKey: string;
    roleLabel: string;
    status: string;
  }[];
}) {
  const qc = useQueryClient();
  const meta = useQuery({
    queryKey: ["platform-admin", "write-meta", tenantId],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/users/write`,
      );
      const body = (await res.json()) as {
        data?: { productRoles: ProductRole[] };
      };
      return body.data ?? { productRoles: [] as ProductRole[] };
    },
  });

  const [productKey, setProductKey] = useState(
    currentProducts.find((p) => p.status === "granted")?.productKey ?? "support",
  );
  const [toRoleId, setToRoleId] = useState("");
  const [scopes, setScopes] = useState("");
  const [ptToolId, setPtToolId] = useState<"workflow-designer" | "analytics-models">(
    "workflow-designer",
  );
  const [ptReason, setPtReason] = useState("");
  const [ptExpiresAt, setPtExpiresAt] = useState("");
  const [preview, setPreview] = useState<RolePreview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const productRoles = meta.data?.productRoles ?? [];
  const rolesForProduct = productRoles.filter((r) => r.productKey === productKey);

  const previewMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(userId)}/access`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            previewOnly: true,
            productKey,
            toRoleId,
          }),
        },
      );
      const body = (await res.json()) as {
        data?: { preview: RolePreview };
        error?: { message?: string };
      };
      if (!res.ok || !body.data?.preview) {
        throw new Error(body.error?.message ?? "Preview failed");
      }
      return body.data.preview;
    },
    onSuccess: setPreview,
    onError: (e: Error) => setError(e.message),
  });

  const saveMut = useMutation({
    mutationFn: async (opts?: { grantPt?: boolean; revokePt?: boolean }) => {
      const resourceScopeGrants = scopes
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const professionalTools = opts?.grantPt
        ? [
            {
              toolId: ptToolId,
              action: "grant" as const,
              reason: ptReason.trim() || "Platform Admin Manage Access",
              expiresAt:
                ptExpiresAt ||
                new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ]
        : opts?.revokePt
          ? [{ toolId: ptToolId, action: "revoke" as const }]
          : undefined;
      const res = await fetch(
        `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(userId)}/access`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            productRoles: toRoleId ? [{ productKey, roleId: toRoleId }] : undefined,
            resourceScopeGrants:
              resourceScopeGrants.length > 0 ? resourceScopeGrants : undefined,
            professionalTools,
          }),
        },
      );
      const body = (await res.json()) as {
        data?: { roleChanges?: RolePreview[]; failures?: string[] };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(body.error?.message ?? "Save failed");
      return body.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({
        queryKey: ["platform-admin", "user-inspector", tenantId, userId],
      });
      setMessage(
        data?.roleChanges?.[0]
          ? `Saved. Role → ${data.roleChanges[0].toRoleName}. GAIN ${data.roleChanges[0].gain.length} / LOSE ${data.roleChanges[0].lose.length}.`
          : "Saved. Inspector refreshed.",
      );
      setPreview(data?.roleChanges?.[0] ?? null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const deactivateMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(userId)}/deactivate`,
        { method: "POST" },
      );
      const body = (await res.json()) as {
        data?: { sessionsRevoked: number };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(body.error?.message ?? "Deactivate failed");
      return body.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({
        queryKey: ["platform-admin", "user-inspector", tenantId, userId],
      });
      setMessage(`Deactivated. Sessions revoked: ${data?.sessionsRevoked ?? 0}.`);
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div
      className="space-y-3 rounded border border-[var(--color-border)] p-3 text-xs"
      data-testid="platform-admin-manage-access"
    >
      <h3 className="text-[11px] font-semibold tracking-wide uppercase">
        Manage Access
      </h3>
      {error ? (
        <p className="text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          className="text-[var(--color-muted-foreground)]"
          data-testid="manage-access-result"
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="grid gap-1">
          Product
          <select
            className="h-8 rounded border border-[var(--color-border)] px-2"
            value={productKey}
            onChange={(e) => {
              setProductKey(e.target.value);
              setToRoleId("");
              setPreview(null);
            }}
            data-testid="manage-access-product"
          >
            {[
              ...new Set([
                ...currentProducts.map((p) => p.productKey),
                ...productRoles.map((r) => r.productKey).filter(Boolean),
              ]),
            ].map((key) => (
              <option key={key} value={key!}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Product role
          <select
            className="h-8 rounded border border-[var(--color-border)] px-2"
            value={toRoleId}
            onChange={(e) => setToRoleId(e.target.value)}
            data-testid="manage-access-role"
          >
            <option value="">Select role…</option>
            {rolesForProduct.map((r) => (
              <option key={r.roleId} value={r.roleId}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1">
        Resource scopes (replace user-scope overlay)
        <input
          className="h-8 rounded border border-[var(--color-border)] px-2"
          value={scopes}
          onChange={(e) => setScopes(e.target.value)}
          placeholder="support.queue:vip, projects.project:apzhub"
          data-testid="manage-access-scopes"
        />
      </label>

      <div
        className="space-y-2 border border-[var(--color-border)] p-2"
        data-testid="manage-access-pt"
      >
        <p className="font-medium">Professional tools (separate from product roles)</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="grid gap-1">
            Tool
            <select
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={ptToolId}
              onChange={(e) =>
                setPtToolId(e.target.value as "workflow-designer" | "analytics-models")
              }
              data-testid="manage-access-pt-tool"
            >
              <option value="workflow-designer">Workflow designer</option>
              <option value="analytics-models">Analytics models</option>
            </select>
          </label>
          <label className="grid gap-1 sm:col-span-2">
            Reason (required for grant)
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={ptReason}
              onChange={(e) => setPtReason(e.target.value)}
              data-testid="manage-access-pt-reason"
            />
          </label>
          <label className="grid gap-1 sm:col-span-3">
            Expiry (ISO optional — defaults 90 days)
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={ptExpiresAt}
              onChange={(e) => setPtExpiresAt(e.target.value)}
              placeholder="2026-12-31T00:00:00.000Z"
              data-testid="manage-access-pt-expires"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-[var(--color-border)] px-2.5 py-1.5 disabled:opacity-50"
            disabled={saveMut.isPending || !ptReason.trim()}
            data-testid="manage-access-pt-grant"
            onClick={() => {
              setError(null);
              setMessage(null);
              saveMut.mutate({ grantPt: true });
            }}
          >
            Grant tool
          </button>
          <button
            type="button"
            className="rounded border border-[var(--color-border)] px-2.5 py-1.5 disabled:opacity-50"
            disabled={saveMut.isPending}
            data-testid="manage-access-pt-revoke"
            onClick={() => {
              setError(null);
              setMessage(null);
              saveMut.mutate({ revokePt: true });
            }}
          >
            Revoke tool
          </button>
        </div>
      </div>

      {preview ? (
        <div
          className="border border-[var(--color-border)] p-2"
          data-testid="manage-access-preview"
        >
          <p className="font-medium">
            {preview.fromRoleName ?? "None"} → {preview.toRoleName}
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            GAIN ({preview.gain.length}): {preview.gain.slice(0, 8).join(", ") || "—"}
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            LOSE ({preview.lose.length}): {preview.lose.slice(0, 8).join(", ") || "—"}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-[var(--color-border)] px-2.5 py-1.5 disabled:opacity-50"
          disabled={!toRoleId || previewMut.isPending}
          data-testid="manage-access-preview-btn"
          onClick={() => {
            setError(null);
            previewMut.mutate();
          }}
        >
          Preview role delta
        </button>
        <button
          type="button"
          className="rounded bg-[var(--color-muted)] px-2.5 py-1.5 font-medium disabled:opacity-50"
          disabled={saveMut.isPending}
          data-testid="manage-access-save"
          onClick={() => {
            setError(null);
            setMessage(null);
            saveMut.mutate({});
          }}
        >
          {saveMut.isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="rounded border border-[var(--color-destructive)] px-2.5 py-1.5 text-[var(--color-destructive)] disabled:opacity-50"
          disabled={deactivateMut.isPending}
          data-testid="manage-access-deactivate"
          onClick={() => {
            if (
              confirm("Deactivate this user in the tenant? Sessions will be revoked.")
            ) {
              setError(null);
              deactivateMut.mutate();
            }
          }}
        >
          Deactivate
        </button>
      </div>
    </div>
  );
}
