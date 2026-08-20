/**
 * APZPEN PDF compile — Typst when available; minimal PDF-1.1 fallback.
 * Humans publish; never auto-certify.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { ReportPack } from "./reports";

import type { EnvVars } from "@/lib/env-vars";
export type ApzpenPdfResult =
  | {
      readonly ok: true;
      readonly bytes: Buffer;
      readonly engine: "typst" | "embedded";
      readonly pdfPath?: string;
    }
  | {
      readonly ok: false;
      readonly reason: string;
      readonly todo?: string;
    };

function escapeTypst(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/#/g, "\\#")
    .replace(/\$/g, "\\$")
    .replace(/</g, "\\<")
    .replace(/>/g, "\\>")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\r?\n/g, " \\ ");
}

function escapePdfString(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

const DEFAULT_TEMPLATE = `#set document(title: "{{title}}")
#set page(margin: 1.8cm, numbering: "1")
#set text(size: 9.5pt)
#align(center)[
  #text(16pt, weight: "bold")[APZPEN Security Assurance]
  #linebreak()
  #text(11pt)[{{title}}]
  #linebreak()
  #text(9pt, fill: luma(80))[Never auto-certified · human decision]
]
#v(0.6em)
#text(8pt)[Generated {{generatedAt}} · Engagement {{engagementId}} · Kind {{kind}}]
#v(0.8em)
{{body}}
`;

export function resolveApzpenTypstTemplatePath(): string {
  const fromCwd = join(
    process.cwd(),
    "apps/web/lib/apzpen/report-templates/assurance-pack.typ",
  );
  if (existsSync(fromCwd)) return fromCwd;
  return join(process.cwd(), "lib/apzpen/report-templates/assurance-pack.typ");
}

export function resolveTypstBinary(env: EnvVars = process.env): string | undefined {
  const configured = env.APZHUB_TYPST_BIN?.trim();
  if (configured && existsSync(configured)) return configured;
  const local = join(process.cwd(), "tooling/bin/typst");
  if (existsSync(local)) return local;
  return undefined;
}

/** Convert markdown-ish body into Typst paragraphs/bullets (best-effort). */
export function markdownToTypstBody(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    if (line.startsWith("# ")) {
      out.push(`= ${escapeTypst(line.slice(2))}`);
    } else if (line.startsWith("## ")) {
      out.push(`== ${escapeTypst(line.slice(3))}`);
    } else if (line.startsWith("### ")) {
      out.push(`=== ${escapeTypst(line.slice(4))}`);
    } else if (
      line.startsWith("| ") ||
      line.startsWith("|--") ||
      line.startsWith("| -")
    ) {
      out.push(escapeTypst(line.replaceAll("|", "·")));
    } else if (line.startsWith("- ")) {
      out.push(`- ${escapeTypst(line.slice(2))}`);
    } else if (line.trim() === "") {
      out.push("");
    } else {
      out.push(escapeTypst(line.replaceAll("**", "")));
    }
  }
  return out.join("\n");
}

export function renderApzpenTypst(pack: ReportPack, templateSource?: string): string {
  const template = templateSource ?? DEFAULT_TEMPLATE;
  const replacements: Record<string, string> = {
    title: escapeTypst(pack.title),
    generatedAt: escapeTypst(pack.generatedAt),
    engagementId: escapeTypst(pack.engagementId),
    kind: escapeTypst(pack.kind),
    body: markdownToTypstBody(pack.markdown),
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    return replacements[key] ?? "";
  });
}

function runTypstCompile(input: {
  readonly binary: string;
  readonly sourcePath: string;
  readonly outputPath: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  return new Promise((resolve) => {
    const child = spawn(input.binary, ["compile", input.sourcePath, input.outputPath], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      resolve({ ok: false, reason: error.message });
    });
    child.on("close", (code) => {
      if (code === 0) resolve({ ok: true });
      else
        resolve({
          ok: false,
          reason: stderr.trim() || `typst exited ${code ?? "unknown"}`,
        });
    });
  });
}

/** Minimal PDF-1.1 fallback when Typst is not installed. */
export function renderEmbeddedPdf(pack: ReportPack): Buffer {
  const textLines = [
    "APZPEN Security Assurance",
    pack.title,
    `Kind: ${pack.kind}`,
    `Generated: ${pack.generatedAt}`,
    `Engagement: ${pack.engagementId}`,
    "Never auto-certified — human decision required.",
    ...pack.markdown.split(/\r?\n/).map((l) => l.slice(0, 100)),
  ].slice(0, 48);

  const contentParts: string[] = ["BT", "/F1 10 Tf", "50 750 Td", "12 TL"];
  let first = true;
  for (const line of textLines) {
    const escaped = escapePdfString(line);
    if (first) {
      contentParts.push(`(${escaped}) Tj`);
      first = false;
    } else {
      contentParts.push("T*", `(${escaped}) Tj`);
    }
  }
  contentParts.push("ET");
  const stream = contentParts.join("\n");
  const streamLength = Buffer.byteLength(stream, "utf8");
  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];
  let pdf = "%PDF-1.1\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

export async function tryCompileApzpenPdf(
  pack: ReportPack,
  options?: {
    readonly typstBinary?: string;
    readonly workDir?: string;
    readonly preferEmbedded?: boolean;
    readonly env?: EnvVars;
  },
): Promise<ApzpenPdfResult> {
  if (options?.preferEmbedded) {
    return { ok: true, bytes: renderEmbeddedPdf(pack), engine: "embedded" };
  }

  const env = options?.env ?? process.env;
  const binary = options?.typstBinary ?? resolveTypstBinary(env);
  if (binary) {
    let templateSource = DEFAULT_TEMPLATE;
    const templatePath = resolveApzpenTypstTemplatePath();
    if (existsSync(templatePath)) {
      templateSource = await readFile(templatePath, "utf8");
    }
    const workDir =
      options?.workDir ??
      join(
        process.cwd(),
        "apps/web/.data/apzpen-reports",
        pack.engagementId,
        pack.kind,
      );
    await mkdir(workDir, { recursive: true });
    const sourcePath = join(workDir, "assurance-pack.typ");
    const pdfPath = join(workDir, "assurance-pack.pdf");
    await writeFile(sourcePath, renderApzpenTypst(pack, templateSource), "utf8");
    const compiled = await runTypstCompile({
      binary,
      sourcePath,
      outputPath: pdfPath,
    });
    if (compiled.ok) {
      const bytes = await readFile(pdfPath);
      return { ok: true, bytes, engine: "typst", pdfPath };
    }
    // fall through to embedded
  }

  return {
    ok: true,
    bytes: renderEmbeddedPdf(pack),
    engine: "embedded",
  };
}
