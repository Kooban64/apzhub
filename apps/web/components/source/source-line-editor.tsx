"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div
      className="flex min-h-[22rem] flex-1 items-center justify-center border border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]"
      data-testid="source-editor-loading"
    >
      Loading editor…
    </div>
  ),
});

function languageFromPath(path?: string): string {
  if (!path) return "plaintext";
  const lower = path.toLowerCase();
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".mjs"))
    return "javascript";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".rs")) return "rust";
  if (lower.endsWith(".go")) return "go";
  if (lower.endsWith(".sql")) return "sql";
  if (lower.endsWith(".sh")) return "shell";
  return "plaintext";
}

/**
 * Source Workspace editor — Monaco with syntax highlighting (Slice 3 Read+Context).
 * Replaces dense textarea; write remains permission-/slice-gated by parent.
 */
export function SourceLineEditor({
  value,
  onChange,
  readOnly,
  path,
  revealLine,
}: {
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly readOnly: boolean;
  readonly path?: string;
  readonly revealLine?: number;
}) {
  const language = useMemo(() => languageFromPath(path), [path]);

  return (
    <div
      className="flex min-h-[22rem] flex-1 overflow-hidden rounded border border-[var(--color-border)]"
      data-testid="source-line-editor"
      data-readonly={readOnly ? "true" : "false"}
    >
      <MonacoEditor
        height="22rem"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(next) => {
          if (!readOnly && typeof next === "string") onChange(next);
        }}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          renderLineHighlight: "line",
          folding: true,
          tabSize: 2,
          domReadOnly: readOnly,
        }}
        onMount={(editor) => {
          if (revealLine && revealLine > 0) {
            editor.revealLineInCenter(revealLine);
            editor.setPosition({ lineNumber: revealLine, column: 1 });
          }
        }}
        loading={<span className="p-3 text-xs">Loading editor…</span>}
      />
    </div>
  );
}
