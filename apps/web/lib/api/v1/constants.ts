/** Platform HTTP API v1 constants (OSS-110-07). */

export const PLATFORM_API_VERSION = "v1" as const;
export const PLATFORM_API_BASE_PATH = "/api/v1" as const;

export const PLATFORM_API_REQUEST_ID_HEADER = "x-request-id";
export const PLATFORM_API_CORRELATION_ID_HEADER = "x-correlation-id";
export const PLATFORM_API_IDEMPOTENCY_KEY_HEADER = "idempotency-key";

export const PLATFORM_API_MAX_CORRELATION_ID_LENGTH = 128;
export const PLATFORM_API_MAX_IDEMPOTENCY_KEY_LENGTH = 128;
export const PLATFORM_API_MAX_PAGE_LIMIT = 100;
export const PLATFORM_API_DEFAULT_PAGE_LIMIT = 20;
export const PLATFORM_API_MAX_BODY_BYTES = 1_048_576; // 1 MiB

/** Cache-Control for authenticated platform API responses. */
export const PLATFORM_API_CACHE_CONTROL = "no-store";
