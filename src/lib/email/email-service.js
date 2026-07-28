import { Resend } from "resend";

import { EMAIL_CONFIG } from "./email-config";
import { buildSubject } from "./email-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

function normalizeRecipients(to) {
  if (Array.isArray(to)) {
    return to.filter(Boolean);
  }

  return to ? [to] : [];
}

function buildDevelopmentNotice(originalRecipients) {
  const recipients = originalRecipients.join(", ");

  return `
    <div style="
      margin-bottom: 20px;
      padding: 12px 16px;
      border: 1px solid #f59e0b;
      border-radius: 10px;
      background: #fffbeb;
      color: #92400e;
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    ">
      <strong>Development mode</strong><br />
      Marrësi real i këtij email-i ishte: ${recipients}
    </div>
  `;
}

export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY nuk është konfiguruar.");
  }

  if (!EMAIL_CONFIG.from) {
    throw new Error("EMAIL_FROM nuk është konfiguruar.");
  }

  const originalRecipients = normalizeRecipients(to);

  if (originalRecipients.length === 0) {
    throw new Error("Adresa e marrësit është e detyrueshme.");
  }

  if (!subject) {
    throw new Error("Subjekti i email-it është i detyrueshëm.");
  }

  if (!html && !text) {
    throw new Error("Email-i duhet të ketë përmbajtje HTML ose text.");
  }

  const isDevelopment = process.env.NODE_ENV !== "production";

  const developmentRecipient = process.env.EMAIL_DEV_REDIRECT_TO?.trim();

  const finalRecipients =
    isDevelopment && developmentRecipient
      ? [developmentRecipient]
      : originalRecipients;

  const finalHtml =
    isDevelopment && developmentRecipient && html
      ? `${buildDevelopmentNotice(originalRecipients)}${html}`
      : html;

  const finalText =
    isDevelopment && developmentRecipient && text
      ? `Development mode\nMarrësi real: ${originalRecipients.join(
          ", ",
        )}\n\n${text}`
      : text;

  const emailData = {
    from: EMAIL_CONFIG.from,
    to: finalRecipients,
    subject: buildSubject(subject),
    html: finalHtml,
    text: finalText,
  };

  const finalReplyTo = replyTo || EMAIL_CONFIG.replyTo;

  if (finalReplyTo) {
    emailData.replyTo = finalReplyTo;
  }

  const { data, error } = await resend.emails.send(emailData);

  if (error) {
    console.error("Resend email error:", error);

    throw new Error(
      error.message || "Ndodhi një problem gjatë dërgimit të email-it.",
    );
  }

  return data;
}
