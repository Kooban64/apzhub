"use client";

/**
 * Dense Source editor chrome — line numbers without Monaco dependency.
 */
export function SourceLineEditor({
  value,
  onChange,
  readOnly,
}: {
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly readOnly: boolean;
}) {
  const lines = value.length === 0 ? [""] : value.split("\n");
  const width = Math.max(2, String(lines.length).length);

  return (
    <div
      className="flex min-h-[22rem] flex-1 overflow-hidden rounded border border-[var(--color-border)]"
      data-testid="source-line-editor"
    >
      <pre
        aria-hidden
        className="select-none overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-muted)]/20 px-2 py-3 text-right font-mono text-[12px] leading-relaxed text-[var(--color-muted-foreground)]"
      >
        {lines.map((_, index) => (
          <div key={index}>{String(index + 1).padStart(width, " ")}</div>
        ))}
      </pre>
      <textarea
        className="min-h-[22rem] flex-1 resize-none bg-transparent p-3 font-mono text-[12px] leading-relaxed outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        data-testid="source-editor-textarea"
      />
    </div>
  );
}
