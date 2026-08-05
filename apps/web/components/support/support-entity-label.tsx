"use client";

import { useQuery } from "@tanstack/react-query";

import { supportQueryKeys } from "@/lib/support/query-keys";
import {
  getSupportGroup,
  getSupportOrganization,
  getSupportUser,
} from "@/lib/support/support-api";

/**
 * Resolve a Support entity to a human label for native UX.
 * Falls back to a short unavailable marker — never leads with raw IDs.
 */
export function SupportEntityLabel({
  kind,
  id,
  empty = "—",
}: {
  readonly kind: "user" | "organization" | "group";
  readonly id?: string | null;
  readonly empty?: string;
}) {
  const enabled = Boolean(id);
  const query = useQuery({
    queryKey:
      kind === "user"
        ? supportQueryKeys.users.detail(id ?? "")
        : kind === "organization"
          ? supportQueryKeys.organizations.detail(id ?? "")
          : supportQueryKeys.groups.detail(id ?? ""),
    queryFn: async ({ signal }) => {
      if (!id) return null;
      if (kind === "user") {
        const result = await getSupportUser(id, { signal });
        return (
          result.data.displayName || result.data.email || result.data.login || null
        );
      }
      if (kind === "organization") {
        const result = await getSupportOrganization(id, { signal });
        return result.data.name || null;
      }
      const result = await getSupportGroup(id, { signal });
      return result.data.name || null;
    },
    enabled,
    staleTime: 60_000,
  });

  if (!id) return <span>{empty}</span>;
  if (query.isPending) {
    return (
      <span
        className="text-[var(--color-muted-foreground)]"
        data-testid="support-entity-loading"
      >
        …
      </span>
    );
  }
  if (query.data) {
    return <span data-testid={`support-entity-${kind}`}>{query.data}</span>;
  }
  return (
    <span
      className="text-[var(--color-muted-foreground)]"
      data-testid={`support-entity-${kind}-missing`}
    >
      Unavailable
    </span>
  );
}
