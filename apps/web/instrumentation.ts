export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensurePlatformRuntimeReady } = await import("./lib/runtime-init");
    await ensurePlatformRuntimeReady();
  }
}
