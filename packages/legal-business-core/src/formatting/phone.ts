import type { Phone } from "../domain";

/** Formats a telephone number for display. */
export function formatPhoneNumber(phone: Phone): string {
  const countryPrefix = phone.countryCode
    ? `+${phone.countryCode.replace(/^\+/, "")} `
    : "";
  const extension = phone.extension ? ` ext. ${phone.extension}` : "";
  return `${countryPrefix}${phone.number.trim()}${extension}`.trim();
}
