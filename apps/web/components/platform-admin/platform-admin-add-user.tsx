"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type StaffFunction = {
  id: string;
  name: string;
  description: string;
  suggestedProducts: readonly { productKey: string; roleId: string; label: string }[];
};

type WriteMeta = {
  staffFunctions: StaffFunction[];
  productRoles: { roleId: string; name: string; productKey?: string }[];
};

async function fetchWriteMeta(tenantId: string): Promise<WriteMeta> {
  const res = await fetch(
    `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/users/write`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as { data?: WriteMeta; error?: { message?: string } };
  if (!res.ok || !body.data)
    throw new Error(body.error?.message ?? "Failed to load templates");
  return body.data;
}

export function PlatformAdminAddUserWizard({
  tenantId,
  onDone,
}: {
  readonly tenantId: string;
  readonly onDone: (result: {
    userId: string;
    inspectorHref: string;
    temporaryPassword?: string;
  }) => void;
}) {
  const qc = useQueryClient();
  const meta = useQuery({
    queryKey: ["platform-admin", "write-meta", tenantId],
    queryFn: () => fetchWriteMeta(tenantId),
  });

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [staffFunctionId, setStaffFunctionId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [queueIds, setQueueIds] = useState("customer-support");
  const [knowledgeSpace, setKnowledgeSpace] = useState("support");
  const [projectIds, setProjectIds] = useState("");
  const [repoIds, setRepoIds] = useState("");
  const [qepApps, setQepApps] = useState("");
  const [penApps, setPenApps] = useState("");
  const [includePt, setIncludePt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFn = useMemo(
    () => meta.data?.staffFunctions.find((f) => f.id === staffFunctionId),
    [meta.data, staffFunctionId],
  );

  const resourceScopeGrants = useMemo(() => {
    const scopes: string[] = [];
    const wants = new Set(productKeys);
    if (wants.has("support") || wants.size === 0) {
      for (const id of queueIds
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)) {
        scopes.push(`support.queue:${id}`);
      }
    }
    if (wants.has("projects")) {
      for (const id of projectIds
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)) {
        scopes.push(`projects.project:${id}`);
      }
    }
    if (wants.has("qep") || wants.has("projects") || wants.has("pentest")) {
      for (const id of repoIds
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)) {
        scopes.push(`source.repo:${id}`);
      }
    }
    if (wants.has("qep")) {
      for (const id of qepApps
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)) {
        scopes.push(`qep.application:${id}`);
      }
    }
    if (wants.has("pentest")) {
      for (const id of penApps
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)) {
        scopes.push(`pen.application:${id}`);
      }
    }
    if (wants.has("knowledge") && knowledgeSpace.trim()) {
      scopes.push(`knowledge.space:${knowledgeSpace.trim()}`);
    }
    return scopes;
  }, [queueIds, projectIds, repoIds, qepApps, penApps, knowledgeSpace, productKeys]);

  const mutate = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/users/write`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email,
            displayName: displayName || email.split("@")[0],
            staffFunctionId,
            jobTitle: jobTitle || selectedFn?.name,
            productKeys:
              productKeys.length > 0
                ? productKeys
                : selectedFn?.suggestedProducts.map((p) => p.productKey),
            productRoles: selectedFn?.suggestedProducts.filter((p) =>
              (productKeys.length > 0
                ? productKeys
                : selectedFn.suggestedProducts.map((x) => x.productKey)
              ).includes(p.productKey),
            ),
            resourceScopeGrants,
            professionalToolIds: includePt ? ["workflow-designer"] : [],
            professionalToolsReason: includePt ? "Platform Admin Add User" : undefined,
            ensureOrgSubscriptions: true,
          }),
        },
      );
      const body = (await res.json()) as {
        data?: {
          userId: string;
          inspectorHref: string;
          temporaryPassword?: string;
          failures?: string[];
        };
        error?: { message?: string };
      };
      if (!res.ok || !body.data)
        throw new Error(body.error?.message ?? "Provision failed");
      return body.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({
        queryKey: ["platform-admin", "tenant-users", tenantId],
      });
      onDone({
        userId: data.userId,
        inspectorHref: data.inspectorHref,
        temporaryPassword: data.temporaryPassword,
      });
    },
    onError: (e: Error) => setError(e.message),
  });

  const steps = ["Identity", "Template", "Access", "Scopes", "Review"];

  return (
    <div
      className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs"
      data-testid="platform-admin-add-user"
    >
      <h3 className="mb-2 text-sm font-semibold">Add User</h3>
      <div className="mb-3 flex flex-wrap gap-1">
        {steps.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`rounded px-2 py-1 ${i === step ? "bg-[var(--color-muted)] font-medium" : "opacity-60"}`}
            onClick={() => setStep(i)}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-2 text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1">
            Email
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="add-user-email"
            />
          </label>
          <label className="grid gap-1">
            Display name
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              data-testid="add-user-name"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            Job title
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </label>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-2">
          <p className="text-[var(--color-muted-foreground)]">
            Staff function is a descriptive template — not an authorisation grant.
          </p>
          <select
            className="h-8 w-full rounded border border-[var(--color-border)] px-2"
            value={staffFunctionId}
            onChange={(e) => {
              setStaffFunctionId(e.target.value);
              const fn = meta.data?.staffFunctions.find((f) => f.id === e.target.value);
              setProductKeys(fn?.suggestedProducts.map((p) => p.productKey) ?? []);
              if (fn?.id === "staff-fn-engineering") {
                setQueueIds("");
                setKnowledgeSpace("");
                setProjectIds("apzhub,apzsign");
              } else if (fn?.id === "staff-fn-customer-support") {
                setQueueIds("customer-support");
                setKnowledgeSpace("support");
                setProjectIds("");
                setRepoIds("");
                setQepApps("");
                setPenApps("");
              }
            }}
            data-testid="add-user-staff-function"
          >
            <option value="">Select staff function…</option>
            {(meta.data?.staffFunctions ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {selectedFn ? (
            <ul className="list-inside list-disc text-[var(--color-muted-foreground)]">
              {selectedFn.suggestedProducts.map((p) => (
                <li key={p.productKey}>
                  {p.label} ({p.productKey})
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-2">
          <p className="text-[var(--color-muted-foreground)]">
            Product assignments are independent — no single APZPRD role.
          </p>
          {(selectedFn?.suggestedProducts ?? []).map((p) => {
            const checked = productKeys.includes(p.productKey);
            return (
              <label key={p.productKey} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setProductKeys((prev) =>
                      checked
                        ? prev.filter((k) => k !== p.productKey)
                        : [...prev, p.productKey],
                    )
                  }
                />
                {p.label}
              </label>
            );
          })}
          <label className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={includePt}
              onChange={(e) => setIncludePt(e.target.checked)}
            />
            Include professional tool (Workflow designer) — separate entitlement
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1">
            Support queues
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={queueIds}
              onChange={(e) => setQueueIds(e.target.value)}
              placeholder="customer-support"
            />
          </label>
          <label className="grid gap-1">
            Knowledge space
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={knowledgeSpace}
              onChange={(e) => setKnowledgeSpace(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            Projects
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={projectIds}
              onChange={(e) => setProjectIds(e.target.value)}
              placeholder="apzhub,apzsign"
              data-testid="add-user-projects"
            />
          </label>
          <label className="grid gap-1">
            Source repos
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={repoIds}
              onChange={(e) => setRepoIds(e.target.value)}
              data-testid="add-user-repos"
            />
          </label>
          <label className="grid gap-1">
            QEP applications
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={qepApps}
              onChange={(e) => setQepApps(e.target.value)}
              placeholder="app-a,app-b"
              data-testid="add-user-qep-apps"
            />
          </label>
          <label className="grid gap-1">
            PEN applications
            <input
              className="h-8 rounded border border-[var(--color-border)] px-2"
              value={penApps}
              onChange={(e) => setPenApps(e.target.value)}
              placeholder="app-x"
              data-testid="add-user-pen-apps"
            />
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-2 text-[var(--color-muted-foreground)]">
          <p>
            <span className="text-[var(--color-foreground)]">User:</span>{" "}
            {displayName || "—"} &lt;
            {email}&gt;
          </p>
          <p>
            <span className="text-[var(--color-foreground)]">Staff function:</span>{" "}
            {selectedFn?.name ?? "—"}
          </p>
          <p>
            <span className="text-[var(--color-foreground)]">Products:</span>{" "}
            {productKeys.join(", ") || "none"}
          </p>
          <p>
            <span className="text-[var(--color-foreground)]">Scopes:</span>{" "}
            {resourceScopeGrants.join(", ") || "none"}
          </p>
          <p>
            <span className="text-[var(--color-foreground)]">Professional tools:</span>{" "}
            {includePt ? "workflow-designer" : "none"}
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-[var(--color-border)] px-2.5 py-1.5 disabled:opacity-50"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            className="rounded bg-[var(--color-muted)] px-2.5 py-1.5 font-medium"
            data-testid="add-user-next"
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="rounded bg-[var(--color-muted)] px-2.5 py-1.5 font-medium disabled:opacity-50"
            data-testid="add-user-provision"
            disabled={mutate.isPending || !email || !staffFunctionId}
            onClick={() => {
              setError(null);
              mutate.mutate();
            }}
          >
            {mutate.isPending ? "Provisioning…" : "Provision"}
          </button>
        )}
      </div>
    </div>
  );
}
