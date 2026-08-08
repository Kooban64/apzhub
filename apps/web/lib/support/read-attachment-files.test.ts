import { describe, expect, it } from "vitest";

import {
  SUPPORT_MAX_ATTACHMENT_BYTES,
  readAttachmentFiles,
} from "./read-attachment-files";

describe("readAttachmentFiles (SUP-P1-04)", () => {
  it("enforces the 1 MiB limit", async () => {
    expect(SUPPORT_MAX_ATTACHMENT_BYTES).toBe(1_048_576);
    const oversized = new File(
      [new Uint8Array(SUPPORT_MAX_ATTACHMENT_BYTES + 1)],
      "too-big.bin",
      { type: "application/octet-stream" },
    );
    await expect(readAttachmentFiles([oversized])).rejects.toThrow(/1 MiB/i);
  });

  it("accepts files at or under the limit", async () => {
    const ok = new File([new Uint8Array(8)], "ok.txt", { type: "text/plain" });
    const uploads = await readAttachmentFiles([ok]);
    expect(uploads).toHaveLength(1);
    expect(uploads[0]?.filename).toBe("ok.txt");
    expect(uploads[0]?.sizeBytes).toBe(8);
  });
});
