/**
 * Greenbone Management Protocol (GMP) client — SPR-FULL-002-B.
 * CE-oriented: authenticate + get_results → finding seeds. Never certifies / starts scans by default.
 */

import { connect as tlsConnect, type TLSSocket } from "node:tls";

export type GreenboneFindingSeed = {
  readonly title: string;
  readonly severity: string;
  readonly host?: string;
  readonly message?: string;
};

export type GmpClientConfig = {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly rejectUnauthorized?: boolean;
  readonly timeoutMs?: number;
};

export type GmpVersionInfo = {
  readonly version: string;
  readonly raw: string;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildGmpAuthenticateCommand(
  username: string,
  password: string,
): string {
  return `<authenticate><credentials><username>${escapeXml(username)}</username><password>${escapeXml(password)}</password></credentials></authenticate>`;
}

export function buildGmpGetVersionCommand(): string {
  return `<get_version/>`;
}

export function buildGmpGetResultsCommand(filter?: string): string {
  if (filter?.trim()) {
    return `<get_results filter="${escapeXml(filter.trim())}"/>`;
  }
  return `<get_results/>`;
}

/** Parse GMP get_results XML into simplified finding seeds (best-effort). */
export function parseGmpResultsXml(xml: string): GreenboneFindingSeed[] {
  const out: GreenboneFindingSeed[] = [];
  const resultBlocks = xml.match(/<result\b[\s\S]*?<\/result>/gi) ?? [];
  let i = 0;
  for (const block of resultBlocks) {
    i += 1;
    const name =
      block.match(/<name>([\s\S]*?)<\/name>/i)?.[1]?.trim() ||
      block.match(/<nvt[^>]*\bname="([^"]+)"/i)?.[1]?.trim() ||
      `GMP finding ${i}`;
    const threat =
      block.match(/<threat>([\s\S]*?)<\/threat>/i)?.[1]?.trim() ||
      block.match(/<severity>([\s\S]*?)<\/severity>/i)?.[1]?.trim() ||
      "info";
    const host =
      block
        .match(/<host>([\s\S]*?)<\/host>/i)?.[1]
        ?.replace(/<[^>]+>/g, "")
        .trim() || undefined;
    const description =
      block.match(/<description>([\s\S]*?)<\/description>/i)?.[1]?.trim() || undefined;
    out.push({
      title: name.slice(0, 160),
      severity: threat.toLowerCase(),
      ...(host ? { host } : {}),
      ...(description ? { message: description.slice(0, 2000) } : {}),
    });
  }
  return out;
}

export function parseGmpVersionXml(xml: string): GmpVersionInfo {
  const version =
    xml.match(/<version>([\s\S]*?)<\/version>/i)?.[1]?.trim() ||
    xml.match(/version="([^"]+)"/i)?.[1]?.trim() ||
    "unknown";
  return { version, raw: xml.slice(0, 500) };
}

export function resolveGmpConfigFromEnv(
  env: Record<string, string | undefined> = process.env,
): GmpClientConfig | null {
  const host = env.GREENBONE_GMP_HOST?.trim() || env.GVM_GMP_HOST?.trim();
  const username = env.GREENBONE_GMP_USER?.trim() || env.GVM_GMP_USER?.trim();
  const password = env.GREENBONE_GMP_PASSWORD?.trim() || env.GVM_GMP_PASSWORD?.trim();
  if (!host || !username || !password) return null;
  const port = Number(
    env.GREENBONE_GMP_PORT?.trim() || env.GVM_GMP_PORT?.trim() || "9390",
  );
  return {
    host,
    port: Number.isFinite(port) ? port : 9390,
    username,
    password,
    rejectUnauthorized: env.GREENBONE_GMP_TLS_INSECURE !== "true",
    timeoutMs: Number(env.GREENBONE_GMP_TIMEOUT_MS?.trim() || "8000") || 8000,
  };
}

type SocketLike = {
  readonly write: (data: string) => boolean;
  readonly on: (event: string, cb: (...args: unknown[]) => void) => void;
  readonly end: () => void;
  readonly destroy?: () => void;
  readonly setTimeout?: (ms: number) => void;
};

async function readUntil(
  socket: SocketLike,
  predicate: (buf: string) => boolean,
  timeoutMs: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("gmp.timeout"));
    }, timeoutMs);
    const onData = (chunk: unknown) => {
      buf += String(chunk);
      if (predicate(buf)) {
        cleanup();
        resolve(buf);
      }
    };
    const onError = (err: unknown) => {
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    };
    const cleanup = () => {
      clearTimeout(timer);
      socket.on("data", () => undefined);
    };
    socket.on("data", onData);
    socket.on("error", onError);
  });
}

/**
 * Low-level TLS GMP session. Prefer `fetchGmpResults` for callers.
 * Inject `connectFn` in tests.
 */
export async function withGmpSession<T>(
  config: GmpClientConfig,
  run: (send: (xml: string) => Promise<string>) => Promise<T>,
  connectFn: (cfg: GmpClientConfig) => Promise<SocketLike> = defaultTlsConnect,
): Promise<T> {
  const socket = await connectFn(config);
  const timeoutMs = config.timeoutMs ?? 8000;
  try {
    const send = async (xml: string): Promise<string> => {
      socket.write(xml);
      return readUntil(
        socket,
        (buf) => /<\/.+?>/.test(buf) || buf.includes("<gmp"),
        timeoutMs,
      );
    };
    const authXml = buildGmpAuthenticateCommand(config.username, config.password);
    const authResp = await send(authXml);
    if (/status="4\d\d"|authentication failed|Authenticate failed/i.test(authResp)) {
      throw new Error("gmp.auth_failed");
    }
    return await run(send);
  } finally {
    try {
      socket.end();
    } catch {
      socket.destroy?.();
    }
  }
}

async function defaultTlsConnect(config: GmpClientConfig): Promise<SocketLike> {
  return new Promise((resolve, reject) => {
    const socket: TLSSocket = tlsConnect(
      {
        host: config.host,
        port: config.port,
        rejectUnauthorized: config.rejectUnauthorized !== false,
      },
      () => resolve(socket as unknown as SocketLike),
    );
    socket.setEncoding("utf8");
    socket.setTimeout(config.timeoutMs ?? 8000);
    socket.on("error", reject);
  });
}

export async function fetchGmpVersion(
  config: GmpClientConfig,
  connectFn?: (cfg: GmpClientConfig) => Promise<SocketLike>,
): Promise<GmpVersionInfo> {
  return withGmpSession(
    config,
    async (send) => parseGmpVersionXml(await send(buildGmpGetVersionCommand())),
    connectFn,
  );
}

export async function fetchGmpResults(
  config: GmpClientConfig,
  options?: {
    readonly filter?: string;
    readonly connectFn?: (cfg: GmpClientConfig) => Promise<SocketLike>;
  },
): Promise<GreenboneFindingSeed[]> {
  return withGmpSession(
    config,
    async (send) =>
      parseGmpResultsXml(await send(buildGmpGetResultsCommand(options?.filter))),
    options?.connectFn,
  );
}

/** Build simplified artefact JSON for APZPEN ingest. */
export function toGreenboneSimplifiedArtefact(
  findings: readonly GreenboneFindingSeed[],
): { readonly tool: "greenbone"; readonly findings: readonly GreenboneFindingSeed[] } {
  return { tool: "greenbone", findings };
}
