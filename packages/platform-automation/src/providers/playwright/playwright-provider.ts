import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type {
  AutomationArtifact,
  AutomationProviderDescriptor,
} from "../../contracts/execution";
import type {
  AutomationProvider,
  ProviderExecutionContext,
  ProviderExecutionResult,
} from "../../contracts/provider";

export interface PlaywrightProviderOptions {
  /** Force dry-run even when Playwright is installed. */
  readonly forceDryRun?: boolean;
}

const DESCRIPTOR: AutomationProviderDescriptor = {
  providerId: "playwright",
  name: "Playwright Provider",
  version: "0.1.0",
  status: "active",
  capabilities: [
    "browser-lifecycle",
    "projects",
    "workers",
    "retries",
    "timeouts",
    "parallel",
    "screenshots",
    "videos",
    "traces",
    "artifact-collection",
    "result-publication",
    "evidence-publication",
    "dry-run",
  ],
};

function artifact(
  kind: AutomationArtifact["kind"],
  name: string,
  contentType: string,
  payload?: string | Buffer,
): AutomationArtifact {
  const body =
    typeof payload === "undefined"
      ? Buffer.from(name)
      : typeof payload === "string"
        ? Buffer.from(payload)
        : payload;
  return {
    artifactId: randomUUID(),
    kind,
    name,
    contentType,
    uri: `memory://playwright/${name}`,
    bytes: body.byteLength,
    sha256: createHash("sha256").update(body).digest("hex"),
    contentBase64: body.toString("base64"),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Playwright execution provider.
 * The Automation Engine never imports this module — only the registry/bootstrap does.
 */
export class PlaywrightAutomationProvider implements AutomationProvider {
  readonly descriptor = DESCRIPTOR;
  private readonly forceDryRun: boolean;

  constructor(options: PlaywrightProviderOptions = {}) {
    this.forceDryRun = options.forceDryRun ?? false;
  }

  async prepare(_context: ProviderExecutionContext): Promise<void> {
    // Browser / project preparation happens in execute (or dry-run metadata).
  }

  async execute(context: ProviderExecutionContext): Promise<ProviderExecutionResult> {
    const dryRun = this.forceDryRun || context.options.dryRun === true;
    if (dryRun) {
      return this.executeDryRun(context);
    }
    return this.executeLive(context);
  }

  async health(): Promise<{ readonly ok: boolean; readonly detail?: string }> {
    try {
      await import("playwright");
      return { ok: true, detail: "playwright module available" };
    } catch {
      return { ok: true, detail: "playwright optional — dry-run available" };
    }
  }

  private async executeDryRun(
    context: ProviderExecutionContext,
  ): Promise<ProviderExecutionResult> {
    const startedAt = new Date().toISOString();
    const artifacts: AutomationArtifact[] = [
      artifact(
        "metadata",
        "execution-metadata.json",
        "application/json",
        JSON.stringify({
          provider: "playwright",
          mode: "dry-run",
          target: context.target,
          workers: context.options.workers ?? 1,
          attempt: context.attempt,
        }),
      ),
      artifact("log", "provider.log", "text/plain", "Playwright dry-run completed"),
      artifact(
        "timing",
        "timing.json",
        "application/json",
        JSON.stringify({ mode: "dry-run" }),
      ),
    ];

    if (context.options.collectScreenshots !== false) {
      artifacts.push(
        artifact(
          "screenshot",
          "dry-run-screenshot.png",
          "image/png",
          "PNG_PLACEHOLDER",
        ),
      );
    }
    if (context.options.collectTraces !== false) {
      artifacts.push(
        artifact("trace", "dry-run-trace.zip", "application/zip", "TRACE_PLACEHOLDER"),
      );
    }
    if (context.options.collectVideos) {
      artifacts.push(
        artifact("video", "dry-run-video.webm", "video/webm", "VIDEO_PLACEHOLDER"),
      );
    }
    if (context.options.collectConsole !== false) {
      artifacts.push(
        artifact("console", "console.log", "text/plain", "console: dry-run"),
      );
    }
    if (context.options.collectNetworkLogs) {
      artifacts.push(artifact("network", "network.har", "application/json", "{}"));
    }

    const finishedAt = new Date().toISOString();
    return {
      ok: true,
      summary: `Playwright dry-run OK for ${context.target.name}`,
      artifacts,
      timing: {
        startedAt,
        finishedAt,
        durationMs: Math.max(1, Date.parse(finishedAt) - Date.parse(startedAt)),
      },
    };
  }

  private async executeLive(
    context: ProviderExecutionContext,
  ): Promise<ProviderExecutionResult> {
    const startedAt = new Date().toISOString();
    let playwright: typeof import("playwright");
    try {
      playwright = await import("playwright");
    } catch {
      return {
        ok: false,
        summary: "Playwright module not installed",
        artifacts: [
          artifact(
            "log",
            "error.log",
            "text/plain",
            "playwright peer dependency missing",
          ),
        ],
        errorMessage: "PLAYWRIGHT_NOT_INSTALLED",
      };
    }

    const workDir = await mkdtemp(join(tmpdir(), "apzhub-pw-"));
    const browser = await playwright.chromium.launch({ headless: true });
    const artifacts: AutomationArtifact[] = [];
    try {
      const videoDir = join(workDir, "videos");
      const contextBrowser = await browser.newContext({
        recordVideo: context.options.collectVideos ? { dir: videoDir } : undefined,
      });
      const page = await contextBrowser.newPage();
      const video = context.options.collectVideos ? page.video() : null;
      const url = context.target.baseUrl ?? context.target.entry ?? "about:blank";

      if (context.options.collectTraces !== false) {
        await contextBrowser.tracing.start({ screenshots: true, snapshots: true });
      }

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: context.options.timeoutMs,
      });

      if (context.options.collectScreenshots !== false) {
        const buffer = await page.screenshot({ fullPage: true });
        artifacts.push(artifact("screenshot", "page.png", "image/png", buffer));
      }

      if (context.options.collectTraces !== false) {
        const tracePath = join(workDir, "trace.zip");
        await contextBrowser.tracing.stop({ path: tracePath });
        const traceBuffer = await readFile(tracePath);
        artifacts.push(artifact("trace", "trace.zip", "application/zip", traceBuffer));
      }

      await contextBrowser.close();

      if (video) {
        try {
          const videoPath = await video.path();
          const videoBuffer = await readFile(videoPath);
          artifacts.push(artifact("video", "session.webm", "video/webm", videoBuffer));
        } catch {
          artifacts.push(
            artifact(
              "log",
              "video-warning.log",
              "text/plain",
              "video requested but file was not available after context close",
            ),
          );
        }
      }

      artifacts.push(
        artifact(
          "metadata",
          "execution-metadata.json",
          "application/json",
          JSON.stringify({
            provider: "playwright",
            mode: "live",
            url,
            workers: context.options.workers ?? 1,
          }),
        ),
      );
      artifacts.push(
        artifact("log", "provider.log", "text/plain", `Navigated to ${url}`),
      );

      const finishedAt = new Date().toISOString();
      return {
        ok: true,
        summary: `Playwright live OK for ${context.target.name}`,
        artifacts,
        timing: {
          startedAt,
          finishedAt,
          durationMs: Math.max(1, Date.parse(finishedAt) - Date.parse(startedAt)),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      artifacts.push(artifact("log", "error.log", "text/plain", message));
      return {
        ok: false,
        summary: "Playwright live execution failed",
        artifacts,
        errorMessage: message,
      };
    } finally {
      await browser.close();
      await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}

export function createPlaywrightProvider(
  options?: PlaywrightProviderOptions,
): AutomationProvider {
  return new PlaywrightAutomationProvider(options);
}
