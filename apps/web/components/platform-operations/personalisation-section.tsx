"use client";

import { Button, Card, CardContent } from "@apzhub/ui";
import { useEffect, useState } from "react";

import {
  fetchPersonalisationDiagnostics,
  fetchPersonalisationFavorites,
  fetchPersonalisationPreferences,
  fetchPersonalisationRecent,
  patchPersonalisationPreferences,
} from "@/lib/platform-operations/ops-api";

import {
  OpsErrorState,
  OpsJsonPanel,
  OpsLoadingState,
  OpsPageShell,
  OpsTable,
} from "./ops-ui";

type Preferences = {
  appearance: { theme: string; density: string };
  regional: { language: string; timezone: string; dateFormat: string; timeFormat: string };
  workbench: {
    landingPage: string;
    defaultWorkspace: string;
    sidebarCollapsed: boolean;
    pinnedWorkspaces: string[];
    recentWorkspaces: string[];
  };
  notifications: { email: boolean; inApp: boolean; digest: string };
  accessibility: { reducedMotion: boolean; highContrast: boolean; focusIndicators: string };
};

function PreferenceSelect({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: readonly { value: string; label: string }[];
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PreferenceToggle({
  label,
  checked,
  onChange,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function PersonalisationSection() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [favorites, setFavorites] = useState<unknown[]>([]);
  const [recent, setRecent] = useState<unknown[]>([]);
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchPersonalisationPreferences(),
      fetchPersonalisationFavorites(),
      fetchPersonalisationRecent(),
      fetchPersonalisationDiagnostics(),
    ])
      .then(([prefs, favs, recentItems, diag]) => {
        if (!active) return;
        setPreferences(prefs as Preferences);
        setFavorites(favs);
        setRecent(recentItems);
        setDiagnostics(diag);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Failed to load personalisation.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function savePatch(patch: Record<string, unknown>) {
    if (!preferences) return;
    setSaving(true);
    try {
      const updated = (await patchPersonalisationPreferences(patch)) as Preferences;
      setPreferences(updated);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <OpsLoadingState />;
  if (error || !preferences) return <OpsErrorState message={error ?? "No preferences loaded."} />;

  return (
    <OpsPageShell
      title="Personalisation"
      description="Platform-owned user preferences — appearance, regional settings, workbench, notifications, and accessibility."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h2 className="text-sm font-semibold">Appearance</h2>
            <PreferenceSelect
              label="Theme"
              value={preferences.appearance.theme}
              options={[
                { value: "system", label: "System" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
              onChange={(theme) => void savePatch({ appearance: { theme } })}
            />
            <PreferenceSelect
              label="Density"
              value={preferences.appearance.density}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
              onChange={(density) => void savePatch({ appearance: { density } })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h2 className="text-sm font-semibold">Regional Settings</h2>
            <PreferenceSelect
              label="Language"
              value={preferences.regional.language}
              options={[
                { value: "en", label: "English" },
                { value: "fr", label: "French" },
                { value: "de", label: "German" },
              ]}
              onChange={(language) => void savePatch({ regional: { language } })}
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Time zone</span>
              <input
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
                value={preferences.regional.timezone}
                onChange={(event) => void savePatch({ regional: { timezone: event.target.value } })}
              />
            </label>
            <PreferenceSelect
              label="Date format"
              value={preferences.regional.dateFormat}
              options={[
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
              ]}
              onChange={(dateFormat) => void savePatch({ regional: { dateFormat } })}
            />
            <PreferenceSelect
              label="Time format"
              value={preferences.regional.timeFormat}
              options={[
                { value: "24h", label: "24-hour" },
                { value: "12h", label: "12-hour" },
              ]}
              onChange={(timeFormat) => void savePatch({ regional: { timeFormat } })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h2 className="text-sm font-semibold">Workbench</h2>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Landing page</span>
              <input
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
                value={preferences.workbench.landingPage}
                onChange={(event) =>
                  void savePatch({ workbench: { landingPage: event.target.value } })
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Default workspace</span>
              <input
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
                value={preferences.workbench.defaultWorkspace}
                onChange={(event) =>
                  void savePatch({ workbench: { defaultWorkspace: event.target.value } })
                }
              />
            </label>
            <PreferenceToggle
              label="Sidebar collapsed"
              checked={preferences.workbench.sidebarCollapsed}
              onChange={(sidebarCollapsed) => void savePatch({ workbench: { sidebarCollapsed } })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <PreferenceToggle
              label="Email notifications"
              checked={preferences.notifications.email}
              onChange={(email) => void savePatch({ notifications: { email } })}
            />
            <PreferenceToggle
              label="In-app notifications"
              checked={preferences.notifications.inApp}
              onChange={(inApp) => void savePatch({ notifications: { inApp } })}
            />
            <PreferenceSelect
              label="Digest"
              value={preferences.notifications.digest}
              options={[
                { value: "off", label: "Off" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ]}
              onChange={(digest) => void savePatch({ notifications: { digest } })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h2 className="text-sm font-semibold">Accessibility</h2>
            <PreferenceToggle
              label="Reduced motion"
              checked={preferences.accessibility.reducedMotion}
              onChange={(reducedMotion) => void savePatch({ accessibility: { reducedMotion } })}
            />
            <PreferenceToggle
              label="High contrast"
              checked={preferences.accessibility.highContrast}
              onChange={(highContrast) => void savePatch({ accessibility: { highContrast } })}
            />
            <PreferenceSelect
              label="Focus indicators"
              value={preferences.accessibility.focusIndicators}
              options={[
                { value: "default", label: "Default" },
                { value: "enhanced", label: "Enhanced" },
              ]}
              onChange={(focusIndicators) => void savePatch({ accessibility: { focusIndicators } })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h2 className="text-sm font-semibold">Favorites</h2>
            <OpsTable
              columns={["Type", "Key", "Label"]}
              rows={(favorites as Array<{ itemType: string; itemKey: string; label: string }>).map(
                (item) => [item.itemType, item.itemKey, item.label],
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <OpsTable
              columns={["Type", "Key", "Label", "Accessed"]}
              rows={(recent as Array<{
                itemType: string;
                itemKey: string;
                label: string;
                accessedAt: string;
              }>).map((item) => [item.itemType, item.itemKey, item.label, item.accessedAt])}
            />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardContent className="flex flex-col gap-4 pt-6">
            <h2 className="text-sm font-semibold">Diagnostics</h2>
            <OpsJsonPanel value={diagnostics ?? {}} />
          </CardContent>
        </Card>
      </div>

      {saving ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Saving preferences…</p>
      ) : null}
      <Button type="button" variant="outline" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </OpsPageShell>
  );
}
