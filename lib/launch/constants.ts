/** HttpOnly cookie holding short-lived internal launch JWT (real launch path). */
export const LAUNCH_INTERNAL_JWT_COOKIE = "apzhub_internal_launch_jwt";

/** Narrow cookie scope: sent only for workspace launch routes (not site-wide). */
export const LAUNCH_INTERNAL_JWT_COOKIE_PATH = "/workspace/launch";

/** Query param carrying mint-route correlation into internal JWT landing for joined audit rows. */
export const LAUNCH_CORRELATION_QUERY_PARAM = "launch_cid";
