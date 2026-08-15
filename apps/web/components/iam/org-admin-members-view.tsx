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
  const [personaRoleId, setPersonaRoleId] = useState("role-employee");
  const [inviteProducts, setInviteProducts] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const personasQuery = useQuery({
    queryKey: ["iam", "personas"],
    queryFn: () => fetchJson<{ personas: Persona[] }>("/api/v1/iam/personas"),
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
      fetchJson<{ member: Member }>("/api/v1/iam/members", {
        method: "POST",
        body: JSON.stringify({
          email,
          personaRoleId,
          productKeys: inviteProducts,
        }),
      }),
    onSuccess: () => {
      setMessage("Invite recorded");
      setEmail("");
      setInviteProducts([]);
      void queryClient.invalidateQueries({ queryKey: ["iam", "members"] });
    },
    onError: (error) => setMessage((error as Error).message),
  });

  const personas = personasQuery.data?.personas ?? [];
  const members = membersQuery.data?.members ?? [];
  const orgProducts = membersQuery.data?.orgProducts ?? [];

  return (
    <QepPageShell
      title="Organisation members"
      description="Invite and manage members for your organisation. Grant only products your organisation has subscribed."
    >
      <QepPanel title="Invite member">
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
            Persona
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
          <button
            type="button"
            data-testid="iam-invite-submit"
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
            disabled={!email.trim() || inviteMutation.isPending}
            onClick={() => {
              setMessage(null);
              inviteMutation.mutate();
            }}
          >
            {inviteMutation.isPending ? "Inviting…" : "Invite"}
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
                  {productKey}
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
