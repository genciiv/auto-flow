import { Resend } from "resend";
import { EMAIL_CONFIG } from "./email-config";
import { buildSubject } from "./email-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY nuk është konfiguruar.");
  }

  if (!EMAIL_CONFIG.from) {
    throw new Error("EMAIL_FROM nuk është konfiguruar.");
  }

  if (!to) {
    throw new Error("Adresa e marrësit është e detyrueshme.");
  }

  if (!subject) {
    throw new Error("Subjekti i email-it është i detyrueshëm.");
  }

  if (!html && !text) {
    throw new Error("Email-i duhet të ketë përmbajtje HTML ose text.");
  }

  const emailData = {
    from: EMAIL_CONFIG.from,
    to: Array.isArray(to) ? to : [to],
    subject: buildSubject(subject),
    html,
    text,
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
