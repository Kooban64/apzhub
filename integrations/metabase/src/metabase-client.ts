import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type {
  MetabaseCollectionRecord,
  MetabaseHealthResponse,
  MetabaseSessionProperties,
} from "./internal/metabase-api-types";
import {
  MetabaseRestClient,
  type MetabaseConnectionTestResult,
} from "./internal/metabase-rest-client";

export interface CanonicalCollectionMetadata {
  readonly id: string;
  readonly name: string;
  readonly slug?: string;
  readonly archived: boolean;
  readonly engine: "metabase";
}

/**
 * Public Metabase client facade used by the adapter.
 * Wraps the internal REST client; never exposes secret material.
 */
export class MetabaseClient {
  constructor(private readonly rest: MetabaseRestClient) {}

  getLastLatencyMs(): number | undefined {
    return this.rest.getLastLatencyMs();
  }

  clearSession(): void {
    this.rest.clearSession();
  }

  testConnection(
    context: IntegrationRequestContext,
  ): Promise<MetabaseConnectionTestResult> {
    return this.rest.testConnection(context);
  }

  getHealth(context: IntegrationRequestContext): Promise<MetabaseHealthResponse> {
    return this.rest.getHealth(context);
  }

  getSessionProperties(
    context: IntegrationRequestContext,
  ): Promise<MetabaseSessionProperties> {
    return this.rest.getSessionProperties(context);
  }

  async detectVersion(
    context: IntegrationRequestContext,
  ): Promise<{ readonly tag?: string; readonly source: string }> {
    const props = await this.rest.getSessionProperties(context);
    return {
      tag: props.version?.tag,
      source: "session/properties",
    };
  }

  async detectCapabilities(context: IntegrationRequestContext): Promise<{
    readonly embeddingEnabled: boolean;
    readonly applicationName?: string;
    readonly versionTag?: string;
  }> {
    const props = await this.rest.getSessionProperties(context);
    return {
      embeddingEnabled: props["enable-embedding"] === true,
      applicationName: props["application-name"],
      versionTag: props.version?.tag,
    };
  }

  async listCollectionsMetadata(
    context: IntegrationRequestContext,
  ): Promise<readonly CanonicalCollectionMetadata[]> {
    const rows = await this.rest.listCollections(context);
    return rows.map((row: MetabaseCollectionRecord) => ({
      id: String(row.id),
      name: row.name,
      slug: row.slug,
      archived: row.archived === true,
      engine: "metabase" as const,
    }));
  }
}
