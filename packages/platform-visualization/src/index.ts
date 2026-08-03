export {
  PLATFORM_VISUALIZATION_VERSION,
  PLATFORM_VISUALIZATION_PROGRAMME,
} from "./version";
export * from "./contracts/index";
export {
  buildKpi,
  buildChart,
  buildTimeline,
  buildHeatMap,
  buildRiskMatrix,
  buildGauge,
  buildEvidenceViewer,
  VISUALIZATION_KINDS,
  type VisualizationKind,
} from "./builders/descriptors";
export {
  clampDisplayPercent,
  summarizeSeries,
  downsamplePoints,
} from "./format/presentation";
export { VisualizationRegistry } from "./registry/visualization-registry";
export {
  createPlatformVisualization,
  type PlatformVisualization,
} from "./sdk/create-visualization";
