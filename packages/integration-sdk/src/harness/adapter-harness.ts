import {
  createAdapterFactory,
  createMockAdapterManifest,
  type AdapterBootstrapConfiguration,
  type AdapterContext,
  type MockAdapter,
} from "../adapter";
import type {
  AdapterFileMap,
  AdapterFixtureSet,
  AdapterHarnessOptions,
  AdapterHarnessState,
} from "./types";
import { createDefaultFixtures } from "./testing/fixtures";

/**
 * Bootstrap, configure, inject deps, load fixtures, and cleanup MockAdapter instances
 * for adapter development and certification workflows.
 */
export class AdapterHarness {
  private state: AdapterHarnessState | undefined;
  private readonly options: AdapterHarnessOptions;
  private disposed = false;

  constructor(options: AdapterHarnessOptions = {}) {
    this.options = options;
  }

  get isBooted(): boolean {
    return this.state?.booted === true;
  }

  get isDisposed(): boolean {
    return this.disposed;
  }

  get adapter(): MockAdapter {
    this.assertBooted();
    return this.state!.adapter;
  }

  get context(): AdapterContext {
    this.assertBooted();
    return this.state!.context;
  }

  get configuration(): AdapterBootstrapConfiguration {
    this.assertBooted();
    return this.state!.configuration;
  }

  get fixtures(): Readonly<Record<string, unknown>> {
    this.assertBooted();
    return this.state!.fixtures;
  }

  /** Create and optionally initialise a MockAdapter with injected context deps. */
  async boot(options: AdapterHarnessOptions = {}): Promise<AdapterHarnessState> {
    this.assertNotDisposed();
    if (this.state?.booted) {
      throw new Error("AdapterHarness already booted — call cleanup() first");
    }

    const merged: AdapterHarnessOptions = {
      ...this.options,
      ...options,
      configuration:
        options.configuration ??
        this.options.configuration ??
        createMockAdapterManifest(),
      fixtures: {
        ...createDefaultFixtures().payloads,
        ...(this.options.fixtures ?? {}),
        ...(options.fixtures ?? {}),
      },
    };

    const configuration = merged.configuration!;
    const factory = createAdapterFactory();
    const { adapter, context } = await factory.createMockAdapter({
      configuration,
      autoInitialise: merged.autoInitialise ?? true,
    });

    // Apply shallow context overrides for DI experiments (does not mutate SDK internals deeply)
    const effectiveContext =
      merged.contextOverrides !== undefined
        ? ({ ...context, ...merged.contextOverrides } as AdapterContext)
        : context;

    this.state = {
      adapter,
      context: effectiveContext,
      configuration,
      fixtures: merged.fixtures ?? {},
      booted: true,
    };
    return this.state;
  }

  /** Reconfigure fixtures / configuration metadata while booted (does not rebuild adapter). */
  configure(patch: { readonly fixtures?: Readonly<Record<string, unknown>> }): void {
    this.assertBooted();
    this.assertNotDisposed();
    this.state = {
      ...this.state!,
      fixtures: {
        ...this.state!.fixtures,
        ...(patch.fixtures ?? {}),
      },
    };
  }

  /** Run work against the booted adapter, ensuring cleanup when `autoCleanup` is true. */
  async runWith<T>(
    work: (state: AdapterHarnessState) => Promise<T> | T,
    options: {
      readonly autoCleanup?: boolean;
      readonly bootOptions?: AdapterHarnessOptions;
    } = {},
  ): Promise<T> {
    this.assertNotDisposed();
    if (!this.state?.booted) {
      await this.boot(options.bootOptions);
    }
    try {
      return await work(this.state!);
    } finally {
      if (options.autoCleanup ?? false) {
        await this.cleanup();
      }
    }
  }

  loadFixtures(fixtures: Readonly<Record<string, unknown>>): AdapterFixtureSet {
    this.assertBooted();
    this.configure({ fixtures });
    const defaults = createDefaultFixtures();
    return {
      requestContexts: defaults.requestContexts,
      payloads: {
        ...defaults.payloads,
        ...this.state!.fixtures,
      },
      metadata: defaults.metadata,
    };
  }

  getFixture<T = unknown>(key: string): T | undefined {
    this.assertBooted();
    return this.state!.fixtures[key] as T | undefined;
  }

  /** Snapshot current fixture keys for assertions / reports. */
  listFixtureKeys(): readonly string[] {
    this.assertBooted();
    return Object.keys(this.state!.fixtures);
  }

  async cleanup(): Promise<void> {
    if (this.state?.adapter && !this.state.adapter.isDisposed) {
      await this.state.adapter.dispose("shutdown");
    }
    this.state = undefined;
    this.disposed = true;
  }

  /** Reset disposed flag so the harness can be rebooted (new lifecycle). */
  reset(): void {
    this.state = undefined;
    this.disposed = false;
  }

  private assertBooted(): void {
    if (!this.state?.booted) {
      throw new Error("AdapterHarness is not booted — call boot() first");
    }
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error("AdapterHarness is disposed — call reset() before reuse");
    }
  }
}

export function createAdapterHarness(options?: AdapterHarnessOptions): AdapterHarness {
  return new AdapterHarness(options);
}

/** Utility: merge an in-memory file map (used by scaffold + compliance). */
export function mergeFileMaps(...maps: AdapterFileMap[]): AdapterFileMap {
  return Object.assign({}, ...maps);
}
