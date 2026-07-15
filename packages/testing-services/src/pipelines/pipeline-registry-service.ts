/** Thin registry façade over PipelineImportService registration methods. */

import type { PipelineImportService } from "@apzhub/testing-contracts";

export type PipelineRegistryService = Pick<
  PipelineImportService,
  | "registerPipeline"
  | "synchroniseMetadata"
  | "updatePipeline"
  | "archivePipeline"
  | "listPipelines"
  | "getPipeline"
>;

export function createPipelineRegistryService(
  imports: PipelineImportService,
): PipelineRegistryService {
  return {
    registerPipeline: (ctx, input) => imports.registerPipeline(ctx, input),
    synchroniseMetadata: (ctx, input) => imports.synchroniseMetadata(ctx, input),
    updatePipeline: (ctx, id, input) => imports.updatePipeline(ctx, id, input),
    archivePipeline: (ctx, id) => imports.archivePipeline(ctx, id),
    listPipelines: (ctx) => imports.listPipelines(ctx),
    getPipeline: (ctx, id) => imports.getPipeline(ctx, id),
  };
}
