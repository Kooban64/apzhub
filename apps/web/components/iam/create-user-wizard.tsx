"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { productDisplayName } from "@/lib/commercial/soft-product-access";

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

type Persona = { roleId: string; slug: string; name: string };
type StaffFunction = {
  id: string;
  name: string;
  orgJobRoleId: string;
  suggestedProducts: readonly { productKey: string; label: string }[];
};

const STEPS = [
  { id: "identity", label: "Identity" },
  { id: "template", label: "Template" },
  { id: "products", label: "Products" },
  { id: "resource-scopes", label: "Resource scopes" },
  { id: "source-scopes", label: "Source scopes" },
  { id: "professional-tools", label: "Professional tools" },
  { id: "review", label: "Review" },
] as const;

const TOOL_OPTIONS = [
  {
    id: "workflow-designer" as const,
    label: "Workflow designer",
  },
  {
    id: "analytics-models" as const,
    label: "Analytics models",
  },
];

function parseIdList(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,]+/)
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  ];
}

export function CreateUserWizard({
  personas,
  staffFunctions,
  orgProducts,
  onProvisioned,
}: {
  readonly personas: readonly Persona[];
  readonly staffFunctions: readonly StaffFunction[];
  readonly orgProducts: readonly string[];
  readonly onProvisioned: (result: {
    message: string;
    temporaryPassword?: string;
  }) => void;
}) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [staffFunctionId, setStaffFunctionId] = useState("");
  const [personaRoleId, setPersonaRoleId] = useState(
    personas[0]?.roleId ?? "role-employee",
  );
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [queueIds, setQueueIds] = useState("");
  const [projectIds, setProjectIds] = useState("");
  const [repoIds, setRepoIds] = useState("");
  const [toolIds, setToolIds] = useState<string[]>([]);
  const [provision, setProvision] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const resourceScopeGrants = [
    ...parseIdList(queueIds).map((id) => `support.queue:${id}`),
    ...parseIdList(projectIds).map((id) => `projects.project:${id}`),
  ];
  const sourceScopeGrants = parseIdList(repoIds).map((id) => `source.repo:${id}`);
  const allScopeGrants = [...resourceScopeGrants, ...sourceScopeGrants];

  const mutate = useMutation({
    mutationFn: () =>
      fetchJson<{
        provisioned?: boolean;
        temporaryPassword?: string;
        effectiveAccessSummary?: {
          products: readonly { productKey: string; label: string }[];
        };
        overlays?: {
          resourceScopeGrants?: readonly string[];
          professionalToolIds?: readonly string[];
        };
      }>("/api/v1/iam/members", {
        method: "POST",
        body: JSON.stringify({
          email,
          displayName: displayName || undefined,
          personaRoleId: staffFunctionId ? undefined : personaRoleId,
          staffFunctionId: staffFunctionId || undefined,
          productKeys,
          provision,
          resourceScopeGrants: provision ? allScopeGrants : [],
          professionalToolIds: provision ? toolIds : [],
        }),
      }),
    onSuccess: (data) => {
      if (data.provisioned && data.temporaryPassword) {
        const products =
          data.effectiveAccessSummary?.products.map((p) => p.label).join(", ") ||
          productKeys.map((k) => productDisplayName(k)).join(", ");
        const scopes = data.overlays?.resourceScopeGrants?.length
          ? `; scopes: ${data.overlays.resourceScopeGrants.join(", ")}`
          : "";
        const tools = data.overlays?.professionalToolIds?.length
          ? `; tools: ${data.overlays.professionalToolIds.join(", ")}`
          : "";
        onProvisioned({
          message: `Provisioned. Effective access: ${products || "shell only"}${scopes}${tools}`,
          temporaryPassword: data.temporaryPassword,
        });
      } else {
        onProvisioned({ message: "Invite recorded" });
      }
      setStep(0);
      setEmail("");
      setDisplayName("");
      setStaffFunctionId("");
      setProductKeys([]);
      setQueueIds("");
      setProjectIds("");
      setRepoIds("");
      setToolIds([]);
      setProvision(true);
    },
    onError: (error) => setLocalError((error as Error).message),
  });

  function canAdvance(): boolean {
    if (step === 0) return email.trim().includes("@");
    return true;
  }

  function goNext() {
    setLocalError(null);
    if (!canAdvance()) {
      setLocalError("Enter a valid email before continuing.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setLocalError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  const selectedTemplate = staffFunctions.find((f) => f.id === staffFunctionId);

  return (
    <div data-testid="iam-create-user-wizard">
      <ol className="mb-4 flex flex-wrap gap-2 text-xs">
        {STEPS.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className={`rounded border px-2 py-1 ${
                index === step
                  ? "border-[var(--color-foreground)] bg-[var(--color-muted)]"
                  : "border-[var(--color-border)]"
              }`}
              aria-current={index === step ? "step" : undefined}
              data-testid={`iam-wizard-step-${item.id}`}
              onClick={() => {
                if (index <= step || (index === step + 1 && canAdvance())) {
                  setLocalError(null);
                  setStep(index);
                }
              }}
            >
              {index + 1}. {item.label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="flex flex-wrap gap-3">
          <label className="block text-sm">
            Email
            <input
              className="mt-1 block w-64 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="iam-invite-email"
            />
          </label>
          <label className="block text-sm">
            Display name
            <input
              className="mt-1 block w-48 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              data-testid="iam-invite-display-name"
            />
          </label>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-wrap gap-3">
          <label className="block text-sm">
            Staff function template
            <select
              className="mt-1 block rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={staffFunctionId}
              onChange={(e) => {
                const id = e.target.value;
                setStaffFunctionId(id);
                const tmpl = staffFunctions.find((f) => f.id === id);
                if (tmpl) {
                  setPersonaRoleId(tmpl.orgJobRoleId);
                  setProductKeys(
                    tmpl.suggestedProducts
                      .map((p) => p.productKey)
                      .filter((key) => orgProducts.includes(key)),
                  );
                  setProvision(true);
                }
              }}
              data-testid="iam-invite-staff-function"
            >
              <option value="">— select template —</option>
              {staffFunctions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Org job persona
            <select
              className="mt-1 block rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={personaRoleId}
              onChange={(e) => setPersonaRoleId(e.target.value)}
              data-testid="iam-invite-persona"
            >
              {personas.map((p) => (
                <option key={p.roleId} value={p.roleId}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        orgProducts.length > 0 ? (
          <fieldset>
            <legend className="text-sm font-medium">Product grants</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {orgProducts.map((productKey) => (
                <label key={productKey} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={productKeys.includes(productKey)}
                    onChange={(e) => {
                      setProductKeys((prev) =>
                        e.target.checked
                          ? [...prev, productKey]
                          : prev.filter((p) => p !== productKey),
                      );
                    }}
                    data-testid={`iam-invite-product-${productKey}`}
                  />
                  {productDisplayName(productKey)}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            No org product subscriptions yet — start a plan trial from Pricing to enable
            grants.
          </p>
        )
      ) : null}

      {step === 3 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Support queue IDs
            <textarea
              className="mt-1 block h-20 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={queueIds}
              onChange={(e) => setQueueIds(e.target.value)}
              placeholder="one id per line"
              data-testid="iam-wizard-queue-ids"
            />
          </label>
          <label className="block text-sm">
            Project IDs
            <textarea
              className="mt-1 block h-20 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={projectIds}
              onChange={(e) => setProjectIds(e.target.value)}
              placeholder="one id per line"
              data-testid="iam-wizard-project-ids"
            />
          </label>
          <p className="sm:col-span-2 text-xs text-[var(--color-muted-foreground)]">
            Leave blank for unrestricted resource scope (existing Phase G/H behaviour).
          </p>
        </div>
      ) : null}

      {step === 4 ? (
        <label className="block text-sm">
          Source repository IDs
          <textarea
            className="mt-1 block h-24 w-full max-w-lg rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
            value={repoIds}
            onChange={(e) => setRepoIds(e.target.value)}
            placeholder="one repository id per line"
            data-testid="iam-wizard-repo-ids"
          />
          <span className="mt-1 block text-xs text-[var(--color-muted-foreground)]">
            Optional. Grants {"source.repo:{id}"} only — no provider names.
          </span>
        </label>
      ) : null}

      {step === 5 ? (
        <fieldset>
          <legend className="text-sm font-medium">Professional tools</legend>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            Specialist overlays only. Reason defaults to wizard grant; expiry defaults
            to 90 days.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {TOOL_OPTIONS.map((tool) => (
              <label key={tool.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={toolIds.includes(tool.id)}
                  onChange={(e) => {
                    setToolIds((prev) =>
                      e.target.checked
                        ? [...prev, tool.id]
                        : prev.filter((id) => id !== tool.id),
                    );
                  }}
                  data-testid={`iam-wizard-tool-${tool.id}`}
                />
                {tool.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === 6 ? (
        <div className="space-y-2 text-sm" data-testid="iam-wizard-review">
          <p>
            <span className="text-[var(--color-muted-foreground)]">Email:</span>{" "}
            {email || "—"}
          </p>
          <p>
            <span className="text-[var(--color-muted-foreground)]">Name:</span>{" "}
            {displayName || "—"}
          </p>
          <p>
            <span className="text-[var(--color-muted-foreground)]">Template:</span>{" "}
            {selectedTemplate?.name || "—"}
          </p>
          <p>
            <span className="text-[var(--color-muted-foreground)]">Persona:</span>{" "}
            {personas.find((p) => p.roleId === personaRoleId)?.name || personaRoleId}
          </p>
          <p>
            <span className="text-[var(--color-muted-foreground)]">Products:</span>{" "}
            {productKeys.map((k) => productDisplayName(k)).join(", ") || "none"}
          </p>
          <p>
            <span className="text-[var(--color-muted-foreground)]">Scopes:</span>{" "}
            {allScopeGrants.join(", ") || "unrestricted (none listed)"}
          </p>
          <p>
            <span className="text-[var(--color-muted-foreground)]">Tools:</span>{" "}
            {toolIds.join(", ") || "none"}
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={provision}
              onChange={(e) => setProvision(e.target.checked)}
              data-testid="iam-invite-provision"
            />
            Create login &amp; assign roles (required for scopes and tools)
          </label>
        </div>
      ) : null}

      {localError ? (
        <p className="mt-2 text-sm text-[var(--color-destructive)]">{localError}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
          disabled={step === 0}
          onClick={goBack}
          data-testid="iam-wizard-back"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
            onClick={goNext}
            data-testid="iam-wizard-next"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
            disabled={!email.trim() || mutate.isPending}
            data-testid="iam-invite-submit"
            onClick={() => {
              setLocalError(null);
              if (!provision && (allScopeGrants.length > 0 || toolIds.length > 0)) {
                setLocalError(
                  "Scopes and professional tools require Create login & assign roles.",
                );
                return;
              }
              mutate.mutate();
            }}
          >
            {mutate.isPending
              ? provision
                ? "Provisioning…"
                : "Inviting…"
              : provision
                ? "Provision"
                : "Invite"}
          </button>
        )}
      </div>
    </div>
  );
}
