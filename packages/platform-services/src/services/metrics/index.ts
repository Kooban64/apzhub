/**
 * Platform Metrics Services (APZMETRICS-002).
 */

export { isMetricsServiceEnabled } from "./metrics-env";
export {
  createMetricsPlatformServices,
  createMetricsPlatformServicesForProduction,
  createMetricsPlatformServicesForTest,
  wrapMetricsPlatformGatewayWithPipeline,
  type MetricsPlatformServicesBundle,
  type CreateMetricsPlatformServicesInput,
  type CreateMetricsPlatformServicesForProductionInput,
  type CreateMetricsPlatformServicesForTestInput,
} from "./create-metrics-platform-services";
export {
  createMetricsPlatformServiceImpls,
  mapMetricsDomainError,
  type MetricsPlatformServiceImpls,
} from "./metrics-service-impls";
