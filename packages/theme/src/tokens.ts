export const lightTokens = {
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  surface: "var(--color-surface)",
  border: "var(--color-border)",
  primary: "var(--color-primary)",
  primaryForeground: "var(--color-primary-foreground)",
  muted: "var(--color-muted)",
  mutedForeground: "var(--color-muted-foreground)",
  accent: "var(--color-accent)",
  accentForeground: "var(--color-accent-foreground)",
  destructive: "var(--color-destructive)",
  ring: "var(--color-ring)",
} as const;

export type ThemeMode = "light" | "dark" | "system";

export const themeModes: ThemeMode[] = ["light", "dark", "system"];
