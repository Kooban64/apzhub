"use client";

import type { UserPreferences } from "@apzhub/platform-personalisation";
import { Button } from "@apzhub/ui";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  addFavorite,
  fetchFavorites,
  fetchPreferences,
  fetchRecent,
  LANDING_PAGE_OPTIONS,
  patchPreferences,
  removeFavorite,
  type FavoriteDto,
  type RecentDto,
} from "@/lib/personalisation/api";

type Tab = "preferences" | "favourites" | "recent" | "filters";

export function PersonalisationCentreView() {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<Tab>("preferences");
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [favorites, setFavorites] = useState<FavoriteDto[]>([]);
  const [recent, setRecent] = useState<RecentDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState("");
  const [filterJson, setFilterJson] = useState('{"status":"open"}');

  const reload = useCallback(async () => {
    const [prefs, favs, recents] = await Promise.all([
      fetchPreferences(),
      fetchFavorites(),
      fetchRecent(),
    ]);
    setPreferences(prefs);
    setFavorites(favs);
    setRecent(recents);
  }, []);

  useEffect(() => {
    void reload().catch((err: Error) => setError(err.message));
  }, [reload]);

  const savedFilters = useMemo(
    () => favorites.filter((item) => item.itemType === "saved-filter"),
    [favorites],
  );
  const routeFavorites = useMemo(
    () => favorites.filter((item) => item.itemType === "route"),
    [favorites],
  );

  const isCurrentFavorited = routeFavorites.some((item) => item.itemKey === pathname);

  async function saveLanding(landingPage: string) {
    const next = await patchPreferences({ workbench: { landingPage } });
    setPreferences(next);
  }

  async function saveTheme(theme: "light" | "dark" | "system") {
    const next = await patchPreferences({ appearance: { theme } });
    setPreferences(next);
  }

  async function toggleFavoriteCurrent() {
    const existing = routeFavorites.find((item) => item.itemKey === pathname);
    if (existing) {
      await removeFavorite(existing.favoriteId);
    } else {
      await addFavorite({
        itemType: "route",
        itemKey: pathname,
        label: pathname,
        metadata: { href: pathname },
      });
    }
    await reload();
  }

  async function saveFilter() {
    const label = filterLabel.trim() || "Saved filter";
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(filterJson) as Record<string, unknown>;
    } catch {
      setError("Filter JSON is invalid.");
      return;
    }
    await addFavorite({
      itemType: "saved-filter",
      itemKey: `filter:${Date.now()}`,
      label,
      metadata: { filter: parsed, href: pathname },
    });
    setFilterLabel("");
    await reload();
  }

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="personalisation-centre">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            APS-Personalisation
          </p>
          <h1 className="text-2xl font-semibold">Personalisation</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Preferences, favourites, recent items, and remembered filters
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="personalisation-favorite-current"
          onClick={() => void toggleFavoriteCurrent()}
        >
          {isCurrentFavorited ? "Unfavourite page" : "Favourite this page"}
        </Button>
      </header>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Personalisation sections"
      >
        {(
          [
            ["preferences", "Preferences"],
            ["favourites", "Favourites"],
            ["recent", "Recent"],
            ["filters", "Remembered filters"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              tab === id
                ? "border-[var(--color-foreground)] bg-[var(--color-muted)]"
                : "border-[var(--color-border)]"
            }`}
            onClick={() => setTab(id)}
            data-testid={`personalisation-tab-${id}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-red-600" data-testid="personalisation-error">
          {error}
        </p>
      ) : null}

      {tab === "preferences" && preferences ? (
        <section
          className="grid max-w-xl gap-4"
          data-testid="personalisation-preferences"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Default landing page</span>
            <select
              className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
              value={preferences.workbench.landingPage}
              onChange={(event) => void saveLanding(event.target.value)}
              data-testid="personalisation-landing-page"
            >
              {LANDING_PAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Theme</span>
            <select
              className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
              value={preferences.appearance.theme}
              onChange={(event) =>
                void saveTheme(event.target.value as "light" | "dark" | "system")
              }
              data-testid="personalisation-theme"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </section>
      ) : null}

      {tab === "favourites" ? (
        <ul className="flex flex-col gap-2" data-testid="personalisation-favourites">
          {routeFavorites.length === 0 ? (
            <li className="text-sm text-[var(--color-muted-foreground)]">
              No favourites yet.
            </li>
          ) : (
            routeFavorites.map((item) => (
              <li
                key={item.favoriteId}
                className="flex items-center justify-between gap-2 rounded-md border border-[var(--color-border)] px-3 py-2"
              >
                <button
                  type="button"
                  className="text-left text-sm font-medium"
                  onClick={() => router.push(item.itemKey)}
                >
                  {item.label}
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void removeFavorite(item.favoriteId).then(reload)}
                >
                  Remove
                </Button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {tab === "recent" ? (
        <ul className="flex flex-col gap-2" data-testid="personalisation-recent">
          {recent.length === 0 ? (
            <li className="text-sm text-[var(--color-muted-foreground)]">
              No recent items yet.
            </li>
          ) : (
            recent.map((item) => (
              <li key={item.recentId}>
                <button
                  type="button"
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]/40"
                  onClick={() => {
                    if (item.itemType === "route") {
                      router.push(item.itemKey);
                    }
                  }}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--color-muted-foreground)]">
                    {item.itemKey}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {tab === "filters" ? (
        <section
          className="flex max-w-xl flex-col gap-4"
          data-testid="personalisation-filters"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Filter name</span>
            <input
              className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2"
              value={filterLabel}
              onChange={(event) => setFilterLabel(event.target.value)}
              data-testid="personalisation-filter-label"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Filter JSON</span>
            <textarea
              className="min-h-24 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 font-mono text-xs"
              value={filterJson}
              onChange={(event) => setFilterJson(event.target.value)}
              data-testid="personalisation-filter-json"
            />
          </label>
          <Button
            type="button"
            onClick={() => void saveFilter()}
            data-testid="personalisation-filter-save"
          >
            Remember filter
          </Button>
          <ul className="flex flex-col gap-2">
            {savedFilters.map((item) => (
              <li
                key={item.favoriteId}
                className="flex items-center justify-between gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <span>{item.label}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void removeFavorite(item.favoriteId).then(reload)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
