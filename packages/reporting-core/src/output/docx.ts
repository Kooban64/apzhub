import { deflateRawSync } from "node:zlib";

import type { CanonicalReportDocument } from "@apzhub/reporting-contracts";

/** CRC-32 (ISO 3309 / ZIP) */
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i]!;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n: number): Buffer {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n, 0);
  return b;
}

function u32(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0, 0);
  return b;
}

type ZipEntry = {
  readonly name: string;
  readonly data: Buffer;
};

function buildZip(entries: readonly ZipEntry[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const compressed = deflateRawSync(entry.data);
    const crc = crc32(entry.data);
    const local = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(8),
      u16(0),
      u16(0),
      u32(crc),
      u32(compressed.length),
      u32(entry.data.length),
      u16(nameBuf.length),
      u16(0),
      nameBuf,
      compressed,
    ]);
    locals.push(local);

    const central = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(8),
      u16(0),
      u16(0),
      u32(crc),
      u32(compressed.length),
      u32(entry.data.length),
      u16(nameBuf.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBuf,
    ]);
    centrals.push(central);
    offset += local.length;
  }

  const centralDir = Buffer.concat(centrals);
  const localBlob = Buffer.concat(locals);
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDir.length),
    u32(localBlob.length),
    u16(0),
  ]);

  return Buffer.concat([localBlob, centralDir, end]);
}

function xmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraph(text: string, bold = false): string {
  const run = bold
    ? `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r>`
    : `<w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r>`;
  return `<w:p>${run}</w:p>`;
}

function collectParagraphs(document: CanonicalReportDocument): string {
  const parts: string[] = [];
  parts.push(paragraph(document.title, true));
  if (document.subtitle) parts.push(paragraph(document.subtitle));
  if (document.header) parts.push(paragraph(document.header));
  for (const m of document.metrics) {
    parts.push(paragraph(`${m.label}: ${m.value}`));
  }
  for (const section of document.sections) {
    parts.push(paragraph(section.title, true));
    for (const block of section.blocks) {
      switch (block.kind) {
        case "heading":
        case "paragraph":
        case "summary":
          parts.push(paragraph(block.text, block.kind === "heading"));
          break;
        case "metric": {
          const unit = block.unit ? ` ${block.unit}` : "";
          parts.push(paragraph(`${block.label}: ${block.value}${unit}`));
          break;
        }
        case "list":
          for (const item of block.items) parts.push(paragraph(`• ${item}`));
          break;
        case "table":
          if (block.columns.length > 0) {
            parts.push(paragraph(block.columns.join(" | ")));
            for (const row of block.rows) {
              parts.push(paragraph(row.join(" | ")));
            }
          }
          break;
        default:
          break;
      }
    }
  }
  if (document.footer) parts.push(paragraph(document.footer));
  return parts.join("");
}

/**
 * Minimal OOXML DOCX as a ZIP (deflate), no npm dependencies.
 */
export function renderDocxDocument(document: CanonicalReportDocument): Buffer {
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${collectParagraphs(document)}
<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
</w:body>
</w:document>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  return buildZip([
    { name: "[Content_Types].xml", data: Buffer.from(contentTypes, "utf8") },
    { name: "_rels/.rels", data: Buffer.from(rels, "utf8") },
    { name: "word/document.xml", data: Buffer.from(documentXml, "utf8") },
    {
      name: "word/_rels/document.xml.rels",
      data: Buffer.from(docRels, "utf8"),
    },
  ]);
}
