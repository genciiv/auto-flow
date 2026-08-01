import { EMAIL_CONFIG } from "./email-config";
import { buildSubject } from "./email-utils";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const EMAIL_REQUEST_TIMEOUT_MS = 15_000;

function normalizeRecipients(to) {
  if (Array.isArray(to)) {
    return to.filter(Boolean).map((recipient) => String(recipient).trim());
  }

  return to ? [String(to).trim()] : [];
}

function parseEmailAddress(value) {
  const normalized = String(value || "").trim();
  const namedAddressMatch = normalized.match(/^\s*(.*?)\s*<([^<>\s]+@[^<>\s]+)>\s*$/);

  if (namedAddressMatch) {
    return {
      name: namedAddressMatch[1].replace(/^['"]|['"]$/g, "").trim() || undefined,
      email: namedAddressMatch[2].trim(),
    };
  }

  return { email: normalized };
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

async function readBrevoError(response) {
  try {
    const body = await response.json();
    return body?.message || body?.code || `Brevo API ktheu statusin ${response.status}.`;
  } catch {
    return `Brevo API ktheu statusin ${response.status}.`;
  }
}

export async function sendEmail({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.BREVO_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("BREVO_API_KEY nuk është konfiguruar.");
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

  const payload = {
    sender: parseEmailAddress(EMAIL_CONFIG.from),
    to: finalRecipients.map(parseEmailAddress),
    subject: buildSubject(subject),
  };

  if (finalHtml) payload.htmlContent = finalHtml;
  if (finalText) payload.textContent = finalText;

  const finalReplyTo = replyTo || EMAIL_CONFIG.replyTo;
  if (finalReplyTo) payload.replyTo = parseEmailAddress(finalReplyTo);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMAIL_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await readBrevoError(response);
      console.error("Brevo email error:", {
        status: response.status,
        message,
      });
      throw new Error(message || "Ndodhi një problem gjatë dërgimit të email-it.");
    }

    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Dërgimi i email-it tejkaloi kohën e lejuar.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
