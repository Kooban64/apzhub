export {
  isSmtpConfigured,
  resolveSmtpTransportConfig,
  resolveSmtpTransportConfigFromPlatformEnv,
} from "./smtp-config";
export {
  probePlatformEmailHealth,
  resetPlatformEmailForTests,
  sendPlatformEmail,
} from "./smtp-mailer";
export type {
  PlatformEmailHealth,
  SendPlatformEmailInput,
  SendPlatformEmailResult,
  SmtpTransportConfig,
} from "./types";
