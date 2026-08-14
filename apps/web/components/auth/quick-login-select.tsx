"use client";

type PersonaOption = {
  id: string;
  label: string;
  email: string;
  description: string;
  group: "platform" | "organisation" | "individual";
};

const GROUP_LABEL: Record<PersonaOption["group"], string> = {
  platform: "Platform",
  organisation: "Organisation",
  individual: "Individual",
};

export function QuickLoginSelect({
  personas,
  onSelect,
  disabled,
}: {
  readonly personas: readonly PersonaOption[];
  readonly onSelect: (persona: PersonaOption) => void;
  readonly disabled?: boolean;
}) {
  if (!personas || personas.length === 0) return null;

  const grouped = (["platform", "organisation", "individual"] as const).map(
    (group) => ({
      group,
      items: personas.filter((p) => p.group === group),
    }),
  );

  return (
    <div
      className="mb-5 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3"
      data-testid="demo-quick-login-wrap"
    >
      <label
        htmlFor="demo-quick-login"
        className="block text-[11px] font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase"
      >
        Quick login
      </label>
      <select
        id="demo-quick-login"
        className="mt-2 h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
        defaultValue=""
        disabled={disabled}
        data-testid="demo-quick-login"
        onChange={(e) => {
          const id = e.target.value;
          const persona = personas.find((p) => p.id === id);
          if (persona) onSelect(persona);
        }}
      >
        <option value="">Select persona…</option>
        {grouped.map(({ group, items }) =>
          items.length === 0 ? null : (
            <optgroup key={group} label={GROUP_LABEL[group]}>
              {items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.email}
                </option>
              ))}
            </optgroup>
          ),
        )}
      </select>
      <p className="mt-2 text-[11px] leading-snug text-[var(--color-muted-foreground)]">
        Signs in immediately. Shared demo password across personas.
      </p>
    </div>
  );
}
