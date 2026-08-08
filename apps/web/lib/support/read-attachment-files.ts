import type { SupportArticleAttachmentUpload } from "./types";

/** Support v1.0 attachment max — ENG-0004 / SUP-P1-04. */
export const SUPPORT_MAX_ATTACHMENT_BYTES = 1_048_576;

export async function readAttachmentFiles(
  files: FileList | readonly File[],
): Promise<readonly SupportArticleAttachmentUpload[]> {
  const list = Array.from(files);
  const uploads: SupportArticleAttachmentUpload[] = [];
  for (const file of list) {
    if (file.size > SUPPORT_MAX_ATTACHMENT_BYTES) {
      throw new Error(`Attachment "${file.name}" exceeds the 1 MiB limit.`);
    }
    const dataBase64 = await readFileAsBase64(file);
    uploads.push({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      dataBase64,
      sizeBytes: file.size,
    });
  }
  return uploads;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Unable to read "${file.name}".`));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}
