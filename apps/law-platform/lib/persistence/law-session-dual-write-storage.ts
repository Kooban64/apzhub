/**
 * Client dual-write storage for Law session SoR (APZHUB-ENG-0002 / R12-PERSIST-02).
 * Sync façade: localStorage L1 cache + fire-and-forget Platform API → PostgreSQL SoR.
 */

export type LawSessionKind = "activity" | "notification";

export interface LawSessionDualWriteScope {
  readonly tenantId?: string;
  readonly userId?: string;
}

function apiPath(kind: LawSessionKind): string {
  return kind === "activity"
    ? "/api/platform/v1/law/session/activity"
    : "/api/platform/v1/law/session/notification";
}

function scopeQuery(scope: LawSessionDualWriteScope): string {
  const params = new URLSearchParams();
  if (scope.tenantId) params.set("tenantId", scope.tenantId);
  if (scope.userId) params.set("userId", scope.userId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function resolveBrowserStorage(): Storage | null {
  if (typeof globalThis.localStorage === "undefined") {
    return null;
  }
  return globalThis.localStorage;
}

/** Sync Storage that mirrors to Postgres SoR via Platform API. */
export function createLawSessionDualWriteStorage(options: {
  readonly kind: LawSessionKind;
  readonly storageKey: string;
  readonly scope: LawSessionDualWriteScope;
  readonly storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
}): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  const local =
    options.storage === undefined ? resolveBrowserStorage() : options.storage;

  function pushToApi(payload: string | null): void {
    if (typeof fetch === "undefined") {
      return;
    }
    const url = `${apiPath(options.kind)}${scopeQuery(options.scope)}`;
    void fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: payload ? (JSON.parse(payload) as unknown) : [],
      }),
    }).catch(() => {
      // Fail-soft — local cache remains; SoR retry on next mutation.
    });
  }

  return {
    getItem(key: string) {
      return local?.getItem(key) ?? null;
    },
    setItem(key: string, value: string) {
      local?.setItem(key, value);
      if (key === options.storageKey) {
        pushToApi(value);
      }
    },
    removeItem(key: string) {
      local?.removeItem(key);
      if (key === options.storageKey) {
        pushToApi(null);
      }
    },
  };
}

/** Prefetch SoR snapshot for initialItems / merge after load. */
export async function fetchLawSessionSnapshotFromApi(options: {
  readonly kind: LawSessionKind;
  readonly scope: LawSessionDualWriteScope;
}): Promise<unknown[] | null> {
  if (typeof fetch === "undefined") {
    return null;
  }
  const url = `${apiPath(options.kind)}${scopeQuery(options.scope)}`;
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as { data?: { items?: unknown } };
    const items = body.data?.items;
    return Array.isArray(items) ? items : null;
  } catch {
    return null;
  }
}
