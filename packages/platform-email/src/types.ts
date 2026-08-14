export type SmtpTransportConfig = {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly pass: string;
  readonly from: string;
};

export type SendPlatformEmailInput = {
  readonly to: string | readonly string[];
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
  readonly from?: string;
  readonly headers?: Readonly<Record<string, string>>;
};

export type SendPlatformEmailResult = {
  readonly ok: true;
  readonly messageId: string;
  readonly accepted: readonly string[];
};

export type PlatformEmailHealth = {
  readonly configured: boolean;
  readonly status: "healthy" | "unconfigured" | "misconfigured" | "unhealthy";
  readonly host?: string;
  readonly port?: number;
  readonly from?: string;
  readonly message?: string;
  readonly checkedAt: string;
};
