import type { UserPreferences } from "@apzhub/platform-personalisation";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const json = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(json.error?.message ?? `Request failed (${response.status})`);
  }
  return json.data as T;
}

export type FavoriteDto = {
  readonly favoriteId: string;
  readonly itemType: string;
  readonly itemKey: string;
  readonly label: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
};

export type RecentDto = {
  readonly recentId: string;
  readonly itemType: string;
  readonly itemKey: string;
  readonly label: string;
  readonly accessedAt: string;
};

export function fetchPreferences() {
  return requestJson<UserPreferences>("/api/platform/v1/preferences");
}

export function patchPreferences(patch: Record<string, unknown>) {
  return requestJson<UserPreferences>("/api/platform/v1/preferences", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function fetchFavorites() {
  return requestJson<FavoriteDto[]>("/api/platform/v1/favorites");
}

export function addFavorite(input: {
  readonly itemType: string;
  readonly itemKey: string;
  readonly label: string;
  readonly metadata?: Record<string, unknown>;
}) {
  return requestJson<FavoriteDto>("/api/platform/v1/favorites", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function removeFavorite(favoriteId: string) {
  return requestJson<unknown>(
    `/api/platform/v1/favorites?favoriteId=${encodeURIComponent(favoriteId)}`,
    { method: "DELETE" },
  );
}

export function fetchRecent() {
  return requestJson<RecentDto[]>("/api/platform/v1/recent");
}

export function trackRecent(input: {
  readonly itemType: string;
  readonly itemKey: string;
  readonly label: string;
}) {
  return requestJson<RecentDto>("/api/platform/v1/recent", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export const LANDING_PAGE_OPTIONS = [
  { value: "/workspace/home", label: "Home" },
  { value: "/workspace/activity", label: "Activity" },
  { value: "/workspace/notifications/inbox", label: "Notifications" },
  { value: "/workspace/projects", label: "Projects" },
  { value: "/workspace/support", label: "Support" },
] as const;
