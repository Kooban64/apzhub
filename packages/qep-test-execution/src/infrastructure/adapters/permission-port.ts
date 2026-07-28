/**
 * Permission Port adapter — APZQEP-ENG-100D.
 * The permission decision logic is stable across Application/Infrastructure
 * (ADMIN/WILDCARD short-circuit + explicit allow-list); re-exported here so
 * Infrastructure factories do not depend on Application testing internals.
 */
export { createPermissionPort } from "../../application/testing/in-memory-ports";
