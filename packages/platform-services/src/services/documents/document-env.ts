/**
 * Document Platform service enablement (APZDOCS-004).
 */

export function isDocumentServiceEnabled(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> | undefined = process.env,
): boolean {
  return env?.DOCUMENT_SERVICE_ENABLED === "true";
}
