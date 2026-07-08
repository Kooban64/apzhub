import {
  LAW_API_BASE_PATH,
  LAW_API_SCAFFOLD_VERSION,
  LAW_API_SERVICE_NAME,
  LAW_API_VERSION,
} from "./constants";

export interface LawApiHealthData {
  readonly status: "healthy";
  readonly service: string;
  readonly apiVersion: string;
  readonly scaffoldVersion: string;
  readonly basePath: string;
}

/** Safe health payload — no secrets or dependency diagnostics (LAW-014-01). */
export function buildLawApiHealthData(): LawApiHealthData {
  return {
    status: "healthy",
    service: LAW_API_SERVICE_NAME,
    apiVersion: LAW_API_VERSION,
    scaffoldVersion: LAW_API_SCAFFOLD_VERSION,
    basePath: LAW_API_BASE_PATH,
  };
}
