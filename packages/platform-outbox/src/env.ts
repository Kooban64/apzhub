export function isPlatformOutboxWorkerEnabled(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  const raw = env.APZHUB_OUTBOX_WORKER_ENABLED ?? env.LAW_OUTBOX_ENABLED;
  if (raw === undefined) return true;
  return raw !== "0" && raw.toLowerCase() !== "false" && raw !== "off";
}
