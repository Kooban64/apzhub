import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type {
  PaperlessDocumentRecord,
  PaperlessDownloadResult,
  PaperlessUploadInput,
  PaperlessUploadResult,
} from "./internal/paperless-api-types";
import {
  PaperlessRestClient,
  type PaperlessConnectionTestResult,
} from "./internal/paperless-rest-client";

export interface PaperlessDocumentPage {
  readonly count: number;
  readonly nextPageAvailable: boolean;
  readonly documents: readonly PaperlessDocumentRecord[];
}

export class PaperlessClient {
  constructor(private readonly rest: PaperlessRestClient) {}

  testConnection(
    context: IntegrationRequestContext,
  ): Promise<PaperlessConnectionTestResult> {
    return this.rest.testConnection(context);
  }

  async listDocuments(
    context: IntegrationRequestContext,
    query?: { readonly page?: number; readonly pageSize?: number },
  ): Promise<PaperlessDocumentPage> {
    const result = await this.rest.listDocuments(context, query);
    return {
      count: result.count,
      nextPageAvailable: result.next !== null,
      documents: result.results,
    };
  }

  getDocument(
    context: IntegrationRequestContext,
    documentId: number,
  ): Promise<PaperlessDocumentRecord> {
    return this.rest.getDocument(context, documentId);
  }

  downloadDocument(
    context: IntegrationRequestContext,
    documentId: number,
  ): Promise<PaperlessDownloadResult> {
    return this.rest.downloadDocument(context, documentId);
  }

  uploadDocument(
    context: IntegrationRequestContext,
    input: PaperlessUploadInput,
  ): Promise<PaperlessUploadResult> {
    return this.rest.uploadDocument(context, input);
  }
}
