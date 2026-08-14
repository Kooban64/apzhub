/**
 * SPR-APZQEP-202 — Playwright runner health against apzqep-testing cluster.
 * Live dispatch only when APZHUB_AUTOMATION_LIVE=true and runner is reachable.
 */

export type PlaywrightRunnerHealth = {
  readonly liveFlag: boolean;
  readonly configured: boolean;
  readonly healthy: boolean;
  readonly containerName?: string;
  readonly detail: string;
  readonly dryRunDefault: boolean;
};

export function resolvePlaywrightRunnerHealth(
  env: NodeJS.ProcessEnv = process.env,
): PlaywrightRunnerHealth {
  const liveFlag =
    (env.APZHUB_AUTOMATION_LIVE ?? "").toLowerCase() === "true" ||
    env.APZHUB_AUTOMATION_LIVE === "1";
  const containerName =
    env.APZHUB_PLAYWRIGHT_RUNNER_CONTAINER?.trim() ||
    "apzqep-testing-playwright-runner-1";
  const configured = Boolean(containerName);

  // Health is opt-in probe via env snapshot only in-process (no docker socket from web by default).
  // Operators set APZHUB_PLAYWRIGHT_RUNNER_HEALTHY=true after `docker inspect` / compose up.
  const healthy =
    (env.APZHUB_PLAYWRIGHT_RUNNER_HEALTHY ?? "").toLowerCase() === "true" ||
    env.APZHUB_PLAYWRIGHT_RUNNER_HEALTHY === "1";

  if (!liveFlag) {
    return {
      liveFlag: false,
      configured,
      healthy: false,
      containerName,
      detail:
        "Playwright live mode off (APZHUB_AUTOMATION_LIVE). In-process dry-run remains the safe default.",
      dryRunDefault: true,
    };
  }

  if (!healthy) {
    return {
      liveFlag: true,
      configured,
      healthy: false,
      containerName,
      detail: `Live flag on but runner not marked healthy. Start apzqep-testing playwright-runner and set APZHUB_PLAYWRIGHT_RUNNER_HEALTHY=true (container ${containerName}).`,
      dryRunDefault: true,
    };
  }

  return {
    liveFlag: true,
    configured,
    healthy: true,
    containerName,
    detail: `Playwright runner healthy (${containerName}). Live executions allowed.`,
    dryRunDefault: false,
  };
}
