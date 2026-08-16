"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPanel,
  QepStatusBadge,
} from "@/components/qep/qep-ui";
import { productDisplayName } from "@/lib/commercial/soft-product-access";
import { CreateUserWizard } from "@/components/iam/create-user-wizard";
import { UserInspectorPanel } from "@/components/iam/user-inspector-panel";

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

  const personas = personasQuery.data?.personas ?? [];
  const staffFunctions = personasQuery.data?.staffFunctions ?? [];
  const members = membersQuery.data?.members ?? [];
  const orgProducts = membersQuery.data?.orgProducts ?? [];

  return (
    <div data-testid="org-admin-members-view">
      <QepPanel title="Create user">
        {personasQuery.isLoading ? (
          <QepLoadingState label="Loading templates…" />
        ) : personasQuery.isError ? (
          <QepErrorState message={(personasQuery.error as Error).message} />
        ) : (
          <CreateUserWizard
            personas={personas}
            staffFunctions={staffFunctions}
            orgProducts={orgProducts}
            onProvisioned={({ message: nextMessage, temporaryPassword }) => {
              setMessage(nextMessage);
              setIssuedPassword(temporaryPassword ?? null);
              void queryClient.invalidateQueries({ queryKey: ["iam", "members"] });
            }}
          />
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
          <QepEmptyState title="No members yet — create your first teammate." />
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
    </div>
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
    <span className="ml-auto flex w-full flex-wrap items-center gap-2">
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
      <UserInspectorPanel membershipId={membershipId} />
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
