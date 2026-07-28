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
