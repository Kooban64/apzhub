/** Law Platform public API constants (LAW-014-01 / LAW-014-02). */

export const LAW_API_VERSION = "v1";
export const LAW_API_BASE_PATH = `/api/law/${LAW_API_VERSION}`;
export const LAW_API_SERVICE_NAME = "law-platform-api";
export const LAW_API_SCAFFOLD_VERSION = "1.0.0";

export const LAW_API_REQUEST_ID_HEADER = "x-request-id";
export const LAW_API_CORRELATION_ID_HEADER = "x-correlation-id";

export const LAW_API_MAX_CORRELATION_ID_LENGTH = 128;

/** Permission required for authenticated diagnostics endpoint (LAW-014-02). */
export const LAW_API_DIAGNOSTICS_PERMISSION = "legal.nav.dashboard.view";
