import { buildGreeting } from "./email-utils";

export function emailLayout({ name, title, content, buttonText, buttonUrl }) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px">

<h2>${title}</h2>

<p>${buildGreeting(name)}</p>

<p>${content}</p>

<p style="margin:32px 0">
<a
href="${buttonUrl}"
style="
background:#2563eb;
color:white;
padding:14px 22px;
text-decoration:none;
border-radius:8px;
display:inline-block;
">
${buttonText}
</a>
</p>

<p>
Nëse nuk funksionon butoni, kopjo këtë link:
</p>

<p style="word-break:break-all">${buttonUrl}</p>

<hr>

<p style="font-size:12px;color:#666">
AutoFlow
</p>

</div>
`;
}

export function emailVerificationTemplate({ name, verificationUrl }) {
  return emailLayout({
    name,
    title: "Verifiko adresën tënde të email-it",
    content: `
      Faleminderit që u regjistrove në AutoFlow.
      Kliko butonin më poshtë për të verifikuar adresën tënde të email-it.
      Linku është i vlefshëm për 24 orë.
    `,
    buttonText: "Verifiko email-in",
    buttonUrl: verificationUrl,
  });
}

export function passwordResetTemplate({ name, resetPasswordUrl }) {
  return emailLayout({
    name,
    title: "Rivendos password-in",
    content: `
      Kemi marrë një kërkesë për ndryshimin e password-it të llogarisë
      tënde AutoFlow. Kliko butonin më poshtë për të vendosur një
      password të ri. Linku është i vlefshëm për 1 orë.
      Nëse nuk e ke bërë ti këtë kërkesë, mund ta injorosh këtë email.
    `,
    buttonText: "Vendos password të ri",
    buttonUrl: resetPasswordUrl,
  });
}
