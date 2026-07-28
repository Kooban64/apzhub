/** Canonical binary attachment payload (base64) — R12-SUP-02. */

export interface SupportArticleAttachmentContent {
  readonly id: string;
  readonly articleId: string;
  readonly supportTicketId: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly dataBase64: string;
}
