"use client";

import { useState } from "react";

type InspectorTabId =
  "overview" | "products" | "roles" | "scopes" | "tools" | "provisioning";

type InspectionPayload = {
  readonly why?: readonly string[];
  readonly productKeys?: readonly string[];
  readonly orgProductKeys?: readonly string[];
  readonly provisionStatus?: string;
  readonly staffFunctionName?: string | null;
  readonly orgJobRoleId?: string;
  readonly productRoles?: readonly { productKey: string; roleHint: string }[];
  readonly tabs?: {
    readonly products?: readonly {
      productKey: string;
      displayName: string;
      status: string;
      why: string;
    }[];
    readonly roles?: readonly {
      source: string;
      id: string;
      label: string;
      why: string;
    }[];
    readonly scopes?: readonly {
      kind: string;
      resourceId: string;
      grantKey: string;
      why: string;
    }[];
    readonly professionalTools?: readonly {
      toolId: string;
      label: string;
      status: string;
      expiresAt?: string;
      why: string;
    }[];
    readonly provisioning?: {
      provisionStatus: string;
      membershipStatus: string;
      userId: string;
      why: readonly string[];
    };
  };
};

const TABS: readonly { id: InspectorTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "roles", label: "Roles" },
  { id: "scopes", label: "Scopes" },
  { id: "tools", label: "Professional Tools" },
  { id: "provisioning", label: "Provisioning" },
];

export function UserInspectorPanel({
  membershipId,
}: {
  readonly membershipId: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<InspectorTabId>("overview");
  const [inspection, setInspection] = useState<InspectionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/iam/members/${encodeURIComponent(membershipId)}/access`,
      );
      const body = (await res.json()) as {
        data?: { inspection?: InspectionPayload };
        error?: { message?: string };
      };
      if (!res.ok) {
        setInspection(null);
        setError(body.error?.message ?? "Inspect failed");
        setOpen(true);
        return;
      }
      setInspection(body.data?.inspection ?? null);
      setTab("overview");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
      <button
        type="button"
        className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs hover:bg-[var(--color-muted)]"
        data-testid={`iam-inspect-${membershipId}`}
        disabled={loading}
        onClick={() => {
          void load();
        }}
      >
        {loading ? "Inspecting…" : open ? "Refresh inspect" : "Inspect access"}
      </button>
      {open ? (
        <div
          className="w-full basis-full space-y-2 rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-2 text-[11px] text-[var(--color-muted-foreground)]"
          data-testid={`iam-inspect-why-${membershipId}`}
          data-user-inspector="flagship"
        >
          {error ? <p className="text-[var(--color-destructive)]">{error}</p> : null}
          {inspection ? (
            <>
              <div
                className="flex flex-wrap gap-1"
                role="tablist"
                aria-label="User Inspector tabs"
                data-testid={`iam-inspect-tabs-${membershipId}`}
              >
                {TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.id}
                    className={`rounded px-2 py-0.5 text-[10px] ${
                      tab === item.id
                        ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                        : "border border-[var(--color-border)]"
                    }`}
                    data-testid={`iam-inspect-tab-${item.id}-${membershipId}`}
                    onClick={() => setTab(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {tab === "overview" ? (
                <div data-testid={`iam-inspect-overview-${membershipId}`}>
                  <dl className="mb-2 grid gap-1 sm:grid-cols-3">
                    <div>
                      <dt className="font-medium text-[var(--color-foreground)]">
                        Provision
                      </dt>
                      <dd data-testid={`iam-inspect-provision-${membershipId}`}>
                        {inspection.provisionStatus ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--color-foreground)]">
                        Org job
                      </dt>
                      <dd>{inspection.orgJobRoleId ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--color-foreground)]">
                        Staff function
                      </dt>
                      <dd>{inspection.staffFunctionName ?? "—"}</dd>
                    </div>
                  </dl>
                  <ul className="space-y-0.5">
                    {(inspection.why ?? []).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {tab === "products" ? (
                <ul
                  className="space-y-1"
                  data-testid={`iam-inspect-products-${membershipId}`}
                >
                  {(inspection.tabs?.products ?? []).map((row) => (
                    <li
                      key={row.productKey}
                      className="rounded border border-[var(--color-border)]/60 px-2 py-1"
                    >
                      <div className="font-medium text-[var(--color-foreground)]">
                        {row.displayName}{" "}
                        <span className="font-mono text-[10px]">
                          ({row.productKey})
                        </span>{" "}
                        · {row.status}
                      </div>
                      <div>{row.why}</div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {tab === "roles" ? (
                <ul
                  className="space-y-1"
                  data-testid={`iam-inspect-roles-${membershipId}`}
                >
                  {(inspection.tabs?.roles ?? []).map((row) => (
                    <li
                      key={`${row.source}-${row.id}-${row.label}`}
                      className="rounded border border-[var(--color-border)]/60 px-2 py-1"
                    >
                      <div className="font-medium text-[var(--color-foreground)]">
                        {row.label} · {row.source}
                      </div>
                      <div>{row.why}</div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {tab === "scopes" ? (
                <ul
                  className="space-y-1"
                  data-testid={`iam-inspect-scopes-${membershipId}`}
                >
                  {(inspection.tabs?.scopes ?? []).map((row) => (
                    <li
                      key={`${row.kind}-${row.grantKey}`}
                      className="rounded border border-[var(--color-border)]/60 px-2 py-1"
                    >
                      <div className="font-medium text-[var(--color-foreground)]">
                        {row.kind} · {row.resourceId}
                      </div>
                      <div className="font-mono text-[10px]">{row.grantKey}</div>
                      <div>{row.why}</div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {tab === "tools" ? (
                <ul
                  className="space-y-1"
                  data-testid={`iam-inspect-tools-${membershipId}`}
                >
                  {(inspection.tabs?.professionalTools ?? []).map((row) => (
                    <li
                      key={row.toolId}
                      className="rounded border border-[var(--color-border)]/60 px-2 py-1"
                    >
                      <div className="font-medium text-[var(--color-foreground)]">
                        {row.label} · {row.status}
                      </div>
                      <div>{row.why}</div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {tab === "provisioning" ? (
                <div data-testid={`iam-inspect-provisioning-${membershipId}`}>
                  <dl className="mb-2 grid gap-1 sm:grid-cols-3">
                    <div>
                      <dt className="font-medium text-[var(--color-foreground)]">
                        Provision
                      </dt>
                      <dd>{inspection.tabs?.provisioning?.provisionStatus ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--color-foreground)]">
                        Membership
                      </dt>
                      <dd>{inspection.tabs?.provisioning?.membershipStatus ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--color-foreground)]">
                        User id
                      </dt>
                      <dd className="break-all font-mono text-[10px]">
                        {inspection.tabs?.provisioning?.userId ?? "—"}
                      </dd>
                    </div>
                  </dl>
                  <ul className="space-y-0.5">
                    {(inspection.tabs?.provisioning?.why ?? []).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </span>
  );
}
