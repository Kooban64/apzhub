/**
 * In-memory Test Execution repository — APZQEP-ENG-100D.
 * Wraps the Application testing fake so Infrastructure factories can offer a
 * `mode: "memory"` path (contract tests, local dev) without duplicating
 * persistence logic. Never used in production (see factories.ts guards).
 */
export { createInMemoryTestExecutionRepository } from "../../application/testing/in-memory-ports";
