"use client";

import { useMemo, useState } from "react";

import type { ProjectSourceOperatingMode } from "@/lib/commercial/project-source-catalogue";
import { PROJECT_SOURCE_PROVIDER_CATALOGUE } from "@/lib/commercial/project-source-catalogue";
import type { ScmProviderId } from "@apzhub/platform-scm";

export type ProjectSourceBindingInput = {
  readonly providerId: ScmProviderId;
  readonly externalRef: string;
  readonly mode: ProjectSourceOperatingMode;
  readonly displayName?: string;
  readonly secretRef?: string;
  readonly defaultBranch?: string;
};

export type ProjectSourceFormState = {
  readonly enabled: boolean;
  readonly providerId: string;
  readonly externalRef: string;
  readonly mode: "granted_read" | "customer_pipeline";
  readonly defaultBranch: string;
  readonly secretRef: string;
};

export const EMPTY_PROJECT_SOURCE_FORM: ProjectSourceFormState = {
  enabled: false,
  providerId: "github",
  externalRef: "",
  mode: "granted_read",
  defaultBranch: "main",
  secretRef: "",
};

/** Build API `source` payload when the form is enabled and valid. */
export function projectSourcePayloadFromForm(
  form: ProjectSourceFormState,
): ProjectSourceBindingInput | undefined {
  if (!form.enabled) return undefined;
  const externalRef = form.externalRef.trim();
  if (!externalRef) return undefined;
  return {
    providerId: form.providerId as ProjectSourceBindingInput["providerId"],
    externalRef,
    mode: form.mode,
    defaultBranch: form.defaultBranch.trim() || undefined,
    secretRef: form.secretRef.trim() || undefined,
  };
}

export function useProjectSourceForm(
  initial: ProjectSourceFormState = EMPTY_PROJECT_SOURCE_FORM,
) {
  const [form, setForm] = useState<ProjectSourceFormState>(initial);
  const payload = useMemo(() => projectSourcePayloadFromForm(form), [form]);
  const reset = () => setForm(EMPTY_PROJECT_SOURCE_FORM);
  return { form, setForm, payload, reset };
}

type Props = {
  readonly value: ProjectSourceFormState;
  readonly onChange: (next: ProjectSourceFormState) => void;
  readonly productLabel: "APZQEP" | "APZPEN";
  readonly testIdPrefix?: string;
  readonly compact?: boolean;
};

/**
 * GitHub-first source binding fields for quality project / engagement create.
 * Never accepts plaintext tokens — secretRef only.
 */
export function ProjectSourceFields({
  value,
  onChange,
  productLabel,
  testIdPrefix = "project-source",
  compact = false,
}: Props) {
  const available = PROJECT_SOURCE_PROVIDER_CATALOGUE.filter(
    (p) => p.status === "available",
  );
  const comingSoon = PROJECT_SOURCE_PROVIDER_CATALOGUE.filter(
    (p) => p.status === "coming_soon",
  );

  const fieldClass = compact
    ? "mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[12px]"
    : "mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm";

  return (
    <div
      className={
        compact
          ? "mt-2 space-y-2 rounded border border-dashed border-[var(--color-border)] p-2"
          : "mb-2 space-y-2 rounded border border-dashed border-[var(--color-border)] p-3"
      }
      data-testid={testIdPrefix}
    >
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={value.enabled}
          data-testid={`${testIdPrefix}-enabled`}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />
        Bind source code ({productLabel})
      </label>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Optional. Attach a repository reference when this project/engagement is created.
        GitHub is live; other SCMs are typed for later. Credentials stay server-side via
        secret ref — never paste tokens here.
      </p>
      {value.enabled ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-sm">
            Provider
            <select
              className={fieldClass}
              value={value.providerId}
              data-testid={`${testIdPrefix}-provider`}
              onChange={(e) => onChange({ ...value, providerId: e.target.value })}
            >
              {available.map((p) => (
                <option key={p.providerId} value={p.providerId}>
                  {p.name}
                </option>
              ))}
              {comingSoon.map((p) => (
                <option key={p.providerId} value={p.providerId} disabled>
                  {p.name} (coming soon)
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Access mode
            <select
              className={fieldClass}
              value={value.mode}
              data-testid={`${testIdPrefix}-mode`}
              onChange={(e) =>
                onChange({
                  ...value,
                  mode: e.target.value as ProjectSourceFormState["mode"],
                })
              }
            >
              <option value="granted_read">Granted read (APZ reads repos)</option>
              <option value="customer_pipeline">
                Customer pipeline (findings/evidence only)
              </option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            Repository ref
            <input
              className={fieldClass}
              placeholder="owner/repo"
              value={value.externalRef}
              data-testid={`${testIdPrefix}-ref`}
              onChange={(e) => onChange({ ...value, externalRef: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Default branch
            <input
              className={fieldClass}
              placeholder="main"
              value={value.defaultBranch}
              data-testid={`${testIdPrefix}-branch`}
              onChange={(e) => onChange({ ...value, defaultBranch: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Secret ref (optional)
            <input
              className={fieldClass}
              placeholder="secrets/github-app"
              value={value.secretRef}
              data-testid={`${testIdPrefix}-secret-ref`}
              onChange={(e) => onChange({ ...value, secretRef: e.target.value })}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

export function formatSourceBindingsSummary(
  bindings:
    | readonly {
        readonly providerId: string;
        readonly externalRef: string;
        readonly mode: string;
      }[]
    | undefined,
): string | null {
  if (!bindings?.length) return null;
  return bindings
    .map((b) => `${b.providerId}:${b.externalRef} (${b.mode})`)
    .join(" · ");
}
