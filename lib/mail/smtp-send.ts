import nodemailer from "nodemailer";

import { isSmtpConfigured, loadAppSecrets } from "@/lib/config/secrets";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const secrets = loadAppSecrets();
  if (!isSmtpConfigured(secrets)) {
    return { ok: false, error: "SMTP is not configured." };
  }
  const { smtp } = secrets;
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port ?? 587,
      secure: (smtp.port ?? 587) === 465,
      auth:
        smtp.user && smtp.password
          ? {
              user: smtp.user,
              pass: smtp.password,
            }
          : undefined,
    });
    await transporter.sendMail({
      from: smtp.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
