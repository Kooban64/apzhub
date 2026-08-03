import { VisualizationRegistry } from "../registry/visualization-registry";

export interface PlatformVisualization {
  readonly registry: VisualizationRegistry;
}

/** Bootstrap reusable APZHUB Visualization Platform (metadata + builders). */
export function createPlatformVisualization(): PlatformVisualization {
  return { registry: new VisualizationRegistry() };
}
