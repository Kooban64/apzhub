import type { PaperlessAdapter } from "@apzhub/integration-paperless";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import type { DocumentsDmsGateway, DocumentsDmsProvider } from "./documents-dms-types";
import { createPaperlessOpsProvider } from "./paperless-ops-provider";

export interface DocumentsDmsPlatformServicesBundle {
  readonly gatewaySurface: DocumentsDmsGateway;
  readonly readiness: {
    readonly documentsDmsEnabled: true;
    readonly providerId: string;
  };
  wrapWithPipeline(pipeline: RequestPipeline): DocumentsDmsGateway;
}

function createBundle(
  provider: DocumentsDmsProvider,
): DocumentsDmsPlatformServicesBundle {
  const dms: DocumentsDmsGateway["dms"] = {
    getHealth: (ctx) => provider.getHealth(ctx),
    listDocuments: (ctx, query) => provider.listDocuments(ctx, query),
  };
  const gatewaySurface: DocumentsDmsGateway = { dms };
  return {
    gatewaySurface,
    readiness: {
      documentsDmsEnabled: true,
      providerId: provider.providerId,
    },
    wrapWithPipeline: (pipeline) => ({
      dms: wrapServiceWithPipeline(dms, pipeline, "documentsDms"),
    }),
  };
}

export function createDocumentsDmsPlatformServicesWithPaperless(
  adapter: PaperlessAdapter,
): DocumentsDmsPlatformServicesBundle {
  return createBundle(createPaperlessOpsProvider(adapter));
}
