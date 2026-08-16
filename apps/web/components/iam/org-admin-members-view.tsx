"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "@/components/qep/qep-ui";
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
type Member = {
  membershipId: string;
  userId: string;
  email: string;
  displayName?: string;
  personaRoleId: string;
  status: string;
  productGrants?: string[];
};

export function OrgAdminMembersView() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [personaRoleId, setPersonaRoleId] = useState("role-employee");
  const [staffFunctionId, setStaffFunctionId] = useState("");
  const [provision, setProvision] = useState(false);
  const [inviteProducts, setInviteProducts] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [issuedPassword, setIssuedPassword] = useState<string | null>(null);

  const personasQuery = useQuery({
    queryKey: ["iam", "personas"],
    queryFn: () =>
      fetchJson<{ personas: Persona[]; staffFunctions?: StaffFunction[] }>(
        "/api/v1/iam/personas",
      ),
  });

  const membersQuery = useQuery({
    queryKey: ["iam", "members"],
    queryFn: () =>
      fetchJson<{
        organisationId: string;
        members: Member[];
        orgProducts: string[];
        ruleset: string;
      }>("/api/v1/iam/members"),
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      fetchJson<{
        member: Member;
        provisioned?: boolean;
        temporaryPassword?: string;
        effectiveAccessSummary?: {
          products: readonly { productKey: string; label: string }[];
        };
      }>("/api/v1/iam/members", {
        method: "POST",
        body: JSON.stringify({
          email,
          displayName: displayName || undefined,
          personaRoleId: staffFunctionId ? undefined : personaRoleId,
          staffFunctionId: staffFunctionId || undefined,
          productKeys: inviteProducts,
          provision,
        }),
      }),
    onSuccess: (data) => {
      if (data.provisioned && data.temporaryPassword) {
        setIssuedPassword(data.temporaryPassword);
        const products =
          data.effectiveAccessSummary?.products.map((p) => p.label).join(", ") ||
          inviteProducts.join(", ");
        setMessage(`Provisioned. Effective access: ${products || "shell only"}`);
      } else {
        setIssuedPassword(null);
        setMessage("Invite recorded");
      }
      setEmail("");
      setDisplayName("");
      setInviteProducts([]);
      void queryClient.invalidateQueries({ queryKey: ["iam", "members"] });
    },
    onError: (error) => setMessage((error as Error).message),
  });

  const personas = personasQuery.data?.personas ?? [];
  const staffFunctions = personasQuery.data?.staffFunctions ?? [];
  const members = membersQuery.data?.members ?? [];
  const orgProducts = membersQuery.data?.orgProducts ?? [];

  return (
    <QepPageShell
      title="Organisation members"
      description="Invite and manage members for your organisation. Grant only products your organisation has subscribed. Provision creates a login and assigns product roles from a staff function template."
    >
      <QepPanel title="Invite / provision member">
        <div className="flex flex-wrap items-end gap-2">
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
          <label className="block text-sm">
            Staff function
            <select
              className="mt-1 block rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={staffFunctionId}
              onChange={(e) => {
                const id = e.target.value;
                setStaffFunctionId(id);
                const tmpl = staffFunctions.find((f) => f.id === id);
                if (tmpl) {
                  setPersonaRoleId(tmpl.orgJobRoleId);
                  setInviteProducts(
                    tmpl.suggestedProducts
                      .map((p) => p.productKey)
                      .filter((key) => orgProducts.includes(key)),
                  );
                  setProvision(true);
                }
              }}
              data-testid="iam-invite-staff-function"
            >
              <option value="">— optional template —</option>
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={provision}
              onChange={(e) => setProvision(e.target.checked)}
              data-testid="iam-invite-provision"
            />
            Create login &amp; assign roles
          </label>
          <button
            type="button"
            data-testid="iam-invite-submit"
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
            disabled={!email.trim() || inviteMutation.isPending}
            onClick={() => {
              setMessage(null);
              setIssuedPassword(null);
              inviteMutation.mutate();
            }}
          >
            {inviteMutation.isPending
              ? provision
                ? "Provisioning…"
                : "Inviting…"
              : provision
                ? "Provision"
                : "Invite"}
          </button>
        </div>
        {orgProducts.length > 0 ? (
          <fieldset className="mt-3">
            <legend className="text-sm font-medium">Product grants</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {orgProducts.map((productKey) => (
                <label key={productKey} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={inviteProducts.includes(productKey)}
                    onChange={(e) => {
                      setInviteProducts((prev) =>
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
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
            No org product subscriptions yet — start a plan trial from Pricing to enable
            grants.
          </p>
        )}
        {message ? (
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{message}</p>
        ) : null}
        {issuedPassword ? (
          <p
            className="mt-2 rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-2 font-mono text-sm"
            data-testid="iam-issued-password"
          >
            Temporary password (shown once): {issuedPassword}
          </p>
        ) : null}
      </QepPanel>

      <div className="mt-4">
        {membersQuery.isLoading ? (
          <QepLoadingState label="Loading members…" />
        ) : membersQuery.isError ? (
          <QepErrorState message={(membersQuery.error as Error).message} />
        ) : members.length === 0 ? (
          <QepEmptyState title="No members yet — invite your first teammate." />
        ) : (
          <QepPanel title={`Members (${members.length})`}>
            <ul className="space-y-2" data-testid="iam-members-list">
              {members.map((member) => (
                <li
                  key={member.membershipId}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--color-border)] p-2 text-sm"
                >
                  <QepStatusBadge status={member.status} />
                  <span>{member.email}</span>
                  <span className="font-mono text-xs text-[var(--color-muted-foreground)]">
                    {member.personaRoleId}
                  </span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    grants:{" "}
                    {(member.productGrants ?? [])
                      .map((key) => productDisplayName(key))
                      .join(", ") || "none"}
                  </span>
                  <MemberActions
                    membershipId={member.membershipId}
                    personas={personas}
                    orgProducts={orgProducts}
                    initialGrants={member.productGrants ?? []}
                    onDone={() =>
                      void queryClient.invalidateQueries({
                        queryKey: ["iam", "members"],
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          </QepPanel>
        )}
      </div>
    </QepPageShell>
  );
}

function MemberActions({
  membershipId,
  personas,
  orgProducts,
  initialGrants,
  onDone,
}: {
  readonly membershipId: string;
  readonly personas: readonly Persona[];
  readonly orgProducts: readonly string[];
  readonly initialGrants: readonly string[];
  readonly onDone: () => void;
}) {
  const [personaRoleId, setPersonaRoleId] = useState(
    personas[0]?.roleId ?? "role-employee",
  );
  const [grants, setGrants] = useState<string[]>([...initialGrants]);
  const [inspectionWhy, setInspectionWhy] = useState<string[] | null>(null);
  const [inspectionMeta, setInspectionMeta] = useState<{
    provisionStatus?: string;
    productRoles?: string;
    orgProducts?: string;
  } | null>(null);

  return (
    <span className="ml-auto flex flex-wrap items-center gap-2">
      {orgProducts.map((productKey) => (
        <label key={productKey} className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={grants.includes(productKey)}
            onChange={(e) => {
              setGrants((prev) =>
                e.target.checked
                  ? [...prev, productKey]
                  : prev.filter((p) => p !== productKey),
              );
            }}
          />
          {productDisplayName(productKey)}
          <span className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
            ({productKey})
          </span>
        </label>
      ))}
      <button
        type="button"
        className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs hover:bg-[var(--color-muted)]"
        data-testid={`iam-inspect-${membershipId}`}
        onClick={() => {
          void (async () => {
            const res = await fetch(
              `/api/v1/iam/members/${encodeURIComponent(membershipId)}/access`,
            );
            const body = (await res.json()) as {
              data?: {
                inspection?: {
                  why?: string[];
                  productKeys?: string[];
                  orgProductKeys?: string[];
                  provisionStatus?: string;
                  productRoles?: readonly { productKey: string; roleHint: string }[];
                };
              };
              error?: { message?: string };
            };
            if (!res.ok) {
              setInspectionMeta(null);
              setInspectionWhy([body.error?.message ?? "Inspect failed"]);
              return;
            }
            const inspection = body.data?.inspection;
            setInspectionMeta({
              provisionStatus: inspection?.provisionStatus,
              orgProducts: (inspection?.orgProductKeys ?? []).join(", ") || "none",
              productRoles:
                (inspection?.productRoles ?? [])
                  .map((r) => `${r.productKey}→${r.roleHint}`)
                  .join(", ") || "none",
            });
            setInspectionWhy([
              `Effective products: ${(inspection?.productKeys ?? []).join(", ") || "none"}`,
              ...(inspection?.why ?? []),
            ]);
          })();
        }}
      >
        Inspect access
      </button>
      {inspectionWhy ? (
        <div
          className="w-full basis-full space-y-2 rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-2 text-[11px] text-[var(--color-muted-foreground)]"
          data-testid={`iam-inspect-why-${membershipId}`}
          data-user-inspector="expanded"
        >
          {inspectionMeta ? (
            <dl className="grid gap-1 sm:grid-cols-3">
              <div>
                <dt className="font-medium text-[var(--color-foreground)]">
                  Provision
                </dt>
                <dd data-testid={`iam-inspect-provision-${membershipId}`}>
                  {inspectionMeta.provisionStatus ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-foreground)]">
                  Org products
                </dt>
                <dd>{inspectionMeta.orgProducts}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-foreground)]">
                  Product roles
                </dt>
                <dd>{inspectionMeta.productRoles}</dd>
              </div>
            </dl>
          ) : null}
          <ul className="space-y-0.5">
            {inspectionWhy.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {orgProducts.length > 0 ? (
        <button
          type="button"
          className="text-xs underline"
          onClick={async () => {
            await fetchJson(
              `/api/v1/iam/members/${encodeURIComponent(membershipId)}/products`,
              {
                method: "POST",
                body: JSON.stringify({ productKeys: grants }),
              },
            );
            onDone();
          }}
        >
          Save grants
        </button>
      ) : null}
      <select
        className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
        value={personaRoleId}
        onChange={(e) => setPersonaRoleId(e.target.value)}
      >
        {personas.map((p) => (
          <option key={p.roleId} value={p.roleId}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="text-xs underline"
        onClick={async () => {
          await fetchJson(
            `/api/v1/iam/members/${encodeURIComponent(membershipId)}/persona`,
            {
              method: "POST",
              body: JSON.stringify({ personaRoleId }),
            },
          );
          onDone();
        }}
      >
        Assign
      </button>
      <button
        type="button"
        className="text-xs underline"
        onClick={async () => {
          await fetchJson(
            `/api/v1/iam/members/${encodeURIComponent(membershipId)}/suspend`,
            { method: "POST" },
          );
          onDone();
        }}
      >
        Suspend
      </button>
      <button
        type="button"
        className="text-xs underline"
        onClick={async () => {
          await fetchJson(
            `/api/v1/iam/members/${encodeURIComponent(membershipId)}/activate`,
            { method: "POST" },
          );
          onDone();
        }}
      >
        Activate
      </button>
    </span>
  );
}
