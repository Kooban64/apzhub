export interface PaperlessStatusResponse {
  readonly status?: string;
}

export interface PaperlessDocumentRecord {
  readonly id: number;
  readonly title?: string;
  readonly added?: string;
  readonly created?: string;
  readonly modified?: string;
  readonly archive_serial_number?: number | null;
  readonly original_file_name?: string;
  readonly correspondent?: number | null;
  readonly document_type?: number | null;
  readonly tags?: readonly number[];
}

export interface PaperlessDocumentsListResponse {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: readonly PaperlessDocumentRecord[];
}
